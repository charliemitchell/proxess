/*
    Boileplate, the server will wait for this callback. Define any Globals in here.
    You must add globals to the global namespace.
*/

require('nimbleservice').colors;

var config = require('./config');

module.exports = function(global, callback) {

    // Usage, anywhere in the application. :: global.logJSON({foo:'boo'});
    global.logJSON = function(object) {
        var prefix = "JSON:".yellow;
        console.log(prefix, JSON.stringify(object));
    };
    /////////////////////////////////////////////////////////////

    global.initESclient = function() {
        var elasticsearch = require('elasticsearch'),
            client = elasticsearch.Client({
                host: config.elasticsearch.host,
                sniffOnStart: config.elasticsearch.sniffOnStart,
                sniffInterval: config.elasticsearch.sniffInterval
            });
        return client;
    };
    // OR, create private stuff, and choose how to expose the global
    // var privateString = "Hello I am a private string";
    // var privateNumber = 120;
    // var privateMethod = function (input) {
    //     console.log(privateString, privateNumber, input);
    // };
    // global.myLogger = privateMethod; // Expose the private method as myLogger
    ////////////////////////////////////////////////////////////////

    callback(); // Do not remove this callback.
}
