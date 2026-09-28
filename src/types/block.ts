export type HeadingLevel = 1 | 2 | 3 | 4

export type BlockContent =
    | { text: string }  // paragraph, code
    | { text: string; task: boolean }  // todo
    | { text: string; level: HeadingLevel }  // heading

export const HEADING_CLASSES: Record<HeadingLevel, string> = {
    1: "text-2xl sm:text-3xl font-semibold",
    2: "text-xl sm:text-2xl font-semibold",
    3: "text-lg sm:text-xl font-medium",
    4: "text-base sm:text-lg font-medium",
}

export function getHeadingLevel(content: unknown): HeadingLevel {
    const level = (content as { level?: number } | null)?.level
    if (level === 1 || level === 2 || level === 3 || level === 4) return level
    return 2
}
