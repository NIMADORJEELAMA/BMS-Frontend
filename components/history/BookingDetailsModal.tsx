"use client";
import { X, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";

export default function BookingReceiptModal({ booking, onClose }: any) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB");

  // 1. Calculate Nights & Charges
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const timeDiff = checkOut.getTime() - checkIn.getTime();
  const nights = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  const roomRate = Number(booking.room?.basePrice) || 0;
  const totalRoomCharge = nights * roomRate;

  // 2. Map Food Items
  const foodItems =
    booking.orders?.flatMap((order: any) =>
      order.items.map((item: any) => ({
        name: item.menuItem.name,
        qty: item.quantity,
        rate: item.priceAtOrder,
        total: item.quantity * item.priceAtOrder,
      })),
    ) || [];
  const foodTotal = foodItems.reduce((a: number, b: any) => a + b.total, 0);

  // 3. Financials
  const grossTotal = Number(booking.totalBill) || 0;
  const miscCharges = grossTotal - (totalRoomCharge + foodTotal);
  const discount = Number(booking.discount) || 0;
  const grandTotal = grossTotal - discount;
  const advance = Number(booking.advanceAmount) || 0;
  const paidAtCheckout =
    (Number(booking.cashAmount) || 0) + (Number(booking.onlineAmount) || 0);

  // PDF Download Logic
  const downloadPDF = async () => {
    const element = receiptRef.current;
    if (!element) return;

    try {
      // 1. Capture the element with a clean white background to avoid 'lab' color errors
      const canvas = await html2canvas(element, {
        scale: 2, // Scale 2 is usually plenty for 80mm thermal receipts
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      // 2. Define the fixed width (80mm for thermal)
      const imgWidth = 80;

      // 3. Calculate the height based on the aspect ratio of the captured canvas
      // Height = (Canvas Height / Canvas Width) * Target Width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // 4. Initialize PDF with the calculated dynamic height
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [imgWidth, imgHeight], // Custom [width, height]
      });

      // 5. Add image at 0,0 filling the exact dimensions
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      // 6. Save
      pdf.save(`Receipt_${booking.id.slice(0, 8).toUpperCase()}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      {/* FLOATING ACTION BAR */}
      <div className="absolute top-6 right-6 flex items-center gap-3 bg-white/10 p-2 rounded-2xl border border-white/20 backdrop-blur-xl print:hidden">
        <Button
          size="icon"
          variant="secondary"
          onClick={() => window.print()}
          title="Print Thermal"
          className="rounded-xl"
        >
          <Printer size={18} />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={downloadPDF}
          title="Download PDF"
          className="rounded-xl"
        >
          <Download size={18} />
        </Button>
        <div className="w-px h-6 bg-white/20 mx-1" />
        <Button
          size="icon"
          variant="destructive"
          onClick={onClose}
          className="rounded-xl"
        >
          <X size={18} />
        </Button>
      </div>

      {/* THERMAL RECEIPT CONTAINER */}
      <div className="max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl rounded-sm">
        <div
          ref={receiptRef}
          className="thermal-receipt bg-white p-6 w-[80mm] text-slate-900 font-mono shadow-inner"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          {/* LOGO & HEADER */}
          <div className="text-center mb-3">
            <div className="text-xl font-bold tracking-[0.2em]">
              🏔 GAIRIGAON
            </div>
            <div className="text-[10px] uppercase tracking-widest mt-1">
              Hill Top Resort
            </div>
            <div className="text-[9px] text-slate-500 mt-1">
              North 24 Paragnas, West Bengal
            </div>
          </div>

          <div className="border-b border-dashed border-slate-300 my-3"></div>

          {/* BILL META */}
          <div className="text-[11px] space-y-1">
            <div className="flex justify-between">
              <span>BILL NO:</span>{" "}
              <span className="font-bold">
                #{booking.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>GUEST:</span>{" "}
              <span className="font-bold uppercase">{booking.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span>ROOM:</span> <span>{booking.room?.roomNumber}</span>
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 italic">
              <span>PERIOD:</span>{" "}
              <span>
                {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
              </span>
            </div>
          </div>

          <div className="border-b-2 border-slate-900 my-3"></div>

          {/* ITEMS TABLE */}
          <div className="text-[11px]">
            <div className="flex justify-between font-bold border-b border-slate-900 pb-1 mb-2">
              <span className="w-1/2 text-left">ITEM</span>
              <span className="w-1/4 text-right">QTY/RT</span>
              <span className="w-1/4 text-right">AMT</span>
            </div>

            {/* ROOM CHARGE */}
            <div className="flex justify-between items-start mb-2">
              <div className="w-1/2">
                <div>Room Stay</div>
                <div className="text-[9px] text-slate-500 italic">
                  @₹{roomRate}
                </div>
              </div>
              <span className="w-1/4 text-right">{nights}N</span>
              <span className="w-1/4 text-right">₹{totalRoomCharge}</span>
            </div>

            {/* FOOD ITEMS */}
            {foodItems.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-start mb-2">
                <div className="w-1/2">
                  <div className="truncate">{item.name}</div>
                  <div className="text-[9px] text-slate-500 italic">
                    @₹{item.rate}
                  </div>
                </div>
                <span className="w-1/4 text-right">x{item.qty}</span>
                <span className="w-1/4 text-right">₹{item.total}</span>
              </div>
            ))}

            {/* MISC CHARGES */}
            {miscCharges > 0 && (
              <div className="flex justify-between py-1 border-t border-dotted">
                <span className="w-1/2">Misc. Charges</span>
                <span className="w-1/4 text-right">-</span>
                <span className="w-1/4 text-right">₹{miscCharges}</span>
              </div>
            )}
          </div>

          <div className="border-b border-dashed border-slate-400 my-3"></div>

          {/* TOTALS */}
          <div className="text-[11px] space-y-1">
            <div className="flex justify-between">
              <span>GROSS AMOUNT</span>
              <span>₹{grossTotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-red-600 font-bold">
                <span>DISCOUNT</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t-2 border-slate-900 pt-1 mt-1">
              <span>GRAND TOTAL</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>

          <div className="border-b border-dashed border-slate-400 my-3"></div>

          {/* SETTLEMENT */}
          <div className="text-[10px] space-y-1">
            <div className="font-bold text-[9px] uppercase text-slate-500 mb-1">
              Payment Breakdown
            </div>
            {advance > 0 && (
              <div className="flex justify-between">
                <span>ADVANCE:</span> <span>₹{advance}</span>
              </div>
            )}
            {booking.cashAmount > 0 && (
              <div className="flex justify-between">
                <span>CASH:</span> <span>₹{booking.cashAmount}</span>
              </div>
            )}
            {booking.onlineAmount > 0 && (
              <div className="flex justify-between">
                <span>UPI/ONLINE:</span> <span>₹{booking.onlineAmount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-slate-900 mt-1 pt-1 text-[11px]">
              <span>TOTAL RECEIVED</span>
              <span>₹{advance + paidAtCheckout}</span>
            </div>
          </div>

          <div className="text-center text-[9px] mt-6 pt-4 border-t border-slate-200">
            <p className="font-bold tracking-widest uppercase">
              Status: {booking.paymentStatus}
            </p>
            <p className="mt-2 italic">Thank You for staying at Gairigaon!</p>
            <p className="mt-1">Computer Generated Receipt</p>
          </div>
        </div>
      </div>

      {/* PRINT STYLES */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .thermal-receipt,
          .thermal-receipt * {
            visibility: visible;
          }
          .thermal-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 0;
            margin: 0;
            box-shadow: none;
          }
          .print\:hidden {
            display: none !important;
          }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
