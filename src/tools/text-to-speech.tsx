import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function TextToSpeechTool() {
  const [text, setText] = useState("Hello! Welcome to ToolHub AI.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string>("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (v.length && !voiceURI) setVoiceURI(v[0].voiceURI);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [voiceURI]);

  const speak = () => {
    if (!("speechSynthesis" in window)) {
      toast.error("Your browser does not support Web Speech.");
      return;
    }
    if (!text.trim()) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find((v) => v.voiceURI === voiceURI);
    if (v) u.voice = v;
    u.rate = rate;
    u.pitch = pitch;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <div className="space-y-6">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type text to speak…"
        className="min-h-[180px]"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Voice</Label>
          <Select value={voiceURI} onValueChange={setVoiceURI}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((v) => (
                <SelectItem key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Speed: {rate.toFixed(1)}x</Label>
          <Slider
            className="mt-3"
            min={0.5}
            max={2}
            step={0.1}
            value={[rate]}
            onValueChange={([v]) => setRate(v)}
          />
        </div>
        <div>
          <Label>Pitch: {pitch.toFixed(1)}</Label>
          <Slider
            className="mt-3"
            min={0}
            max={2}
            step={0.1}
            value={[pitch]}
            onValueChange={([v]) => setPitch(v)}
          />
        </div>
      </div>
      <div className="flex gap-3">
        <Button onClick={speak} disabled={speaking}>
          {speaking ? "Speaking…" : "Speak"}
        </Button>
        <Button variant="outline" onClick={stop} disabled={!speaking}>
          Stop
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Runs entirely in your browser using the Web Speech API. Available voices depend on your OS
        and browser.
      </p>
    </div>
  );
}