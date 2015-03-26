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
<<<<<<< HEAD
    },
    running: {
        type: Boolean
    },
    statuscmd: {
        type: String
    },
=======
    },    
    checkcmd: {
        type: String
    }
>>>>>>> def19fce443c45c0a9fb7aeaae20ab482d656ec3
});
process.virtual('id').get(function () {
    return this._id.toHexString();
});
process.set('toJSON', {
    virtuals: true
});
mongoose.model('process', process);
module.exports = mongoose.model('process');
