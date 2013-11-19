# Unit test
#-------------------------------------------------------------------------------------------------
# Basic tests that just calls the functions to make sure that execute ok



exports['test_jacc'] = {

    setUp: (done) =>
        # The functions to test
        this._j = require('../build/jacc.js').create()

        # setup here
        this._async      = require('async')


        this._helpers     = require('helpersjs').create()
        this._helpers.logging_threshold = this._helpers.logging.debug

        this._id   = process.env.JACC_TEST_IMAGE
        this._URL  = process.env.JACC_TEST_URL
        this._port = process.env.JACC_TEST_PORT
        this._DNS  = process.env.JACC_TEST_DNS


        # setup finished
        done()


    'print_warning': (test) =>
        this._helpers.logDebug('\nWARNING: CURRENT JACC CONFIGHURATION WILL BE DELETED!')
        test.done()


    'test_redis_helpers': (test) =>
        # There should be X tests
        test.expect(1)

        REDIS_KEY = "unit_test:key"
        REDIS_VALUE = "value"

        this._async.series(
            [
                # Dummy test
                (fn) =>
                    # Remove old data
                    this._j._redis("del", [REDIS_KEY], () =>
                        fn(null, '_redis.del')
                    )

                (fn) => 
                    this._j._redis( "set", [REDIS_KEY, REDIS_VALUE], () =>
                        fn(null, '_redis.set')
                    )

                (fn) => 
                    this._j._redis( "get", [REDIS_KEY], (val) =>
                        test.equal(val,  REDIS_VALUE, 'redis del, set and get')
                        fn(null, '_redis.get')
                    )

                (fn) => 
                    # All tests performed
                    test.done()
                    fn(null, 'test.done')
            ],
            (err, results) =>
                this._helpers.logDebug('test_redis_helpers: results of async functions - ' + results + ' errors (if any) - ' + err)
            )


    'test_status': (test) =>
        # There should be X tests
        test.expect(1)

        this._j.status( () =>
            test.equal(true,  true, 'jacc status')
            test.done()
        )


    'test_add': (test) =>
        # There should be X tests
        test.expect(1)

        # First cleanup old stuff
        this._j._redis( "del", ["images"], (res) =>

            # _j.add is async so test.done will likely be executed too early
            this._j.add(this._id, this._URL, this._port, this._DNS, () =>
                this._j._redis( "smembers", ["images"], (res) =>
                    this._helpers.logDebug('test_add: onJaccConfig res from redis:' + res)
                    test.equal(res,  this._id, 'jacc add and check that image was added')
                    test.done()
                )
            )
        )

 
    'test_listImages': (test) =>
        # There should be X tests
        test.expect(1)

        test.equal(true,  true, 'jacc update')

        this._helpers.logDebug('test_listImages')
        this._j._listImages(
            () =>
                this._helpers.logDebug('test_listImages: Running images: '+JSON.stringify(this._j._runningImages))
                test.done()
        )


    'test_buildHipacheConfig': (test) =>

        # The hipache configuration (in redis) should look something like this
        # $ redis-cli lrange frontend:app.jacc.local 0 -1
        # 1) "abcdefhikjl"
        # 2) "http://192.168.0.42:80"


        # There should be X tests
        test.expect(1)

        this._helpers.logDebug('test_buildHipacheConfig')
        this._j._listImages(
            () =>
                this._j._buildHipacheConfig( () =>

                    # Check that the hipache configuraiton is there
                    _key = "frontend:" + this._URL
                    this._j._redis("lrange", [_key, 0, -1], (res) =>
                        this._helpers.logDebug('test_buildHipacheConfig hipache configuration for key '+_key+'='+JSON.stringify(res))
                        test.equal(res[0],  this._id, 'test_buildHipacheConfig: image id')
                        test.done()
                    )
                )
        )

}

