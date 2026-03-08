"use client";
import { X, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import { toPng } from "html-to-image";

export default function BookingReceiptModal({ booking, onClose }: any) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB");

  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const nights = Math.max(
    1,
    Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)),
  );

  const roomRate = Number(booking.room?.basePrice) || 0;

  const totalRoomCharge = nights * roomRate;

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
  const grossTotal = Number(booking.totalBill) || 0;
  const miscCharges = grossTotal - (totalRoomCharge + foodTotal);
  const discount = Number(booking.discount) || 0;
  const grandTotal = grossTotal - discount;
  const advance = Number(booking.advanceAmount) || 0;

  // Shared Receipt Content Component to fix the "Empty" preview
  const ReceiptContent = () => (
    <div className="w-[72mm] mx-auto text-black p-1 leading-tight">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold uppercase m-0">GAIRIGAON</h2>
        <p className="text-[10px] m-0">Hill Top Eco Tourism</p>
        <p className="text-[10px] m-0"> Jaigaon, West Bengal</p>
        <p className="text-[10px] m-0"> +91-7547957222</p>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      <div className="text-[11px] space-y-1">
        <div className="flex justify-between">
          <span>BILL NO:</span>
          <span className="font-bold">
            #{booking.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>GUEST:</span>
          <span className="font-bold">{booking.guestName}</span>
        </div>
        <div className="flex justify-between">
          <span>ROOM:</span>
          <span className="font-bold">{booking.room?.roomNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>PERIOD:</span>
          <span className="font-bold">
            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
          </span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      <table className="w-full text-[11px] border-collapse">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-1">ITEM</th>
            <th className="text-center py-1">QTY</th>
            <th className="text-center py-1">RATE</th>

            <th className="text-right py-1">AMT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-1">Room Stay ({nights}N)</td>
            <td className="text-center">-</td>
            <td className="text-right">₹{roomRate}</td>

            <td className="text-right">₹{totalRoomCharge}</td>
          </tr>
          {foodItems.map(
            (item: any, i: number) => (
              console.log("item", item),
              (
                <tr key={i}>
                  <td className="py-1">{item.name}</td>
                  <td className="text-center">{item.qty}</td>
                  <td className="text-center">{item.rate}</td>
                  <td className="text-right">₹{item.total}</td>
                </tr>
              )
            ),
          )}
          {miscCharges > 0 && (
            <tr>
              <td className="py-1">Misc Charges</td>
              <td className="text-center">-</td>
              <td className="text-right">₹{miscCharges}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="border-t border-dashed border-black my-2" />

      <div className="text-[11px] space-y-1">
        <div className="flex justify-between">
          <span>GROSS TOTAL</span>
          <span>₹{grossTotal}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span>DISCOUNT</span>
            <span>-₹{discount}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm border-t border-black pt-1 mt-1">
          <span>GRAND TOTAL</span>
          <span>₹{grandTotal}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      <div className="text-[11px] space-y-1">
        {advance > 0 && (
          <div className="flex justify-between">
            <span>ADVANCE PAID</span>
            <span>₹{advance}</span>
          </div>
        )}
        {booking.cashAmount > 0 && (
          <div className="flex justify-between">
            <span>CASH PAYMENT</span>
            <span>₹{booking.cashAmount}</span>
          </div>
        )}
        {booking.onlineAmount > 0 && (
          <div className="flex justify-between">
            <span>UPI PAYMENT</span>
            <span>₹{booking.onlineAmount}</span>
          </div>
        )}
      </div>

      <div className="text-center mt-6 text-[10px] space-y-1">
        <div className="font-bold uppercase italic">
          Status: {booking.paymentStatus}
        </div>
        <div>Thank You for staying at Gairigaon!</div>
        <div className="text-[8px] opacity-70">Computer Generated Receipt</div>
      </div>
    </div>
  );

  const printReceipt = () => {
    const win = window.open("", "", "width=1200,height=800");
    if (!win) return;

    const padRight = (text: string, length: number) =>
      text.length >= length
        ? text.slice(0, length)
        : text + " ".repeat(length - text.length);

    const padLeft = (text: string, length: number) =>
      text.length >= length
        ? text.slice(0, length)
        : " ".repeat(length - text.length) + text;

    const formatItem = (
      name: string,
      qty: number | string,
      rate: number | string,
      amt: number,
    ) => {
      const itemCol = padRight(name, 16);
      const qtyCol = padLeft(String(qty), 4);
      const rateCol = padLeft(String(rate), 5);
      const amtCol = padLeft(String(amt), 7);
      return `${itemCol}${qtyCol}${rateCol}${amtCol}`;
    };

    const items = [
      // For Room Stay: Rate is the price per night
      formatItem(
        `Room Stay(${nights}N)`,
        nights,
        (totalRoomCharge / (nights || 1)).toFixed(0),
        totalRoomCharge,
      ),

      // For Food Items: Rate is i.price
      ...foodItems.map((i: any) => formatItem(i.name, i.qty, i.rate, i.total)),

      ...(miscCharges > 0
        ? [formatItem("Misc Charges", "1", miscCharges, miscCharges)]
        : []),
    ].join("\n");

    const receipt = `
                    
Gairigaon Hill Top Eco Tourism 
     Jaigaon, West Bengal
       +91-7547957222
--------------------------------
Bill No : ${booking.id.slice(0, 8).toUpperCase()}
Guest   : ${booking.guestName}
Room    : ${booking.room?.roomNumber}
Date : ${formatDate(booking.checkIn)} - ${formatDate(booking.checkOut)}
--------------------------------
ITEM            QTY  RATE   AMT
--------------------------------
${items}
--------------------------------
Gross Total          ${grossTotal}
${discount > 0 ? `Discount            -${discount}` : ""}
--------------------------------
Grand Total          ${grandTotal}
--------------------------------
${advance > 0 ? `Advance              ${advance}\n` : ""}
${booking.cashAmount > 0 ? `Cash                 ${booking.cashAmount}\n` : ""}
${booking.onlineAmount > 0 ? `UPI                  ${booking.onlineAmount}\n` : ""}
--------------------------------
STATUS: ${booking.paymentStatus.toUpperCase()}

        Thank You!
     
`;

    win.document.write(`
<html>
<head>
<style>
body{
  font-family: monospace;
  font-size:12px;
  white-space: pre;
  margin:0;
  padding-top:15px;
  padding-bottom:25px;
}
</style>
</head>
<body>
${receipt}
</body>
</html>
`);

    win.document.close();

    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  const downloadPDF = async () => {
    const element = receiptRef.current;
    if (!element) return;

    try {
      // This library is much more stable than html2canvas
      const dataUrl = await toPng(element, { quality: 1.0, pixelRatio: 3 });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 150], // Adjust height as needed
      });

      pdf.addImage(dataUrl, "PNG", 0, 0, 80, 150);
      pdf.save(`Receipt_${booking.id.slice(0, 4)}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed", err);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="absolute top-6 right-6 flex gap-3">
        <Button size="icon" onClick={printReceipt}>
          <Printer size={18} />
        </Button>
        <Button size="icon" onClick={downloadPDF}>
          <Download size={18} />
        </Button>
        <Button size="icon" variant="destructive" onClick={onClose}>
          <X size={18} />
        </Button>
      </div>

      <div className="bg-white p-4 shadow-2xl max-h-[90vh] overflow-y-auto font-mono">
        <div ref={receiptRef}>
          <ReceiptContent />
        </div>
      </div>
    </div>
  );
}
