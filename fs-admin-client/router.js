module.exports = {
    
    GET : [{
        path : '/clients',
        action : 'GET',
        policy : 'authenticated'
    },{
        path : '/:id',
        action : 'findOne',
        policy : 'authenticated'
    }],
    


    POST : [{
        path : '/clients',
        action : 'POST',
        policy : 'authenticated'
    }],
    
    

    PUT : [{
        path : '/:id',
        action : 'PUT',
        policy : 'authenticated'
    }, {
        path : '/:id/permupdate',
        action : 'updatePermission',
        policy : 'authenticated'
    }],

    

    DELETE : [{
        path : '/:id',
        action : 'DELETE',
        policy : 'authenticated'
    }]

    
}