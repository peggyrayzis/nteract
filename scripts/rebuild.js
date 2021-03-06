#!/usr/bin/env node
if (process.platform === 'win32') {
  var exec = require('child_process').exec;
  var deps = require('../package.json').devDependencies;
  var version = deps.electron || deps['electron-prebuilt'];

  if (typeof version != 'string' || version.search(/>|<|~|\*|x/) > -1) {
    throw Error('No explicit electron version in package.json found.')
  };

  var cmd = 'npm rebuild zmq-prebuilt --runtime=electron --target=' + version +
    ' --disturl=https://atom.io/download/atom-shell --build-from-source'

  exec(cmd, function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    if (err) {
      throw err;
    }
  });
} else if (process.platform === 'linux' || process.platform === 'darwin') {
  console.log('No postinstall step required for platform' + process.platform);
} else {
  console.log(process.platform + ' is not yet supported.');
}
