var spawn = require('child_process').spawn,
  fs = require('fs'),
  SANDBOX = '/home/daniela/sandbox',
  ERROR_FILE = SANDBOX + '/error.log',
  OUTPUT = SANDBOX + '/output';

exports.SANDBOX = SANDBOX;
exports.ERROR_FILE = ERROR_FILE;
exports.OUTPUT = OUTPUT;

exports.execute = function(data, command, args, callback, done) {
  var process = spawn(command, args,
    {
      cwd: SANDBOX,
      stdio: [
        0,
        fs.openSync(OUTPUT, 'w'),
        fs.openSync(ERROR_FILE, 'w')
      ]
    });
  console.log('1');
  //process.stdout.pipe(OUTPUT);
  //process.stderr.pipe(ERROR_FILE);
  console.log('2');
  process.on('close', function(code) {
    callback(data, code, done);
  });
}
