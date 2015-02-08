var SANDBOX = require('./executor.js').SANDBOX,
  logger = require('../logger.js').Logger,
  fs = require('fs'),
  AdmZip = require('adm-zip'),
  db = require('../db/db-connector.js');

COUNTER = 0;
exports.cleanUpSandbox = function(id, dirPath) {
  var removeSelf = false,
    files,
    index,
    filePath,
    zipper;

  dirPath = dirPath ? dirPath : SANDBOX;
  logger.info('Cleaning up sandbox: %s', dirPath);

  try {
    files = fs.readdirSync(dirPath);
  } catch (e) {
    return;
  }

  if (files.length > 0) {
    logger.debug('Number of files generated: %s', files.length);
    zipper = new AdmZip();
    for (index = 0; index < files.length; index++) {
      filePath = dirPath + '/' + files[index];

      if (fs.statSync(filePath).isFile()) {
        zipper.addLocalFile(filePath);
        logger.debug('Added to zip: %s', filePath);
        fs.unlinkSync(filePath);
      } else {
        rmDir(filePath);
      }
    }
    zipper.writeZip('/home/daniela/zipps/' + id + '-' + COUNTER + '.zip');
    COUNTER++;
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
