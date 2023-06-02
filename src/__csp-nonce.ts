/* eslint-disable */
// @ts-expect-error
import type { Config, Context } from "netlify:edge";
// @ts-expect-error
import { randomBytes } from "node:crypto";

import inputs from "./__csp-nonce-inputs.json" assert { type: "json" };

type Params = {
  reportOnly: boolean;
  unsafeEval: boolean;
  path: string | string[];
  excludedPath: string[];
};
const params = inputs as Params;

const header = params.reportOnly
  ? "content-security-policy-report-only"
  : "content-security-policy";

const handler = async (request: Request, context: Context) => {
  const response = await context.next();

  // for debugging which routes use this edge function
  response.headers.set("x-debug-csp-nonce", "invoked");

  // html/curl GETs only
  const isGET = request.method?.toUpperCase() === "GET";
  const isCurl = request.headers.get("user-agent")?.startsWith("curl/");
  const isHTMLRequest =
    request.headers.get("accept")?.startsWith("text/html") || isCurl;
  const isHTMLResponse = response.headers
    .get("content-type")
    .startsWith("text/html");
  const shouldTransformResponse = isGET && isHTMLRequest && isHTMLResponse;
  if (!shouldTransformResponse) {
    return response;
  }

  const nonce = randomBytes(24).toString("base64");
  // `'strict-dynamic'` allows scripts to be loaded from trusted scripts
  // when `'strict-dynamic'` is present, `'unsafe-inline' 'self' https: http:` is ignored by browsers
  // `'unsafe-inline' 'self' https: http:` is a compat check for browsers that don't support `strict-dynamic`
  // https://content-security-policy.com/strict-dynamic/
  const rules = [
    `'nonce-${nonce}'`,
    `'strict-dynamic'`,
    `'unsafe-inline'`,
    params.unsafeEval && `'unsafe-eval'`,
    `'self'`,
    `https:`,
    `http:`,
  ].filter(Boolean);
  const scriptSrc = `script-src ${rules.join(" ")}`;
  const reportUri = `report-uri /.netlify/functions/__csp-violations`;

  const csp = response.headers.get(header);
  if (csp) {
    const directives = csp
      .split(";")
      .map((directive) => {
        // prepend our rules for any existing directives
        const d = directive.trim();
        if (d.startsWith("script-src")) {
          return d.replace("script-src", scriptSrc);
        }
        // intentionally omit report-uri: theirs should take precedence
        return d;
      })
      .filter(Boolean);
    // push our rules if the directives don't exist yet
    if (!directives.find((d) => d.startsWith("script-src"))) {
      directives.push(scriptSrc);
    }
    if (!directives.find((d) => d.startsWith("report-uri"))) {
      directives.push(reportUri);
    }
    const value = directives.join("; ");
    response.headers.set(header, value);
  } else {
    // make a new ruleset of directives if no CSP present
    const value = [scriptSrc, reportUri].join("; ");
    response.headers.set(header, value);
  }

  // time to do some regex magic
  const page = await response.text();
  const rewrittenPage = page.replace(
    /<script([^>]*)>/gi,
    `<script$1 nonce="${nonce}">`
  );
  return new Response(rewrittenPage, response);
};

// Top 50 most common extensions (minus .html and .htm) according to Humio
const excludedExtensions = [
  "aspx",
  "avif",
  "babylon",
  "bak",
  "cgi",
  "com",
  "css",
  "ds",
  "env",
  "gif",
  "gz",
  "ico",
  "ini",
  "jpeg",
  "jpg",
  "js",
  "json",
  "jsp",
  "log",
  "m4a",
  "map",
  "md",
  "mjs",
  "mp3",
  "mp4",
  "ogg",
  "otf",
  "pdf",
  "php",
  "png",
  "rar",
  "sh",
  "sql",
  "svg",
  "ttf",
  "txt",
  "wasm",
  "wav",
  "webm",
  "webmanifest",
  "webp",
  "woff",
  "woff2",
  "xml",
  "xsd",
  "yaml",
  "yml",
  "zip",
];

export const config: Config = {
  path: params.path,
  excludedPath: [
    ...params.excludedPath,
    "/.netlify/*",
    ...excludedExtensions.map((ext) => `**/*.${ext}`),
  ],
  handler,
};

export default handler;
