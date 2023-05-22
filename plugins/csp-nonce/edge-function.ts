import { cryptoRandomString } from "https://deno.land/x/crypto_random_string@1.0.0/mod.ts";
import { Config, Context } from "netlify:edge";

export default async (request: Request, context: Context) => {
  const response = await context.next();

  console.log(response.headers);
  if (!response.headers.get("Content-Type").startsWith("text/html")) {
    return new Response(response);
  }

  const nonce = cryptoRandomString({ length: 16, type: "alphanumeric" });

  response.headers.set(
    "Content-Security-Policy",
    `script-src 'nonce-${nonce}'`
  );
  const page = await response.text();

  const updatedPage = page.replace(
    /<script([^>]*)>/gi,
    `<script$1 nonce="${nonce}">`
  );
  return new Response(updatedPage, response);
};

export const config: Config = {
  path: "/",
};
