import { BlockType } from "@/generated/prisma/enums";
import { HeadingLevel } from "@/types/block";

export type SlashCommand = {
  id: string;
  label: string;
  keywords: string[];
  type: BlockType;
  level?: HeadingLevel;
};

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "todo",
    label: "Todo",
    keywords: ["todo", "task", "checkbox"],
    type: "todo",
  },
  {
    id: "paragraph",
    label: "Paragraph",
    keywords: ["paragraph", "text"],
    type: "paragraph",
  },
  {
    id: "heading1",
    label: "Heading 1",
    keywords: ["h1", "heading1", "title", "heading"],
    type: "heading",
    level: 1,
  },
  {
    id: "heading2",
    label: "Heading 2",
    keywords: ["h2", "heading2", "subtitle", "heading"],
    type: "heading",
    level: 2,
  },
  {
    id: "heading3",
    label: "Heading 3",
    keywords: ["h3", "heading3", "heading"],
    type: "heading",
    level: 3,
  },
  {
    id: "heading4",
    label: "Heading 4",
    keywords: ["h4", "heading4", "heading"],
    type: "heading",
    level: 4,
  },
];

export function filterCommands(query: string) {
  const q = query.toLowerCase();

  return SLASH_COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(q) ||
    cmd.keywords.some((k) => k.includes(q))
  );
}
