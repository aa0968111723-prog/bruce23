import { auth, authConfigured, SESSION_TOKEN_COOKIE } from "../auth/server";
import { ensureDbReady, closePglite, getPglite } from "../db";

const ADMIN_EMAIL = "aa0968111723@gmail.com";

export async function mintLiveAdminSession() {
  if (!authConfigured) throw new Error("auth is not configured; cannot mint a session");
  await ensureDbReady();
  const ctx = await auth.$context;
  const existing = await ctx.internalAdapter.findUserByEmail(ADMIN_EMAIL);
  let user = existing?.user;
  if (!user) {
    user = await ctx.internalAdapter.createUser({
      name: "Bruce",
      email: ADMIN_EMAIL,
      emailVerified: true,
    });
  }
  if (!user?.id) throw new Error("Better Auth createUser did not return a user");
  if (user.id === "dev-user") throw new Error("refusing to mint a session for the shared dev-user");
  const session = await ctx.internalAdapter.createSession(user.id);
  if (!session?.token) throw new Error("Better Auth createSession did not return a token");
  const pg = await getPglite();
  const users = await pg.query<{ email: string; id: string }>(
    `select id, email from "user" where email = $1`,
    [ADMIN_EMAIL],
  );
  if (users.rows[0]?.id === "dev-user") throw new Error("minted user id was dev-user");
  if (users.rows[0]?.email !== ADMIN_EMAIL) throw new Error("minted user email mismatch");
  return {
    email: ADMIN_EMAIL,
    userId: user.id,
    token: session.token as string,
    cookieName: SESSION_TOKEN_COOKIE,
  };
}

export async function closeMintedAdminDb() {
  await closePglite();
}
