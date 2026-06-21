#!/usr/bin/env node

'use strict';

const assert = require('assert');
const utils = require('../utils.js');

// Enhanced SEA requires Node.js >= 22
if (utils.getNodeMajorVersion() < 22) {
  return;
}

assert(__dirname === process.cwd());

const input = './package.json';
const testName = 'test-89-sea-fs-ops';

const newcomers = utils.seaHostOutputs(testName);

const before = utils.filesBefore(newcomers);

utils.runSeaHostOnly(input, testName);

const expectedOutput =
  'exists-index:true\n' +
  'exists-missing:false\n' +
  'stat-isFile:true\n' +
  'stat-isDir:false\n' +
  'dir-isFile:false\n' +
  'dir-isDir:true\n' +
  'readdir:data.json,index.js,package.json\n' +
  'readdir-wft:data.json|true|false,index.js|true|false,package.json|true|false\n' +
  'readFile:ok\n' +
  'stat-missing:ENOENT\n' +
  'read-missing:ENOENT\n' +
  'exists-dir-slash:true\n' +
  'stat-dir-slash-isDir:true\n' +
  'readdir-dir-slash:data.json,index.js,package.json\n' +
  'accessSync-dir-slash:ok\n' +
  'readdir-wft-async:data.json,index.js,package.json|allDirent:true\n' +
  'access-promise-dir-slash:ok\n';

utils.assertSeaOutput(testName, expectedOutput);

utils.filesAfter(before, newcomers, { tolerateWindowsEbusy: true });
