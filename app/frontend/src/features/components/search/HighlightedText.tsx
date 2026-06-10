import { Fragment } from "react";
import { cn } from "@/lib/utils";

interface HighlightedTextProps {
  /** Text to render. May contain ts_headline `<b>…</b>` markers from the backend. */
  text: string;
  /** Fallback query term to highlight when `text` has no `<b>` markers. */
  query?: string;
  className?: string;
}

type Segment = { value: string; highlight: boolean };

const HEADLINE_TAG = /<b>[\s\S]*?<\/b>/i;

/**
 * Splits `text` into highlighted / plain segments.
 *
 * Postgres `ts_headline` wraps matches in `<b>…</b>` (covering stemmed
 * variants like "connections" for a "connection" query) — honor those when
 * present. Otherwise (e.g. the SQLite dev/test path returns a raw slice),
 * highlight occurrences of the query term directly.
 */
function buildSegments(text: string, query?: string): Segment[] {
  if (HEADLINE_TAG.test(text)) {
    return text
      .split(/(<b>[\s\S]*?<\/b>)/gi)
      .filter((part) => part.length > 0)
      .map((part) => {
        const match = part.match(/^<b>([\s\S]*?)<\/b>$/i);
        return match
          ? { value: match[1], highlight: true }
          : { value: part, highlight: false };
      });
  }

  const term = query?.trim();
  if (!term) return [{ value: text, highlight: false }];

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text
    .split(new RegExp(`(${escaped})`, "gi"))
    .filter((part) => part.length > 0)
    .map((part) => ({
      value: part,
      highlight: part.toLowerCase() === term.toLowerCase(),
    }));
}

export function HighlightedText({ text, query, className }: HighlightedTextProps) {
  const segments = buildSegments(text, query);

  return (
    <span className={className}>
      {segments.map((segment, i) =>
        segment.highlight ? (
          <mark
            key={i}
            className={cn(
              "rounded bg-signal/25 px-0.5 font-semibold text-foreground not-italic",
            )}
          >
            {segment.value}
          </mark>
        ) : (
          <Fragment key={i}>{segment.value}</Fragment>
        ),
      )}
    </span>
  );
}
