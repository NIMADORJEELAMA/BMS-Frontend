"use client";
import { X, Printer, Download, Receipt, Hash, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import dayjs from "dayjs";
import { toPng } from "html-to-image";

interface BillReceiptModalProps {
  order: any;
  onClose: () => void;
}

export default function BillReceiptModal({
  order,
  onClose,
}: BillReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  if (!order) return null;
  console.log("order", order);
  const isSplit = order.paymentMode === "SPLIT";
  const shortId = order.id.slice(-8).toUpperCase();

  /* ================= PRINT LOGIC (Thermal Monospace) ================= */
  const printThermal = () => {
    const win = window.open("", "", "width=1200,height=800");
    if (!win) return;

    // Helper functions for character-width alignment (STRICT 32 chars total)
    const padRight = (text: string, len: number) =>
      text.length >= len
        ? text.slice(0, len)
        : text + " ".repeat(len - text.length);

    const padLeft = (text: string, len: number) =>
      text.length >= len
        ? text.slice(0, len)
        : " ".repeat(len - text.length) + text;

    // 1. FILTER & MAP ITEMS
    const itemsText = order.items
      ?.filter((item: any) => item.status !== "CANCELLED")
      ?.map((item: any) => {
        // COLUMN BUDGET: Name(12) + Qty(4) + Rate(7) + Amt(9) = 32
        const name = padRight(String(item.menuItem.name).toUpperCase(), 12);
        const qty = padLeft(String(item.quantity), 4);
        const rate = padLeft(String(item.priceAtOrder), 7);
        const amt = padLeft(String(item.priceAtOrder * item.quantity), 9);

        return `${name}${qty}${rate}${amt}`;
      })
      .join("\n");

    const receiptString = `
  GAIRIGAON HILL ECO TOURISM
      Jaigaon, West Bengal
         +91-7547957222
--------------------------------
BILL NO : #${shortId}
TABLE   : ${order.table?.number || "N/A"}
WAITER  : ${order.waiter?.name || "N/A"}
DATE    : ${dayjs(order.updatedAt).format("DD/MM/YYYY  hh:mm A")}
--------------------------------
ITEM         QTY   RATE      AMT
--------------------------------
${itemsText}
--------------------------------
SUBTOTAL               ${padLeft(String(order.totalAmount), 8)}
--------------------------------
GRAND TOTAL            ${padLeft(String(order.totalAmount), 8)}
--------------------------------
MODE: ${order.paymentMode || "PENDING"}
${isSplit ? `CASH: ${padLeft(String(order.amountCash), 10)}\nONLINE: ${padLeft(String(order.amountOnline), 10)}` : ""}
--------------------------------
          THANK YOU!
      PLEASE VISIT AGAIN


              .
`;

    win.document.write(`
    <html><head><style>
      body { 
        font-family: 'Courier New', Courier, monospace; 
        font-size: 12px; 
        white-space: pre; 
        margin: 0; 
        padding: 0; 
        width: 32ch; /* Limits width to 32 characters */
      }
    </style></head>
    <body>${receiptString}</body></html>
  `);
    win.document.close();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  };

  /* ================= PDF DOWNLOAD LOGIC ================= */

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
      // pdf.save("receipt.pdf");
      pdf.save(`Receipt_${shortId.slice(0, 4)}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed", err);
    }
  };
  /* ================= PREVIEW COMPONENT ================= */
  const ReceiptContent = () => (
    <div className="w-[72mm] mx-auto text-black p-1 leading-tight text-left">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold uppercase m-0">
          Gairigaon Hill Eco Tourism
        </h2>

        <p className="text-[10px] m-0">Jaigaon, West Bengal</p>
        <p className="text-[10px] m-0">+91-7547957222</p>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      <div className="text-[11px] space-y-1">
        <div className="flex justify-between">
          <span>BILL NO:</span>
          <span className="font-bold">#{shortId}</span>
        </div>
        <div className="flex justify-between">
          <span>TABLE:</span>
          <span className="font-bold">{order.table?.number}</span>
        </div>
        <div className="flex justify-between">
          <span>WAITER:</span>
          <span className="font-bold">{order?.waiter?.name}</span>
        </div>
        <div className="flex justify-between">
          <span>DATE:</span>
          <span className="font-bold">
            {dayjs(order.updatedAt).format("DD/MM/YYYY • hh:mm A")}
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
          {order.items?.map(
            (item: any, i: number) => (
              console.log("item", item),
              (
                <tr key={i}>
                  <td className="py-1 uppercase">{item.menuItem.name}</td>
                  <td className="text-center">{item.quantity}</td>

                  <td className="text-center">{item.priceAtOrder}</td>

                  <td className="text-right">
                    ₹{item.priceAtOrder * item.quantity}
                  </td>
                </tr>
              )
            ),
          )}
        </tbody>
      </table>

      {/* <div className="border-t border-dashed border-black my-2" /> */}

      <div className="text-[11px] space-y-1">
        <div className="flex justify-between font-bold text-sm border-t border-black pt-1 mt-1">
          <span>GRAND TOTAL</span>
          <span>₹{order.totalAmount}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      <div className="text-[11px] space-y-1">
        <div className="flex justify-between">
          <span>PAYMENT MODE</span>
          <span className="font-bold uppercase">{order.paymentMode}</span>
        </div>
        {isSplit && (
          <div className="pl-2 border-l-2 border-slate-200">
            <div className="flex justify-between text-[10px]">
              <span>CASH:</span>
              <span>₹{order.amountCash}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span>ONLINE:</span>
              <span>₹{order.amountOnline}</span>
            </div>
          </div>
        )}
      </div>

      <div className="text-center mt-6 text-[10px] space-y-1">
        <div className="font-bold uppercase italic">Status: {order.status}</div>
        <div>Thank You! Please Visit Again.</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="absolute top-6 right-6 flex gap-3">
        <Button
          size="icon"
          className="rounded-xl shadow-lg"
          onClick={printThermal}
        >
          <Printer size={18} />
        </Button>
        <Button
          size="icon"
          className="rounded-xl shadow-lg"
          onClick={downloadPDF}
        >
          <Download size={18} />
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="rounded-xl shadow-lg"
          onClick={onClose}
        >
          <X size={18} />
        </Button>
      </div>

      <div className="bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto font-mono rounded-sm border-8 border-white">
        <div
          ref={receiptRef}
          style={{ backgroundColor: "#ffffff", color: "#000000" }} // Standard Hex
          className="font-mono"
        >
          <ReceiptContent />
        </div>
      </div>
    </div>
  );
}
