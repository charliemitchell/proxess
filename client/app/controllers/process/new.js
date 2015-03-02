import Ember from 'ember';

export default Ember.Controller.extend({

    args : '',

    transformArgs : function () {
        var args = this.get('args').split(',').without('');
        this.set('model.args', args);
    }.observes('args'),

    actions : {
        save : function () {
            Ember.$.ajax({
                type : 'POST',
                url : '/process',
                data : JSON.stringify(this.get('model')),
                success : function (response) {
                    this.notify.success('Process Saved!');
                    this.transitionToRoute('process.list');
                }.bind(this)
            });
        }
    }
});
