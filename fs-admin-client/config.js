module.exports = {
    
    verbose : true,

    reportGlobalVars : true,

    port : 2006,  // What port should this service handle

    bodyParser : 'json', // What Kind of API is this [https://www.npmjs.com/package/body-parser]
    
    // Used For Session
    redis : {
      host: 'devredis01',
      port: 6379,
      key : 'sess:'
    },
    cookie : {
      name : 'sails.sid',
    },
    // MongoDB
    mongodb : {
        host : 'devmongo01',
        port : 27017,
        database : 'accounting'
    },
    elasticsearch: {
        host: 'develastic01:9200',
        sniffOnStart: false,
        //sniffInterval: 300000
    },

    secret: 'defieco12345',
    
    // CSRF
    csrf : {

    }

}