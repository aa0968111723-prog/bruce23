import { isSafeHttpsUrl, interpretDemoResponse } from "./demo-url";

export async function verifyLiveDemo(url: string) {
  if (!isSafeHttpsUrl(url)) {
    return {
      status: "failed" as const,
      httpStatus: null as number | null,
      error: "Demo URL must be https",
      embeddableGuess: false,
    };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "luminous-studio-portfolio" },
    });
    if (response.status === 405 || response.status === 501) {
      response = await fetch(url, {
        method: "GET",
        redirect: "follow",
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
