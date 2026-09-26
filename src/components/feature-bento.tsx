import {
  Check,
  Copy,
  ExternalLink,
  Search,
  SquarePen,
} from "lucide-react"

const card =
  "group relative flex h-full flex-col overflow-hidden rounded-(--radius) border border-border bg-card p-6 transition-shadow duration-200 ease-out hover:shadow-md"

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
      {children}
    </p>
  )
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
      {children}
    </h3>
  )
}

function CardBody({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">
      {children}
    </p>
  )
}

/* A block rendered the way BlockEditor renders one, so the preview matches the product. */
function MockBlock({ children, done }: { children: React.ReactNode; done?: boolean }) {
  return (
    <div className="border-border flex items-start gap-2 border-l-2 pl-3 text-sm">
      {done !== undefined && (
        <span className="border-border mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[4px] border">
          {done && <Check className="size-3" strokeWidth={3} />}
        </span>
      )}
      <span
        className={
          done
            ? "text-muted-foreground line-through"
            : "text-foreground/85"
        }
      >
        {children}
      </span>
    </div>
  )
}

export default function FeatureBento() {
  return (
    <section className="bg-muted/50 dark:bg-background relative z-10 py-16 lg:py-20">
      <div className="m-auto max-w-5xl px-6">
        <div className="max-w-2xl">
          <CardLabel>What you get</CardLabel>
          <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            A notebook your whole team can actually run
          </h2>
          <CardBody>
            OpenNotion keeps writing, finding, and sharing in one place, so
            nobody has to ask where a note ended up.
          </CardBody>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {/* The block editor, the product itself, gets the large cell. */}
          <article className={`${card} sm:row-span-2`}>
            <CardTitle>Every line is its own block</CardTitle>
            <CardBody>
              Hit Enter to split a block, Backspace to merge one away, and the
              arrow keys to move between them. No formatting toolbar to lose a
              paragraph in.
            </CardBody>

            <div
              aria-hidden
              className="border-border bg-muted/60 mt-6 flex flex-1 flex-col gap-4 rounded-(--radius) border p-4"
            >
              <p className="text-foreground text-base font-semibold">
                Q3 launch notes
              </p>
              <MockBlock>
                Ship the billing rewrite before the
                <span className="text-blue-700 dark:text-blue-400 underline">
                  {" "}
                  migration guide
                </span>
                {" "}
                goes out.
              </MockBlock>
              <MockBlock done>Confirm the staging seed data</MockBlock>
              <MockBlock done>Cut the release branch</MockBlock>
              <div className="border-border relative border-l-2 pl-3 text-sm">
                <span className="text-muted-foreground">
                  Draft the rollback steps
                </span>
                <span className="text-foreground motion-safe:ml-0.5 motion-safe:animate-pulse">
                  |
                </span>
              </div>
            </div>
          </article>

          <article className={card}>
            <CardTitle>Type slash to reshape</CardTitle>
            <CardBody>
              A block starts as plain text. Type / to turn it into a task or
              back again.
            </CardBody>

            <div
              aria-hidden
              className="border-border bg-muted/60 mt-6 flex flex-1 flex-col justify-between gap-4 rounded-(--radius) border p-5"
            >
              <p className="text-foreground text-base">
                <span className="text-muted-foreground">Ask Dana about </span>/t
                <span className="bg-foreground ml-px inline-block h-5 w-px align-middle" />
              </p>
              <div className="border-border bg-card flex flex-col overflow-hidden rounded-md border">
                <div className="text-foreground flex items-center gap-2 px-3.5 py-3 text-sm">
                  <SquarePen className="text-muted-foreground size-4 shrink-0" />
                  Todo
                </div>
                <div className="text-muted-foreground flex items-center gap-2 px-3.5 py-3 text-sm">
                  <SquarePen className="size-4 shrink-0" />
                  Paragraph
                </div>
              </div>
            </div>
          </article>

          <article className={card}>
            <CardTitle>Search every block</CardTitle>
            <CardBody>
              One shortcut searches the whole workspace and shows which page
              each hit came from.
            </CardBody>

            <div
              aria-hidden
              className="border-border bg-muted/60 mt-6 flex flex-1 flex-col gap-3 rounded-(--radius) border p-4"
            >
              <div className="text-muted-foreground flex items-center gap-2 text-base">
                <Search className="size-4 shrink-0" />
                <span>
                  roll<span className="text-foreground">back</span>
                </span>
              </div>
              <div className="border-border bg-card flex flex-col gap-3 rounded-md border p-3">
                <div className="min-w-0">
                  <p className="text-muted-foreground truncate text-[10px] font-semibold tracking-wider uppercase">
                    Q3 launch notes
                  </p>
                  <p className="text-foreground truncate text-sm">
                    Document the roll
                    <span className="bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-50 rounded-sm px-0.5">
                      back
                    </span>
                    {" "}
                    steps
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground truncate text-[10px] font-semibold tracking-wider uppercase">
                    Support playbook
                  </p>
                  <p className="text-foreground truncate text-sm">
                    Ask before any account change
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground truncate text-[10px] font-semibold tracking-wider uppercase">
                    Pricing rewrite
                  </p>
                  <p className="text-foreground truncate text-sm">
                    Announce the
                    <span className="bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-50 rounded-sm px-0.5">
                      back
                    </span>
                    {" "}
                    window
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className={card}>
            <CardTitle>Share a link, skip the login</CardTitle>
            <CardBody>
              Publish one page to a read only URL. Viewers see the finished
              note without needing an account.
            </CardBody>

            <div
              aria-hidden
              className="border-border bg-muted/60 mt-6 flex flex-1 flex-col gap-3 rounded-(--radius) border p-4"
            >
              <div className="border-border bg-card flex items-center gap-2 rounded-md border px-3 py-2.5">
                <span className="text-muted-foreground min-w-0 flex-1 truncate font-mono text-sm">
                  /share/8c41d2
                </span>
                <Copy className="text-muted-foreground size-4 shrink-0" />
              </div>
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <Check className="size-4" strokeWidth={3} />
                Anyone with the link can read
              </p>
              <div className="border-border bg-card flex flex-col gap-2.5 rounded-md border p-3">
                <p className="text-foreground text-sm font-semibold">
                  Release checklist
                </p>
                <MockBlock done>Tag and publish the build</MockBlock>
                <MockBlock>Post the upgrade note</MockBlock>
              </div>
            </div>
          </article>

          <article className={card}>
            <CardTitle>Links turn live on their own</CardTitle>
            <CardBody>
              Paste a URL and it becomes clickable as you type, with a preview
              before it opens.
            </CardBody>

            <div
              aria-hidden
              className="border-border bg-muted/60 mt-6 flex flex-1 flex-col justify-center gap-3 rounded-(--radius) border p-4"
            >
              <p className="text-foreground text-base leading-relaxed">
                The spec lives at
                <span className="relative ml-1 inline-block">
                  <span className="text-blue-700 dark:text-blue-400 underline">
                    stripe.com/docs/billing
                  </span>
                  <span className="bg-foreground text-background absolute top-full left-0 mt-1.5 flex items-center gap-1 rounded px-2 py-1 text-xs whitespace-nowrap">
                    Open link <ExternalLink className="size-3" />
                  </span>
                </span>
                , so keep both in the same block.
              </p>
              <p className="text-foreground text-base leading-relaxed">
                Retro notes are in
                <span className="text-blue-700 dark:text-blue-400 ml-1 underline">
                  notion.so/opennotion/retro
                </span>
                .
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
