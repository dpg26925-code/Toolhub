import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function strength(pw: string): { score: number; label: string; color: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
  const colors = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#22c55e", "#16a34a"];
  return { score: s, label: labels[s], color: colors[s] };
}

export default function PdfProtectTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const st = strength(pw);
  const canRun = !!file && pw.length >= 4 && pw === confirm && !busy;

  const run = async () => {
    if (!file) return;
    if (pw !== confirm) { setError("Passwords do not match"); return; }
    setBusy(true); setError(null); setUrl(null);
    try {
      const { PDFDocument } = await import("@cantoo/pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const data = await doc.save({
        // @ts-expect-error - encrypt supported by @cantoo/pdf-lib fork
        encrypt: {
          userPassword: pw,
          ownerPassword: pw,
          permissions: { printing: "highResolution", modifying: false, copying: false, annotating: false, fillingForms: true, contentAccessibility: true, documentAssembly: false },
        },
      });
      setUrl(URL.createObjectURL(new Blob([data as BlobPart], { type: "application/pdf" })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to encrypt PDF");
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>PDF file</Label>
        <Input type="file" accept="application/pdf" className="mt-1" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setUrl(null); setError(null); }} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Password</Label>
          <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1" />
          {pw && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              <div className="h-1.5 flex-1 overflow-hidden rounded bg-muted">
                <div className="h-full transition-all" style={{ width: `${(st.score / 5) * 100}%`, backgroundColor: st.color }} />
              </div>
              <span style={{ color: st.color }}>{st.label}</span>
            </div>
          )}
        </div>
        <div>
          <Label>Confirm password</Label>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1" />
          {confirm && pw !== confirm && <p className="mt-1 text-xs text-destructive">Passwords do not match</p>}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Adds a password required to open the PDF. Keep the password safe — there is no recovery.</p>
      <div className="flex gap-3">
        <Button onClick={run} disabled={!canRun}>{busy ? "Encrypting…" : "Protect PDF"}</Button>
        {url && <Button asChild variant="outline"><a href={url} download="protected.pdf">Download protected.pdf</a></Button>}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}