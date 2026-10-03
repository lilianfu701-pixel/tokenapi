import Link from "next/link";
import { logoutAction } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/aliases", label: "Model aliases" },
  { href: "/admin/models", label: "Models" },
  { href: "/admin/providers", label: "Providers" },
  { href: "/admin/users", label: "Users & keys" },
  { href: "/admin/logs", label: "Request logs" },
  { href: "/admin/audit", label: "Audit" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <Link href="/admin" className="adm-brand">
          TokenAPI <span>gateway</span>
        </Link>
        <nav aria-label="Admin">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>{n.label}</Link>
          ))}
        </nav>
        <form action={logoutAction}>
          <button type="submit" className="adm-btn is-ghost">Sign out</button>
        </form>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
