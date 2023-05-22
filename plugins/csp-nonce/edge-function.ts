import { Config, Context } from "netlify:edge";

export default async (request: Request, context: Context) => {

  console.log(request.headers)

  const response = await context.next();
  response.headers = {
    ...response.headers,
    'Content-Security-Policy': "script-src 'nonce-2726c7f26c'",
  }
  const page = await response.text();

  console.log('page', page)

  const updatedPage = page.replace(/<script>/gi, "<script nonce=\"2726c7f26c\">");
  return new Response(updatedPage, response);
};

export const config: Config = {
  path: '/',
};
