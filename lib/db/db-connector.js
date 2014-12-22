var mongojs = require('mongojs'),
  connection = 'mongodb://127.0.0.1:3001/meteor',
  trainMeDB = mongojs(connection, ['problems', 'solutions']);

trainMeDB.on('error', function(err) {
  console.log(err);
  throw err;
});

module.exports = trainMeDB;
