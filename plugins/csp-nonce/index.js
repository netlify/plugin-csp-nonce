export const onPreBuild = async ({ netlifyConfig, utils }) => {
  let dir = netlifyConfig.build.edge_functions;
  if (!dir) {
    dir = "./netlify/edge-functions";
    await utils.run.command(`mkdir -p ${dir}`);
  }
  await utils.run.command(
    `cp ./plugins/csp-nonce/edge-function.ts ${dir}/__csp-nonce.ts`
  );
};
