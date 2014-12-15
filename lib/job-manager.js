var db = require('./db/db-connector.js');

exports.attachJob = function(problemId, solutionId, solution) {
  var problem,
    solution,
    result;

  db.problems.findOne({_id: problemId}, function(err, doc) {
    if (err || !doc) {
      result = {error: err || 'problem not found', status: 1};
    }

    problem = doc;
  });

  db.solutions.findOne({_id: solutionId}, function(err, doc) {
    if (err || !doc) {
      result = {error: err || 'solution not found', status: 1};
    }
    solution = doc;
  });

  

  return result || {message: 'ok', status: 0};
};
