var mongojs = require('mongojs'),
  connection = 'mongodb://127.0.0.1:3001/meteor',
  trainMeDB = mongojs(connection, ['problems', 'solutions']);

module.exports = trainMeDB;
