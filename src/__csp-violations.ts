// Uses the modern Netlify Functions API (Request/Response) so this function runs
// on the current function runtime. The legacy `handler(event)` API runs on the
// older runtime, which is subject to the AWS Lambda 4 KB limit on environment
// variables and fails to deploy on sites whose function-scoped variables exceed it.
export default async (request: Request): Promise<Response> => {
  try {
    const { "csp-report": cspReport } = await request.json();
    if (cspReport) {
      console.log(JSON.stringify(cspReport));
    }
  } catch {
    // ...the sound of silence
  }
  return new Response(null, { status: 200 });
};
