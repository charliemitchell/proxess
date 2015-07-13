import Ember from 'ember';

export default Ember.View.extend({
    didInsertElement: function() {
        var controller = this.get('controller'),
            refresh = _.debounce(function() {
                controller.send('filter');
            }, 500);

        Ember.$('#searchbox').on('keyup', function() {
            refresh();
        });

        Ember.$("li.active").removeClass('active');
        Ember.$("#processes").addClass('active');
    }
});
