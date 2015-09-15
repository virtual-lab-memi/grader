var config = module.exports = {};

config.env = 'development';
config.hostname = 'localhost';
config.port = 8888;

//Mongo DB
config.mongo = {};
config.mongo.uri = process.env.MONGO_URI || 'localhost:3001';
config.mongo.db = 'meteor';

//Sandbox
config.sandbox = {};
config.sandbox.partialRunCount = 1;
config.sandbox.root = '/home/dann/train-me/train-me-sandbox/output-data';
config.sandbox.problems = '/home/dann/uploads';
config.sandbox.expectedOutputFormat = config.sandbox.problems + '/problemFiles-%s-output';
config.output = {};
config.output.error = config.sandbox.root + '/error.log';
config.output.default = config.sandbox.root + '/output';
config.sandbox.envVars = 'SANDBOX_INPUT=%s\nSANDBOX_MEMORY=%s\nSANDBOX_TIME=%s';
