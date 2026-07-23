import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COMMON = new Set(["password","123456","12345678","qwerty","abc123","111111","letmein","admin","welcome","monkey","dragon","iloveyou","password1","000000"]);

function analyze(pw: string) {
  const len = pw.length;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSym = /[^A-Za-z0-9]/.test(pw);
  let pool = 0;
  if (hasLower) pool += 26;
  if (hasUpper) pool += 26;
  if (hasDigit) pool += 10;
  if (hasSym) pool += 33;
  const entropy = len && pool ? Math.log2(pool) * len : 0;
  const isCommon = COMMON.has(pw.toLowerCase());
  const hasSeq = /(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|qwer|wert|erty|asdf)/i.test(pw);
  const hasRepeat = /(.)\1{2,}/.test(pw);

  let score = 0;
  score += Math.min(40, len * 3);
  score += hasLower ? 8 : 0;
  score += hasUpper ? 10 : 0;
  score += hasDigit ? 10 : 0;
  score += hasSym ? 15 : 0;
  score += Math.min(20, Math.round(entropy / 5));
  if (isCommon) score = Math.min(score, 10);
  if (hasSeq) score -= 15;
  if (hasRepeat) score -= 10;
  score = Math.max(0, Math.min(100, score));

  // guesses/sec assumption: 1e10 (offline hash)
  const guesses = Math.pow(2, entropy);
  const seconds = guesses / 1e10;
  const humanTime = (s: number) => {
    if (!isFinite(s) || s > 1e18) return "centuries";
    if (s < 1) return "instant";
    if (s < 60) return `${s.toFixed(0)} seconds`;
    if (s < 3600) return `${(s / 60).toFixed(0)} minutes`;
    if (s < 86400) return `${(s / 3600).toFixed(0)} hours`;
    if (s < 2592000) return `${(s / 86400).toFixed(0)} days`;
    if (s < 31536000) return `${(s / 2592000).toFixed(0)} months`;
    if (s < 31536000 * 100) return `${(s / 31536000).toFixed(0)} years`;
    return "centuries";
  };

  const tips: string[] = [];
  if (len < 12) tips.push("Use at least 12 characters — 16+ is much stronger.");
  if (!hasUpper) tips.push("Add uppercase letters (A-Z).");
  if (!hasDigit) tips.push("Add digits (0-9).");
  if (!hasSym) tips.push("Add symbols (!@#$%…).");
  if (isCommon) tips.push("This password is on public leaked lists. Change it now.");
  if (hasSeq) tips.push("Avoid sequences like '1234' or 'abcd'.");
  if (hasRepeat) tips.push("Avoid repeated characters like 'aaa'.");

  const label = score >= 80 ? "Very strong" : score >= 60 ? "Strong" : score >= 40 ? "Medium" : score >= 20 ? "Weak" : "Very weak";
  const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : score >= 20 ? "bg-orange-500" : "bg-red-500";

  return { score, entropy, humanTime: humanTime(seconds), tips, label, color, len, hasLower, hasUpper, hasDigit, hasSym };
}

export default function PasswordStrengthTesterTool() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const a = useMemo(() => analyze(pw), [pw]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Password</Label>
        <div className="mt-1 flex gap-2">
          <Input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Type or paste a password" />
          <button type="button" onClick={() => setShow((s) => !s)} className="rounded-md border px-3 text-sm">{show ? "Hide" : "Show"}</button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Passwords are analysed locally in your browser — nothing is sent anywhere.</p>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-semibold">{a.label}</span>
          <span className="text-muted-foreground">{a.score} / 100</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className={`h-full ${a.color} transition-all`} style={{ width: `${a.score}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Length", `${a.len} chars`],
          ["Entropy", `${a.entropy.toFixed(1)} bits`],
          ["Time to crack", a.humanTime],
          ["Character sets", [a.hasLower && "a-z", a.hasUpper && "A-Z", a.hasDigit && "0-9", a.hasSym && "!@#"].filter(Boolean).join(" · ") || "—"],
        ].map(([k, v]) => (
          <div key={k as string} className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">{k}</div>
            <div className="mt-0.5 text-sm font-semibold">{v}</div>
          </div>
        ))}
      </div>
      {a.tips.length > 0 && (
        <div className="rounded-lg border bg-muted/40 p-3">
          <div className="mb-2 text-sm font-semibold">Suggestions</div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {a.tips.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}