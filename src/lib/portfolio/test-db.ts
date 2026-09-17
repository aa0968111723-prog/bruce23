import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import type { Sql } from "./sql.ts";

export async function createTestSql(): Promise<Sql> {
  const pg = new PGlite();
  await pg.waitReady;
  await pg.exec(readFileSync(new URL("../../../migrations/0001_auth.sql", import.meta.url), "utf8"));
  await pg.exec(readFileSync(new URL("../../../migrations/0002_portfolio_cms.sql", import.meta.url), "utf8"));

  const run = async <T>(text: string, params: unknown[] = []): Promise<T[]> => {
    const result = await pg.query<T>(text, params);
    return result.rows;
  };
  const sql = (async <T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]> => {
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return run<T>(text, values);
  }) as unknown as Sql;
  sql.query = run;
  return sql;
}

export async function insertUser(
  sql: Sql,
  input: { id: string; email: string; name?: string },
) {
  await sql.query(
    `insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
     values ($1,$2,$3,true,now(),now())`,
    [input.id, input.name ?? "Test", input.email],
  );
}
