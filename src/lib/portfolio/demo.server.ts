import { isPublicHttpsUrl, interpretDemoResponse } from "./demo-url";

export async function verifyLiveDemo(url: string) {
  if (!isPublicHttpsUrl(url)) {
    return {
      status: "failed" as const,
      httpStatus: null as number | null,
      error: "Demo URL must be a public https address",
      embeddableGuess: false,
    };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      signal: controller.signal,
      headers: { "User-Agent": "luminous-studio-portfolio" },
    });
    const location = response.headers.get("location");
    if (location && [301, 302, 303, 307, 308].includes(response.status)) {
      const next = new URL(location, url);
      if (!isPublicHttpsUrl(next.toString())) {
        return {
          status: "failed" as const,
          httpStatus: response.status,
          error: "Demo redirected off a public https host",
          embeddableGuess: false,
        };
      }
      response = await fetch(next, {
        method: "HEAD",
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "luminous-studio-portfolio" },
      });
    }
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "luminous-studio-portfolio" },
      });
    }
    return interpretDemoResponse({
      ok: response.ok,
      status: response.status,
      xFrameOptions: response.headers.get("x-frame-options"),
      csp: response.headers.get("content-security-policy"),
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    return {
      status: "failed" as const,
      httpStatus: null,
      error: timedOut ? "Demo request timed out" : "Demo request failed",
      embeddableGuess: false,
    };
  } finally {
    clearTimeout(timer);
  }
}
