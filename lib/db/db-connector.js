var mongojs = require('mongojs'),
  logger = require('../logger.js').Logger,
  connection = 'mongodb://localhost:3001/meteor',
  trainMeDB = mongojs(connection, ['problems', 'solutions', 'eventInstances']);

trainMeDB.on('error', function(err) {
  console.error('Can not connect to database');
  throw err;
});

module.exports = trainMeDB;
