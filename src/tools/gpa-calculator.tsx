import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Stat, Bar, LETTER_4, LETTER_5, round, downloadCSV } from "./_edu";

type Scale = "4.0" | "5.0";
type Row = { id: number; name: string; credits: number; letter: string };

let nextId = 1;
function makeRow(letter = "A", credits = 3): Row {
  return { id: nextId++, name: "", credits, letter };
}

export default function GpaCalculator() {
  const [scale, setScale] = useState<Scale>("4.0");
  const [rows, setRows] = useState<Row[]>(() => [
    makeRow("A", 3),
    makeRow("B+", 4),
    makeRow("A-", 3),
  ]);

  const table = scale === "4.0" ? LETTER_4 : LETTER_5;
  const letters = table.map((r) => r.l);

  const r = useMemo(() => {
    let totalCredits = 0;
    let totalPoints = 0;
    const breakdown = new Map<string, number>();
    for (const row of rows) {
      const c = Number(row.credits);
      if (!c || c <= 0) continue;
      const gp = table.find((x) => x.l === row.letter)?.g ?? 0;
      totalCredits += c;
      totalPoints += gp * c;
      breakdown.set(row.letter, (breakdown.get(row.letter) ?? 0) + c);
    }
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    return { totalCredits, totalPoints, gpa, breakdown };
  }, [rows, table]);

  const update = (id: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: number) => setRows((rs) => rs.filter((r) => r.id !== id));

  const exportCsv = () => {
    const data: (string | number)[][] = [
      ["Course", "Credits", "Grade", "Points"],
      ...rows.map((row) => [
        row.name || "(untitled)",
        row.credits,
        row.letter,
        round((table.find((x) => x.l === row.letter)?.g ?? 0) * (Number(row.credits) || 0), 2),
      ]),
      [],
      ["Total credits", r.totalCredits, "GPA", round(r.gpa, 3)],
    ];
    downloadCSV("gpa-report.csv", data);
  };

  const maxBreak = Math.max(1, ...Array.from(r.breakdown.values()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Scale:</span>
        <Button size="sm" variant={scale === "4.0" ? "default" : "outline"} onClick={() => setScale("4.0")}>4.0 (unweighted)</Button>
        <Button size="sm" variant={scale === "5.0" ? "default" : "outline"} onClick={() => setScale("5.0")}>5.0 (weighted)</Button>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setRows((rs) => [...rs, makeRow()])}>+ Add course</Button>
          <Button size="sm" variant="outline" onClick={exportCsv} disabled={!rows.length}>Export CSV</Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="hidden grid-cols-12 gap-2 px-2 text-xs uppercase text-muted-foreground sm:grid">
          <div className="col-span-6">Course</div>
          <div className="col-span-2">Credits</div>
          <div className="col-span-3">Grade</div>
          <div className="col-span-1" />
        </div>
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-12 gap-2 rounded-lg border border-border p-2">
            <Input
              className="col-span-12 sm:col-span-6"
              placeholder="Course name (e.g. Calculus I)"
              value={row.name}
              onChange={(e) => update(row.id, { name: e.target.value })}
            />
            <Input
              className="col-span-6 sm:col-span-2"
              type="number"
              min={0}
              step="0.5"
              value={row.credits}
              onChange={(e) => update(row.id, { credits: +e.target.value })}
            />
            <select
              className="col-span-5 sm:col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={row.letter}
              onChange={(e) => update(row.id, { letter: e.target.value })}
            >
              {letters.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <Button
              size="sm"
              variant="ghost"
              className="col-span-1 text-destructive"
              onClick={() => remove(row.id)}
              aria-label="Remove row"
            >
              ×
            </Button>
          </div>
        ))}
        {!rows.length && (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No courses. Add one to start.
          </p>
        )}
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-3">
        <Stat label="GPA" value={round(r.gpa, 3)} highlight hint={`On a ${scale} scale`} />
        <Stat label="Total credits" value={round(r.totalCredits, 1)} />
        <Stat label="Quality points" value={round(r.totalPoints, 2)} />
      </div>

      {r.breakdown.size > 0 && (
        <div className="rounded-xl border border-border p-4">
          <h3 className="mb-3 text-sm font-semibold">Grade breakdown (credits per letter)</h3>
          <div className="space-y-2">
            {Array.from(r.breakdown.entries()).map(([letter, credits]) => (
              <div key={letter}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{letter}</span>
                  <span className="text-muted-foreground">{credits} credits</span>
                </div>
                <Bar percent={(credits / maxBreak) * 100} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}