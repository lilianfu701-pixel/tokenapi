"use client";

import { useActionState } from "react";
import { type CreateKeyState, createApiKey } from "@/lib/admin/actions";

export function CreateKeyForm({ userId }: { userId: string }) {
  const [state, action, pending] = useActionState<CreateKeyState, FormData>(createApiKey, {});
  return (
    <div>
      <form action={action} className="adm-inline">
        <input type="hidden" name="user_id" value={userId} />
        <input name="name" placeholder="key name" className="is-narrow" />
        <input name="rpm_limit" type="number" min="1" placeholder="rpm (inherit)" className="is-narrow" />
        <input name="spend_limit_usd" type="number" min="0" step="0.01" placeholder="spend cap $" className="is-narrow" />
        <input name="allowed_aliases" placeholder="allowed aliases (comma, blank=all)" />
        <input name="expires_at" type="date" aria-label="Expires" />
        <button className="adm-btn is-small" disabled={pending}>{pending ? "Creating…" : "New API key"}</button>
      </form>
      {state.error ? <p className="adm-flash is-error" role="alert">{state.error}</p> : null}
      {state.key ? (
        <p className="adm-flash is-ok" role="status">
          Copy now — it will not be shown again: <code className="adm-secret">{state.key}</code>
        </p>
      ) : null}
    </div>
  );
}
