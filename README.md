# @netlify/plugin-csp-nonce

Use a nonce for the script-src and style-src directives of your Content Security Policy.

This package deploys an edge function to add a header and transform the HTML response body, and a function to log CSP violations.

## Configuration options

- `reportOnly`: When true, uses the Content-Security-Policy-Report-Only header instead of the Content-Security-Policy header.
- `path`: The glob expressions of path(s) that should invoke the CSP nonce edge function. Can be a string or array of strings.
- `excludedPath`: The glob expressions of path(s) that _should not_ invoke the CSP nonce edge function. Must be an array of strings. This value gets spread with common non-html filetype extensions (_.css, _.js, \*.svg, etc)
