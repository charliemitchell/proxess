import Ember from 'ember';

export default Ember.Controller.extend({
	search: '',
    // filter: function () {
    //     if (this.get('search')) {
    //         var arr = this.get('model');
    //         arr = arr.filter(function (item) {
    //             return item.name.match(new RegExp(this.get('search'), 'ig'));
    //         }.bind(this));
    //         this.set('mirror', arr);
    //     } else {
    //         this.set('mirror', this.get('model'));
    //     }
    // }.observes('search'),
    //  mirror: function () {
    //     return this.get('model');
    // }.property('mirror'),
    actions: {
        filter: function () {
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
