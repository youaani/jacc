(function() {
  var _this = this;

  exports['test_jacc'] = {
    setUp: function(done) {
      _this._j = require('../build/jacc.js').create();
      _this._async = require('async');
      _this._helpers = require('helpersjs').create();
      _this._helpers.logging_threshold = _this._helpers.logging.debug;
      _this._id = process.env.JACC_TEST_IMAGE;
      _this._URL = process.env.JACC_TEST_URL;
      _this._port = process.env.JACC_TEST_PORT;
      _this._DNS = process.env.JACC_TEST_DNS;
      return done();
    },
    'print_warning': function(test) {
      _this._helpers.logDebug('\nWARNING: CURRENT JACC CONFIGHURATION WILL BE DELETED!');
      return test.done();
    },
    'test_redis_helpers': function(test) {
      var REDIS_KEY, REDIS_VALUE;
      test.expect(1);
      REDIS_KEY = "unit_test:key";
      REDIS_VALUE = "value";
      return _this._async.series([
        function(fn) {
          return _this._j._redis("del", [REDIS_KEY], function() {
            return fn(null, '_redis.del');
          });
        }, function(fn) {
          return _this._j._redis("set", [REDIS_KEY, REDIS_VALUE], function() {
            return fn(null, '_redis.set');
          });
        }, function(fn) {
          return _this._j._redis("get", [REDIS_KEY], function(val) {
            test.equal(val, REDIS_VALUE, 'redis del, set and get');
            return fn(null, '_redis.get');
          });
        }, function(fn) {
          test.done();
          return fn(null, 'test.done');
        }
      ], function(err, results) {
        return _this._helpers.logDebug('test_redis_helpers: results of async functions - ' + results + ' errors (if any) - ' + err);
      });
    },
    'test_status': function(test) {
      test.expect(1);
      return _this._j.status(function() {
        test.equal(true, true, 'jacc status');
        return test.done();
      });
    },
    'test_add': function(test) {
      test.expect(1);
      return _this._j._redis("del", ["images"], function(res) {
        return _this._j.add(_this._id, _this._URL, _this._port, _this._DNS, function() {
          return _this._j._redis("smembers", ["images"], function(res) {
            _this._helpers.logDebug('test_add: onJaccConfig res from redis:' + res);
            test.equal(res, _this._id, 'jacc add and check that image was added');
            return test.done();
          });
        });
      });
    },
    'test_listImages': function(test) {
      test.expect(1);
      test.equal(true, true, 'jacc update');
      _this._helpers.logDebug('test_listImages');
      return _this._j._listImages(function() {
        _this._helpers.logDebug('test_listImages: Running images: ' + JSON.stringify(_this._j._runningImages));
        return test.done();
      });
    },
    'test_buildHipacheConfig': function(test) {
      test.expect(1);
      _this._helpers.logDebug('test_buildHipacheConfig');
      return _this._j._listImages(function() {
        return _this._j._buildHipacheConfig(function() {
          var _key;
          _key = "frontend:" + _this._URL;
          return _this._j._redis("lrange", [_key, 0, -1], function(res) {
            _this._helpers.logDebug('test_buildHipacheConfig hipache configuration for key ' + _key + '=' + JSON.stringify(res));
            test.equal(res[0], _this._id, 'test_buildHipacheConfig: image id');
            return test.done();
          });
        });
      });
    }
  };

}).call(this);
