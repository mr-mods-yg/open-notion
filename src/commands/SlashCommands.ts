export type SlashCommand = {
  id: string;
  label: string;
  keywords: string[];
  insert: () => string;
};

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "h1",
    label: "Heading 1",
    keywords: ["h", "heading", "title"],
    insert: () => "# ",
  },
  {
    id: "h2",
    label: "Heading 2",
    keywords: ["h2", "heading"],
    insert: () => "## ",
  },
  {
    id: "todo",
    label: "Todo",
    keywords: ["todo", "task", "checkbox"],
    insert: () => "- [ ] ",
  },
  {
    id: "quote",
    label: "Quote",
    keywords: ["quote", "blockquote"],
    insert: () => "> ",
  },
  {
    id: "divider",
    label: "Divider",
    keywords: ["divider", "hr", "line"],
    insert: () => "---\n",
  },
];

export function filterCommands(query: string) {
  const q = query.toLowerCase();

  return SLASH_COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(q) ||
    cmd.keywords.some((k) => k.includes(q))
  );
}
