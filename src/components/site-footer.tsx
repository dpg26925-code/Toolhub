import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">▲</span>
            ToolHub AI
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            The ultimate AI-powered online tool platform for creators, developers and teams.
          </p>
        </div>
        <FooterCol title="Product" links={[
          { to: "/tools", label: "All tools" },
          { to: "/pricing", label: "Pricing" },
          { to: "/blog", label: "Blog" },
        ]} />
        <FooterCol title="Company" links={[
          { to: "/about", label: "About" },
          { to: "/faq", label: "FAQ" },
        ]} />
        <FooterCol title="Legal" links={[
          { to: "/terms", label: "Terms" },
          { to: "/privacy", label: "Privacy" },
        ]} />
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ToolHub AI. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-muted-foreground hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}