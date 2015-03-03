import Ember from 'ember';

export default Ember.Controller.extend({
    
    logs : Ember.A(),

    log : {
        title : "",
        content : []
    },

    actions : {

        logs : function (process) {
            this.set('log.title', process.name);
            this.set('log.content', this.get('logs').filterBy('id', process.id));
            Ember.$('#logs').modal('show');
        },

        kill : function (process) {
            Ember.$.ajax({
                type : 'DELETE',
                url : '/execute/' + process.id
            });
        },
        start : function (process) {
            console.log(process);
            Ember.$.ajax({
                type : 'POST',
                url : '/execute/' + process.id
            });
        }
    }
});
