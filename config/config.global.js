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
config.sandbox.root = '/home/daniela/sandbox';
config.sandbox.problems = '/home/daniela/uploads';
config.sandbox.expectedOutputFormat = config.sandbox.problems + '/problemFiles-%s-output';
config.output = {}
config.output.error = config.sandbox.root + '/error.log';
config.output.default = config.sandbox.root + '/output';
