"use client";

import React, { useState, useEffect, useRef } from "react";
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
    FileText, 
    CheckSquare, 
    Heading, 
    Code, 
    Command,
    CornerDownLeft,
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

    const results = data?.results || [];

    // Reset selected index when search query or results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [debouncedQuery, results.length]);

    // Handle redirection and close dialog
    const handleSelect = (result: SearchResult) => {
        onOpenChange(false);
        router.push(`/page/${result.pageId}`);
    };

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
    }, [open, results, selectedIndex]);

    // Scroll active item into view
    useEffect(() => {
        if (resultsContainerRef.current) {
            const activeElement = resultsContainerRef.current.querySelector('[data-active="true"]');
            if (activeElement) {
                activeElement.scrollIntoView({ block: "nearest" });
            }
        }
    }, [selectedIndex]);

    // Helper to render type icons
    const getBlockIcon = (type: string) => {
        switch (type) {
            case "todo":
                return <CheckSquare className="size-4 text-emerald-500 shrink-0" />;
            case "heading":
                return <Heading className="size-4 text-sky-500 shrink-0" />;
            case "code":
                return <Code className="size-4 text-amber-500 shrink-0" />;
            default:
                return <FileText className="size-4 text-neutral-500 shrink-0" />;
        }
    };

    // Helper to render block type badge name
    const getBlockTypeLabel = (type: string) => {
        switch (type) {
            case "todo":
                return "To-do";
            case "heading":
                return "Heading";
            case "code":
                return "Code";
            default:
                return "Paragraph";
        }
    };

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
                className="p-0 overflow-hidden max-w-xl border-neutral-200 dark:border-neutral-800 bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-2xl"
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">Search Blocks</DialogTitle>
                
                {/* Search Input Area */}
                <div className="flex items-center gap-3 border-b px-4 py-3 border-neutral-200 dark:border-neutral-800">
                    <Search className="size-5 text-neutral-400 shrink-0" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search text in blocks..."
                        className="flex-1 bg-transparent text-sm outline-none text-neutral-800 dark:text-neutral-100 placeholder-neutral-400"
                        autoFocus
                    />
                    <div className="flex items-center gap-1.5 shrink-0 bg-neutral-200/50 dark:bg-neutral-800/50 px-1.5 py-0.5 rounded text-[10px] text-neutral-400 font-mono">
                        <Command className="size-2.5" />
                        <span>K</span>
                    </div>
                </div>

                {/* Results List */}
                <div 
                    ref={resultsContainerRef} 
                    className="max-h-[350px] overflow-y-auto p-2 flex flex-col gap-1"
                >
                    {/* Empty Query / Welcome State */}
                    {!query.trim() && (
                        <div className="py-12 text-center text-sm text-neutral-400 dark:text-neutral-500">
                            <Search className="size-8 mx-auto mb-2 opacity-30 animate-pulse" />
                            <p>Type to search across all blocks...</p>
                        </div>
                    )}

                    {/* Searching State */}
                    {query.trim() && isLoading && (
                        <div className="py-12 text-center text-sm text-neutral-400 dark:text-neutral-500 flex flex-col items-center justify-center gap-2">
                            <Loader2 className="size-6 animate-spin text-neutral-400" />
                            <p>Searching workspace...</p>
                        </div>
                    )}

                    {/* No Results State */}
                    {query.trim() && !isLoading && results.length === 0 && (
                        <div className="py-12 text-center text-sm text-neutral-400 dark:text-neutral-500">
                            <p className="font-medium text-neutral-500">No results found for &ldquo;{query}&rdquo;</p>
                            <p className="text-xs mt-1 text-neutral-400">Try searching for other words or phrases.</p>
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
                                        "w-full text-left px-3 py-2.5 rounded-lg flex items-start justify-between gap-4 transition-all duration-150 group",
                                        isSelected 
                                            ? "bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50" 
                                            : "hover:bg-neutral-200/30 dark:hover:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300"
                                    )}
                                >
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="mt-1 shrink-0">
                                            {getBlockIcon(result.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {/* Page Path / Name */}
                                            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-0.5 flex items-center gap-1">
                                                <span>📄 {result.pageName || "Untitled Page"}</span>
                                            </div>
                                            {/* Snippet text */}
                                            <p className="text-sm truncate font-medium">
                                                <HighlightText text={text} query={query} />
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Action indicator */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[10px] bg-neutral-200 dark:bg-neutral-800 border border-neutral-300/40 dark:border-neutral-700/40 px-1.5 py-0.5 rounded text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
                                            {getBlockTypeLabel(result.type)}
                                        </span>
                                        {isSelected && (
                                            <CornerDownLeft className="size-3.5 text-neutral-400 animate-in fade-in duration-300" />
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer Guide */}
                <div className="border-t border-neutral-200 dark:border-neutral-800 px-4 py-2 flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500 bg-neutral-100/50 dark:bg-neutral-900/50 font-medium">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 bg-neutral-200 dark:bg-neutral-800 rounded font-mono border border-neutral-300/50 dark:border-neutral-700/50 text-[9px] shadow-sm">↑↓</kbd> Navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1 bg-neutral-200 dark:bg-neutral-800 rounded font-mono border border-neutral-300/50 dark:border-neutral-700/50 text-[9px] shadow-sm">Enter</kbd> Open
                        </span>
                    </div>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1 bg-neutral-200 dark:bg-neutral-800 rounded font-mono border border-neutral-300/50 dark:border-neutral-700/50 text-[9px] shadow-sm">Esc</kbd> Close
                    </span>
                </div>
            </DialogContent>
        </Dialog>
    );
}
