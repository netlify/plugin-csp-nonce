/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
// @ts-expect-error
import { cryptoRandomString } from "https://deno.land/x/crypto_random_string@1.0.0/mod.ts";
// @ts-expect-error
import type { Config, Context } from "netlify:edge";

// TODO: should be able to set CSP / CSP-Report-Only
const HEADER = "content-security-policy";

const handler = async (request: Request, context: Context) => {
  const response = await context.next();

  // for debugging which routes use this edge function
  response.headers.set("x-nf-debug-edge-function", "csp-nonce");

  // html only
  if (
    !request.headers.get("accept")?.startsWith("text/html") ||
    !response.headers.get("content-type").startsWith("text/html")
  ) {
    return response;
  }

  const nonce = cryptoRandomString({ length: 16, type: "alphanumeric" });
  // `'strict-dynamic'` allows scripts to be loaded from trusted scripts
  // when `'strict-dynamic'` is present, `'unsafe-inline' 'self' https: http:` is ignored by browsers
  // `'unsafe-inline' 'self' https: http:` is a compat check for browsers that don't support `strict-dynamic`
  // https://content-security-policy.com/strict-dynamic/
  const value = `script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' 'self' https: http:`;

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
    if (!csp.includes("report-uri")) {
      // TODO: add report-uri directive
    }
  } else {
    response.headers.set(HEADER, value);
    // TODO: add report-uri directive
  }

  const page = await response.text();
  const updatedPage = page.replace(
    /<script([^>]*)>/gi,
    `<script$1 nonce="${nonce}">`
  );
  return new Response(updatedPage, response);
};

export const config: Config = {
  // how exclusive should we get here?
  // should this be a config option?
  path: ["/*", "/!(access-control)/*"],
};

export default handler;
