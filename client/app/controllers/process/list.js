import Ember from 'ember';

export default Ember.Controller.extend({
	search: '',
    actions: {
        search: function (e, a) {
            Ember.$.ajax({
                type: 'GET',
                url: '/process/?search=' + this.get('search'),
                success: function (data) {
                    this.set('model', data);
                }.bind(this)
            });
        },
    }
});
