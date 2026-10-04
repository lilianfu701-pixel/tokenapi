import { redirect } from "next/navigation";
import { loginAction } from "@/lib/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { type SearchParams, first } from "../_components/ui";

export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  invalid: "Wrong password.",
  locked: "Too many attempts. Try again in 15 minutes.",
};

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  if (await isAdminAuthenticated()) redirect("/admin");
  const error = ERRORS[first((await searchParams).error) ?? ""];
  return (
    <main className="adm-login">
      <form action={loginAction} className="adm-card">
        <h1>Gateway admin</h1>
        {error ? <p className="adm-flash is-error" role="alert">{error}</p> : null}
        <label>
          Password
          <input type="password" name="password" autoComplete="current-password" required autoFocus />
        </label>
        <button type="submit" className="adm-btn">Sign in</button>
      </form>
    </main>
  );
}
