import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Tool() {
  const [name, setName] = useState("Jane Doe");
  const [dt, setDt] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
  const [clinic, setClinic] = useState("Sunrise Clinic");
  const [doctor, setDoctor] = useState("Dr. Nguyen");
  const [phone, setPhone] = useState("(555) 010-1234");

  const fmt = new Date(dt).toLocaleString();
  const sms = `Hi ${name}, reminder: your appointment with ${doctor} at ${clinic} is on ${fmt}. Reply Y to confirm or ${phone} to reschedule.`;
  const email = `Subject: Appointment reminder — ${fmt}\n\nDear ${name},\n\nThis is a reminder for your upcoming appointment at ${clinic} with ${doctor} on ${fmt}.\n\nPlease arrive 10 minutes early. If you need to reschedule, call us at ${phone}.\n\nBest regards,\n${clinic}`;

  const [copied, setCopied] = useState("");
  const copy = async (text: string, key: string) => { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 1500); };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Patient name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1"/></div>
        <div><Label>Date & time</Label><Input type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} className="mt-1"/></div>
        <div><Label>Clinic</Label><Input value={clinic} onChange={(e) => setClinic(e.target.value)} className="mt-1"/></div>
        <div><Label>Doctor</Label><Input value={doctor} onChange={(e) => setDoctor(e.target.value)} className="mt-1"/></div>
        <div className="sm:col-span-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1"/></div>
      </div>
      <div className="rounded-lg border p-3">
        <div className="mb-2 flex items-center justify-between"><div className="font-semibold">SMS ({sms.length}/160)</div><Button size="sm" variant="outline" onClick={() => copy(sms, "sms")}>{copied === "sms" ? "Copied!" : "Copy"}</Button></div>
        <Textarea readOnly value={sms} className="min-h-[80px]"/>
      </div>
      <div className="rounded-lg border p-3">
        <div className="mb-2 flex items-center justify-between"><div className="font-semibold">Email</div><Button size="sm" variant="outline" onClick={() => copy(email, "em")}>{copied === "em" ? "Copied!" : "Copy"}</Button></div>
        <Textarea readOnly value={email} className="min-h-[160px]"/>
      </div>
    </div>
  );
}