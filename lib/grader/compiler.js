var fs = require('fs'),
  db = require('../db/db-connector'),
  executor = require('./executor'),
  runner = require('./runner'),
  utils = require('./utils'),
  spawn = require('child_process').spawn;

exports.compile = function(data, done) {
  var language = data.solution.language,
    solutionFile = data.solutionFile;

  switch (language) {
    case 'Java':
      Logger.info('ID: %s - Starting compilation: %s', CURRENT_JOB, language);
      compileJava(data, solutionFile, done);
      break;
    case 'C++':
      Logger.info('ID: %s - Starting compilation: %s', CURRENT_JOB, language);
      compileCPP(data, solutionFile, done);
      break;
    default:
      Logger.info('ID: %s - No option available for compilation: %S', CURRENT_JOB, language);
      db.solutions.update({_id: data.solution._id}, {$set: {
        error: 'No compiler available for ' + language,
        status: 'COMPILATION_ERROR'
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

function compileCPP(data, originalSourceFile, done) {
  var fileName = 'main.cpp',
    sourceFile = executor.SANDBOX + '/' + fileName,
    outputCompiled = 'compiled',
    command = 'g++';
  //g++ $1 -o $2
  //TODO: test if the file exists first.
  fs.createReadStream(originalSourceFile).pipe(fs.createWriteStream(sourceFile));
  executor.execute(data, command, [fileName, '-o', outputCompiled], compileFinished, done);
}

function compileFinished(data, code, done) {
  var solution = data.solution,
    problem = data.problem,
    errorLog;
  if (code === 0) {
    Logger.info('ID: %s - Successful compilation', CURRENT_JOB);
    runner.run(data, done);
  } else {
    Logger.info('ID: %s - FINAL RESULT: Not succesful compilation', CURRENT_JOB);
    errorLog = fs.readFileSync(executor.ERROR_FILE, 'utf8');
    db.solutions.update({_id:solution._id}, {$set: {status: 'COMPILATION_ERROR', error: errorLog}});
    utils.setBestSolutionForInstance(solution, problem);
    utils.cleanUpSandbox(solution._id);
    done && done();
  }
}
