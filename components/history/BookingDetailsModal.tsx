import { X, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";

export default function BookingReceiptModal({ booking, onClose }: any) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB"); // dd/mm/yyyy
  console.log("booking", booking);
  const foodItems =
    booking.orders?.flatMap((order: any) =>
      order.items.map((item: any) => ({
        name: item.menuItem.name,
        qty: item.quantity,
        price: item.priceAtOrder,
        total: item.quantity * item.priceAtOrder,
      })),
    ) || [];

  const foodTotal = foodItems.reduce((a: number, b: any) => a + b.total, 0);
  const roomCharges = booking.totalBill + booking.discount - foodTotal;

  const downloadPDF = async () => {
    const element = receiptRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 3 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, canvas.height * 0.264], // dynamic height
    });

    pdf.addImage(imgData, "PNG", 0, 0, 80, canvas.height * 0.264);
    pdf.save(`Receipt_${booking.id.slice(0, 8)}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* ACTIONS */}
      <div className="absolute top-6 right-6 flex gap-2 print:hidden">
        <Button size="sm" variant="ghost" onClick={() => window.print()}>
          <Printer size={16} />
        </Button>
        <Button size="sm" variant="ghost" onClick={downloadPDF}>
          <Download size={16} />
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose}>
          <X size={16} />
        </Button>
      </div>

      {/* THERMAL RECEIPT */}
      <div
        ref={receiptRef}
        className="thermal-receipt thermal-print bg-white p-4 shadow-xl"
      >
        {/* DEMO LOGO */}
        <div className="text-center mb-2">
          <div className="text-lg font-bold tracking-widest">🏔 GAIRIGAON</div>
          <div className="text-xs">Hill Top Resort</div>
          <div className="text-[10px]">North 24 Paragnas</div>
        </div>

        <div className="separator"></div>

        {/* BILL META */}
        <div>
          <p>Bill No: {booking.id.slice(0, 8)}</p>
          <p>Date: {formatDate(booking.checkOut)}</p>
          <p>Guest: {booking.guestName}</p>
          <p>Room: {booking.room.roomNumber}</p>
          <p>Check-In: {formatDate(booking.checkIn)}</p>
          <p>Check-Out: {formatDate(booking.checkOut)}</p>
        </div>

        <div className="separator"></div>

        {/* ITEMS HEADER */}
        <div className="flex justify-between font-bold text-[11px]">
          <span>Item</span>
          <span>Amt</span>
        </div>

        <div className="separator"></div>

        {/* ROOM */}
        <div className="flex justify-between">
          <span>Room Stay</span>
          <span>₹{roomCharges}</span>
        </div>

        {/* FOOD ITEMS */}
        {foodItems.map((item: any, index: number) => (
          <div key={index}>
            <div className="flex justify-between">
              <span>
                {item.name} x{item.qty}
              </span>
              <span>₹{item.total}</span>
            </div>
          </div>
        ))}

        <div className="separator"></div>

        {/* TOTALS */}
        <div className="flex justify-between">
          <span>Sub Total</span>
          <span>₹{booking.totalBill + booking.discount}</span>
        </div>

        {booking.discount > 0 && (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>-₹{booking.discount}</span>
          </div>
        )}

        <div className="separator"></div>

        <div className="flex justify-between font-bold text-base">
          <span>TOTAL</span>
          <span>₹{booking.totalBill}</span>
        </div>

        <div className="separator"></div>

        {/* PAYMENT */}
        {booking.cashAmount > 0 && (
          <div className="flex justify-between">
            <span>Cash</span>
            <span>₹{booking.cashAmount}</span>
          </div>
        )}
        {booking.onlineAmount > 0 && (
          <div className="flex justify-between">
            <span>Online</span>
            <span>₹{booking.onlineAmount}</span>
          </div>
        )}

        <div className="separator"></div>

        <div className="text-center text-[10px] mt-3">
          <p>Status: {booking.paymentStatus}</p>
          <p>Thank You. Visit Again!</p>
        </div>
      </div>
    </div>
  );
}
