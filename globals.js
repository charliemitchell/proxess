/*
    Boileplate, the server will wait for this callback. Define any Globals in here.
    You must add globals to the global namespace.
*/

require('nimbleservice').colors;

module.exports = function (global, callback) {

    Array.prototype.hasItem = function (key, val) {
        var i = 0;
        var path = key.split('.');

        for (i; i < this.length; i +=1) {

            var stack = this[i];

            for (var p = 0; p < path.length; p += 1) {
                stack = stack[path[p]];
            }

            if (stack === val) {
                return true
            } 
        }

        return false;
    };


    Array.prototype.getItem = function (key, val) {
        var i = 0;
        var path = key.split('.');

        for (i; i < this.length; i +=1) {

            var stack = this[i];

            for (var p = 0; p < path.length; p += 1) {
                stack = stack[path[p]];
            }
            
            if (stack === val) {
                return this[i]
            } 
        }

        return false;
    }

    callback(); // Do not remove this callback.
}