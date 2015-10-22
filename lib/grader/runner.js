var executor = require('./executor'),
  statsParser = require('./stats-parser'),
  grader = require('./grader'),
  db = require('../db/db-connector'),
  utils = require('./utils'),
  formatter = require('sprintf-js').sprintf,
  fs = require('fs');

exports.run = function(data, done) {
  var language = data.doc.language,
    task = data.task;

  //TODO: Test if the file exists
  //TODO: Improve name of the problem file getting from problemFiles collection.
  data.inputName = 'input';
  data.output = executor.OUTPUT;

  Logger.info('ID: %s - Starting running: %s', CURRENT_JOB, language);

  switch (language) {
    case 'cpp':
      var envVars = formatter(Config.sandbox.envVars, data.inputName, 512000, 3);
      fs.writeFile(executor.SANDBOX + '/env-vars', envVars);
      var command = 'docker';
      var args = ['start', '--attach=true', 'official-sandbox'];
      fs.writeFile(executor.SANDBOX + '/' + data.inputName, task.input);
      executor.execute(data, command, args, runFinished, done);
      break;
    default:
      Logger.info('ID: %s - No option available for runtime: %S', CURRENT_JOB, language);
      db.taskExecutions.update({_id: task._id}, {$set: {status: 1, output: 'No executable option for ' + language}});
      done && done();
  }
};

function runFinished(data, code, done, timeout) {
  data.result = statsParser.parse(executor.SANDBOX + '/run-stats');
  var task = data.task;
  if (code === 0 && !data.result.status) {
    Logger.info('ID: %s - Successful run', CURRENT_JOB);
    var output = fs.readFileSync(executor.OUTPUT, 'utf8');
    db.taskExecutions.update({_id: task._id}, {$set: {status: 1, output: output}});
    //grader.grade(data, done);
    done && done();
  } else {
    Logger.info('ID: %s - FINAL RESULT: Not successful run', CURRENT_JOB);
    var errorLog = fs.readFileSync(executor.ERROR_FILE, 'utf8');
    db.taskExecutions.update({_id: task._id}, {$set: {status: 1, output: errorLog}});
    done && done();
  }
}
