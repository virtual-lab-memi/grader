var mongojs = require('mongojs'),
  connection = 'mongodb://' + Config.mongo.uri + '/' + Config.mongo.db,
  trainMeDB = mongojs(connection, ['problems', 'solutions', 'eventInstances', 'events', 'taskExecutions']);

trainMeDB.on('error', function(err) {
  Logger.error('Can not connect to database: %s', err);
  throw err;
});

trainMeDB.on('ready', function() {
  Logger.info('Database connected successfully.');
});

module.exports = trainMeDB;
