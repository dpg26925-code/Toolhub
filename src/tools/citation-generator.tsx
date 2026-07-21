import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type SourceType = "book" | "website" | "journal" | "youtube";
type Style = "apa" | "mla" | "chicago" | "harvard";

type Source = {
  id: number;
  type: SourceType;
  author: string;
  title: string;
  year: string;
  publisher: string;
  url: string;
  journal: string;
  volume: string;
  issue: string;
  pages: string;
  accessed: string;
};

let nextId = 1;
function makeSource(type: SourceType = "book"): Source {
  return {
    id: nextId++,
    type,
    author: "",
    title: "",
    year: String(new Date().getFullYear()),
    publisher: "",
    url: "",
    journal: "",
    volume: "",
    issue: "",
    pages: "",
    accessed: new Date().toISOString().slice(0, 10),
  };
}

function authorFirst(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "";
  if (trimmed.includes(",")) return trimmed;
  const parts = trimmed.split(/\s+/);
  const last = parts.pop()!;
  const initials = parts.map((p) => p[0]?.toUpperCase() + ".").join(" ");
  return initials ? `${last}, ${initials}` : last;
}

function apa(s: Source): string {
  const author = authorFirst(s.author) || "Unknown Author";
  const year = `(${s.year || "n.d."})`;
  if (s.type === "book") return `${author} ${year}. ${s.title}. ${s.publisher || "Publisher"}.`;
  if (s.type === "website") return `${author} ${year}. ${s.title}. ${s.publisher || ""}. ${s.url}`.trim();
  if (s.type === "journal") return `${author} ${year}. ${s.title}. ${s.journal}, ${s.volume}${s.issue ? `(${s.issue})` : ""}, ${s.pages}.`;
  return `${author} ${year}. ${s.title} [Video]. YouTube. ${s.url}`;
}
function mla(s: Source): string {
  const author = s.author || "Unknown Author";
  if (s.type === "book") return `${author}. ${s.title}. ${s.publisher || "Publisher"}, ${s.year}.`;
  if (s.type === "website") return `${author}. "${s.title}." ${s.publisher || ""}, ${s.year}, ${s.url}. Accessed ${s.accessed}.`;
  if (s.type === "journal") return `${author}. "${s.title}." ${s.journal}, vol. ${s.volume}, no. ${s.issue}, ${s.year}, pp. ${s.pages}.`;
  return `${author}. "${s.title}." YouTube, ${s.year}, ${s.url}.`;
}
function chicago(s: Source): string {
  const author = s.author || "Unknown Author";
  if (s.type === "book") return `${author}. ${s.title}. ${s.publisher || "Publisher"}, ${s.year}.`;
  if (s.type === "website") return `${author}. "${s.title}." ${s.publisher || ""}. ${s.year}. ${s.url}.`;
  if (s.type === "journal") return `${author}. "${s.title}." ${s.journal} ${s.volume}, no. ${s.issue} (${s.year}): ${s.pages}.`;
  return `${author}. "${s.title}." YouTube video, ${s.year}. ${s.url}.`;
}
function harvard(s: Source): string {
  const author = authorFirst(s.author) || "Unknown Author";
  if (s.type === "book") return `${author} (${s.year}) ${s.title}. ${s.publisher || "Publisher"}.`;
  if (s.type === "website") return `${author} (${s.year}) '${s.title}', ${s.publisher || ""}. Available at: ${s.url} (Accessed: ${s.accessed}).`;
  if (s.type === "journal") return `${author} (${s.year}) '${s.title}', ${s.journal}, ${s.volume}(${s.issue}), pp. ${s.pages}.`;
  return `${author} (${s.year}) ${s.title} [Video]. YouTube. Available at: ${s.url} (Accessed: ${s.accessed}).`;
}
function bibtex(s: Source): string {
  const key = ((s.author.split(/\s+/)[0] || "src") + s.year).replace(/\W+/g, "");
  const type = s.type === "book" ? "book" : s.type === "journal" ? "article" : "misc";
  const fields: [string, string][] = [
    ["author", s.author],
    ["title", s.title],
    ["year", s.year],
    ["publisher", s.publisher],
    ["journal", s.journal],
    ["volume", s.volume],
    ["number", s.issue],
    ["pages", s.pages],
    ["url", s.url],
  ].filter(([, v]) => v) as [string, string][];
  return `@${type}{${key},\n${fields.map(([k, v]) => `  ${k} = {${v}}`).join(",\n")}\n}`;
}

