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

exports.execute = function(data, command, args, callback, done) {
  var timeoutId,
    timeout,
    totalExecutionTime = new Date(),
    memoryUsage = 300,
    process = spawn(command, args,
    {
      cwd: SANDBOX,
      stdio: [
        (data.input ? fs.openSync(data.input, 'r') : 0),
        (data.output ? fs.openSync(data.output, 'w') : 0),
        fs.openSync(ERROR_FILE, 'w')
      ]
    });

  Logger.info('ID: %s - Started process executor...', CURRENT_JOB);


  timeoutId = setTimeout(function() {
    timeout = true;
    process.kill();
    Logger.info('ID: %s - Process killed because a timeout', CURRENT_JOB);
  }, 10000);
  Logger.info('ID: %s - Process timeout set for: %s', CURRENT_JOB, 10000);

  process.on('close', function(code, signal) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    totalExecutionTime = Math.abs(new Date() - totalExecutionTime);

    Logger.debug('ID: %s - Process time: %s', CURRENT_JOB, totalExecutionTime);
    Logger.info('ID: %s - Process executor finished with code: %s', CURRENT_JOB, code);
    callback(data, code, done, timeout);
  });
};
