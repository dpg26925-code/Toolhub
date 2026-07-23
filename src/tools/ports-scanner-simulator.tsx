import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COMMON: Record<number, string> = {
  20: "FTP data", 21: "FTP control", 22: "SSH", 23: "Telnet", 25: "SMTP",
  53: "DNS", 67: "DHCP server", 68: "DHCP client", 69: "TFTP",
  80: "HTTP", 110: "POP3", 123: "NTP", 143: "IMAP", 161: "SNMP",
  194: "IRC", 389: "LDAP", 443: "HTTPS", 445: "SMB", 465: "SMTPS",
  514: "syslog", 587: "SMTP submission", 636: "LDAPS", 993: "IMAPS",
  995: "POP3S", 1080: "SOCKS proxy", 1433: "MS SQL", 1521: "Oracle DB",
  1723: "PPTP", 2049: "NFS", 2181: "ZooKeeper", 27017: "MongoDB",
  3000: "Dev server", 3306: "MySQL", 3389: "RDP", 5000: "Dev / UPnP",
  5432: "PostgreSQL", 5672: "AMQP", 5900: "VNC", 5984: "CouchDB",
  6379: "Redis", 8000: "Dev HTTP", 8080: "HTTP alt", 8443: "HTTPS alt",
  9000: "PHP-FPM", 9092: "Kafka", 9200: "Elasticsearch", 11211: "Memcached",
};

function status(port: number): { s: "known" | "unknown"; role: string } {
  const role = COMMON[port];
  return role ? { s: "known", role } : { s: "unknown", role: "no common service" };
}

export default function PortsScannerSimulatorTool() {
  const [host, setHost] = useState("example.com");
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(1024);

  const ports = useMemo(() => {
    const start = Math.max(1, Math.min(from, to));
    const end = Math.min(65535, Math.max(from, to));
    const result: { port: number; s: "known" | "unknown"; role: string }[] = [];
    for (let p = start; p <= end && result.length < 512; p++) result.push({ port: p, ...status(p) });
    return result;
  }, [from, to]);

  const known = ports.filter((p) => p.s === "known");
  const nmapCmd = `nmap -Pn -p ${from}-${to} ${host || "example.com"}`;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
        ⚠️ Browsers can't scan TCP/UDP ports on remote hosts — that requires a real socket. This tool is an <strong>educational simulator</strong> showing what each port is normally used for. Never scan a network you don't own.
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Host</Label><Input value={host} onChange={(e) => setHost(e.target.value)} className="mt-1"/></div>
        <div><Label>From port</Label><Input type="number" min={1} max={65535} value={from} onChange={(e) => setFrom(+e.target.value)} className="mt-1"/></div>
        <div><Label>To port</Label><Input type="number" min={1} max={65535} value={to} onChange={(e) => setTo(+e.target.value)} className="mt-1"/></div>
      </div>
      <div className="rounded-lg border p-3">
        <div className="mb-2 text-sm font-semibold">Known services in range ({known.length})</div>
        <div className="max-h-80 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted"><tr><th className="p-2 text-left">Port</th><th className="p-2 text-left">Service</th></tr></thead>
            <tbody>
              {known.map((p) => (
                <tr key={p.port} className="border-t"><td className="p-2 font-mono">{p.port}</td><td className="p-2">{p.role}</td></tr>
              ))}
              {!known.length && <tr><td colSpan={2} className="p-3 text-center text-muted-foreground">No well-known ports in this range.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-lg border p-3">
        <div className="mb-1 text-sm font-semibold">Real scan (run locally)</div>
        <pre className="overflow-x-auto rounded bg-muted p-2 font-mono text-xs">{nmapCmd}</pre>
        <Button size="sm" variant="outline" className="mt-2" onClick={() => navigator.clipboard.writeText(nmapCmd)}>Copy command</Button>
      </div>
    </div>
  );
}