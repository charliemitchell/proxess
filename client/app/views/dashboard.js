import Ember from 'ember';
export default Ember.View.extend({
    setupInterval: function (self) {
        var controller = self.get('controller');
        var process;

        for (var i = 1; i < 99999; i++)
            window.clearInterval(i);

        function checkstatus(process, id, i) {
            setInterval(function () {
                Ember.$.getJSON('/status/' + id).then(function (res) {
                    controller.get('mirror.processes').set(i + '.running', res.status);
                });
            }, 2000);
        }

        for (var i = 0; i < controller.get('mirror').processes.length; i++) {
            process = controller.get('mirror.processes')[i];
            checkstatus(process, process._id, i);
        }
    },
    didInsertElement: function () {
        var controller = this.get('controller');

        this.setupInterval(this);

        socket.on('log', function (data) {
            controller.get('logs').pushObject(data);
            // Cap The Amount of Logs to Hold In The Front End
            if (controller.get('logs').length > 1500) {
                controller.get('logs').shift();
            }
            this.$('#' + data.id).addClass('activity');
            setTimeout(function () {
                this.$('#' + data.id).removeClass('activity');
            }.bind(this), 1000);
        }.bind(this));
        socket.on('pmem', function (data) {
            controller.updatePMEM(data);
        }.bind(this));
        socket.on('pcpu', function (data) {
            controller.updatePCPU(data);
        });
        Ember.$("li.active").removeClass('active');
        Ember.$("#dashboard").addClass('active');

        controller.on('setupint', this, function () {
            setTimeout(function () {
                this.setupInterval(this);
            }.bind(this), 1000);
        });
    },
    willClearRender: function () {
        var controller = this.get('controller');
        controller.set('service', false);
        controller.set('id', '');
        socket.off('service_started');
        socket.off('service_died');
        socket.off('pmem');
        socket.off('pcpu');
    },
    updateUI: function (callback) {
        Ember.$.getJSON('/dashboard').then(function (alive) {
            // alive.processes.forEach(function (process) {
            //     if (alive.running.findBy('id', process.id)) {
            //         process.alive = true;
            //     } else {
            //         process.alive = false;
            //     }
            // });
            callback(alive);
        });
    }
});
