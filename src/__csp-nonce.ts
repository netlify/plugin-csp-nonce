/* eslint-disable */
// @ts-ignore
import type { Config, Context } from "netlify:edge";
// @ts-ignore

import init from 'https://cdn.jsdelivr.net/gh/netlify/csp_nonce_html_transformer@129556d111c752ab9ef9b2febeb0add99779ec4f/dist/html_rewriter.js'

import { HTMLRewriterWrapper } from 'https://cdn.jsdelivr.net/gh/netlify/csp_nonce_html_transformer@129556d111c752ab9ef9b2febeb0add99779ec4f/dist/html_rewriter_wrapper.js'

const HTMLRewriter = HTMLRewriterWrapper(
    init(fetch(new URL('https://cdn.jsdelivr.net/gh/netlify/csp_nonce_html_transformer@129556d111c752ab9ef9b2febeb0add99779ec4f/dist/html_rewriter_bg.wasm', import.meta.url))),
)

// import { HTMLRewriter } from "https://cdn.jsdelivr.net/gh/netlify/csp_nonce_html_transformer@129556d111c752ab9ef9b2febeb0add99779ec4f/browser.js";
// @ts-ignore
import inputs from "./__csp-nonce-inputs.json" assert { type: "json" };

type Params = {
  reportOnly: boolean;
  reportUri?: string;
  unsafeEval: boolean;
  path: string | string[];
  excludedPath: string[];
  distribution?: string;
  strictDynamic?: boolean;
  unsafeInline?: boolean;
  self?: boolean;
  https?: boolean;
  http?: boolean;
};
const params = inputs as Params;
params.reportUri = params.reportUri || "/.netlify/functions/__csp-violations";
// @ts-ignore
params.distribution = Netlify.env.get("CSP_NONCE_DISTRIBUTION");

params.strictDynamic = true;
params.unsafeInline = true;
params.self = true;
params.https = true;
params.http = true;



const hexOctets: string[] = [];

for (let i = 0; i <= 255; ++i) {
  const hexOctet = i.toString(16).padStart(2, "0");
  hexOctets.push(hexOctet);
}

function uInt8ArrayToBase64String(input: Uint8Array): string {
  let res = "";

  for (let i = 0; i < input.length; i++) {
    res += String.fromCharCode(parseInt(hexOctets[input[i]], 16));
  }

  return btoa(res);
}

async function csp(originalResponse: Response, params?: Params) {
  const isHTMLResponse = originalResponse.headers.get("content-type")
    ?.startsWith(
      "text/html",
    );
  if (!isHTMLResponse) {
    return originalResponse;
  }
  const response = new Response(originalResponse.body, originalResponse);

  let header = params && params.reportOnly
    ? "content-security-policy-report-only"
    : "content-security-policy";

  // distribution is a number from 0 to 1,
  // but 0 to 100 is also supported, along with a trailing %
  const distribution = params?.distribution;
  if (distribution) {
    const threshold = distribution.endsWith("%") || parseFloat(distribution) > 1
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

  const nonce = uInt8ArrayToBase64String(
    crypto.getRandomValues(new Uint8Array(24)),
  );

  const rules = [
    `'nonce-${nonce}'`,
    params?.unsafeEval && `'unsafe-eval'`,
    params?.strictDynamic && `'strict-dynamic'`,
    params?.unsafeInline && `'unsafe-inline'`,
    params?.self && `'self'`,
    params?.https && `https:`,
    params?.http && `http:`,
  ].filter(Boolean);
  const scriptSrc = `script-src ${rules.join(" ")}`;

  const csp = response.headers.get(header) as string;
  if (csp) {
    const directives = csp
      .split(";")
      .map((directive) => {
        // prepend our rules for any existing directives
        const d = directive.trim();
        // intentionally add trailing space to avoid mangling `script-src-elem`
        if (d.startsWith("script-src ")) {
          // append with trailing space to include any user-supplied values
          // https://github.com/netlify/plugin-csp-nonce/issues/72
          return d.replace("script-src ", `${scriptSrc} `).trim();
        }
        // intentionally omit report-uri: theirs should take precedence
        return d;
      })
      .filter(Boolean);
    // push our rules if the directives don't exist yet
    if (!directives.find((d) => d.startsWith("script-src "))) {
      directives.push(scriptSrc);
    }
    if (
      params?.reportUri && !directives.find((d) => d.startsWith("report-uri"))
    ) {
      directives.push(`report-uri ${params.reportUri}`);
    }
    const value = directives.join("; ");
    response.headers.set(header, value);
  } else {
    // make a new ruleset of directives if no CSP present
    const value = [scriptSrc];
    if (params?.reportUri) {
      value.push(`report-uri ${params.reportUri}`);
    }
    response.headers.set(header, value.join("; "));
  }

  const querySelectors = ["script", 'link[rel="preload"][as="script"]'];
  await init();
  const HTMLRewriter = HTMLRewriterWrapper();
  return new HTMLRewriter()
    .on(querySelectors.join(","), {
      element(element: Element) {
        element.setAttribute("nonce", nonce);
      },
    })
    .transform(response);
}

const handler = async (request: Request, context: Context) => {
  const response = await context.next(request);

  // for debugging which routes use this edge function
  response.headers.set("x-debug-csp-nonce", "invoked");
  return csp(response, params)
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
  excludedPath: ["/.netlify*", `**/*.(${excludedExtensions.join("|")})`]
    .concat(params.excludedPath)
    .filter(Boolean),
  handler,
  onError: "bypass",
  method: "GET",
};

export default handler;
