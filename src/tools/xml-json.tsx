import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

function nodeToJson(node: Element): unknown {
  const obj: Record<string, unknown> = {};
  for (const attr of Array.from(node.attributes)) obj[`@${attr.name}`] = attr.value;
  const children = Array.from(node.children);
  if (children.length === 0) {
    const text = node.textContent?.trim() ?? "";
    if (Object.keys(obj).length === 0) return text;
    if (text) obj["#text"] = text;
    return obj;
  }
  for (const child of children) {
    const key = child.tagName;
    const val = nodeToJson(child);
    if (obj[key] === undefined) obj[key] = val;
    else if (Array.isArray(obj[key])) (obj[key] as unknown[]).push(val);
    else obj[key] = [obj[key], val];
  }
  return obj;
}

function xmlToJson(xml: string): string {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const err = doc.querySelector("parsererror");
  if (err) throw new Error("Invalid XML");
  const root = doc.documentElement;
  return JSON.stringify({ [root.tagName]: nodeToJson(root) }, null, 2);
}

function jsonToXml(json: string): string {
  const data = JSON.parse(json);
  const build = (name: string, val: unknown): string => {
    if (val === null || val === undefined) return `<${name}/>`;
    if (Array.isArray(val)) return val.map((v) => build(name, v)).join("");
    if (typeof val === "object") {
      const attrs: string[] = []; const inner: string[] = [];
      for (const [k, v] of Object.entries(val)) {
        if (k.startsWith("@")) attrs.push(`${k.slice(1)}="${String(v)}"`);
        else if (k === "#text") inner.push(String(v));
        else inner.push(build(k, v));
      }
      const attrStr = attrs.length ? " " + attrs.join(" ") : "";
      return inner.length ? `<${name}${attrStr}>${inner.join("")}</${name}>` : `<${name}${attrStr}/>`;
    }
    return `<${name}>${String(val)}</${name}>`;
  };
  const [rootName, rootVal] = Object.entries(data)[0] ?? ["root", data];
  return `<?xml version="1.0" encoding="UTF-8"?>\n${build(rootName, rootVal)}`;
}

export default function XmlJsonTool() {
  const [xml, setXml] = useState('<user id="1"><name>Alice</name><role>admin</role></user>');
  const [json, setJson] = useState('{\n  "user": {\n    "@id": "1",\n    "name": "Alice"\n  }\n}');
  const [out, setOut] = useState("");

  const run = (which: "x2j" | "j2x") => {
    try { setOut(which === "x2j" ? xmlToJson(xml) : jsonToXml(json)); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };
  const copy = async () => { await navigator.clipboard.writeText(out); toast.success("Copied"); };

  return (
    <Tabs defaultValue="x2j" onValueChange={() => setOut("")}>
      <TabsList>
        <TabsTrigger value="x2j">XML → JSON</TabsTrigger>
        <TabsTrigger value="j2x">JSON → XML</TabsTrigger>
      </TabsList>
      <TabsContent value="x2j" className="space-y-3">
        <Textarea value={xml} onChange={(e) => setXml(e.target.value)} className="min-h-[200px] font-mono text-sm" />
        <div className="flex gap-2"><Button onClick={() => run("x2j")}>Convert</Button>{out && <Button variant="outline" onClick={copy}>Copy</Button>}</div>
        {out && <Textarea readOnly value={out} className="min-h-[200px] font-mono text-sm" />}
      </TabsContent>
      <TabsContent value="j2x" className="space-y-3">
        <Textarea value={json} onChange={(e) => setJson(e.target.value)} className="min-h-[200px] font-mono text-sm" />
        <div className="flex gap-2"><Button onClick={() => run("j2x")}>Convert</Button>{out && <Button variant="outline" onClick={copy}>Copy</Button>}</div>
        {out && <Textarea readOnly value={out} className="min-h-[200px] font-mono text-sm" />}
      </TabsContent>
    </Tabs>
  );
}