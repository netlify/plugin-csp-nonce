import fs, { copyFileSync } from "fs";

/* eslint-disable no-console */
export const onPreBuild = async ({ inputs, netlifyConfig, utils }) => {
  const config = JSON.stringify(inputs, null, 2);

  const functionsDir = netlifyConfig.build.functions || "./netlify/functions";
  // make the directory in case it actually doesn't exist yet
  await utils.run.command(`mkdir -p ${functionsDir}`);
  console.log(`  Copying function to ${functionsDir}...`);
  copyFileSync(
    `./plugins/csp-nonce/files/__csp-violations.ts`,
    `${functionsDir}/__csp-violations.ts`
  );

  const edgeFunctionsDir =
    netlifyConfig.build.edge_functions || "./netlify/edge-functions";
  // make the directory in case it actually doesn't exist yet
  await utils.run.command(`mkdir -p ${edgeFunctionsDir}`);
  console.log(`  Copying edge function to ${edgeFunctionsDir}...`);
  copyFileSync(
    `./plugins/csp-nonce/files/__csp-nonce.ts`,
    `${edgeFunctionsDir}/__csp-nonce.ts`
  );
  console.log(`  Copying config inputs to ${edgeFunctionsDir}...`);
  fs.writeFileSync(`${edgeFunctionsDir}/__csp-nonce-inputs.json`, config);

  console.log(`  Complete.`);
};
