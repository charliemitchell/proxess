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
        type: String,
        required: true
    },
    command: {
        type: String,
        required: true
    },
    args: {
        type: Array
    },
    cwd: {
        type: String,
        required: true
    },
    img: {
        type: String
    },
    stopcmd: {
        type: String
    },    
    checkcmd: {
        type: String,
        required: true
    },
    pid: {
        type: String
    },
    port: {
        type: String
    },
    hidden: {
        type: Boolean
    },
    logs: {
        type: Array
    },
    file: {
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
