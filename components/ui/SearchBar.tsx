import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export function SearchBar({
  containerClassName,
  className,
  ...props
}: SearchBarProps) {
  return (
    <div className={cn("relative w-full md:w-64", containerClassName)}>
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        size={16}
      />
      <Input
        {...props}
        className={cn(
          " py-4 pl-10 bg-slate-100/50 border-slate-200 rounded-xl focus-visible:bg-white transition-all",
          className,
        )}
      />
    </div>
  );
}
