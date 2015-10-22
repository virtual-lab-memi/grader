var fs = require('fs'),
  db = require('../db/db-connector'),
  executor = require('./executor'),
  runner = require('./runner'),
  utils = require('./utils');

exports.compile = function(data, done) {
  var language = data.doc.language,
    solution = data.doc.code;

  switch (language) {
    case 'java':
      Logger.info('ID: %s - Starting compilation: %s', CURRENT_JOB, language);
      compileJava(data, solution, done);
      break;
    case 'cpp':
      Logger.info('ID: %s - Starting compilation: %s', CURRENT_JOB, language);
      compileCPP(data, solution, done);
      break;
    default:
      Logger.info('ID: %s - No option available for compilation: %S', CURRENT_JOB, language);
      db.taskExecutions.update({_id: data.task._id}, {$set: {
        output: 'Compilation Error: No compiler available for ' + language,
        status: 1
      }});
      done && done();
  }
};

function compileJava(data, originalSourceFile, done) {
  var fileName = 'Main.java',
    sourceFile = executor.SANDBOX + '/' + fileName,
    command = 'javac';
  //TODO: test if the file exists first.
  fs.createReadStream(originalSourceFile).pipe(fs.createWriteStream(sourceFile));
  executor.execute(data, command, [fileName], compileFinished, done);
}

function compileCPP(data, originalSource, done) {
  var fileName = 'main.cpp',
    sourceFile = executor.SANDBOX + '/' + fileName,
    outputCompiled = 'main',
    command = 'g++';
  //g++ $1 -o $2
  //TODO: test if the file exists first.
  fs.writeFile(sourceFile, originalSource);
  executor.execute(data, command, ['-std=c++11', fileName, '-o', outputCompiled], compileFinished, done);
}

function compileFinished(data, code, done) {
  var task = data.task,
    errorLog;

  console.log('------------------------------------', data);
  if (code === 0) {
    Logger.info('ID: %s - Successful compilation', CURRENT_JOB);
    if (data.run) {
      runner.run(data, done);
    } else {
      db.taskExecutions.update({_id: task._id}, {$set: {status: 0, output: 'Successful compilation'}});
      done && done();
    }
  } else {
    Logger.info('ID: %s - FINAL RESULT: Not successful compilation', CURRENT_JOB);
    errorLog = fs.readFileSync(executor.ERROR_FILE, 'utf8');
    db.taskExecutions.update({_id: task._id}, {$set: {status: 1, output: errorLog}});
    done && done();
  }
}
