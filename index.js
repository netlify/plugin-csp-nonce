/* eslint-disable no-console */
import fs, { copyFileSync } from "fs";
import { getBuildInfo } from '@netlify/build-info/node';

const SITE_ID = "321a7119-6008-49a8-9d2f-e20602b1b349";

async function projectUsesNextJS() {
  for (const framework of (await getBuildInfo()).frameworks) {
    if (framework.id === 'next') {
      return true;
    }
  }
  return false;
}

export const onPreBuild = async ({
  inputs,
  netlifyConfig,
  utils,
  constants,
}) => {
  const { build } = netlifyConfig;

  const { INTERNAL_EDGE_FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC } = constants;

  // DISABLE_CSP_NONCE is undocumented (deprecated), but still supported
  // -> superseded by CSP_NONCE_DISTRIBUTION
  if (build.environment.DISABLE_CSP_NONCE === "true") {
    console.log(`  DISABLE_CSP_NONCE environment variable is true, skipping.`);
    return;
  }

  // CSP_NONCE_DISTRIBUTION is a number from 0 to 1,
  // but 0 to 100 is also supported, along with a trailing %
  const distribution = build.environment.CSP_NONCE_DISTRIBUTION;
  if (!!distribution) {
    const threshold =
      distribution.endsWith("%") || parseFloat(distribution) > 1
        ? Math.max(parseFloat(distribution) / 100, 0)
        : Math.max(parseFloat(distribution), 0);
    console.log(`  CSP_NONCE_DISTRIBUTION is set to ${threshold * 100}%`);
    if (threshold === 0) {
      console.log(`  Skipping.`);
      return;
    }
  }

  console.log(`  Current working directory: ${process.cwd()}`);
  const basePath =
    build.environment.SITE_ID === undefined || build.environment.SITE_ID === SITE_ID
      ? "./src"
      : "./node_modules/@netlify/plugin-csp-nonce/src";

  // make the directory in case it actually doesn't exist yet
  await utils.run.command(`mkdir -p ${INTERNAL_EDGE_FUNCTIONS_SRC}`);
  console.log(
    `  Writing nonce edge function to ${INTERNAL_EDGE_FUNCTIONS_SRC}...`,
  );
  copyFileSync(
    `${basePath}/__csp-nonce.ts`,
    `${INTERNAL_EDGE_FUNCTIONS_SRC}/__csp-nonce.ts`,
  );

  const usesNext = await projectUsesNextJS();

  // Do not invoke the CSP Edge Function for Netlify Image CDN requests.
  inputs.excludedPath.push('/.netlify/images');
  
  // If using NextJS, do not invoke the CSP Edge Function for NextJS Image requests.
  if (usesNext) {
    inputs.excludedPath.push('/_next/image');
  }
  
  fs.writeFileSync(
    `${INTERNAL_EDGE_FUNCTIONS_SRC}/__csp-nonce-inputs.json`,
    JSON.stringify(inputs, null, 2),
  );

  // if no reportUri in config input, deploy function on site's behalf
  if (!inputs.reportUri) {
    // make the directory in case it actually doesn't exist yet
    await utils.run.command(`mkdir -p ${INTERNAL_FUNCTIONS_SRC}`);
    console.log(
      `  Writing violations logging function to ${INTERNAL_FUNCTIONS_SRC}...`,
    );
    copyFileSync(
      `${basePath}/__csp-violations.ts`,
      `${INTERNAL_FUNCTIONS_SRC}/__csp-violations.ts`,
    );
  } else {
    console.log(`  Using ${inputs.reportUri} as report-uri directive...`);
  }

  console.log(`  Done.`);
};
