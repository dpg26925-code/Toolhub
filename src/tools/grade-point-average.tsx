import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Stat, Bar, LETTER_4, round, loadJSON, saveJSON, downloadCSV } from "./_edu";

type Course = { id: number; name: string; credits: number; letter: string };
type Semester = { id: number; name: string; courses: Course[] };

let cid = 1;
let sid = 1;
const makeCourse = (): Course => ({ id: cid++, name: "", credits: 3, letter: "A" });
const makeSemester = (name: string): Semester => ({ id: sid++, name, courses: [makeCourse()] });

const STORAGE_KEY = "nexatools.gpaTracker.v1";

function semesterGpa(s: Semester) {
  let cr = 0;
  let pts = 0;
  for (const c of s.courses) {
    const credits = Number(c.credits) || 0;
    if (credits <= 0) continue;
    const gp = LETTER_4.find((r) => r.l === c.letter)?.g ?? 0;
    cr += credits;
    pts += credits * gp;
  }
  return { credits: cr, points: pts, gpa: cr > 0 ? pts / cr : 0 };
}

export default function SemesterGpaTracker() {
  const [semesters, setSemesters] = useState<Semester[]>(() => [makeSemester("Fall 2024")]);

  // Load / save persistence
  useEffect(() => {
    const saved = loadJSON<Semester[]>(STORAGE_KEY, []);
    if (saved.length) {
      // rehydrate id counters
      sid = Math.max(...saved.map((s) => s.id)) + 1;
      cid = Math.max(1, ...saved.flatMap((s) => s.courses.map((c) => c.id))) + 1;
      setSemesters(saved);
    }
  }, []);
  useEffect(() => {
    saveJSON(STORAGE_KEY, semesters);
  }, [semesters]);

  const results = useMemo(() => semesters.map((s) => ({ s, ...semesterGpa(s) })), [semesters]);
  const totals = results.reduce(
    (a, r) => ({ credits: a.credits + r.credits, points: a.points + r.points }),
    { credits: 0, points: 0 }
  );
  const cumulative = totals.credits > 0 ? totals.points / totals.credits : 0;

  const patchSemester = (id: number, patch: Partial<Semester>) =>
    setSemesters((all) => all.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const patchCourse = (semId: number, courseId: number, patch: Partial<Course>) =>
    setSemesters((all) =>
      all.map((s) =>
        s.id === semId
          ? { ...s, courses: s.courses.map((c) => (c.id === courseId ? { ...c, ...patch } : c)) }
          : s
      )
    );
  const addSemester = () => setSemesters((all) => [...all, makeSemester(`Semester ${all.length + 1}`)]);
  const removeSemester = (id: number) => setSemesters((all) => all.filter((s) => s.id !== id));
  const addCourse = (semId: number) =>
    setSemesters((all) => all.map((s) => (s.id === semId ? { ...s, courses: [...s.courses, makeCourse()] } : s)));
  const removeCourse = (semId: number, cid: number) =>
    setSemesters((all) =>
      all.map((s) => (s.id === semId ? { ...s, courses: s.courses.filter((c) => c.id !== cid) } : s))
    );

  const clearAll = () => {
    if (confirm("Clear all semester data? This cannot be undone.")) {
      setSemesters([makeSemester("Semester 1")]);
    }
  };

  const exportCsv = () => {
    const rows: (string | number)[][] = [["Semester", "Course", "Credits", "Grade", "Points"]];
    for (const s of semesters) {
      for (const c of s.courses) {
        const gp = LETTER_4.find((r) => r.l === c.letter)?.g ?? 0;
        rows.push([s.name, c.name || "(untitled)", c.credits, c.letter, round(gp * (Number(c.credits) || 0), 2)]);
      }
      const g = semesterGpa(s);
      rows.push([s.name, "— Semester GPA —", g.credits, "", round(g.gpa, 3)]);
      rows.push([]);
    }
    rows.push(["Cumulative", "", totals.credits, "", round(cumulative, 3)]);
    downloadCSV("gpa-history.csv", rows);
  };

  const maxGpa = 4;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={addSemester}>+ Add semester</Button>
        <Button size="sm" variant="outline" onClick={exportCsv}>Export CSV</Button>
        <Button size="sm" variant="ghost" className="text-destructive" onClick={clearAll}>Clear all</Button>
      </div>

      <div className="space-y-4">
        {results.map((row) => (
          <div key={row.s.id} className="rounded-xl border border-border p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Input
                value={row.s.name}
                onChange={(e) => patchSemester(row.s.id, { name: e.target.value })}
                className="max-w-xs"
                placeholder="Semester name"
              />
              <span className="text-sm text-muted-foreground">
                GPA <strong className="text-foreground">{round(row.gpa, 3)}</strong> · {round(row.credits, 1)} credits
              </span>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={() => addCourse(row.s.id)}>+ Course</Button>
                {semesters.length > 1 && (
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeSemester(row.s.id)}>Remove</Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {row.s.courses.map((c) => (
                <div key={c.id} className="grid grid-cols-12 gap-2 rounded-lg border border-border p-2">
                  <Input
                    className="col-span-12 sm:col-span-6"
                    placeholder="Course name"
                    value={c.name}
                    onChange={(e) => patchCourse(row.s.id, c.id, { name: e.target.value })}
                  />
                  <Input
                    className="col-span-6 sm:col-span-2"
                    type="number"
                    min={0}
                    step="0.5"
                    value={c.credits}
                    onChange={(e) => patchCourse(row.s.id, c.id, { credits: +e.target.value })}
                  />
                  <select
                    className="col-span-5 sm:col-span-3 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={c.letter}
                    onChange={(e) => patchCourse(row.s.id, c.id, { letter: e.target.value })}
                  >
                    {LETTER_4.map((r) => <option key={r.l} value={r.l}>{r.l}</option>)}
                  </select>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="col-span-1 text-destructive"
                    onClick={() => removeCourse(row.s.id, c.id)}
                    aria-label="Remove course"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 sm:grid-cols-3">
        <Stat label="Cumulative GPA" value={round(cumulative, 3)} highlight />
        <Stat label="Total credits" value={round(totals.credits, 1)} />
        <Stat label="Total quality points" value={round(totals.points, 2)} />
      </div>

      <div className="rounded-xl border border-border p-4">
        <h3 className="mb-3 text-sm font-semibold">GPA trend by semester</h3>
        <div className="space-y-2">
          {results.map((row) => (
            <div key={row.s.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{row.s.name || "(unnamed)"}</span>
                <span className="text-muted-foreground">GPA {round(row.gpa, 3)}</span>
              </div>
              <Bar percent={(row.gpa / maxGpa) * 100} />
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Your GPA history is saved locally in your browser (nothing uploaded). Use <em>Export CSV</em> to keep a copy or share with your advisor.
        </p>
      </div>
    </div>
  );
}