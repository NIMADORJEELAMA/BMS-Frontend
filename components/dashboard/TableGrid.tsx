import TableCard from "../TableCard";

export default function TableGrid({ tables, searchQuery, onTableClick }: any) {
  // Filter logic updated to match your JSON keys
  const filteredTables = tables.filter((table: any) => {
    // 1. Check against table.name (New 1, Top 1, etc.)
    const tableMatch = table.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    // 2. Check against table.activeOrder.waiterName
    const waiterMatch = table.activeOrder?.waiterName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    return tableMatch || waiterMatch;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
      {filteredTables.map((table: any) => (
        <div
          key={table.id}
          onClick={() => onTableClick(table)}
          className="cursor-pointer group"
        >
          {/* TableCard will now receive:
             status: "OCCUPIED" | "FREE"
             activeOrder.status: "CREATED" | "BILLED" 
          */}
          <TableCard {...table} />
        </div>
      ))}

      {filteredTables.length === 0 && (
        <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
          <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">
            No tables found matching "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}
