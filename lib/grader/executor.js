var spawn = require('child_process').spawn,
  fs = require('fs'),
  SANDBOX = '/home/train-me/sandbox',
  ERROR_FILE = SANDBOX + '/error.log',
  OUTPUT = SANDBOX + '/output',
  PROBLEMS_REPO = '/home/train-me/uploads';

exports.SANDBOX = SANDBOX;
exports.ERROR_FILE = ERROR_FILE;
exports.OUTPUT = OUTPUT,
exports.PROBLEMS_REPO = PROBLEMS_REPO;

exports.execute = function(data, command, args, callback, done, options) {
  var timeoutId,
    timeout,
    executionTime = new Date(),
    memoryUsage = 300,
    process = spawn(command, args,
    {
      cwd: SANDBOX,
      stdio: [
        (data.input ? fs.openSync(data.input, 'r') : 0),
        fs.openSync(OUTPUT, 'w'),
        fs.openSync(ERROR_FILE, 'w')
      ]
    });

  if (options) {
    timeoutId = setTimeout(function() {
      console.log('Killing the process');
      timeout = true
      process.kill();
    }, options.timeout);
  }

  process.on('close', function(code, signal) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    executionTime = Math.abs(new Date() - executionTime);
    data.result = {
      time: executionTime,
      memory: memoryUsage
    }
    callback(data, code, done, timeout);
  });
}
