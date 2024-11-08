/* eslint-disable */
// @ts-ignore
import type { Config, Context } from "netlify:edge";
// @ts-ignore
import { csp } from "https://deno.land/x/csp_nonce_html_transformer@v2.1.0/src/index.ts";
// @ts-ignore
import inputs from "./__csp-nonce-inputs.json" assert { type: "json" };

type Params = {
  reportOnly: boolean;
  reportUri?: string;
  strictDynamic: boolean,
  unsafeInline: boolean,
  self: boolean,
  https: boolean,
  http: boolean,
  unsafeEval: boolean;
  path: string | string[];
  excludedPath: string[];
  distribution?: string;
};
const params = inputs as Params;
params.reportUri = params.reportUri || "/.netlify/functions/__csp-violations";
// @ts-ignore
params.distribution = Netlify.env.get("CSP_NONCE_DISTRIBUTION");

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
