// index.js

const ef = `
import { Context } from "netlify:edge";

export default async (request: Request, context: Context) => {

  const response = await context.next();
  response.headers = {
    ...response.headers,
    'Content-Security-Policy': "script-src 'nonce-2726c7f26c'",
  }
  const page = await response.text();

  const updatedPage = page.replace(/<script>/gi, "<script nonce=\"2726c7f26c\">");
  return new Response(updatedPage, response);
};
`

export const onPreBuild = function({ netlifyConfig }) {

  // Add headers
  netlifyConfig.headers.push({
    for: "/*",
    values: { 'Content-Security-Policy': "script-src 'nonce-a8s0dbfa0s8d7b'" },
  });

  // Add edge function
  const edgeFunction = { path: '/*', function: ef }
  if (netlifyConfig.edge_functions) {
    netlifyConfig.edge_functions.push(edgeFunction)
  } else {
    netlifyConfig.edge_functions = [edgeFunction]
  }
}
