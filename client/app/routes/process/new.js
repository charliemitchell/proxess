import Ember from 'ember';

export default Ember.Route.extend({
    model : function () {
        return {
            name : '',
            cmd: '',
            cwd : '',
            args : [],
            stopcmd: '',
            statuscmd: ''
        };
    }
});
