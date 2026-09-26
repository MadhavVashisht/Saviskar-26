import { createBrowserClient } from "@supabase/ssr";
import { toAdminSessionCookieOptions } from "./admin-session";

export function parseBrowserCookies(cookieStr: string): { name: string; value: string }[] {
  if (!cookieStr) return [];
  const list: { name: string; value: string }[] = [];
  const pairs = cookieStr.split(";");
  for (const pair of pairs) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx === -1) continue;
    const key = pair.substring(0, eqIdx).trim();
    if (!key) continue;
    let val = pair.substring(eqIdx + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    try {
      list.push({ name: key, value: decodeURIComponent(val) });
    } catch {
      list.push({ name: key, value: val });
    }
  }
  return list;
}

export function serializeBrowserCookie(
  name: string,
  val: string,
  options?: {
    path?: string;
    domain?: string;
    maxAge?: number;
    expires?: Date | number;
    sameSite?: "lax" | "strict" | "none" | boolean;
    secure?: boolean;
    httpOnly?: boolean;
    partitioned?: boolean;
  }
): string {
  let str = `${name}=${encodeURIComponent(val)}`;
  if (!options) return str;

  if (typeof options.maxAge === "number") {
    str += `; Max-Age=${Math.floor(options.maxAge)}`;
  }
  if (options.domain) {
    str += `; Domain=${options.domain}`;
  }
  if (options.path) {
    str += `; Path=${options.path}`;
  }
  if (options.expires) {
    const expDate = typeof options.expires === "number" ? new Date(options.expires) : options.expires;
    str += `; Expires=${expDate.toUTCString()}`;
  }
  if (options.httpOnly) {
    str += "; HttpOnly";
  }
  if (options.secure) {
    str += "; Secure";
  }
  if (options.partitioned) {
    str += "; Partitioned";
  }
  if (options.sameSite !== undefined) {
    const sameSite = typeof options.sameSite === "string" ? options.sameSite.toLowerCase() : options.sameSite;
    if (sameSite === true || sameSite === "strict") {
      str += "; SameSite=Strict";
    } else if (sameSite === "lax") {
      str += "; SameSite=Lax";
    } else if (sameSite === "none") {
      str += "; SameSite=None";
    }
  }

  return str;
}

export type BrowserCookieOptions = {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date | number;
  sameSite?: "lax" | "strict" | "none" | boolean;
  secure?: boolean;
  httpOnly?: boolean;
  partitioned?: boolean;
};

export const adminBrowserCookieMethods = {
  getAll() {
    if (typeof document === "undefined") return [];
    return parseBrowserCookies(document.cookie);
  },
  setAll(
    cookiesToSet: {
      name: string;
      value: string;
      options?: BrowserCookieOptions;
    }[]
  ) {
    if (typeof document === "undefined") return;
    cookiesToSet.forEach(({ name, value, options }) => {
      const sessionOptions = toAdminSessionCookieOptions(options);
      document.cookie = serializeBrowserCookie(name, value, sessionOptions);
    });
  },
};

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key",
    {
      cookies: adminBrowserCookieMethods,
    }
  );
}
