module.exports = {
    app : function (server, app, express) {

        var io = require('socket.io')(server);
        
        io.on('connection', function(socket){
            console.log("  > Proxess : Socket Connection Established".grey);
        });

        global.io = io;
    },

    // onBeforeMongoose : function (mongoose, app, express) {

    // },

    // onBeforeBodyParser : function (server, app, express) {

    // },

    // onBeforeMethodOverride : function (server, app, express) {

    // },
    
    // onBeforeCookieParser : function (server, app, express) {

    // },

    // onBeforeRouter : function (server, app, express) {

    // },
    // onBeforeListen : function (server, app, express) {

    // },
    
    // onAfterListen : function (server, app, express) {

    // }
};