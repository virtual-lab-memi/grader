var path = require('path'),
  TEST_DIR = path.dirname(__dirname),
  rewire = require('rewire'),
  fs = require('fs'),
  runner = rewire('../../lib/grader/runner.js'),
  compiler = rewire('../../lib/grader/compiler.js'),
  executor = require('../../lib/grader/executor.js');

describe('Runner', function() {
  var input = TEST_DIR + '/fixtures/1.in',
    targetInput = executor.PROBLEMS_REPO + '/1.in';
  fs.createReadStream(input).pipe(fs.createWriteStream(targetInput));

  it('should save error if run is not successful', function(done) {
    var dbMock = {
        solutions: {
          update: function(query, data) {
            query.should.have.property('_id', 1);
            trueData = data.$set;
            trueData.error.should.containEql('An important error');
            trueData.should.have.property('status', 'RUNTIME_ERROR');
            console.log('-------------');
          }
        }
      },
      revertDB = runner.__set__('db', dbMock),
      revertRunner = compiler.__set__('runner', runner),
      data = {
        problem: {
          _id: 1,
          time: 1500
        },
        solution: {
          _id: 1,
          language: 'Java'
        },
        solutionFile: TEST_DIR + '/fixtures/multiplication-runtimeError.java'
      };

    compiler.compile(data, done);
    this.timeout(3000);
  });

  it('should save error if timeout', function(done) {
    var dbMock = {
        solutions: {
          update: function(query, data) {
            query.should.have.property('_id', 1);
            trueData = data.$set;
            trueData.error.should.be.empty;
            trueData.should.have.property('status', 'TIMEOUT_ERROR');
            console.log('-------------');
          }
        }
      },
      revertDB = runner.__set__('db', dbMock),
      revertRunner = compiler.__set__('runner', runner),
      data = {
        problem: {
          _id: 1,
          time: 1000
        },
        solution: {
          _id: 1,
          language: 'Java'
        },
        solutionFile: TEST_DIR + '/fixtures/multiplication-timeoutError.java'
      };

    compiler.compile(data, done);
    this.timeout(3000);
  });

  after(function() {
    fs.unlinkSync(targetInput);
  });
});
