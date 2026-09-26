"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { SearchDialog } from "@/components/custom/SearchDialog";
import { cn } from "@/lib/utils";

export function SearchForm({ className, ...props }: React.ComponentProps<"div">) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle Ctrl+K / Cmd+K global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={cn("w-full sm:w-[320px]", className)} {...props}>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative w-full h-9 flex items-center justify-between pl-9 pr-2.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/50 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 text-sm text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer text-left select-none outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <span>Search...</span>

        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 opacity-50 select-none" />
      </button>

      <SearchDialog open={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
}