const FORMATTERS: Record<Style, (s: Source) => string> = { apa, mla, chicago, harvard };
const STYLE_LABEL: Record<Style, string> = { apa: "APA 7th", mla: "MLA 9th", chicago: "Chicago", harvard: "Harvard" };

export default function CitationGenerator() {
  const [style, setStyle] = useState<Style>("apa");
  const [sources, setSources] = useState<Source[]>(() => [makeSource("book")]);

  const update = (id: number, patch: Partial<Source>) =>
    setSources((s) => s.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: number) => setSources((s) => s.filter((r) => r.id !== id));
  const add = () => sources.length < 10 && setSources((s) => [...s, makeSource()]);

  const citations = useMemo(() => sources.map((s) => FORMATTERS[style](s)), [sources, style]);
  const bib = useMemo(() => sources.map(bibtex).join("\n\n"), [sources]);

  const copyAll = () => navigator.clipboard.writeText(citations.join("\n\n"));
  const copyBib = () => navigator.clipboard.writeText(bib);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Style:</span>
        {(Object.keys(STYLE_LABEL) as Style[]).map((s) => (
          <Button key={s} size="sm" variant={style === s ? "default" : "outline"} onClick={() => setStyle(s)}>
            {STYLE_LABEL[s]}
          </Button>
        ))}
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={add} disabled={sources.length >= 10}>+ Add source ({sources.length}/10)</Button>
        </div>
      </div>

      <div className="space-y-3">
        {sources.map((s) => (
          <div key={s.id} className="space-y-2 rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={s.type}
                onChange={(e) => update(s.id, { type: e.target.value as SourceType })}
                className="rounded-md border border-input bg-background px-2 py-1 text-sm"
              >
                <option value="book">Book</option>
                <option value="website">Website</option>
                <option value="journal">Journal article</option>
                <option value="youtube">YouTube video</option>
              </select>
              <Button size="sm" variant="ghost" className="ml-auto text-destructive" onClick={() => remove(s.id)}>Remove</Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Author(s)" value={s.author} onChange={(v) => update(s.id, { author: v })} placeholder="Smith, John" />
              <Field label="Title" value={s.title} onChange={(v) => update(s.id, { title: v })} />
              <Field label="Year" value={s.year} onChange={(v) => update(s.id, { year: v })} />
              {s.type === "book" && <Field label="Publisher" value={s.publisher} onChange={(v) => update(s.id, { publisher: v })} />}
              {(s.type === "website" || s.type === "youtube") && (
                <>
                  <Field label="URL" value={s.url} onChange={(v) => update(s.id, { url: v })} />
                  <Field label={s.type === "website" ? "Site name" : "Channel"} value={s.publisher} onChange={(v) => update(s.id, { publisher: v })} />
                  <Field label="Accessed" value={s.accessed} onChange={(v) => update(s.id, { accessed: v })} type="date" />
                </>
              )}
              {s.type === "journal" && (
                <>
                  <Field label="Journal" value={s.journal} onChange={(v) => update(s.id, { journal: v })} />
                  <Field label="Volume" value={s.volume} onChange={(v) => update(s.id, { volume: v })} />
                  <Field label="Issue" value={s.issue} onChange={(v) => update(s.id, { issue: v })} />
                  <Field label="Pages" value={s.pages} onChange={(v) => update(s.id, { pages: v })} placeholder="12–34" />
                </>
              )}
            </div>
            <div className="rounded-md bg-secondary/60 p-3 text-sm">
              <div className="mb-1 text-[10px] uppercase text-muted-foreground">{STYLE_LABEL[style]}</div>
              <p className="text-foreground">{FORMATTERS[style](s)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">All citations ({STYLE_LABEL[style]})</h3>
            <Button size="sm" variant="outline" onClick={copyAll} disabled={!sources.length}>Copy</Button>
          </div>
          <Textarea readOnly value={citations.join("\n\n")} className="min-h-32 font-mono text-xs" />
        </div>
        <div className="rounded-xl border border-border p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">BibTeX</h3>
            <Button size="sm" variant="outline" onClick={copyBib} disabled={!sources.length}>Copy</Button>
          </div>
          <Textarea readOnly value={bib} className="min-h-32 font-mono text-xs" />
        </div>
      </div>

      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
        <strong>Note:</strong> Always verify citations against the official style guide before submitting.
        This tool covers common formats but edge cases (multiple authors, edited volumes, DOI-first references) may need manual adjustment.
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} className="mt-1" />
    </div>
  );
}