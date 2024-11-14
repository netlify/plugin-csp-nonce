import parseContentSecurityPolicy from "content-security-policy-parser";
import * as cheerio from "cheerio";

import { afterAll, beforeAll, expect, it, describe } from "vitest";
import { serve } from "./helpers";

let baseURL: string;

let cleanup: () => Promise<void>;

beforeAll(async () => {
  [baseURL, cleanup] = await serve({
    waitForFunctions: ["__csp-nonce"],
  });
});

afterAll(async () => {
  await cleanup()
});

describe("GET /", function () {
  let response: Response;
  beforeAll(async () => {
    response = await fetch(new URL(`/`, baseURL), {
      headers: {
        "x-nf-debug-logging": "true",
      },
    });
  });

  it("__csp-nonce edge function was invoked", () => {
    expect(response.headers.get("x-debug-csp-nonce")).to.eql("invoked");
    expect(response.headers.get("x-nf-edge-functions")).to.match(
      /\b__csp-nonce\b/
    );
  });

  it("responds with a 200 status", () => {
    expect(response.status).to.eql(200);
  });

  it("responds with a content-security-policy header", () => {
    expect(response.headers.has("content-security-policy")).to.eql(true);
  });

  describe("content-security-policy header", () => {
    let csp: Map<string, string[]>;
    beforeAll(async () => {
      csp = parseContentSecurityPolicy(
        response.headers.get("content-security-policy") || ""
      );
    });

    it("has correct img-src directive", () => {
      expect(csp.get("img-src")).to.eql(["'self'", "blob:", "data:"]);
    });
    it("has correct script-src directive", () => {
      const script = csp.get("script-src");
      const nonce = /^'nonce-[-A-Za-z0-9+/]{32}'$/;
      expect(script.find((value) => nonce.test(value))).to.match(nonce);
      expect(script.includes("'strict-dynamic'")).to.eql(true);
      expect(script.includes("'unsafe-inline'")).to.eql(true);
      expect(script.includes("'unsafe-eval'")).to.eql(true);
      expect(script.includes("'self'")).to.eql(true);
      expect(script.includes("https:")).to.eql(true);
      expect(script.includes("http:")).to.eql(true);
      expect(
        script.includes("'sha256-/Cb4VxgL2aVP0MVDvbP0DgEOUv+MeNQmZX4yXHkn/c0='")
      ).to.eql(true);
    });
    it("has correct report-uri directive", () => {
      expect(csp.get("report-uri")).to.eql([
        "/.netlify/functions/__csp-violations",
      ]);
    });
  });

  describe("html nonces", () => {
    let $: cheerio.CheerioAPI;
    beforeAll(async () => {
      $ = cheerio.load(await response.text());
    });

    it("has set the nonce attribute on the script elements", () => {
      const csp = parseContentSecurityPolicy(
        response.headers.get("content-security-policy") || ""
      );
      const scriptsrc = csp.get("script-src");
      const nonce = scriptsrc
        ?.find((v) => v.startsWith("'nonce-"))
        ?.slice("'nonce-".length, -1)!;
      
      const scripts = $("script");
      for (const script of scripts) {
        expect(script.attribs.nonce).to.eql(nonce);
      }
    });
    
    it("has set the nonce attribute on the link preload script elements", () => {
      const csp = parseContentSecurityPolicy(
        response.headers.get("content-security-policy") || ""
      );
      const scriptsrc = csp.get("script-src");
      const nonce = scriptsrc
        ?.find((v) => v.startsWith("'nonce-"))
        ?.slice("'nonce-".length, -1)!;
      
      const elements = $("link[rel=\"preload\"][as=\"script\"]");
      for (const element of elements) {
        expect(element.attribs.nonce).to.eql(nonce);
      }
    });
  });
});

describe("POST /", function () {
  let response: Response;
  beforeAll(async () => {
    response = await fetch(new URL(`/`, baseURL), {
      method: "POST",
      headers: {
        "x-nf-debug-logging": "true",
      },
    });
  });

  it("__csp-nonce edge function was not invoked", () => {
    expect(response.headers.has("x-debug-csp-nonce")).to.eql(false);
    expect(response.headers.has("x-nf-edge-functions")).to.eql(false);
  });

  it("responds with original content-security-policy header", () => {
    expect(response.headers.get("content-security-policy")).to.eql(
      "img-src 'self' blob: data:; script-src 'sha256-/Cb4VxgL2aVP0MVDvbP0DgEOUv+MeNQmZX4yXHkn/c0='"
    );
  });
});

describe("GET /main.css", function () {
  let response: Response;
  beforeAll(async () => {
    response = await fetch(new URL(`/main.css`, baseURL), {
      headers: {
        "x-nf-debug-logging": "true",
      },
    });
  });

  it("__csp-nonce edge function was not invoked", () => {
    expect(response.headers.has("x-debug-csp-nonce")).to.eql(false);
    expect(response.headers.has("x-nf-edge-functions")).to.eql(false);
  });

  it("responds with a 200 status", () => {
    expect(response.status).to.eql(200);
  });

  it("responds without a content-security-policy header", () => {
    expect(response.headers.has("content-security-policy")).to.eql(false);
  });
});
