var mongojs = require('mongojs'),
  connection = 'mongodb://localhost:27017/train-me',
  trainMeDB = mongojs(connection, ['problems', 'solutions', 'eventInstances']);

trainMeDB.on('error', function(err) {
  console.log(err);
  throw err;
});

module.exports = trainMeDB;
