var SANDBOX = require('./executor.js').SANDBOX,
  fs = require('fs'),
  db = require('../db/db-connector.js');

exports.cleanUpSandbox = function(dirPath) {
  var removeSelf = false,
    files,
    index,
    filePath;

  dirPath = dirPath ? dirPath : SANDBOX;

  try {
    files = fs.readdirSync(dirPath);
  } catch (e) {
    return;
  }

  if (files.length > 0)
    for (index = 0; index < files.length; index++) {
      filePath = dirPath + '/' + files[index];
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath);
      else
        rmDir(filePath);
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
