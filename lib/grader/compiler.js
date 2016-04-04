var fs = require('fs'),
  db = require('../db/db-connector'),
  executor = require('./executor'),
  runner = require('./runner'),
  utils = require('./utils');

exports.compile = function(data, done) {
  var language = data.execution.language;

  switch (language) {
    case 'C++':
      Logger.info('ID: %s - Starting compilation: %s', CURRENT_JOB, language);
      compileCPP(data, done);
      break;
    default:
      Logger.info('ID: %s - No option available for compilation: %s', CURRENT_JOB, language);
      db.taskExecutions.update({_id: data.task._id}, {$set: {
        output: 'Compilation Error: No compiler available for ' + language,
        status: 1
      }});
      done && done();
  }
};

function compileCPP(data, done) {
  var outputCompiled = 'main',
    command = 'g++',
    args = ['-std=c++11'];

  data.files.forEach(function(file) {
    args.push(file.name);
  });

  args.push('-o', outputCompiled);
  //g++ $1 -o $2
  //TODO: test if the file exists first.
  executor.execute(data, command, args, compileFinished, done);
}

function compileFinished(data, code, done) {
  var execution = data.execution,
    errorLog;

  if (code === 0) {
    Logger.info('ID: %s - Successful compilation', CURRENT_JOB);
    if (data.run) {
      runner.run(data, done);
    } else {
      db.taskExecutions.update({_id: execution._id}, {$set: {status: 0}});
      done && done();
    }
  } else {
    Logger.info('ID: %s - FINAL RESULT: Not successful compilation', CURRENT_JOB);
    errorLog = fs.readFileSync(executor.ERROR_FILE, 'utf8');
    db.taskExecutions.update({_id: execution._id}, {$set: {status: 1, error: errorLog}});
    done && done();
  }
}
