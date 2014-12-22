var path = require('path'),
  TEST_DIR = path.dirname(__dirname),
  rewire = require('rewire'),
  compiler = rewire('../../lib/grader/compiler.js');

describe('Compiler', function() {
  it('should save error if compilation is not successful', function(done) {
    var dbMock = {
        solutions: {
          update: function(query, data) {
            query.should.have.property('_id', 1);
            trueData = data.$set;
            trueData.should.not.be.empty;
            trueData.should.have.property('status', 'COMPILATION_ERROR');
          }
        }
      },
      revertDB = compiler.__set__('db', dbMock),
      data = {
        solution: {
          _id: 1,
          language: 'Java'
        },
        solutionFile: (TEST_DIR + '/fixtures/noCompilableSolution.java')
      };

    compiler.compile(data, done);
    revertDB();
  });

  it('should continue to execution if compilation is successful', function(done) {
    var dbMock = {
        solutions: {
          update: function(query, data) {
            query.should.not.be.ok;
            data.should.not.be.ok;
          }
        }
      },
      revertDB = compiler.__set__('db', dbMock),
      data = {
        solution: {
          _id: 1,
          language: 'Java'
        },
        solutionFile: (TEST_DIR + '/fixtures/solution.java')
      };

    compiler.compile(data, done);
    revertDB();
  });
});
