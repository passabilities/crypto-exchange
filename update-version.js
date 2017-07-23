#!/usr/bin/env node

const fs = require('fs')
const os = require('os')
const prependFile = require('prepend-file')

let { version } = JSON.parse(fs.readFileSync('./package.json', 'utf8'))

prependFile.sync('./CHANGELOG.md', `# v${version}${os.EOL}`)
