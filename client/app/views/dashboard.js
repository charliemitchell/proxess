import Ember from 'ember';

export default Ember.View.extend({
    didInsertElement : function () {
        var controller = this.get('controller');

        socket.on('service_started', function (data) {
            this.updateUI(function (model) {
                controller.set('model', model);
            });
        }.bind(this));

        socket.on('service_died', function (data) {
            this.updateUI(function (model) {
                controller.set('model', model);
            });
        }.bind(this));

        socket.on('log', function (data) {
            controller.get('logs').pushObject(data);
        }.bind(this));

        Ember.$("li.active").removeClass('active');
        Ember.$("#dashboard").addClass('active');
    },
    willClearRender : function () {
        socket.off('service_started');
        socket.off('service_died');
    },

    updateUI : function (callback) {
        Ember.$.getJSON('/dashboard').then(function (alive) {
            
            alive.processes.forEach(function (process) {
                if (alive.running.findBy('id', process.id)) {
                    process.alive = true;
                } else {
                    process.alive = false;
                }
            });

            callback(alive);
        });
    }
});
