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
            
            // Cap The Amount of Logs to Hold In The Front End
            if (controller.get('logs').length > 1500) {
                controller.get('logs').shift();
            }

            this.$('#' + data.id).addClass('activity')

            setTimeout(function () {
                this.$('#' + data.id).removeClass('activity');
            }.bind(this), 1000);

        }.bind(this));

        socket.on('pmem', function (data) {
            controller.updatePMEM(data);
        }.bind(this));

        socket.on('pcpu', function (data) {
            controller.updatePCPU(data);
        })

        Ember.$("li.active").removeClass('active');
        Ember.$("#dashboard").addClass('active');
    },
    willClearRender : function () {
        socket.off('service_started');
        socket.off('service_died');
        socket.off('pmem');
        socket.off('pcpu');
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
