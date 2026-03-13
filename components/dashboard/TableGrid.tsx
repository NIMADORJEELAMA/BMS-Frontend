// import TableCard from "../TableCard";

// export default function TableGrid({ tables, searchQuery, onTableClick }: any) {
//   // Filter logic updated to match your JSON keys
//   const filteredTables = tables.filter((table: any) => {
//     // 1. Check against table.name (New 1, Top 1, etc.)
//     const tableMatch = table.name
//       ?.toLowerCase()
//       .includes(searchQuery.toLowerCase());

//     // 2. Check against table.activeOrder.waiterName
//     const waiterMatch = table.activeOrder?.waiterName
//       ?.toLowerCase()
//       .includes(searchQuery.toLowerCase());

//     return tableMatch || waiterMatch;
//   });

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
//       {filteredTables.map((table: any) => (
//         <div
//           key={table.id}
//           onClick={() => onTableClick(table)}
//           className="cursor-pointer group"
//         >
//           {/* TableCard will now receive:
//              status: "OCCUPIED" | "FREE"
//              activeOrder.status: "CREATED" | "BILLED"
//           */}
//           <TableCard {...table} />
//         </div>
//       ))}

//       {filteredTables.length === 0 && (
//         <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
//           <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">
//             No tables found matching "{searchQuery}"
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState } from "react";
import TableCard from "../TableCard";
import { toast } from "react-hot-toast"; // or your preferred toast lib
import { cn } from "@/lib/utils";

export default function TableGrid({
  tables,
  searchQuery,
  onTableClick,
  onSwapTables,
}: any) {
  // Track if we are in the middle of a swap
  const [sourceTable, setSourceTable] = useState<any>(null);

  const handleTableSelection = (table: any) => {
    // IF we are currently selecting a NEW destination
    if (sourceTable) {
      if (table.id === sourceTable.id) {
        setSourceTable(null); // Cancel swap if clicking same table
        return;
      }

      if (table.status === "FREE") {
        // TRIGGER SWAP
        onSwapTables(sourceTable.activeOrder.id, table.id);
        setSourceTable(null);
      } else {
        toast.error("Target table must be FREE");
        setSourceTable(null);
      }
      return;
    }

    // NORMAL CLICK LOGIC
    // If user clicks an occupied table, they might want to swap it
    // You could trigger this via a long-press or a specific "Swap" button
    // But for this example, we'll check if it's occupied
    onTableClick(table);
  };

  const filteredTables = tables.filter((table: any) => {
    const tableMatch = table.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const waiterMatch = table.activeOrder?.waiterName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return tableMatch || waiterMatch;
  });

  return (
    <div className="relative">
      {sourceTable && (
        <div className="mb-4 p-3 bg-blue-600 text-white rounded-xl flex justify-between items-center animate-bounce">
          <span>
            Moving <b>{sourceTable.name}</b>. Select a FREE table to complete
            swap...
          </span>
          <button
            onClick={() => setSourceTable(null)}
            className="underline text-sm"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTables.map((table: any) => (
          <div
            key={table.id}
            onClick={() => handleTableSelection(table)}
            className={cn(
              "cursor-pointer group transition-all",
              sourceTable?.id === table.id &&
                "ring-4 ring-blue-500 rounded-2xl scale-95 opacity-50",
            )}
          >
            <TableCard
              {...table}
              // Add a "Swap" button inside the card or use context menu
              onSwapClick={(e: any) => {
                e.stopPropagation();
                if (table.status !== "FREE") setSourceTable(table);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
