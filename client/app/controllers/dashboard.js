import Ember from 'ember';

export default Ember.Controller.extend({
    actions : {
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
