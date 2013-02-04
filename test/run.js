#!/usr/bin/env node

var tests = [
    'tests.js',
    'function-tests.js',
    'conditional-tests.js',
    'save-restore-tests.js',
    'promise-tests.js'
];

var path = require('path');
var qunit = require('qunit');

qunit.setup({
    log: {
        globalSummary: true
    }
});

qunit.run({
    code: { namespace: 'P', path: resolve('../pointless.js') },
    tests: tests.map(resolve)
});

function resolve(file) {
    return path.join(__dirname, file);
}
