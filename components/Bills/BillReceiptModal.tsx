"use client";
import { X, Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { useRef } from "react";
import dayjs from "dayjs";
import { toPng } from "html-to-image";
import toast from "react-hot-toast";

interface BillReceiptModalProps {
  order: any;
  onClose: () => void;
}
declare global {
  interface Window {
    qz: any;
  }
}
export default function BillReceiptModal({
  order,
  onClose,
}: BillReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  if (!order) return null;

  const isSplit = order.paymentMode === "SPLIT";
  const shortId = order.id.slice(-8).toUpperCase();

  /* ================= PRINT LOGIC (80mm Optimized) ================= */

  /* ================= PRINT LOGIC (80mm Optimized) ================= */

  const printThermalESC = async () => {
    try {
      if (typeof window === "undefined" || !window.qz) {
        alert("QZ Tray is not installed or running.");
        return;
      }

      // Ensure connection
      if (!window.qz.websocket.isActive()) {
        await window.qz.websocket.connect();
      }

      const ESC = "\x1B";
      const CENTER = ESC + "a" + "\x01";
      const LEFT = ESC + "a" + "\x00";
      const BOLD_ON = ESC + "E" + "\x01";
      const BOLD_OFF = ESC + "E" + "\x00";
      const LINE_WIDTH = 48; // Standard for 80mm

      const padRight = (text: string, len: number) =>
        text.length >= len
          ? text.slice(0, len)
          : text + " ".repeat(len - text.length);

      const padLeft = (text: string, len: number) =>
        text.length >= len
          ? text.slice(0, len)
          : " ".repeat(len - text.length) + text;

      // Formatting items: Name(22) Qty(6) Rate(10) Amt(10) = 48 chars
      const itemsText = (order.items || [])
        .filter((item: any) => item.status !== "CANCELLED")
        .map((item: any) => {
          const name = padRight(
            (item.menuItem?.name || "Unknown").toUpperCase(),
            22,
          );
          const qty = padLeft(String(item.quantity), 6);
          const rate = padLeft(String(item.priceAtOrder), 10);
          const amt = padLeft(String(item.priceAtOrder * item.quantity), 10);
          return `${name}${qty}${rate}${amt}`;
        })
        .join("\n");

      const receipt = [
        CENTER,
        BOLD_ON,
        "GAIRIGAON HILL ECO TOURISM\n",
        BOLD_OFF,
        "Jaigaon, West Bengal\n",
        "+91-7547957222\n",
        LEFT,
        "-".repeat(LINE_WIDTH) + "\n",
        `BILL NO : #${shortId}\n`,
        `TABLE   : ${order.table?.number || "N/A"}\n`,
        `WAITER  : ${order.waiter?.name || "N/A"}\n`,
        `DATE    : ${dayjs(order.updatedAt).format("DD/MM/YYYY hh:mm A")}\n`,
        "-".repeat(LINE_WIDTH) + "\n",
        padRight("ITEM", 22) +
          padLeft("QTY", 6) +
          padLeft("RATE", 10) +
          padLeft("AMT", 10) +
          "\n",
        "-".repeat(LINE_WIDTH) + "\n",
        itemsText + "\n",
        "-".repeat(LINE_WIDTH) + "\n",
        padRight("SUBTOTAL", 38) +
          padLeft(String(order.totalAmount), 10) +
          "\n",
        "-".repeat(LINE_WIDTH) + "\n",
        padRight("GRAND TOTAL", 38) +
          padLeft("Rs." + String(order.totalAmount), 10) +
          "\n",

        "-".repeat(LINE_WIDTH) + "\n",
        CENTER,
        "THANK YOU!\n",
        "PLEASE VISIT AGAIN\n\n\n\x1Bm", // \x1Bm is paper cut for some printers
      ].join("");

      const printerName = localStorage.getItem("printer");
      if (!printerName) {
        alert("Please select a printer in the settings first.");
        return;
      }

      const config = window.qz.configs.create(printerName);
      await window.qz.print(config, [
        { type: "raw", format: "plain", data: receipt },
      ]);
    } catch (err: any) {
      toast.error("Printing failed: " + (err.message || "Check QZ Tray"));
    }
  };
  //   const printThermal = () => {
  //     const win = window.open("", "", "width=1200,height=1200");
  //     if (!win) return;
  //     const LINE_WIDTH = 48;
  //     const centerText = (text: string) => {
  //       if (text.length >= LINE_WIDTH) return text;

  //       let totalPadding = LINE_WIDTH - text.length;

  //       // 🎯 Dynamic correction (stronger for longer text)
  //       let adjustment = 0;
  //       if (text.length > 34) adjustment = 3;
  //       else if (text.length > 30) adjustment = 2;
  //       else if (text.length > 26) adjustment = 1;

  //       const leftPadding = Math.floor(totalPadding / 2) - adjustment;

  //       return " ".repeat(leftPadding > 0 ? leftPadding : 0) + text;
  //     };
  //     // Standard 80mm thermal printers usually support 48 characters in 'Font A'

  //     const padRight = (text: string, len: number) =>
  //       text.length >= len
  //         ? text.slice(0, len)
  //         : text + " ".repeat(len - text.length);

  //     const padLeft = (text: string, len: number) =>
  //       text.length >= len
  //         ? text.slice(0, len)
  //         : " ".repeat(len - text.length) + text;

  //     // BUDGET (48): Name(24) + Qty(6) + Rate(8) + Amt(10)
  //     const itemsText = order.items
  //       ?.filter((item: any) => item.status !== "CANCELLED")
  //       ?.map((item: any) => {
  //         const name = padRight(String(item.menuItem.name).toUpperCase(), 22);
  //         const qty = padLeft(String(item.quantity), 6);
  //         const rate = padLeft(String(item.priceAtOrder), 8);
  //         const amt = padLeft(String(item.priceAtOrder * item.quantity), 10);
  //         return `${name}${qty}${rate}${amt}`;
  //       })
  //       .join("\n");

  //     const separator = "-".repeat(LINE_WIDTH);

  //     const receiptString = `
  // ${"  GAIRIGAON HILL ECO TOURISM"}
  // ${centerText("Jaigaon, West Bengal")}
  // ${centerText("+91-7547957222")}
  // ${separator}
  // BILL NO : #${shortId}
  // TABLE   : ${order.table?.number || "N/A"}
  // WAITER  : ${order.waiter?.name || "N/A"}
  // DATE    : ${dayjs(order.updatedAt).format("DD/MM/YYYY  hh:mm A")}
  // ${separator}
  // ITEM                     QTY    RATE       AMT
  // ${separator}
  // ${itemsText}
  // ${separator}
  // SUBTOTAL                          ${padLeft(String(order.totalAmount), 12)}
  // GRAND TOTAL                       ${padLeft(String(order.totalAmount), 12)}
  // ${separator}
  // MODE: ${order.paymentMode || "PENDING"}
  // ${isSplit ? `CASH: ${padLeft(String(order.amountCash), 14)}\nONLINE: ${padLeft(String(order.amountOnline), 12)}` : ""}
  // ${separator}
  // ${centerText("THANK YOU!")}
  // ${centerText("PLEASE VISIT AGAIN")}
  // \n\n\n\n
  // `;

  //     win.document.write(`
  //       <html><head><style>
  //         @page {
  //           margin: 0;
  //           size: 80mm auto;
  //         }
  //         body {
  //           font-family: 'Courier New', Courier, monospace;
  //           font-size: 14px; /* Slightly larger for 80mm */
  //           font-weight: bold; /* Thermal printers look better with bold mono */
  //           line-height: 1.1;
  //           white-space: pre;
  //           margin: 0;
  //             padding-bottom: 25mm;
  //           padding: 4mm; /* Adjusted padding */
  //           width: 72mm;
  //         }
  //       </style></head>
  //       <body>${receiptString}</body></html>
  //     `);
  //     win.document.close();

  //     // Crucial: Wait for fonts to load before printing
  //     win.onload = () => {
  //       win.print();
  //       win.close();
  //     };
  //   };

  /* ================= PDF DOWNLOAD LOGIC ================= */
  const downloadPDF = async () => {
    const element = receiptRef.current;
    if (!element) return;

    try {
      const dataUrl = await toPng(element, { quality: 1.0, pixelRatio: 3 });
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 200], // 80mm width, height can be auto or long
      });

      pdf.addImage(dataUrl, "PNG", 0, 0, 80, 0); // '0' for height maintains aspect ratio
      pdf.save(`Receipt_${shortId.slice(0, 4)}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed", err);
    }
  };

  /* ================= UI PREVIEW ================= */
  const ReceiptContent = () => (
    <div className="w-[72mm] mx-auto text-black p-2 leading-tight text-left">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold uppercase m-0">Gairigaon Hill</h2>
        <p className="text-[12px] m-0">Eco Tourism</p>
        <p className="text-[11px] m-0">Jaigaon, West Bengal</p>
        <p className="text-[11px] m-0">+91-7547957222</p>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      <div className="text-[12px] space-y-1">
        <div className="flex justify-between">
          <span>BILL NO:</span>
          <span className="font-bold">#{shortId}</span>
        </div>
        <div className="flex justify-between">
          <span>TABLE:</span>
          <span className="font-bold">{order.table?.number}</span>
        </div>
        <div className="flex justify-between">
          <span>DATE:</span>
          <span className="font-bold">
            {dayjs(order.updatedAt).format("DD/MM/YYYY hh:mm A")}
          </span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-1">ITEM</th>
            <th className="text-center py-1">QTY</th>
            <th className="text-right py-1">AMT</th>
          </tr>
        </thead>
        <tbody>
          {order.items
            ?.filter((item: any) => item.status !== "CANCELLED")
            .map((item: any, i: number) => (
              <tr key={i}>
                <td className="py-1 uppercase text-[11px]">
                  {item.menuItem.name}
                </td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">
                  ₹{item.priceAtOrder * item.quantity}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <div className="border-t border-black pt-2 mt-2">
        <div className="flex justify-between font-bold text-base">
          <span>GRAND TOTAL</span>
          <span>₹{order.totalAmount}</span>
        </div>
      </div>

      <div className="text-center mt-6 text-[11px]">
        <div className="font-bold uppercase italic">Status: {order.status}</div>
        <div>Thank You! Please Visit Again.</div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="absolute top-6 right-6 flex gap-3">
        <Button size="icon" onClick={printThermalESC}>
          <Printer size={18} />
        </Button>
        <Button size="icon" onClick={downloadPDF}>
          <Download size={18} />
        </Button>
        <Button size="icon" variant="destructive" onClick={onClose}>
          <X size={18} />
        </Button>
      </div>

      <div className="bg-white p-4 shadow-2xl max-h-[90vh] overflow-y-auto rounded-sm">
        <div ref={receiptRef} className="bg-white text-black font-mono">
          <ReceiptContent />
        </div>
      </div>
    </div>
  );
}
