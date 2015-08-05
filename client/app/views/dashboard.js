import Ember from 'ember';
export default Ember.View.extend({
    setupInterval: function(self) {
        var controller = self.get('controller');
        var process;

        function checkstatus(id, i) {
            setTimeout(function() {
                Ember.$.getJSON('/status/' + id).then(function(res) {
                    controller.get('model.processes').set(i + '.running', res.status);
                    checkstatus(id, i);
                });
            }, 2000);
        }

        if (controller.get('model')) {
            var length = controller.get('model').processes.length;
            for (var i = 0; i < length; i++) {
                process = controller.get('model.processes')[i];
                checkstatus(process._id, i);
                // if (i == length - 1) {
                //     setTimeout(function() {
                //         Ember.$('#reload').modal('hide');
                //     }, 1000);
                // }
            }
        }

    },
    didInsertElement: function() {
        var controller = this.get('controller'),
            refresh = _.debounce(function() {
                controller.send('filter');
            }, 500);

        this.setupInterval(this);

        Ember.$('#searchbox').on('keyup', function() {
            refresh();
        });

        socket.on('log', function(data) {
            controller.get('logs').pushObject(data);
            // Cap The Amount of Logs to Hold In The Front End
            if (controller.get('logs').length > 1500) {
                controller.get('logs').shift();
            }
            this.$('#' + data.id).addClass('activity');
            setTimeout(function() {
                this.$('#' + data.id).removeClass('activity');
            }.bind(this), 1000);
        }.bind(this));
        Ember.$("li.active").removeClass('active');
        Ember.$("#dashboard").addClass('active');

        controller.on('setupint', this, function() {
            // Ember.$('#reload').modal('show');
            for (var i = 1; i < 99999; i++) //clear all the previous interval
                window.clearInterval(i);

            setTimeout(function() { //DO NOT REMOVE, need this delay to make sure the array is loaded completely
                this.setupInterval(this);
            }.bind(this), 1000);
        });
    },
    willClearRender: function() {
        var controller = this.get('controller');
        controller.set('service', false);
        controller.set('id', '');
        socket.off('log');
    }
});
