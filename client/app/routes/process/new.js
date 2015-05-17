import Ember from 'ember';

export default Ember.Route.extend({
    model: function (params) {
        if (params.id == '0' || !params.id) {
            return {
                name: '',
                cmd: '',
                cwd: '',
                args: [],
                stopcmd: '',
                checkcmd: '',
                port: '',
                hidden: false
            };
        } else {
            return Ember.$.getJSON('/process/' + params.id).then(function (data) {
                delete data._id;
                delete data.id;
                return data;
            });
        }

    }
});
