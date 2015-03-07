/*
    Desription of Model
    :: Boilerplate
    About Mongoose :: mongoosejs.com
*/
var mongoose = require('nimbleservice').mongoose,
    Schema = mongoose.Schema,
    validator = require('nimbleservice').validate,
    setter = require('nimbleservice').setter;
/* Edit Your Model Below */

var Client = new Schema({
    firstname: {
        type: String,
        set: setter.sanitize,
        required: true
    },
    lastname: {
        type: String,
        set: setter.sanitize,
        required: true
    },
    company: {
        type: String,
        set: setter.sanitize,
        required: true
    },
    phone: {
        type: String,
        set: setter.sanitize,
        //required: true
    },
    address: {
        type: String,
        set: setter.sanitize,
        //required: true
    },
    country: {
        type: String,
        set: setter.sanitize,
        //required: true
    },
    city: {
        type: String,
        set: setter.sanitize,
        //required: true
    },
    state: {
        type: String,
        set: setter.sanitize,
        //required: true
    },
    email: {
        type: String,
        set: setter.sanitize,
        required: true
    },
    title: {
        type: String,
        set: setter.sanitize,
        //required: true
    },
    password: {
        type: String,
        set: setter.sanitize,
        required: true
    },
    services: {
        type: String,
        set: setter.sanitize,
        //required: true
    },
    notes: {
        type: String,
        set: setter.sanitize,
    },
    createdat: {
        type: Date
    },
    permissions: {
        type: Array
    }
});



Client.set('toJSON', {
    virtuals: true
});



mongoose.model('Client', Client);
module.exports = mongoose.model('Client');