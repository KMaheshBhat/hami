import packageJson from '../package.json' with { type: 'json' };
import { version } from "@hami-frameworx/core";

console.log(`TBC CLI v${packageJson.version}`);
console.log(`HAMI v${version}`);
