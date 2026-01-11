import { SLASH_COMMANDS } from "@/commands/SlashCommands";

function SlashMenu({
    items,
    onSelect,
    position
}: {
    items: typeof SLASH_COMMANDS;
    onSelect: (cmd: typeof SLASH_COMMANDS[number]) => void;
    position: { left: number };
}) {
    return (
        <div className="absolute mt-2 w-64 rounded-md border text-primary bg-background shadow-lg z-50"
            style={{ left: position.left }}>
            {items.map((cmd) => (
                <div
                    key={cmd.id}
                    onClick={() => onSelect(cmd)}
                    className="px-3 py-2 cursor-pointer first:rounded-t-md last:rounded-b-md hover:bg-foreground/50"
                >
                    {cmd.label}
                </div>
            ))}
        </ div>
    );
}

export default SlashMenu
