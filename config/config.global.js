var config = module.exports = {};

config.env = 'development';
config.hostname = 'localhost';
config.port = 8888;

//Mongo DB
config.mongo = {};
config.mongo.uri = process.env.MONGO_URI || 'localhost:27017';
config.mongo.db = 'train-me';

//Sandbox
config.sandbox = {};
config.sandbox.partialRunCount = 1;
config.sandbox.root = '/root/sandbox/output-data';
config.sandbox.problems = '/home/train-me/uploads';
config.sandbox.expectedOutputFormat = config.sandbox.problems + '/problemFiles-%s-output';
config.output = {};
config.output.error = config.sandbox.root + '/error.log';
config.output.default = config.sandbox.root + '/output';
config.sandbox.envVars = 'SANDBOX_INPUT=%s\nSANDBOX_MEMORY=%s\nSANDBOX_TIME=%s';
