// Minimal Neon-compatible `sql` client on top of PGlite (in-process Postgres),
// so createNeonRepo() runs its real SQL in tests.

import type { PGlite } from "@electric-sql/pglite";
import type { Sql } from "@/lib/gateway/repo";

type Row = Record<string, unknown>;

class PendingQuery implements PromiseLike<Row[]> {
  constructor(private readonly db: PGlite, readonly text: string, readonly params: unknown[]) {}
  then<A = Row[], B = never>(ok?: ((v: Row[]) => A | PromiseLike<A>) | null, err?: ((e: unknown) => B | PromiseLike<B>) | null) {
    return this.db.query<Row>(this.text, this.params).then((r) => r.rows).then(ok, err);
  }
}

export function pgliteSql(db: PGlite): Sql {
  const sql = (strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = strings[0];
    values.forEach((_, i) => { text += `$${i + 1}${strings[i + 1]}`; });
    return new PendingQuery(db, text, values);
  };
  sql.query = (text: string, params: unknown[] = []) => db.query<Row>(text, params).then((r) => r.rows);
  sql.transaction = (queries: PendingQuery[]) =>
    db.transaction(async (tx) => {
      const out: Row[][] = [];
      for (const q of queries) out.push((await tx.query<Row>(q.text, q.params)).rows);
      return out;
    });
  return sql as unknown as Sql;
}
