import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TableProps {
  name: string;
  status: "FREE" | "OCCUPIED" | "BILLED";
  activeOrder?: {
    waiterName: string;
    runningTotal: number;
  } | null;
}

export default function TableCard({ name, status, activeOrder }: TableProps) {
  return (
    <div
      className={cn(
        "p-6 rounded-xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md",
        status === "FREE" && "bg-green-50 border-green-200",
        status === "OCCUPIED" && "bg-red-50 border-red-200",
        status === "BILLED" && "bg-amber-50 border-amber-200",
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">{name}</h3>
        <span
          className={cn(
            "px-2 py-1 rounded text-xs font-bold uppercase",
            status === "FREE" && "bg-green-200 text-green-800",
            status === "OCCUPIED" && "bg-red-200 text-red-800",
            status === "BILLED" && "bg-amber-200 text-amber-800",
          )}
        >
          {status}
        </span>
      </div>

      {activeOrder ? (
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            Waiter: {activeOrder.waiterName}
          </p>
          <p className="text-lg font-mono font-bold text-gray-900">
            ₹{activeOrder.runningTotal}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">Ready for guests</p>
      )}
    </div>
  );
}
