import TableCard from "../TableCard";

export default function TableGrid({ tables, searchQuery, onTableClick }: any) {
  // Filter logic
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
      {filteredTables.map((table: any) => (
        <div
          key={table.id}
          onClick={() => onTableClick(table)}
          className="cursor-pointer"
        >
          <TableCard {...table} />
        </div>
      ))}

      {filteredTables.length === 0 && (
        <div className="col-span-full py-20 text-center">
          <p className="text-gray-400 italic">
            No tables found matching "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}
