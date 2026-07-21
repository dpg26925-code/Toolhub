import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Origin = "english" | "spanish" | "french" | "german" | "japanese" | "chinese" | "vietnamese" | "indian";
type Gender = "male" | "female" | "random";

const NAMES: Record<Origin, { m: string[]; f: string[]; last: string[] }> = {
  english: {
    m: ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Thomas", "Charles", "Daniel", "Matthew", "Anthony", "Andrew", "Joshua", "Ryan"],
    f: ["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Emily", "Olivia", "Sophia", "Ava", "Emma"],
    last: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris"],
  },
  spanish: {
    m: ["Alejandro", "Carlos", "Diego", "Fernando", "Javier", "José", "Juan", "Luis", "Manuel", "Pablo", "Rafael", "Ricardo", "Sergio", "Miguel", "Antonio"],
    f: ["Ana", "Carmen", "Elena", "Isabel", "Laura", "Lucía", "María", "Marta", "Paula", "Sofía", "Valentina", "Camila", "Daniela", "Gabriela", "Natalia"],
    last: ["García", "Rodríguez", "González", "Fernández", "López", "Martínez", "Sánchez", "Pérez", "Gómez", "Ruiz", "Torres", "Ramírez", "Vargas", "Castro", "Moreno"],
  },
  french: {
    m: ["Lucas", "Louis", "Gabriel", "Jules", "Adam", "Raphaël", "Léo", "Arthur", "Hugo", "Nathan", "Mathis", "Ethan", "Timéo", "Noah", "Théo"],
    f: ["Emma", "Louise", "Alice", "Chloé", "Léa", "Manon", "Camille", "Sarah", "Jade", "Zoé", "Inès", "Anaïs", "Juliette", "Clara", "Nina"],
    last: ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent", "Lefèvre", "Michel", "Garcia"],
  },
  german: {
    m: ["Lukas", "Leon", "Finn", "Jonas", "Paul", "Ben", "Elias", "Noah", "Luis", "Felix", "Max", "Moritz", "Julian", "David", "Tim"],
    f: ["Mia", "Emma", "Hannah", "Sofia", "Anna", "Emilia", "Lina", "Marie", "Lena", "Lea", "Klara", "Ida", "Lara", "Nele", "Frieda"],
    last: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Schäfer", "Koch", "Bauer", "Richter", "Klein"],
  },
  japanese: {
    m: ["Haruto", "Yuto", "Sota", "Yuki", "Hayato", "Haruki", "Ryusei", "Koki", "Sora", "Riku", "Kaito", "Ren", "Aoi", "Ryo", "Takumi"],
    f: ["Yui", "Hina", "Aoi", "Sakura", "Rin", "Yuna", "Mio", "Koharu", "Akari", "Himari", "Mei", "Hana", "Ichika", "Emi", "Ayaka"],
    last: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato", "Yoshida", "Yamada", "Sasaki", "Yamaguchi", "Matsumoto"],
  },
  chinese: {
    m: ["Wei", "Jun", "Ming", "Hao", "Jie", "Yang", "Bo", "Lei", "Feng", "Chao", "Jian", "Kai", "Tao", "Xin", "Long"],
    f: ["Xiu", "Ying", "Hua", "Xia", "Yan", "Juan", "Yun", "Mei", "Ling", "Qian", "Ping", "Hong", "Xue", "Fang", "Li"],
    last: ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Huang", "Zhao", "Wu", "Zhou", "Xu", "Sun", "Ma", "Zhu", "Hu"],
  },
  vietnamese: {
    m: ["An", "Bảo", "Bình", "Dũng", "Đức", "Hải", "Hùng", "Khang", "Long", "Minh", "Nam", "Phong", "Quang", "Tân", "Tuấn"],
    f: ["Anh", "Chi", "Dung", "Hà", "Hằng", "Hoa", "Hương", "Lan", "Linh", "Mai", "My", "Ngọc", "Nhung", "Phương", "Thảo"],
    last: ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương"],
  },
  indian: {
    m: ["Aarav", "Vihaan", "Aditya", "Vivaan", "Arjun", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Rohan", "Kabir", "Advait", "Dev", "Rudra"],
    f: ["Aadhya", "Ananya", "Diya", "Aarohi", "Anika", "Kiara", "Myra", "Sara", "Ira", "Prisha", "Pari", "Riya", "Aditi", "Meera", "Navya"],
    last: ["Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Reddy", "Nair", "Iyer", "Rao", "Joshi", "Mehta", "Shah", "Malhotra", "Kapoor"],
  },
};

const ORIGIN_LABEL: Record<Origin, string> = {
  english: "English", spanish: "Spanish", french: "French", german: "German",
  japanese: "Japanese", chinese: "Chinese", vietnamese: "Vietnamese", indian: "Indian",
};

function pick<T>(arr: T[]): T {
  const b = new Uint32Array(1); crypto.getRandomValues(b);
  return arr[b[0] % arr.length];
}

export default function RandomNameGenerator() {
  const [gender, setGender] = useState<Gender>("random");
  const [origin, setOrigin] = useState<Origin>("english");
  const [qty, setQty] = useState(5);
  const [results, setResults] = useState<string[]>([]);
  const [favs, setFavs] = useState<string[]>([]);

  const generate = () => {
    const src = NAMES[origin];
    const n = Math.max(1, Math.min(20, qty));
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      const g: "m" | "f" = gender === "random" ? (Math.random() < 0.5 ? "m" : "f") : gender === "male" ? "m" : "f";
      out.push(`${pick(src[g])} ${pick(src.last)}`);
    }
    setResults(out);
  };

  const copyOne = async (name: string) => { await navigator.clipboard.writeText(name); toast.success(`Copied "${name}"`); };
  const copyAll = async () => { await navigator.clipboard.writeText(results.join("\n")); toast.success("Copied all names"); };
  const toggleFav = (name: string) => setFavs((f) => f.includes(name) ? f.filter((x) => x !== name) : [...f, name]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <Label>Origin</Label>
          <select value={origin} onChange={(e) => setOrigin(e.target.value as Origin)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {(Object.keys(NAMES) as Origin[]).map((o) => <option key={o} value={o}>{ORIGIN_LABEL[o]}</option>)}
          </select>
        </div>
        <div>
          <Label>Gender</Label>
          <select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="random">Random</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div><Label>Quantity (1–20)</Label><Input type="number" min={1} max={20} value={qty} onChange={(e) => setQty(+e.target.value)} className="mt-1" /></div>
        <div className="flex items-end"><Button className="w-full" onClick={generate}>Generate</Button></div>
      </div>

      {results.length > 0 && (
        <div className="rounded-xl border border-border bg-secondary/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs uppercase text-muted-foreground">Names</div>
            <Button size="sm" variant="outline" onClick={copyAll}>Copy all</Button>
          </div>
          <ul className="space-y-1">
            {results.map((name, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <span className="font-medium">{name}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => toggleFav(name)}>{favs.includes(name) ? "★" : "☆"}</Button>
                  <Button size="sm" variant="ghost" onClick={() => copyOne(name)}>Copy</Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {favs.length > 0 && (
        <div className="rounded-xl border border-border p-4">
          <h3 className="mb-2 text-sm font-semibold">Favourites ({favs.length})</h3>
          <div className="flex flex-wrap gap-2">
            {favs.map((n) => (
              <span key={n} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs">
                {n}<button onClick={() => toggleFav(n)} className="text-muted-foreground hover:text-destructive">×</button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}