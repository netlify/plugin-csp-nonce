/* eslint-disable no-console */
import fs, { copyFileSync } from "fs";

const SITE_ID = "321a7119-6008-49a8-9d2f-e20602b1b349";

export const onPreBuild = async ({ inputs, netlifyConfig, utils }) => {
  if (build.environment.DISABLE_CSP_NONCE === "true") {
    console.log(`  DISABLE_CSP_NONCE environment variable is true, skipping.`);
    return;
  }

  console.log(`  Current working directory: ${process.cwd()}`);
  const config = JSON.stringify(inputs, null, 2);
  const { build } = netlifyConfig;
  const basePath =
    build.environment.SITE_ID === SITE_ID
      ? "./src"
      : "./node_modules/@netlify/plugin-csp-nonce/src";

  const functionsDir = build.functions || "./netlify/functions";
  // make the directory in case it actually doesn't exist yet
  await utils.run.command(`mkdir -p ${functionsDir}`);
  console.log(`  Copying function to ${functionsDir}...`);
  copyFileSync(
    `${basePath}/__csp-violations.ts`,
    `${functionsDir}/__csp-violations.ts`
  );

  const edgeFunctionsDir = build.edge_functions || "./netlify/edge-functions";
  // make the directory in case it actually doesn't exist yet
  await utils.run.command(`mkdir -p ${edgeFunctionsDir}`);
  console.log(`  Copying edge function to ${edgeFunctionsDir}...`);
  copyFileSync(
    `${basePath}/__csp-nonce.ts`,
    `${edgeFunctionsDir}/__csp-nonce.ts`
  );
  console.log(`  Copying config inputs to ${edgeFunctionsDir}...`);
  fs.writeFileSync(`${edgeFunctionsDir}/__csp-nonce-inputs.json`, config);

  console.log(`  Complete.`);
};
