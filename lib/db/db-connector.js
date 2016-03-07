var mongojs = require('mongojs'),
  connection = 'mongodb://' + Config.mongo.uri + '/' + Config.mongo.db,
  trainMeDB = mongojs(connection, ['tasks', 'taskExecutions', 'projects', 'files', 'uploads']);

trainMeDB.on('error', function(err) {
  Logger.error('Can not connect to database: %s', err);
  throw err;
});

trainMeDB.on('ready', function() {
  Logger.info('Database connected successfully.');
});

module.exports = trainMeDB;
