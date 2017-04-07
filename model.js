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
    name : {
        type : String
    },
    command : {
        type : String
    },
    args : {
        type : Array
    },
    cwd : {
        type : String
    },
    img : {
        type : String
    }
});

var note = new Schema({
    title : {
        type : String
    },
    body : {
        type : String
    },
    files : [{
      type : String
    }]
});

process.virtual('id').get(function(){
    return this._id.toHexString();
});

process.set('toJSON', {
    virtuals: true
});


mongoose.model('note', note);
mongoose.model('process', process);
module.exports.process = mongoose.model('process');
module.exports.note = mongoose.model('note');
