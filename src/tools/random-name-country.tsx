import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Gender = "male" | "female" | "random";

type Bank = { m: string[]; f: string[]; last: string[] };

const COUNTRIES: Record<string, { flag: string; label: string; bank: Bank }> = {
  US: { flag: "🇺🇸", label: "United States", bank: {
    m: ["James","John","Robert","Michael","William","David","Richard","Joseph","Thomas","Charles","Christopher","Daniel","Matthew","Anthony","Mark"],
    f: ["Mary","Patricia","Jennifer","Linda","Elizabeth","Barbara","Susan","Jessica","Sarah","Karen","Nancy","Lisa","Betty","Helen","Sandra"],
    last: ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Wilson","Anderson","Taylor"] } },
  GB: { flag: "🇬🇧", label: "United Kingdom", bank: {
    m: ["Oliver","George","Harry","Jack","Jacob","Noah","Charlie","Muhammad","Thomas","Oscar","William","James","Henry","Leo","Alfie"],
    f: ["Olivia","Amelia","Isla","Ava","Mia","Isabella","Sophia","Grace","Lily","Freya","Emily","Ivy","Ella","Rosie","Evie"],
    last: ["Smith","Jones","Taylor","Brown","Williams","Wilson","Johnson","Davies","Robinson","Wright","Thompson","Evans","Walker","White","Roberts"] } },
  FR: { flag: "🇫🇷", label: "France", bank: {
    m: ["Lucas","Louis","Gabriel","Jules","Adam","Raphaël","Léo","Arthur","Hugo","Nathan","Ethan","Théo","Noah","Timéo","Antoine"],
    f: ["Emma","Louise","Alice","Chloé","Léa","Manon","Camille","Sarah","Jade","Zoé","Inès","Juliette","Clara","Nina","Rose"],
    last: ["Martin","Bernard","Dubois","Thomas","Robert","Richard","Petit","Durand","Leroy","Moreau","Simon","Laurent","Lefèvre","Michel","Garcia"] } },
  DE: { flag: "🇩🇪", label: "Germany", bank: {
    m: ["Lukas","Leon","Finn","Jonas","Paul","Ben","Elias","Noah","Luis","Felix","Maximilian","Julian","David","Tim","Moritz"],
    f: ["Mia","Emma","Hannah","Sofia","Anna","Emilia","Lina","Marie","Lena","Lea","Klara","Ida","Lara","Nele","Frieda"],
    last: ["Müller","Schmidt","Schneider","Fischer","Weber","Meyer","Wagner","Becker","Schulz","Hoffmann","Schäfer","Koch","Bauer","Richter","Klein"] } },
  ES: { flag: "🇪🇸", label: "Spain", bank: {
    m: ["Alejandro","Carlos","Diego","Fernando","Javier","José","Juan","Luis","Manuel","Pablo","Rafael","Ricardo","Sergio","Miguel","Antonio"],
    f: ["Ana","Carmen","Elena","Isabel","Laura","Lucía","María","Marta","Paula","Sofía","Valentina","Camila","Daniela","Gabriela","Natalia"],
    last: ["García","Rodríguez","González","Fernández","López","Martínez","Sánchez","Pérez","Gómez","Ruiz","Torres","Ramírez","Vargas","Castro","Moreno"] } },
  IT: { flag: "🇮🇹", label: "Italy", bank: {
    m: ["Leonardo","Francesco","Alessandro","Lorenzo","Mattia","Andrea","Gabriele","Riccardo","Tommaso","Edoardo","Matteo","Giuseppe","Antonio","Marco","Luca"],
    f: ["Sofia","Giulia","Aurora","Alice","Ginevra","Emma","Giorgia","Greta","Martina","Chiara","Sara","Anna","Beatrice","Vittoria","Bianca"],
    last: ["Rossi","Russo","Ferrari","Esposito","Bianchi","Romano","Colombo","Ricci","Marino","Greco","Bruno","Gallo","Conti","De Luca","Costa"] } },
  PT: { flag: "🇵🇹", label: "Portugal", bank: {
    m: ["João","Miguel","Rodrigo","Tiago","Diogo","Francisco","Afonso","Duarte","Gonçalo","Martim","Tomás","Guilherme","Rafael","Santiago","André"],
    f: ["Maria","Beatriz","Matilde","Leonor","Carolina","Ana","Mariana","Sofia","Inês","Camila","Alice","Margarida","Lara","Íris","Laura"],
    last: ["Silva","Santos","Ferreira","Pereira","Oliveira","Costa","Rodrigues","Martins","Jesus","Sousa","Fernandes","Gonçalves","Gomes","Lopes","Marques"] } },
  NL: { flag: "🇳🇱", label: "Netherlands", bank: {
    m: ["Daan","Sem","Milan","Levi","Luuk","Finn","Bram","Thijs","Jesse","Tim","Lars","Sven","Ruben","Stijn","Jayden"],
    f: ["Emma","Julia","Mila","Tess","Sophie","Zoë","Anna","Nora","Eva","Lotte","Sara","Fleur","Liv","Noa","Roos"],
    last: ["de Jong","Jansen","de Vries","van den Berg","van Dijk","Bakker","Janssen","Visser","Smit","Meijer","de Boer","Mulder","de Groot","Bos","Vos"] } },
  RU: { flag: "🇷🇺", label: "Russia", bank: {
    m: ["Aleksandr","Dmitri","Maksim","Sergei","Andrei","Aleksei","Ivan","Mikhail","Nikolai","Yuri","Roman","Kirill","Denis","Pavel","Vladimir"],
    f: ["Anastasia","Maria","Anna","Ekaterina","Olga","Tatiana","Elena","Natalia","Irina","Yulia","Daria","Svetlana","Polina","Kseniya","Alina"],
    last: ["Ivanov","Smirnov","Kuznetsov","Popov","Vasiliev","Petrov","Sokolov","Mikhailov","Fedorov","Morozov","Volkov","Alekseev","Lebedev","Semenov","Egorov"] } },
  JP: { flag: "🇯🇵", label: "Japan", bank: {
    m: ["Haruto","Yuto","Sota","Yuki","Hayato","Haruki","Ryusei","Koki","Sora","Riku","Kaito","Ren","Aoi","Ryo","Takumi"],
    f: ["Yui","Hina","Aoi","Sakura","Rin","Yuna","Mio","Koharu","Akari","Himari","Mei","Hana","Ichika","Emi","Ayaka"],
    last: ["Sato","Suzuki","Takahashi","Tanaka","Watanabe","Ito","Yamamoto","Nakamura","Kobayashi","Kato","Yoshida","Yamada","Sasaki","Yamaguchi","Matsumoto"] } },
  CN: { flag: "🇨🇳", label: "China", bank: {
    m: ["Wei","Jun","Ming","Hao","Jie","Yang","Bo","Lei","Feng","Chao","Jian","Kai","Tao","Xin","Long"],
    f: ["Xiu","Ying","Hua","Xia","Yan","Juan","Yun","Mei","Ling","Qian","Ping","Hong","Xue","Fang","Li"],
    last: ["Wang","Li","Zhang","Liu","Chen","Yang","Huang","Zhao","Wu","Zhou","Xu","Sun","Ma","Zhu","Hu"] } },
  KR: { flag: "🇰🇷", label: "South Korea", bank: {
    m: ["Min-jun","Seo-jun","Do-yun","Ha-jun","Ji-ho","Yu-jun","Si-woo","Joon-ho","Jae-won","Hyun-woo","Sung-min","Tae-yang","Woo-jin","Ye-jun","Eun-woo"],
    f: ["Seo-yeon","Ha-yoon","Ji-woo","Ha-eun","Seo-hyun","Min-seo","Ji-yoo","Yoon-seo","Chae-won","Ye-eun","Su-a","Yu-na","Ji-min","Da-eun","Ha-rin"],
    last: ["Kim","Lee","Park","Choi","Jung","Kang","Cho","Yoon","Jang","Lim","Han","Oh","Seo","Shin","Kwon"] } },
  VN: { flag: "🇻🇳", label: "Vietnam", bank: {
    m: ["An","Bảo","Bình","Dũng","Đức","Hải","Hùng","Khang","Long","Minh","Nam","Phong","Quang","Tân","Tuấn"],
    f: ["Anh","Chi","Dung","Hà","Hằng","Hoa","Hương","Lan","Linh","Mai","My","Ngọc","Nhung","Phương","Thảo"],
    last: ["Nguyễn","Trần","Lê","Phạm","Hoàng","Huỳnh","Phan","Vũ","Võ","Đặng","Bùi","Đỗ","Hồ","Ngô","Dương"] } },
  TH: { flag: "🇹🇭", label: "Thailand", bank: {
    m: ["Somchai","Somsak","Anan","Chai","Kittipong","Narong","Prasert","Suchart","Thanawat","Kraisorn","Boonmee","Wichai","Sombat","Panya","Weerapong"],
    f: ["Somsri","Malee","Nan","Ploy","Suda","Kanya","Wanida","Pim","Napat","Ratana","Chanida","Nisa","Sirinya","Duangjai","Kamon"],
    last: ["Saetang","Chaiyaporn","Srisuk","Wongsawat","Boonmee","Suksawat","Ratanapong","Chaipattana","Thammakul","Phongprapai","Rattanakosin","Intharaphak","Kittikun","Anantachai","Sombatchai"] } },
  ID: { flag: "🇮🇩", label: "Indonesia", bank: {
    m: ["Budi","Adi","Andi","Bambang","Dedi","Eko","Hendra","Joko","Rudi","Siti","Wahyu","Yusuf","Rizky","Agus","Bayu"],
    f: ["Sari","Dewi","Ayu","Rina","Indah","Lestari","Ratna","Wulan","Fitri","Nur","Putri","Yuni","Rahayu","Ani","Dian"],
    last: ["Wijaya","Kusuma","Santoso","Hartono","Setiawan","Halim","Pratama","Nugroho","Susanto","Wibowo","Saputra","Utama","Permana","Mahendra","Suryanto"] } },
  IN: { flag: "🇮🇳", label: "India", bank: {
    m: ["Aarav","Vihaan","Aditya","Vivaan","Arjun","Reyansh","Ayaan","Krishna","Ishaan","Shaurya","Rohan","Kabir","Advait","Dev","Rudra"],
    f: ["Aadhya","Ananya","Diya","Aarohi","Anika","Kiara","Myra","Sara","Ira","Prisha","Pari","Riya","Aditi","Meera","Navya"],
    last: ["Sharma","Verma","Gupta","Singh","Kumar","Patel","Reddy","Nair","Iyer","Rao","Joshi","Mehta","Shah","Malhotra","Kapoor"] } },
  BR: { flag: "🇧🇷", label: "Brazil", bank: {
    m: ["Miguel","Arthur","Heitor","Bernardo","Theo","Davi","Lorenzo","Gabriel","Pedro","Matheus","Rafael","Lucas","Enzo","Guilherme","Nicolas"],
    f: ["Alice","Sophia","Helena","Valentina","Laura","Isabella","Manuela","Julia","Heloísa","Luiza","Maria","Beatriz","Mariana","Lívia","Cecília"],
    last: ["Silva","Santos","Oliveira","Souza","Rodrigues","Ferreira","Alves","Pereira","Lima","Gomes","Costa","Ribeiro","Martins","Carvalho","Almeida"] } },
  MX: { flag: "🇲🇽", label: "Mexico", bank: {
    m: ["Santiago","Mateo","Sebastián","Leonardo","Matías","Emiliano","Diego","Miguel","Alejandro","Iker","Daniel","Adrián","Rodrigo","Andrés","Jesús"],
    f: ["Sofía","Valentina","Ximena","Isabella","Camila","Regina","Renata","Victoria","Lucía","María","Emilia","Fernanda","Andrea","Daniela","Natalia"],
    last: ["Hernández","García","Martínez","López","González","Pérez","Rodríguez","Sánchez","Ramírez","Cruz","Flores","Gómez","Morales","Vázquez","Reyes"] } },
  AR: { flag: "🇦🇷", label: "Argentina", bank: {
    m: ["Mateo","Benjamín","Bautista","Thiago","Santino","Joaquín","Lautaro","Valentino","Juan","Franco","Tomás","Nicolás","Lucas","Ignacio","Facundo"],
    f: ["Sofía","Emma","Mía","Isabella","Olivia","Catalina","Martina","Julieta","Emilia","Valentina","Delfina","Guadalupe","Renata","Lola","Alma"],
    last: ["González","Rodríguez","Gómez","Fernández","López","Díaz","Martínez","Pérez","García","Sánchez","Romero","Sosa","Álvarez","Torres","Ruiz"] } },
  CA: { flag: "🇨🇦", label: "Canada", bank: {
    m: ["Liam","Noah","Oliver","William","Benjamin","Lucas","Ethan","Jack","Logan","Jacob","Mason","James","Alexander","Henry","Nathan"],
    f: ["Olivia","Emma","Charlotte","Sophia","Ava","Mia","Isabella","Amelia","Harper","Evelyn","Chloe","Hannah","Ella","Nora","Zoe"],
    last: ["Smith","Brown","Tremblay","Martin","Roy","Wilson","MacDonald","Gagnon","Johnson","Taylor","Anderson","Thompson","White","Lee","Miller"] } },
  AU: { flag: "🇦🇺", label: "Australia", bank: {
    m: ["Oliver","Noah","Jack","Leo","William","Henry","Thomas","Charlie","Lucas","Ethan","James","Hudson","Mason","Cooper","Liam"],
    f: ["Charlotte","Olivia","Amelia","Isla","Mia","Ava","Grace","Willow","Harper","Chloe","Ella","Sophia","Zoe","Ruby","Matilda"],
    last: ["Smith","Jones","Williams","Brown","Wilson","Taylor","Johnson","White","Martin","Anderson","Thompson","Nguyen","Ryan","Walker","Harris"] } },
  ZA: { flag: "🇿🇦", label: "South Africa", bank: {
    m: ["Liam","Junior","Bandile","Bongani","Sipho","Themba","Andile","Lwazi","Kagiso","Tumelo","Sizwe","Thabo","Musa","Lerato","Kabelo"],
    f: ["Amara","Zanele","Nomvula","Thandi","Lerato","Naledi","Nomsa","Precious","Ayanda","Palesa","Refilwe","Zinhle","Nokuthula","Busisiwe","Anele"],
    last: ["Naidoo","Nkosi","Dlamini","Ndlovu","Mokoena","Zulu","Khumalo","Van der Merwe","Botha","Pretorius","Smit","Van Wyk","Coetzee","Mahlangu","Tshabalala"] } },
  NG: { flag: "🇳🇬", label: "Nigeria", bank: {
    m: ["Chukwu","Emeka","Ade","Tunde","Kunle","Femi","Ifeanyi","Obinna","Chinedu","Kelechi","Olumide","Bola","Segun","Wale","Nnamdi"],
    f: ["Amara","Chidinma","Adaeze","Ngozi","Chioma","Ifeoma","Folake","Yemisi","Adaobi","Bisola","Funmi","Toluwalope","Ebele","Nkechi","Amaka"],
    last: ["Okafor","Adeyemi","Okonkwo","Eze","Nwosu","Obi","Adebayo","Balogun","Ibrahim","Olawale","Chukwu","Uche","Afolabi","Ogundipe","Onyekachi"] } },
  EG: { flag: "🇪🇬", label: "Egypt", bank: {
    m: ["Mohamed","Ahmed","Mahmoud","Mostafa","Omar","Youssef","Karim","Khaled","Hassan","Ali","Ibrahim","Amr","Tarek","Sherif","Hossam"],
    f: ["Fatima","Aisha","Nour","Salma","Yasmin","Mariam","Layla","Sara","Dina","Rana","Heba","Amira","Farida","Habiba","Rokaya"],
    last: ["Hassan","Mohamed","Ali","Ibrahim","Mahmoud","Ahmed","Mostafa","Youssef","Abdelrahman","El-Sayed","Fahmy","Nasser","Farouk","Zaki","Salem"] } },
  SE: { flag: "🇸🇪", label: "Sweden", bank: {
    m: ["Lucas","William","Liam","Oliver","Oscar","Elias","Hugo","Vincent","Alexander","Adam","Noah","Axel","Leo","Nils","Elliot"],
    f: ["Alice","Alma","Ella","Ebba","Astrid","Wilma","Freja","Alva","Selma","Maja","Elsa","Klara","Saga","Agnes","Molly"],
    last: ["Andersson","Johansson","Karlsson","Nilsson","Eriksson","Larsson","Olsson","Persson","Svensson","Gustafsson","Pettersson","Jonsson","Jansson","Hansson","Bengtsson"] } },
  NO: { flag: "🇳🇴", label: "Norway", bank: {
    m: ["Jakob","Emil","Lucas","Oliver","Filip","Aksel","William","Oskar","Elias","Noah","Isak","Henrik","Kasper","Magnus","Sander"],
    f: ["Nora","Emma","Sofie","Sara","Olivia","Ella","Ingrid","Maja","Leah","Selma","Frida","Sofia","Amalie","Thea","Julie"],
    last: ["Hansen","Johansen","Olsen","Larsen","Andersen","Pedersen","Nilsen","Kristiansen","Jensen","Karlsen","Johnsen","Pettersen","Eriksen","Berg","Haugen"] } },
  PL: { flag: "🇵🇱", label: "Poland", bank: {
    m: ["Jakub","Antoni","Jan","Aleksander","Franciszek","Filip","Szymon","Michał","Wojciech","Adam","Piotr","Kacper","Stanisław","Tomasz","Marcel"],
    f: ["Zofia","Julia","Zuzanna","Maja","Hanna","Alicja","Amelia","Lena","Wiktoria","Oliwia","Aleksandra","Natalia","Anna","Emilia","Pola"],
    last: ["Nowak","Kowalski","Wiśniewski","Wójcik","Kowalczyk","Kamiński","Lewandowski","Zieliński","Szymański","Woźniak","Dąbrowski","Kozłowski","Jankowski","Mazur","Krawczyk"] } },
  TR: { flag: "🇹🇷", label: "Turkey", bank: {
    m: ["Yusuf","Emir","Ömer","Miraç","Eymen","Ali","Mehmet","Ahmet","Mustafa","Hüseyin","Berat","Kerem","Efe","Arda","Deniz"],
    f: ["Zeynep","Elif","Ayşe","Fatma","Emine","Hatice","Meryem","Miray","Nehir","Ela","Defne","İpek","Azra","Eylül","Selin"],
    last: ["Yılmaz","Kaya","Demir","Şahin","Çelik","Yıldız","Yıldırım","Öztürk","Aydın","Özdemir","Arslan","Doğan","Kılıç","Aslan","Çetin"] } },
};

function rand<T>(arr: T[]): T {
  const b = new Uint32Array(1); crypto.getRandomValues(b);
  return arr[b[0] % arr.length];
}

export default function RandomNameCountry() {
  const codes = useMemo(() => Object.keys(COUNTRIES), []);
  const [country, setCountry] = useState("US");
  const [gender, setGender] = useState<Gender>("random");
  const [qty, setQty] = useState(10);
  const [results, setResults] = useState<string[]>([]);
  const [favs, setFavs] = useState<string[]>([]);

  const generate = () => {
    const src = COUNTRIES[country].bank;
    const n = Math.max(1, Math.min(50, qty));
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      const g: "m" | "f" = gender === "random" ? (Math.random() < 0.5 ? "m" : "f") : gender === "male" ? "m" : "f";
      out.push(`${rand(src[g])} ${rand(src.last)}`);
    }
    setResults(out);
  };

  const copyOne = async (name: string) => { await navigator.clipboard.writeText(name); toast.success(`Copied "${name}"`); };
  const copyAll = async () => { await navigator.clipboard.writeText(results.join("\n")); toast.success("Copied all"); };
  const download = () => {
    const blob = new Blob([results.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `names-${country}.txt`; a.click();
    URL.revokeObjectURL(url);
  };
  const toggleFav = (name: string) => setFavs((f) => f.includes(name) ? f.filter((x) => x !== name) : [...f, name]);

  const c = COUNTRIES[country];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Label>Country</Label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {codes.map((code) => (
              <option key={code} value={code}>{COUNTRIES[code].flag} {COUNTRIES[code].label}</option>
            ))}
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
        <div>
          <Label>Quantity (1–50)</Label>
          <Input type="number" min={1} max={50} value={qty} onChange={(e) => setQty(+e.target.value)} className="mt-1" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={generate}>Generate {qty} names</Button>
        {results.length > 0 && (
          <>
            <Button variant="outline" onClick={copyAll}>Copy all</Button>
            <Button variant="outline" onClick={download}>Download .txt</Button>
          </>
        )}
      </div>

      {results.length > 0 && (
        <div className="rounded-xl border border-border bg-secondary/40 p-4">
          <div className="mb-3 text-xs uppercase text-muted-foreground">{c.flag} {c.label} · {results.length} names</div>
          <ul className="grid gap-1 sm:grid-cols-2">
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

      <p className="text-xs text-muted-foreground">
        Names are generated locally in your browser using curated common first & last names per country. For fiction, testing, or placeholder data only.
      </p>
    </div>
  );
}