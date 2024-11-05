# Changelog

## [1.3.0](https://github.com/netlify/plugin-csp-nonce/compare/v1.2.13...v1.3.0) (2024-11-05)


### Features

* Do not invoke the CSP Edge Function for Netlify Image CDN requests ([#90](https://github.com/netlify/plugin-csp-nonce/issues/90)) ([410862e](https://github.com/netlify/plugin-csp-nonce/commit/410862e1271dfffaf8cdae6c7c3dc9a4c37fca50))

## [1.2.13](https://github.com/netlify/plugin-csp-nonce/compare/v1.2.12...v1.2.13) (2024-11-05)


### Performance Improvements

* refactor the content-type check from `startsWith("text/html")` to `=== "text/html" ([#85](https://github.com/netlify/plugin-csp-nonce/issues/85)) ([6aeef74](https://github.com/netlify/plugin-csp-nonce/commit/6aeef74613b33f4d1bdfbd3261072b7cbc94184e))

## [1.2.12](https://github.com/netlify/plugin-csp-nonce/compare/v1.2.11...v1.2.12) (2024-11-04)


### Bug Fixes

* update the config to only ever run the function for HTTP GET requests ([#87](https://github.com/netlify/plugin-csp-nonce/issues/87)) ([15abadd](https://github.com/netlify/plugin-csp-nonce/commit/15abadd93d833ae67b88609f6606b94213e3f197))

## [1.2.11](https://github.com/netlify/plugin-csp-nonce/compare/v1.2.10...v1.2.11) (2024-11-04)


### Bug Fixes

* **perf:** return early if the request is not a HTTP GET ([#84](https://github.com/netlify/plugin-csp-nonce/issues/84)) ([66936f9](https://github.com/netlify/plugin-csp-nonce/commit/66936f9728cd817f163cbd23401465e2b7f7ed63))

## [1.2.10](https://github.com/netlify/plugin-csp-nonce/compare/v1.2.9...v1.2.10) (2024-05-02)


### Bug Fixes

* upgrade html_rewriter ([#79](https://github.com/netlify/plugin-csp-nonce/issues/79)) ([ae4974f](https://github.com/netlify/plugin-csp-nonce/commit/ae4974f87c717fb4a9614f036bb5c20c36996d98))

## [1.2.9](https://github.com/netlify/plugin-csp-nonce/compare/v1.2.8...v1.2.9) (2024-03-22)


### Bug Fixes

* remove trailing slash from .netlify excluded path ([#76](https://github.com/netlify/plugin-csp-nonce/issues/76)) ([63b6d91](https://github.com/netlify/plugin-csp-nonce/commit/63b6d911991d3b98ddbd98456be40bc7c50c97f1))

## [1.2.8](https://github.com/netlify/plugin-csp-nonce/compare/v1.2.7...v1.2.8) (2024-03-11)


### Bug Fixes

* missing leading space before user-supplied value ([#73](https://github.com/netlify/plugin-csp-nonce/issues/73)) ([f30f961](https://github.com/netlify/plugin-csp-nonce/commit/f30f961d2276478d6d1caf4d5fa4417b87146099))

## [1.2.7](https://github.com/netlify/plugin-csp-nonce/compare/v1.2.6...v1.2.7) (2024-03-11)


### Bug Fixes

* use functions-internal to ensure frameworks do not remove edge function we generate ([#70](https://github.com/netlify/plugin-csp-nonce/issues/70)) ([0da8536](https://github.com/netlify/plugin-csp-nonce/commit/0da85367bd947ca91a4ea95c1f20a3c395dcf40f))

## [1.2.6](https://github.com/netlify/plugin-csp-nonce/compare/v1.2.5...v1.2.6) (2024-01-16)


### Bug Fixes

* mangled `script-src-elem` directive ([#63](https://github.com/netlify/plugin-csp-nonce/issues/63)) ([3c3f5fb](https://github.com/netlify/plugin-csp-nonce/commit/3c3f5fb6c74c6fb0f02fc1bc8cc97c2d1a87c1f9))

## [1.2.5](https://github.com/netlify/plugin-csp-nonce/compare/v1.2.4...v1.2.5) (2023-11-01)


### Bug Fixes

* add nonce to link preload tags ([#59](https://github.com/netlify/plugin-csp-nonce/issues/59)) ([c097ee0](https://github.com/netlify/plugin-csp-nonce/commit/c097ee0cf432ea6a7df946021b0daa9869d7a915))

## [1.2.4](https://github.com/netlify/plugin-csp-nonce/compare/v1.2.3...v1.2.4) (2023-10-26)


### Bug Fixes

* excludedPath not iterable ([#56](https://github.com/netlify/plugin-csp-nonce/issues/56)) ([843b241](https://github.com/netlify/plugin-csp-nonce/commit/843b2414a5ef7ad4e02c960d4216ab8ec4fa9b8c))

## [1.2.3](https://github.com/netlify/plugin-csp-nonce/compare/v1.2.2...v1.2.3) (2023-10-23)


### Bug Fixes

* better typescript types ([#53](https://github.com/netlify/plugin-csp-nonce/issues/53)) ([f01059b](https://github.com/netlify/plugin-csp-nonce/commit/f01059b7f50fee6dca99521a6e66afee02bb9701))

## [1.2.2](https://github.com/netlify/plugin-csp-nonce/compare/v1.2.1...v1.2.2) (2023-08-25)


### Bug Fixes

* join excluded extensions into one regex instead of spreading into multiple regexes ([#49](https://github.com/netlify/plugin-csp-nonce/issues/49)) ([f053d5a](https://github.com/netlify/plugin-csp-nonce/commit/f053d5af571c6d3ba3559842e903f5c99c57bb32))
* **perf:** use HTMLRewriter instead of regex for html transformation ([#48](https://github.com/netlify/plugin-csp-nonce/issues/48)) ([c48daad](https://github.com/netlify/plugin-csp-nonce/commit/c48daadf8255b307cee86f680916218f563d9912))

## [1.2.1](https://github.com/netlify/plugin-csp-nonce/compare/v1.2.0...v1.2.1) (2023-06-15)


### Bug Fixes

* change header key if distribution below threshold, rather than skipping ([#42](https://github.com/netlify/plugin-csp-nonce/issues/42)) ([30ef477](https://github.com/netlify/plugin-csp-nonce/commit/30ef47799e8d0dd4ac0dffe091c270dfa1d9fb15))

## [1.2.0](https://github.com/netlify/plugin-csp-nonce/compare/v1.1.4...v1.2.0) (2023-06-14)


### Features

* support controlled rollouts by environment variable ([#41](https://github.com/netlify/plugin-csp-nonce/issues/41)) ([64b285b](https://github.com/netlify/plugin-csp-nonce/commit/64b285b8927404be6d507f5593b013484a88f4cc))


### Bug Fixes

* disregard accept request header ([#39](https://github.com/netlify/plugin-csp-nonce/issues/39)) ([fbda4fb](https://github.com/netlify/plugin-csp-nonce/commit/fbda4fb22a66067ed0d73a882ad57998317011c8))

## [1.1.4](https://github.com/netlify/plugin-csp-nonce/compare/v1.1.3...v1.1.4) (2023-06-14)


### Bug Fixes

* add more logging to determine unnecessary invocations ([#37](https://github.com/netlify/plugin-csp-nonce/issues/37)) ([684a01b](https://github.com/netlify/plugin-csp-nonce/commit/684a01bcbf03f94e914851ab8d2eb6223e5e992a))

## [1.1.3](https://github.com/netlify/plugin-csp-nonce/compare/v1.1.2...v1.1.3) (2023-06-13)


### Bug Fixes

* bypass on error ([#35](https://github.com/netlify/plugin-csp-nonce/issues/35)) ([6052a96](https://github.com/netlify/plugin-csp-nonce/commit/6052a969a51ea11733aa9666eb4d0522c5142af4))

## [1.1.2](https://github.com/netlify/plugin-csp-nonce/compare/v1.1.1...v1.1.2) (2023-06-06)


### Bug Fixes

* add optional ([#33](https://github.com/netlify/plugin-csp-nonce/issues/33)) ([9f3fe4e](https://github.com/netlify/plugin-csp-nonce/commit/9f3fe4e3a3989ca238c8f6c0ee130157e0388263))

## [1.1.1](https://github.com/netlify/plugin-csp-nonce/compare/v1.1.0...v1.1.1) (2023-06-05)


### Bug Fixes

* actually make public ([#31](https://github.com/netlify/plugin-csp-nonce/issues/31)) ([6499e81](https://github.com/netlify/plugin-csp-nonce/commit/6499e813dac55d888aa77f99462013f178448252))

## [1.1.0](https://github.com/netlify/plugin-csp-nonce/compare/v1.0.8...v1.1.0) (2023-06-05)


### Features

* make public ([#29](https://github.com/netlify/plugin-csp-nonce/issues/29)) ([0638311](https://github.com/netlify/plugin-csp-nonce/commit/0638311e415c2817df9f5939990e45d9376feb25))

## [1.0.8](https://github.com/netlify/csp-nonce/compare/v1.0.7...v1.0.8) (2023-06-05)


### Bug Fixes

* add report-uri config option ([#26](https://github.com/netlify/csp-nonce/issues/26)) ([a602df8](https://github.com/netlify/csp-nonce/commit/a602df806280ebae70a91d19affbb8f0b45176ee))
* log unnecessary invocations ([#28](https://github.com/netlify/csp-nonce/issues/28)) ([c9a91c4](https://github.com/netlify/csp-nonce/commit/c9a91c44a84aec7804c32a1175549774e3c08956))

## [1.0.7](https://github.com/netlify/csp-nonce/compare/v1.0.6...v1.0.7) (2023-06-02)


### Bug Fixes

* add input for unsafe-eval, defaulting to true ([#25](https://github.com/netlify/csp-nonce/issues/25)) ([eebf608](https://github.com/netlify/csp-nonce/commit/eebf60881465843914ff19687a58cc107dedf544))
* allow curl to receive the nonce ([#22](https://github.com/netlify/csp-nonce/issues/22)) ([b27d029](https://github.com/netlify/csp-nonce/commit/b27d029ea0a2381cdfb8bf10e07a51a16ed2f487))

## [1.0.6](https://github.com/netlify/csp-nonce/compare/v1.0.5...v1.0.6) (2023-06-01)


### Bug Fixes

* fix bug related to missing script tag ([#18](https://github.com/netlify/csp-nonce/issues/18)) ([7746bff](https://github.com/netlify/csp-nonce/commit/7746bffcd1043d3cd787ef346a2f0ecd29437c4a))

## [1.0.5](https://github.com/netlify/csp-nonce/compare/v1.0.4...v1.0.5) (2023-06-01)


### Bug Fixes

* remove style-src directive checks ([#15](https://github.com/netlify/csp-nonce/issues/15)) ([42a2109](https://github.com/netlify/csp-nonce/commit/42a21092569ef3764fb98b5175a3e6fb9ab9ee1d))

## [1.0.4](https://github.com/netlify/csp-nonce/compare/v1.0.3...v1.0.4) (2023-05-31)


### Bug Fixes

* eslint-disable copied files ([#13](https://github.com/netlify/csp-nonce/issues/13)) ([d7ec3af](https://github.com/netlify/csp-nonce/commit/d7ec3af57446b9f50ad92ada00edfbfafcf82fdb))

## [1.0.3](https://github.com/netlify/csp-nonce/compare/v1.0.2...v1.0.3) (2023-05-31)


### Bug Fixes

* change base path based on SITE_ID ([#11](https://github.com/netlify/csp-nonce/issues/11)) ([590df27](https://github.com/netlify/csp-nonce/commit/590df27e4896cd389684733c6fe2a9e222840f24))

## [1.0.2](https://github.com/netlify/csp-nonce/compare/v1.0.1...v1.0.2) (2023-05-31)


### Bug Fixes

* typo with manifest.yaml instead of manifest.yml ([#9](https://github.com/netlify/csp-nonce/issues/9)) ([ba60aea](https://github.com/netlify/csp-nonce/commit/ba60aea14a3fb7d465bad0feae3a9e49a95686c8))

## [1.0.1](https://github.com/netlify/csp-nonce/compare/v1.0.0...v1.0.1) (2023-05-31)


### Bug Fixes

* use npm instead of yarn so that `npm ci` works ([#7](https://github.com/netlify/csp-nonce/issues/7)) ([069f2b8](https://github.com/netlify/csp-nonce/commit/069f2b844c344e6492758cbfa1dd11ceb88127ca))

## 1.0.0 (2023-05-31)


### Bug Fixes

* add more detail to readme ([#5](https://github.com/netlify/csp-nonce/issues/5)) ([d55dc80](https://github.com/netlify/csp-nonce/commit/d55dc804cf85f4cc484f36593758778d3e2d414c))
