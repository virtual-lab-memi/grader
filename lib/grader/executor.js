var spawn = require('child_process').spawn,
  fs = require('fs'),
  logger = require('../logger.js').Logger,
  SANDBOX = '/home/daniela/sandbox',
  ERROR_FILE = SANDBOX + '/error.log',
  OUTPUT = SANDBOX + '/output',
  PROBLEMS_REPO = '/home/daniela/uploads';
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

  logger.info('ID: %s - Started process executor...', CURRENT_JOB);

  if (options) {
    timeoutId = setTimeout(function() {
      timeout = true
      process.kill();
      logger.info('ID: %s - Process killed because a timeout', CURRENT_JOB);
    }, options.timeout);
    logger.info('ID: %s - Process timeout set for: %s', CURRENT_JOB, options.timeout);
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
    logger.info('ID: %s - Process executor finished with code: %s', CURRENT_JOB, code);
  });
}
