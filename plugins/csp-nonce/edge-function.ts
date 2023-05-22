import { Config, Context } from "netlify:edge";

export default async (request: Request, context: Context) => {
  const response = await context.next();
  response.headers.set(
    "Content-Security-Policy",
    "script-src 'nonce-2726c7f26c'"
  );
  const page = await response.text();

  const updatedPage = page.replace(/<script>/gi, '<script nonce="2726c7f26c">');
  return new Response(updatedPage, response);
};

export const config: Config = {
  path: "/",
};
