"use client";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

function HighlightedText({ text, lineThrough }: { text: string, lineThrough?: boolean }) {
    const parts: { text: string; isUrl: boolean }[] = [];
    const [hoverLink, setHoverLink] = useState<string | null>(null);
    let lastIndex = 0;

    text.replace(URL_REGEX, (match, _, offset) => {
        if (offset > lastIndex) {
            parts.push({ text: text.slice(lastIndex, offset), isUrl: false });
        }
        parts.push({ text: match, isUrl: true });
        lastIndex = offset + match.length;
        return match;
    });

    if (lastIndex < text.length) {
        parts.push({ text: text.slice(lastIndex), isUrl: false });
    }

    return (
        <span className={`${lineThrough ? "opacity-80" : ""}`}>
            {parts.map((p, i) =>
                p.isUrl ? (
                    <span
                        key={i}
                        className="relative inline-block"
                        onMouseEnter={() => setHoverLink(p.text)}
                        onMouseLeave={() => setHoverLink(null)}
                    >
                        {/* link */}
                        <span
                            className="
                                text-blue-700 dark:text-blue-400
                                underline
                                pointer-events-auto
                                cursor-pointer
                            "
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const url = p.text.startsWith("http") ? p.text : `https://${p.text}`;
                                window.open(url, "_blank");
                            }}
                        >
                            {p.text}
                        </span>

                        {/* tooltip */}
                        {hoverLink === p.text && (
                            <span
                                className="
                                    absolute left-0 top-full mt-1
                                    z-50
                                    bg-foreground text-background
                                    text-xs
                                    px-2 py-1
                                    rounded
                                    whitespace-nowrap
                                    shadow flex gap-1
                                    "
                            >
                                Open link <ExternalLink size={15} />
                            </span>
                        )}
                    </span>
                ) : (
                    <span key={i} className={`${lineThrough ? "line-through" : ""}`}>{p.text}</span>
                )
            )}
        </span>
    );
}

export default HighlightedText