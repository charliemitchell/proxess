module.exports = {
    
    sessionless : true,

    hideLogo : true,

    verbose : false,

    reportGlobalVars : true,

    port : 9911,  // What port should this service handle

    bodyParser : 'json', // What Kind of API is this [https://www.npmjs.com/package/body-parser]
    
    // Used For Session
    redis : {
      host: 'localhost',
      port: 6379,
      key : 'sess:'
    },
    cookie : {
      name : 'yourcookie.sid',
    },
    // MongoDB
    mongodb : {
        host : 'localhost',
        port : 27019,
        database : 'processes'
    },
    
    // CSRF
    csrf : {

    }

}