import { Buffer } from "node:buffer";
import { ExecaError, execa } from "execa";
import getPort from "get-port";
import stripAnsi from "strip-ansi";

export type ServeOptions = {
  command?: ((port: number) => [file: string, args: string[]]) | undefined;
  waitForFunctions?: string[] | undefined;
};

/**
 * Test helper that starts a server that serves Netlify functions.
 *
 * @returns A tuple containing the base URL of the functions server and a cleanup function that,
 * when invoked, stops the server.
 */
export const serve = async ({
  command = (port) => [
    "netlify",
    ["dev", "--offline", "--no-open", "--port", port.toString()],
  ],
  waitForFunctions = [],
}: ServeOptions = {}): Promise<[string, () => Promise<void>]> => {
  const abortController = new AbortController();
  const port = await getPort();
  const proc = execa(...command(port), {
    all: true,
    cancelSignal: abortController.signal,
    env: { RUN_NETLIFY_CSP_NONCE_PLUGIN_TESTS: "1" },
  });

  await new Promise<void>((resolve) => {
    let isDone = false;
    let hasServerStarted = false;
    const functionsReady = new Map(
      waitForFunctions.map((name) => [name, false])
    );

    const onMessage = (data: unknown) => {
      if (isDone) {
        return;
      }

      if (Buffer.isBuffer(data)) {
        const message = stripAnsi(data.toString("utf8"));
        console.log({message})

        if (
          message.includes(
            `◈ Server now ready on http://localhost:${port.toString()}`
          )
        ) {
          hasServerStarted = true;
        }

        if (message.includes("◈ Loaded edge function ")) {
          const match =
            /◈ Loaded edge function (?<name>[\w-]+)/.exec(message)?.groups
              ?.name ?? null;

          console.log({match})

          if (match !== null && functionsReady.has(match)) {
            console.log('debug 1')
            functionsReady.set(match, true);
          }
        }
        
        console.log('hasServerStarted', hasServerStarted)
        console.log('Array.from(functionsReady.values()).every(Boolean)', Array.from(functionsReady.values()).every(Boolean))
        if (
          hasServerStarted &&
          Array.from(functionsReady.values()).every(Boolean)
        ) {
          proc.all.removeListener("message", onMessage);
          isDone = true;
          resolve();
        }
      }
    };

    proc.all.on("data", onMessage);
  });

  const baseUrl = `http://127.0.0.1:${port.toString()}`;
  return [
    baseUrl,
    async () => {
      await Promise.all([
        (async () => {
          try {
            await proc;
          } catch (err) {
            if (
              err instanceof ExecaError &&
              (err.isCanceled || err.isGracefullyCanceled)
            ) {
              return;
            }

            throw err;
          }
        })(),
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
        abortController.abort(),
      ]);
    },
  ] as const;
};
