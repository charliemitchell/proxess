module.exports = {

    GET : [{
        path : '/process',
        action : 'GET',
        // policy : 'authenticated'
    },{
        path : '/process/:id',
        action : 'findOne',
        // policy : 'authenticated'
    },{
        path : '/stats',
        action : 'stats',
        // policy : 'authenticated'
    },{
        path : '/stats/:id',
        action : 'findStat',
        // policy : 'authenticated'
    },{
        path : '/alive',
        action : 'getLive',
        // policy : 'authenticated'
    },{
        path : '/count/alive',
        action : 'countLive',
        // policy : 'authenticated'
    },{
        path : '/dashboard',
        action : 'dashboard',
        // policy : 'authenticated'
    },{
        path : '/notes',
        action : 'getNotes',
        // policy : 'authenticated'
    },{
        path : '/notes/:id',
        action : 'getNote',
        // policy : 'authenticated'
    }],

    POST : [{
        path : '/process',
        action : 'POST',
        // policy : 'authenticated'
    },
    {
        path : '/execute/:id',
        action : 'StartService',
        // policy : 'authenticated'
    },
    {
        path : '/all',
        action : 'startAll',
        // policy : 'authenticated'
    }, {
        path : '/notes',
        action : 'createNote',
        // policy : 'authenticated'
    }],

    PUT : [{
        path : '/process/:id',
        action : 'PUT',
        // policy : 'authenticated'
    }, {
        path : '/notes/:id',
        action : 'updateNote',
        // policy : 'authenticated'
    }],

    DELETE : [{
        path : '/process/:id',
        action : 'DELETE',
        // policy : 'authenticated'
    },{
        path : '/execute/:id',
        action : 'StopService',
        // policy : 'authenticated'
    },
    {
        path : '/all',
        action : 'stopAll',
        // policy : 'authenticated'
    },
    {
        path : '/notes/:id',
        action : 'removeNote',
        // policy : 'authenticated'
    }]
}
