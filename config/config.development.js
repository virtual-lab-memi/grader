var config = require('./config.global');

config.env = 'development';

config.mongo.uri = process.env.MONGO_URI || 'localhost:3001';
config.mongo.db = 'meteor';

module.exports = config;

global.Config = config;
