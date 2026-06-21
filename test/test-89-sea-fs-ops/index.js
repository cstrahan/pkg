'use strict';

const fs = require('fs');
const path = require('path');

// Test existsSync
console.log('exists-index:' + fs.existsSync(path.join(__dirname, 'index.js')));
console.log('exists-missing:' + fs.existsSync(path.join(__dirname, 'nope.js')));

// Test statSync
const stat = fs.statSync(path.join(__dirname, 'index.js'));
console.log('stat-isFile:' + stat.isFile());
console.log('stat-isDir:' + stat.isDirectory());

const dirStat = fs.statSync(__dirname);
console.log('dir-isFile:' + dirStat.isFile());
console.log('dir-isDir:' + dirStat.isDirectory());

// Test readdirSync
const entries = fs.readdirSync(__dirname).sort();
console.log('readdir:' + entries.join(','));

// Test readdirSync({ withFileTypes: true }) -> Dirent-compatible objects.
// The SEA VFS must return objects with working is*() predicates (not bare
// strings), otherwise consumers doing `e.isFile()` crash.
const dirents = fs
  .readdirSync(__dirname, { withFileTypes: true })
  .sort((a, b) => a.name.localeCompare(b.name));
console.log(
  'readdir-wft:' +
    dirents
      .map((d) => d.name + '|' + d.isFile() + '|' + d.isDirectory())
      .join(','),
);

// Test readFileSync
const content = fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8');
const parsed = JSON.parse(content);
console.log('readFile:' + parsed.test);

// Test error path: statSync on non-existent file should throw
try {
  fs.statSync(path.join(__dirname, 'does-not-exist.txt'));
  console.log('stat-missing:no-error');
} catch (e) {
  console.log('stat-missing:' + e.code);
}

// Test error path: readFileSync on non-existent file should throw
try {
  fs.readFileSync(path.join(__dirname, 'does-not-exist.txt'));
  console.log('read-missing:no-error');
} catch (e) {
  console.log('read-missing:' + e.code);
}

// Regression: directory lookups with trailing slash must resolve (issue #260).
// Libraries like nestjs-i18n append '/' to __dirname; classic pkg strips it
// via normalizePath, SEA must do the same in the manifest-key normalizer.
const dirSlash = __dirname + '/';
console.log('exists-dir-slash:' + fs.existsSync(dirSlash));
console.log('stat-dir-slash-isDir:' + fs.statSync(dirSlash).isDirectory());
console.log('readdir-dir-slash:' + fs.readdirSync(dirSlash).sort().join(','));
try {
  fs.accessSync(dirSlash);
  console.log('accessSync-dir-slash:ok');
} catch (e) {
  console.log('accessSync-dir-slash:' + e.code);
}

// Async readdir must honor withFileTypes too (the async provider method
// delegates to readdirSync). Chained before the access check so output order
// is deterministic.
require('fs/promises')
  .readdir(__dirname, { withFileTypes: true })
  .then(function (ds) {
    const allDirent = ds.every((d) => typeof d.isFile === 'function');
    console.log(
      'readdir-wft-async:' +
        ds
          .map((d) => d.name)
          .sort()
          .join(',') +
        '|allDirent:' +
        allDirent,
    );
    return require('fs/promises').access(dirSlash);
  })
  .then(function () {
    console.log('access-promise-dir-slash:ok');
  })
  .catch(function (e) {
    console.log('access-promise-dir-slash:' + e.code);
  });
