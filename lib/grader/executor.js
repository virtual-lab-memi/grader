var spawn = require('child_process').spawn,
  fs = require('fs'),
  SANDBOX = Config.sandbox.root,
  ERROR_FILE = Config.output.error,
  OUTPUT = Config.output.default,
  PROBLEMS_REPO = Config.sandbox.problems;
//TODO: create configuration file for this values
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

  Logger.info('ID: %s - Started process executor...', CURRENT_JOB);

  if (options) {
    timeoutId = setTimeout(function() {
      timeout = true
      process.kill();
      Logger.info('ID: %s - Process killed because a timeout', CURRENT_JOB);
    }, options.timeout);
    Logger.info('ID: %s - Process timeout set for: %s', CURRENT_JOB, options.timeout);
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

    Logger.debug('ID: %s - Process time: %s', CURRENT_JOB, executionTime);
    Logger.info('ID: %s - Process executor finished with code: %s', CURRENT_JOB, code);
    callback(data, code, done, timeout);
  });
}
