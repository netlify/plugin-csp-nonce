/* eslint-disable */
// @ts-ignore
import type { Config, Context } from "netlify:edge";
// @ts-ignore
import { randomBytes } from "node:crypto";
// @ts-ignore
import { HTMLRewriter } from "https://ghuc.cc/worker-tools/html-rewriter@0.1.0-pre.17/index.ts";

// @ts-ignore
import inputs from "./__csp-nonce-inputs.json" assert { type: "json" };

type Params = {
  reportOnly: boolean;
  reportUri?: string;
  unsafeEval: boolean;
  path: string | string[];
  excludedPath: string[];
};
const params = inputs as Params;

const handler = async (request: Request, context: Context) => {
  const response = await context.next(request);

  let header = params.reportOnly
    ? "content-security-policy-report-only"
    : "content-security-policy";

  // for debugging which routes use this edge function
  response.headers.set("x-debug-csp-nonce", "invoked");

  // html GETs only
  const isGET = request.method?.toUpperCase() === "GET";
  const isHTMLResponse = response.headers
    .get("content-type")
    ?.startsWith("text/html");
  const shouldTransformResponse = isGET && isHTMLResponse;
  if (!shouldTransformResponse) {
    console.log(`Unnecessary invocation for ${request.url}`, {
      method: request.method,
      "content-type": response.headers.get("content-type"),
    });
    return response;
  }

  // CSP_NONCE_DISTRIBUTION is a number from 0 to 1,
  // but 0 to 100 is also supported, along with a trailing %
  // @ts-ignore
  const distribution = Netlify.env.get("CSP_NONCE_DISTRIBUTION");
  if (!!distribution) {
    const threshold =
      distribution.endsWith("%") || parseFloat(distribution) > 1
        ? Math.max(parseFloat(distribution) / 100, 0)
        : Math.max(parseFloat(distribution), 0);
    const random = Math.random();
    // if a roll of the dice is greater than our threshold...
    if (random > threshold && threshold <= 1) {
      if (header === "content-security-policy") {
        // if the real CSP is set, then change to report only
        header = "content-security-policy-report-only";
      } else {
        // if the CSP is set to report-only, return unadulterated response
        return response;
      }
    }
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
  const reportUri = `report-uri ${
    params.reportUri || "/.netlify/functions/__csp-violations"
  }`;

  const csp = response.headers.get(header) as string;
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

  const querySelectors = ["script", 'link[rel="preload"][as="script"]'];
  return new HTMLRewriter()
    .on(querySelectors.join(","), {
      element(element: HTMLElement) {
        element.setAttribute("nonce", nonce);
      },
    })
    .transform(response);
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
  excludedPath: ["/.netlify/*", `**/*.(${excludedExtensions.join("|")})`]
    .concat(params.excludedPath)
    .filter(Boolean),
  handler,
  onError: "bypass",
};

export default handler;
