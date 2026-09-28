"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ky from "ky";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";
import type { Page, Workspace } from "@/generated/prisma/client";

const BUCKETS = [
  "Today",
  "Yesterday",
  "Earlier this week",
  "Earlier this month",
  "Older",
] as const;

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysAgo(date: Date) {
  return Math.round(
    (startOfDay(new Date()).getTime() - startOfDay(date).getTime()) / 86_400_000,
  );
}

function bucketFor(date: Date) {
  const days = daysAgo(date);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "Earlier this week";
  if (days < 31) return "Earlier this month";
  return "Older";
}

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "always" });

function relativeTime(date: Date) {
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (Math.abs(seconds) < 60) return "Just now";
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  if (Math.abs(days) < 7) return rtf.format(days, "day");
  if (Math.abs(days) < 31) return rtf.format(Math.round(days / 7), "week");
  if (Math.abs(days) < 365) return rtf.format(Math.round(days / 30), "month");
  return rtf.format(Math.round(days / 365), "year");
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Page() {
  const router = useRouter();
  const session = useSession();
  const filterRef = useRef<HTMLInputElement>(null);

  const [filter, setFilter] = useState("");
  const [creating, setCreating] = useState(false);

  const workspaceQuery = useQuery<{ workspaces: Workspace[] }>({
    queryKey: ["workspaces"],
    queryFn: () => ky.get("/api/workspace/all").json(),
  });

  const workspaceId = workspaceQuery.data?.workspaces?.[0]?.id;

  const pagesQuery = useQuery<{ pages: Page[] }>({
    queryKey: ["pages", workspaceId],
    queryFn: () => ky.get(`/api/page/all/${workspaceId}`).json(),
    enabled: !!workspaceId,
  });

  const createPage = useCallback(async () => {
    if (!workspaceId || creating) return;
    setCreating(true);
    try {
      const res = await ky
        .post("/api/page", { json: { workspaceId } })
        .json<{ page: { id: string } }>();
      router.push(`/page/${res.page.id}`);
    } finally {
      setCreating(false);
    }
  }, [workspaceId, creating, router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (event.key === "/" && !typing) {
        event.preventDefault();
        filterRef.current?.focus();
        return;
      }
      if (event.key === "n" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        void createPage();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [createPage]);

  const groups = useMemo(() => {
    const pages = pagesQuery.data?.pages ?? [];
    const needle = filter.trim().toLowerCase();
    const matching = needle
      ? pages.filter((page) => page.name.toLowerCase().includes(needle))
      : pages;

    const sorted = [...matching].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    return BUCKETS.map((label) => ({
      label,
      pages: sorted.filter((page) => bucketFor(new Date(page.updatedAt)) === label),
    })).filter((group) => group.pages.length > 0);
  }, [pagesQuery.data, filter]);

  if (session.isPending) {
    return <div className="p-10 text-sm text-muted-foreground">Loading your pages</div>;
  }

  const firstName = session.data?.user.name?.split(" ")[0];
  const hasWorkspace = !!workspaceId;
  const isLoading =
    workspaceQuery.isPending ||
    (hasWorkspace && pagesQuery.isPending && !pagesQuery.data);
  const hasFailed = pagesQuery.isError || workspaceQuery.isError;
  const total = pagesQuery.data?.pages.length ?? 0;
  const shown = groups.reduce((count, group) => count + group.pages.length, 0);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-16 md:px-10">
      <div className="mx-auto flex w-full max-w-xl flex-col pt-10 md:pt-14">
        <h1 className="text-xl font-medium">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {isLoading
            ? "Fetching pages"
            : hasFailed
              ? "Pages could not be loaded"
              : total === 0
                ? "No pages in this workspace"
                : `${total} ${total === 1 ? "page" : "pages"}`}
        </p>

        <div className="mt-8 flex items-center gap-2">
          <label htmlFor="page-filter" className="sr-only">
            Filter pages by name
          </label>
          <Input
            id="page-filter"
            ref={filterRef}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setFilter("");
            }}
            placeholder={total > 0 ? "Filter pages" : "No pages to filter yet"}
            disabled={total === 0}
            className="h-9 flex-1"
          />

          <Button
            onClick={() => void createPage()}
            disabled={!workspaceId || creating}
            className="h-9 shrink-0"
          >
            {creating ? "Creating" : "New page"}
          </Button>
        </div>

        {isLoading ? (
          <ul className="flex flex-col gap-3 pt-10">
            {Array.from({ length: 6 }).map((_, index) => (
              <li
                key={index}
                className="h-4 w-full max-w-xs animate-pulse bg-muted"
                aria-hidden
              />
            ))}
          </ul>
        ) : hasFailed ? (
          <div className="flex flex-col gap-2 pt-10 text-sm">
            <p className="font-medium">Your pages did not load</p>
            <p className="text-muted-foreground">
              The request failed before it reached the server. Try again, and if it keeps failing
              your session may have expired.
            </p>
            <button
              type="button"
              onClick={() => {
                void workspaceQuery.refetch();
                void pagesQuery.refetch();
              }}
              className="w-fit underline underline-offset-4 hover:no-underline"
            >
              Retry
            </button>
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col gap-2 pt-10 text-sm">
            {hasWorkspace ? (
              <>
                <p className="font-medium">This workspace has no pages yet</p>
                <p className="text-muted-foreground">
                  A page holds blocks of text, to-dos, headings and code. Start one here, then use
                  the sidebar to move between them.
                </p>
                <button
                  type="button"
                  onClick={() => void createPage()}
                  disabled={creating}
                  className="w-fit underline underline-offset-4 hover:no-underline disabled:pointer-events-none disabled:opacity-40"
                >
                  {creating ? "Creating" : "Create the first page"}
                </button>
              </>
            ) : (
              <>
                <p className="font-medium">You have no workspace yet</p>
                <p className="text-muted-foreground">
                  Pages live inside a workspace, so one has to exist before a page can be created.
                </p>
              </>
            )}
          </div>
        ) : shown === 0 ? (
          <div className="flex flex-col gap-2 pt-10 text-sm">
            <p className="font-medium">No page matches &ldquo;{filter.trim()}&rdquo;</p>
            <p className="text-muted-foreground">
              This filters page names. To search inside page content, press Ctrl K and search
              across every block you have written.
            </p>
            <button
              type="button"
              onClick={() => setFilter("")}
              className="w-fit underline underline-offset-4 hover:no-underline"
            >
              Clear filter
            </button>
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.label} className="pt-8 first:pt-6">
              <h2 className="text-sm text-muted-foreground">{group.label}</h2>
              <ul>
                {group.pages.map((page) => (
                  <li key={page.id}>
                    <a
                      href={`/page/${page.id}`}
                      className="flex items-baseline gap-4 rounded-md px-2 py-2.5 -mx-2 transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm">{page.name}</span>
                      <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                        {relativeTime(new Date(page.updatedAt))}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}