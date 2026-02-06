"use client";
import { useState, useMemo } from "react";
import { useUsers } from "@/hooks/useUsers";
import { useMonthlyAttendance, useMarkAttendance } from "@/hooks/useOperations";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Circle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AttendanceTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: users = [] } = useUsers();
  const { data: attendanceLogs = [], isLoading } = useMonthlyAttendance(
    year,
    month,
  );
  const markAttendance = useMarkAttendance();

  // Generate array of days in the month (e.g. [1, 2, 3...31])
  const daysInMonth = useMemo(() => {
    const date = new Date(year, month, 0);
    return Array.from({ length: date.getDate() }, (_, i) => i + 1);
  }, [year, month]);

  const handleToggle = (userId: string, day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // Logic: If already present, don't do anything (or delete if you want a true toggle)
    markAttendance.mutate(
      {
        userId,
        date: dateStr,
        checkIn: "09:00", // Default check-in time
      },
      {
        onSuccess: () => toast.success("Marked Present"),
      },
    );
  };

  if (isLoading)
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="animate-spin text-slate-200" size={40} />
      </div>
    );

  return (
    <div className="p-6 space-y-4">
      {/* MATRIX CONTROLS */}
      <div className="flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-2xl text-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 2))}
            className="p-2 hover:bg-white/10 rounded-full"
          >
            <ChevronLeft size={18} />
          </button>
          <h3 className="text-sm font-black uppercase tracking-widest italic">
            {currentDate.toLocaleString("default", { month: "long" })} {year}
          </h3>
          <button
            onClick={() => setCurrentDate(new Date(year, month))}
            className="p-2 hover:bg-white/10 rounded-full"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
          Click a cell to mark presence
        </div>
      </div>

      {/* THE GRID */}
      <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="sticky left-0 bg-slate-50 px-6 py-4 text-[10px] font-black text-slate-400 uppercase border-r z-10 w-48">
                Staff Member
              </th>
              {daysInMonth.map((day) => (
                <th
                  key={day}
                  className="px-2 py-4 text-[9px] font-black text-slate-400 text-center border-r min-w-[35px]"
                >
                  {day}
                </th>
              ))}
              {/* SUMMARY COLUMN HEADER */}
              <th className="px-6 py-4 text-[10px] font-black text-blue-600 uppercase text-center bg-blue-50/50">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user: any) => {
              // Access summary from query data (data.summary[userId])
              const totalPresent = attendanceLogs?.summary?.[user.id] || 0;

              return (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="sticky left-0 bg-white px-6 py-4 font-bold text-slate-900 text-xs border-r z-10 uppercase tracking-tighter">
                    {user.name}
                  </td>
                  {daysInMonth.map((day) => {
                    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isPresent = attendanceLogs?.logs?.some(
                      (l: any) => l.userId === user.id && l.date === dateStr,
                    );

                    return (
                      <td
                        key={day}
                        onClick={() =>
                          markAttendance.mutate({
                            userId: user.id,
                            date: dateStr,
                          })
                        }
                        className={`px-2 py-4 text-center border-r border-slate-100 cursor-pointer transition-all ${isPresent ? "bg-emerald-50/30" : "hover:bg-slate-100"}`}
                      >
                        {isPresent ? (
                          <CheckCircle2
                            size={16}
                            className="text-emerald-500 mx-auto"
                          />
                        ) : (
                          <Circle
                            size={16}
                            className="text-slate-200 mx-auto"
                          />
                        )}
                      </td>
                    );
                  })}
                  {/* SUMMARY CELL */}
                  <td className="px-6 py-4 text-center font-black text-blue-700 bg-blue-50/30 text-sm italic">
                    {totalPresent}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="sticky left-0 bg-slate-50 px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 z-10 w-48">
                Staff Member
              </th>
              {daysInMonth.map((day) => (
                <th
                  key={day}
                  className="px-3 py-4 text-[9px] font-black text-slate-400 text-center border-r border-slate-100 min-w-[40px]"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user: any) => (
              <tr
                key={user.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="sticky left-0 bg-white px-6 py-4 font-bold text-slate-900 text-xs border-r border-slate-200 z-10 uppercase tracking-tighter">
                  {user.name}
                </td>
                {daysInMonth.map((day) => {
                  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isPresent = attendanceLogs.some(
                    (l: any) => l.userId === user.id && l.date === dateStr,
                  );

                  return (
                    <td
                      key={day}
                      onClick={() => !isPresent && handleToggle(user.id, day)}
                      className={`px-3 py-4 text-center border-r border-slate-100 cursor-pointer transition-all ${isPresent ? "bg-emerald-50/30" : "hover:bg-slate-100"}`}
                    >
                      {isPresent ? (
                        <CheckCircle2
                          size={16}
                          className="text-emerald-500 mx-auto"
                        />
                      ) : (
                        <Circle size={16} className="text-slate-200 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table> */}
      </div>
    </div>
  );
}
