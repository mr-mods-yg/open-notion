"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { 
    Search, 
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// Search result item type
interface SearchResult {
    id: string;
    type: "paragraph" | "todo" | "heading" | "code";
    content: {
        text?: string;
        task?: boolean;
    };
    pageId: string;
    pageName: string;
}

interface SearchResponse {
    results: SearchResult[];
}

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 300);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const resultsContainerRef = useRef<HTMLDivElement>(null);

    // Fetch search results from our new API route
    const { data, isLoading } = useQuery<SearchResponse>({
        queryKey: ["search-blocks", debouncedQuery],
        queryFn: () => ky.get(`/api/search?q=${encodeURIComponent(debouncedQuery)}`).json(),
        enabled: open && debouncedQuery.trim().length > 0,
    });

    const results = useMemo(() => data?.results ?? [], [data]);

    // Reset selected index when the query or result count changes.
    // Adjusting state during render avoids a cascading effect render.
    const selectionKey = `${debouncedQuery}:${results.length}`;
    const [lastSelectionKey, setLastSelectionKey] = useState(selectionKey);
    if (lastSelectionKey !== selectionKey) {
        setLastSelectionKey(selectionKey);
        setSelectedIndex(0);
    }

    // Handle redirection and close dialog
    const handleSelect = useCallback((result: SearchResult) => {
        onOpenChange(false);
        router.push(`/page/${result.pageId}`);
    }, [onOpenChange, router]);

    // Keyboard navigation handlers
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
            } else if (e.key === "Enter") {
                e.preventDefault();
                if (results[selectedIndex]) {
                    handleSelect(results[selectedIndex]);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, results, selectedIndex, handleSelect]);

    // Scroll active item into view
    useEffect(() => {
        if (resultsContainerRef.current) {
            const activeElement = resultsContainerRef.current.querySelector('[data-active="true"]');
            if (activeElement) {
                activeElement.scrollIntoView({ block: "nearest" });
            }
        }
    }, [selectedIndex]);

    // Helper to escape regex special characters
    const escapeRegExp = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    // Highlight search query
    const HighlightText = ({ text, query }: { text: string; query: string }) => {
        if (!query.trim()) return <span>{text}</span>;
        const escapedQuery = escapeRegExp(query);
        const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
        
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 dark:text-white px-0.5 rounded">
                            {part}
                        </mark>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="p-0 overflow-hidden flex flex-col gap-0 w-[min(94vw,760px)] sm:max-w-4xl h-[min(68svh,500px)] border-neutral-200 dark:border-neutral-800 bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-2xl"
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">Search Blocks</DialogTitle>
                
                {/* Search Input Area */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
                    <Search className="size-6 text-neutral-400 shrink-0" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search text in blocks..."
                        className="flex-1 bg-transparent text-base outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400"
                        autoFocus
                    />
                </div>

                {/* Results List */}
                <div 
                    ref={resultsContainerRef} 
                    className="flex-1 min-h-0 overflow-y-auto p-2 flex flex-col gap-1"
                >
                    {/* Empty Query / Welcome State */}
                    {!query.trim() && (
                        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-base text-neutral-400 dark:text-neutral-500">
                            <Search className="size-10 mb-4 text-neutral-300 dark:text-neutral-600" />
                            <p>Type to search across all blocks</p>
                            <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-500">
                                Every paragraph, to-do, and heading you have written.
                            </p>
                        </div>
                    )}

                    {/* Searching State */}
                    {query.trim() && isLoading && (
                        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-base text-neutral-400 dark:text-neutral-500">
                            <Loader2 className="size-7 animate-spin text-neutral-400" />
                            <p className="mt-4">Searching blocks for &ldquo;{query}&rdquo;</p>
                        </div>
                    )}

                    {/* No Results State */}
                    {query.trim() && !isLoading && results.length === 0 && (
                        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-base text-neutral-400 dark:text-neutral-500">
                            <p className="font-medium text-neutral-500">No blocks match &ldquo;{query}&rdquo;</p>
                            <p className="mt-2 text-sm text-neutral-400">Try a shorter word, or a phrase you remember writing.</p>
                        </div>
                    )}

                    {/* Results Items */}
                    {query.trim() && !isLoading && results.length > 0 && (
                        results.map((result, index) => {
                            const isSelected = index === selectedIndex;
                            const text = result.content.text || "";
                            
                            return (
                                <button
                                    key={result.id}
                                    data-active={isSelected}
                                    onClick={() => handleSelect(result)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={cn(
                                        "w-full text-left px-4 py-3 rounded flex flex-col gap-0.5 transition-colors duration-150",
                                        isSelected
                                            ? "bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
                                            : "hover:bg-neutral-200/30 dark:hover:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300"
                                    )}
                                >
                                    <span className="truncate text-base">
                                        <HighlightText text={text} query={query} />
                                    </span>
                                    <span className="truncate text-sm text-neutral-400 dark:text-neutral-500">
                                        {result.pageName || "Untitled page"}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>


            </DialogContent>
        </Dialog>
    );
}
