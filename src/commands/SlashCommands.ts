export type SlashCommand = {
  id: string;
  label: string;
  keywords: string[];
};

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "todo",
    label: "Todo",
    keywords: ["todo", "task", "checkbox"],
  },
  {
    id: "paragraph",
    label: "Paragraph",
    keywords: ["paragraph"],
  }
];

export function filterCommands(query: string) {
  const q = query.toLowerCase();

  return SLASH_COMMANDS.filter((cmd) =>
    cmd.label.toLowerCase().includes(q) ||
    cmd.keywords.some((k) => k.includes(q))
  );
}
