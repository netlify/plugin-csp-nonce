import { cryptoRandomString } from "https://deno.land/x/crypto_random_string@1.0.0/mod.ts";
import { Config, Context } from "netlify:edge";

// TODO: should be able to set CSP / CSP-Report-Only
const HEADER = "content-security-policy";

export default async (request: Request, context: Context) => {
  const response = await context.next();

  if (!response.headers.get("content-type").startsWith("text/html")) {
    return new Response(response);
  }

  const nonce = cryptoRandomString({ length: 16, type: "alphanumeric" });
  const value = `script-src 'nonce-${nonce}' 'strict-dynamic'`;

  const csp = response.headers.get(HEADER);
  if (csp) {
    const hasScriptSrcDirective = csp.includes("script-src ");
    response.headers.set(
      HEADER,
      // if script-src directive is already present,
      hasScriptSrcDirective
        ? // prepend value just to the directive,
          csp.replace("script-src ", `${value} `)
        : // otherwise prepend value to the entire header
          `${value};${csp}`
    );
  } else {
    // TODO: add report-uri directive
    response.headers.set(HEADER, value);
  }

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
