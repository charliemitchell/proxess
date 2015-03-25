/*
    Desription of Model
    :: Boilerplate
    About Mongoose :: mongoosejs.com
*/
var mongoose = require('nimbleservice').mongoose,
    Schema = mongoose.Schema,
    validator = require('nimbleservice').validate,
    setter = require('nimbleservice').setter;
var process = new Schema({
    name: {
        type: String
    },
    command: {
        type: String
    },
    args: {
        type: Array
    },
    cwd: {
        type: String
    },
    img: {
        type: String
    },
    stopcmd: {
        type: String
    },
    running: {
        type: Boolean
    },
    checkcmd: {
        type: String
    }
});
process.virtual('id').get(function () {
    return this._id.toHexString();
});
process.set('toJSON', {
    virtuals: true
});
mongoose.model('process', process);
module.exports = mongoose.model('process');
