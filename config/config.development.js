var config = require('./config.global');

config.env = 'development';
module.exports = config;

global.Config = config;
