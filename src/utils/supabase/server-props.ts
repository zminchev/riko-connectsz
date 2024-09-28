import { createServerClient, serializeCookieHeader } from "@supabase/ssr";
import { NextApiRequestCookies } from "next/dist/server/api-utils";
import { IncomingMessage, ServerResponse } from "http";

type RequestResponseContext = {
  req: IncomingMessage & { cookies: Partial<NextApiRequestCookies> };
  res: ServerResponse;
};

export function createClient({ req, res }: RequestResponseContext) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_KEY || "",
    {
      cookies: {
        getAll() {
          return Object.keys(req.cookies).map((name) => ({
            name,
            value: req.cookies[name] || "",
          }));
        },
        setAll(cookiesToSet) {
          res.setHeader(
            "Set-Cookie",
            cookiesToSet.map(({ name, value, options }) =>
              serializeCookieHeader(name, value, options)
            )
          );
        },
      },
    }
  );

  return supabase;
}
