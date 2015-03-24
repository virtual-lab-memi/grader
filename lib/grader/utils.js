var SANDBOX = require('./executor').SANDBOX,
  fs = require('fs'),
  formatter = require('sprintf-js').sprintf,
  jsdiff = require('diff'),
  AdmZip = require('adm-zip'),
  db = require('../db/db-connector');

exports.cleanUpSandbox = function(id, dirPath) {
  var removeSelf = false,
    files,
    index,
    filePath,
    zipper;

  dirPath = dirPath ? dirPath : SANDBOX;
  Logger.info('ID: %s - Cleaning up sandbox: %s', CURRENT_JOB, dirPath);

  try {
    files = fs.readdirSync(dirPath);
  } catch (e) {
    return;
  }

  if (files.length > 0) {
    Logger.debug('Number of files generated: %s', files.length);
    zipper = new AdmZip();
    for (index = 0; index < files.length; index++) {
      filePath = dirPath + '/' + files[index];

      if (fs.statSync(filePath).isFile()) {
        zipper.addLocalFile(filePath);
        Logger.debug('Added to zip: %s', filePath);
        fs.unlinkSync(filePath);
      } else {
        rmDir(filePath);
      }
    }
    zipper.writeZip('/home/daniela/zipps/' + id + '.zip');
  }

  if (removeSelf)
    fs.rmdirSync(dirPath);
};

exports.setBestSolutionForInstance = function(solution, problem) {
  db.solutions.find({
    eventInstance: solution.eventInstance,
    parent: problem._id,
    status: 'SUCCESS'
  }).sort({
    grade: -1,
    timeConstraint: 1,
    memory: 1,
    date: -1
  }, function(err, docs) {
    if (docs.length > 0) {
      changed = true;
      var bestInstanceSolution = docs[0];
      db.eventInstances.update({
        _id: solution.eventInstance,
        'solvedProblems.problem': problem._id
      }, {
        $set: {
          'solvedProblems.$.solution': bestInstanceSolution._id
        }
      });
    } else {
      db.solutions.find({
        eventInstance: solution.eventInstance,
        parent: problem._id
      }).sort({
        date: -1
      }, function(err, docs) {
        if (docs.length > 0) {
          var bestInstanceSolution = docs[0];
          db.eventInstances.update({
            _id: solution.eventInstance,
            'solvedProblems.problem': problem._id
          }, {
            $set: {
              'solvedProblems.$.solution': bestInstanceSolution._id
            }
          });
        }
      });
    }
  });
}

exports.getDiffLines = function(data) {
  var solution = data.solution,
    outputId = data.outputId,
    testCase = data.testIndex,
    zipper = new AdmZip('/home/daniela/zipps/' + solution._id + '.zip'),
    fileName = 'output-' + testCase,
    filePath = '/home/daniela/zipps/',
    expectedOutputFile = formatter(Config.sandbox.expectedOutputFormat, outputId),
    outputBuffer,
    expectedBuffer;
  console.log(expectedOutputFile);
  zipper.extractEntryTo(fileName, filePath, false, true);
  outputBuffer = fs.readFileSync(filePath + fileName);
  expectedBuffer = fs.readFileSync(expectedOutputFile);
  return {line: 1, data: 'asdasdasd'};
};
