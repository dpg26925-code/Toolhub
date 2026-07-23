import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Category = "all" | "motivation" | "life" | "tech" | "startup";

const QUOTES: { text: string; author: string; category: Exclude<Category, "all"> }[] = [
  { text: "The best way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "motivation" },
  { text: "Success is not final; failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill", category: "motivation" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "motivation" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford", category: "motivation" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt", category: "motivation" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis", category: "motivation" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon", category: "life" },
  { text: "The purpose of our lives is to be happy.", author: "Dalai Lama", category: "life" },
  { text: "Get busy living or get busy dying.", author: "Stephen King", category: "life" },
  { text: "You only live once, but if you do it right, once is enough.", author: "Mae West", category: "life" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein", category: "life" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay", category: "tech" },
  { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke", category: "tech" },
  { text: "Software is a great combination of artistry and engineering.", author: "Bill Gates", category: "tech" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", category: "tech" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson", category: "tech" },
  { text: "The most disastrous thing that you can ever learn is your first programming language.", author: "Alan Kay", category: "tech" },
  { text: "Ideas are easy. Implementation is hard.", author: "Guy Kawasaki", category: "startup" },
  { text: "Move fast and break things.", author: "Mark Zuckerberg", category: "startup" },
  { text: "The best entrepreneurs are missionaries, not mercenaries.", author: "John Doerr", category: "startup" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb", category: "startup" },
  { text: "If you're not embarrassed by the first version of your product, you've launched too late.", author: "Reid Hoffman", category: "startup" },
  { text: "Your most unhappy customers are your greatest source of learning.", author: "Bill Gates", category: "startup" },
  { text: "Do one thing every day that scares you.", author: "Eleanor Roosevelt", category: "motivation" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "motivation" },
];

export default function RandomQuoteGeneratorTool() {
  const [category, setCategory] = useState<Category>("all");
  const [index, setIndex] = useState(0);

  const filtered = useMemo(() => category === "all" ? QUOTES : QUOTES.filter((q) => q.category === category), [category]);
  const quote = filtered[index % filtered.length];

  const next = () => setIndex(Math.floor(Math.random() * filtered.length));
  const share = (net: "twitter" | "linkedin") => {
    const text = `"${quote.text}" — ${quote.author}`;
    const url = net === "twitter"
      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
      : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://nexatools.cloud")}&summary=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div><Label>Category</Label><Select value={category} onValueChange={(v) => { setCategory(v as Category); setIndex(0); }}><SelectTrigger className="mt-1"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="motivation">Motivation</SelectItem><SelectItem value="life">Life</SelectItem><SelectItem value="tech">Tech</SelectItem><SelectItem value="startup">Startup</SelectItem></SelectContent></Select></div>
        <div className="flex items-end"><Button className="w-full" onClick={next}>New quote</Button></div>
      </div>
      <blockquote className="rounded-xl border bg-muted/40 p-6 text-center">
        <p className="text-lg italic leading-relaxed">“{quote.text}”</p>
        <footer className="mt-3 text-sm text-muted-foreground">— {quote.author}</footer>
      </blockquote>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => { navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`); toast.success("Copied"); }}>Copy</Button>
        <Button variant="outline" onClick={() => share("twitter")}>Share on X</Button>
        <Button variant="outline" onClick={() => share("linkedin")}>Share on LinkedIn</Button>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} quotes in this category · {QUOTES.length} total.</p>
    </div>
  );
}