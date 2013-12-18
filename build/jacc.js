(function() {
  var exports;

  exports = exports != null ? exports : this;

  exports.create = function() {
    var _this = this;
    return {
      _commands: '[add|delete|list|update|status|help]',
      _dockerConnOptions: {
        socketPath: false,
        host: 'http://localhost',
        port: '4243'
      },
      async: require('async'),
      redis: require('redis'),
      _: require('underscore'),
      _helpers: require('helpersjs').create(),
      _isset: function(a, message, dontexit) {
        if (!this._helpers.isset(a)) {
          console.log(message);
          if (dontexit !== void 0 && dontexit) {
            return false;
          } else {
            process.exit();
          }
        }
        return true;
      },
      _f: function(rc, err, res, func) {
        if (err) {
          throw err;
        }
        if (func !== null) {
          func(res);
        }
        return rc.quit();
      },
      _redis: function(operation, args, func) {
        var redis_client,
          _this = this;
        if (!args instanceof Array) {
          throw new Error('_redis: argument not an array');
        }
        redis_client = this.redis.createClient();
        return redis_client.on("connect", function() {
          switch (operation) {
            case "keys":
              return redis_client.keys(args[0], function(err, res) {
                return _this._f(redis_client, err, res, func);
              });
            case "get":
              return redis_client.get(args[0], function(err, res) {
                return _this._f(redis_client, err, res, func);
              });
            case "del":
              return redis_client.del(args[0], function(err, res) {
                return _this._f(redis_client, err, res, func);
              });
            case "rpush":
              return redis_client.rpush(args[0], args[1], function(err, res) {
                return _this._f(redis_client, err, res, func);
              });
            case "set":
              return redis_client.set(args[0], args[1], function(err, res) {
                return _this._f(redis_client, err, res, func);
              });
            case "smembers":
              return redis_client.smembers(args[0], function(err, res) {
                return _this._f(redis_client, err, res, func);
              });
            case "sadd":
              return redis_client.sadd(args[0], args[1], function(err, res) {
                return _this._f(redis_client, err, res, func);
              });
            case "lrange":
              return redis_client.lrange(args[0], args[1], args[2], function(err, res) {
                return _this._f(redis_client, err, res, func);
              });
            default:
              throw Error('_redis: unsuported operation');
          }
        });
      },
      _onJaccConfig: function(func, endFunc) {
        var _this = this;
        return this._redis("smembers", ["images"], function(res) {
          if (res.length === 0) {
            return console.log("EMPTY JACC CONFIG!");
          } else {
            return _this.async.each(res, function(item, fn) {
              if ((item != null)) {
                return func(item, fn);
              }
            }, function() {
              if (endFunc != null) {
                return endFunc();
              }
            });
          }
        });
      },
      _onContainers: function(func, endFunc) {
        var docker, _options,
          _this = this;
        _options = {};
        this._containers = {};
        docker = require('docker.io')(this._dockerConnOptions);
        return docker.containers.list(_options, function(err, res) {
          if (err) {
            if (endFunc != null) {
              endFunc();
            }
            throw err;
          }
          if (res.length === 0) {
            if (endFunc != null) {
              return endFunc();
            }
          } else {
            return _this.async.each(res, function(container, fn) {
              _options = {};
              return docker.containers.inspect(container.Id, _options, function(err, res) {
                if (err) {
                  throw err;
                }
                func(res);
                return fn();
              });
            }, function() {
              if (endFunc != null) {
                return endFunc();
              }
            });
          }
        });
      },
      _listImages: function(endFunc) {
        var _this = this;
        this._runningImages = {};
        return this._onContainers(function(res) {
          if (_this._runningImages[res.Image.slice(0, 12)] === void 0) {
            _this._runningImages[res.Image.slice(0, 12)] = [];
          }
          return _this._runningImages[res.Image.slice(0, 12)].push({
            ID: res.ID.slice(0, 12),
            IP: res.NetworkSettings.IPAddress
          });
        }, endFunc);
      },
      _buildHipacheConfig: function(endFunc) {
        var _this = this;
        return this._onJaccConfig(function(image, fn) {
          return _this._redis("get", [image], function(res) {
            var DNS, URL, internal_port, _ref;
            _ref = JSON.parse(res), URL = _ref.URL, internal_port = _ref.internal_port, DNS = _ref.DNS;
            if (_this._runningImages[image] == null) {
              console.log("Image " + image + " lacks running containers");
              return fn();
            } else {
              return _this._redis("set", [DNS, _this._runningImages[image][0]["IP"]], function() {
                var _key;
                console.log("IN _onJaccConfig,redis_get_set");
                _key = "frontend:" + URL;
                return _this._redis("del", [_key], function() {
                  return _this._redis("rpush", [_key, image], function() {
                    return _this.async.each(_this._runningImages[image], function(res, fn2) {
                      return _this._redis("rpush", [_key, 'http://' + res["IP"] + ':' + internal_port], fn2);
                    }, fn);
                  });
                });
              });
            }
          });
        }, endFunc);
      },
      update: function() {
        var _this = this;
        return this._listImages(function() {
          return _this._buildHipacheConfig();
        });
      },
      list: function() {
        var _this = this;
        console.log("Jacc: current configuration");
        return this._onJaccConfig(function(item, endFunc) {
          return _this._redis("get", [item], function(res) {
            console.log(JSON.stringify(item) + " - " + JSON.stringify(res));
            return endFunc();
          });
        }, null);
      },
      status: function(fn) {
        var _this = this;
        console.log("Jacc: List of running containers");
        return this._onContainers(function(res) {
          return console.log("container:" + res.ID.slice(0, 13) + " image:" + res.Image.slice(0, 13) + " IP:" + res.NetworkSettings.IPAddress);
        }, fn);
      },
      add: function(image, URL, internal_port, dns_name, fn) {
        var _this = this;
        console.log("Jacc: adding " + image);
        return this._redis("sadd", ["images", image], function(res) {
          var _args;
          _args = [
            image, JSON.stringify({
              URL: URL,
              internal_port: internal_port,
              DNS: dns_name
            })
          ];
          return _this._redis("set", _args, function(res) {
            if (fn != null) {
              return fn();
            }
          });
        });
      },
      "delete": function(image) {
        var redis_client,
          _this = this;
        console.log("Jacc: deleting " + image);
        redis_client = this.redis.createClient();
        return redis_client.on("connect", function() {
          return redis_client.srem("images", image, function(err, res) {
            console.log("result - " + res);
            return redis_client.quit();
          });
        });
      },
      main: function() {
        var argv;
        this._helpers.logging_threshold = this._helpers.logging.debug;
        argv = require('optimist').usage('Usage: $0 ' + this._commands).argv;
        this._isset(argv._, 'jacc requires a command - node app.js ' + this._commands);
        switch (argv._[0]) {
          case "add":
            return this.add(argv._[1], argv._[2], argv._[3], argv._[4]);
          case "delete":
            return this["delete"](argv._[1]);
          case "update":
            return this.update();
          case "status":
            return this.status();
          case "list":
            return this.list();
          case "help":
            console.log('usage: jacc ' + _commands);
            console.log('jacc add image URL dns-name');
            console.log('jacc delete image');
            console.log('jacc update');
            console.log('jacc list');
            console.log('jacc status');
            return console.log('help: show this message');
          default:
            return console.log('No such command: ' + argv._[0]);
        }
      }
    };
  };

}).call(this);
