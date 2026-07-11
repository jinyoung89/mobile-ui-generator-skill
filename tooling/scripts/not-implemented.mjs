#!/usr/bin/env node

const command = process.argv[2] ?? "requested command";
console.error(`${command} is not implemented; refusing to report success.`);
process.exit(1);
