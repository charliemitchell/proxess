module.exports = {
    secret : 'defieco12345',
    cookie : {
        maxAge: 24 * 60 * 60 * 1000,
        redis_prefix : 'sess:',
        domain : ''
    }
}