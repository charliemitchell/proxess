import Ember from 'ember';
export default Ember.Controller.extend({
    logs: Ember.A(),
    log: {
        title: "",
        content: []
    },
    totalPMEM: 0,
    totalPCPU: 0,
    service: false,
    id: '',
    updatePMEM: function (proc) {
        var total = 0;
        proc.mem = parseFloat(proc.mem.replace(/[^0-9\.]+/g, ""));
        var process = this.get('model.processes').findBy('id', proc.id),
            idx = this.get('model.processes').indexOf(process);
        this.set('model.processes.' + idx + '.pmem', proc.mem);
        this.get('model.processes').forEach(function (p) {
            total += p.pmem || 0;
        });
        this.set('totalPMEM', total.toFixed(2));
    },
    updatePCPU: function (proc) {
        var total = 0;
        proc.cpu = parseFloat(proc.cpu.replace(/[^0-9\.]+/g, ""));
        var process = this.get('model.processes').findBy('id', proc.id),
            idx = this.get('model.processes').indexOf(process);
        this.set('model.processes.' + idx + '.pcpu', proc.cpu);
        this.get('model.processes').forEach(function (p) {
            total += p.pcpu || 0;
        });
        total = total > 100 ? 100 : total;
        this.set('totalPCPU', total.toFixed(2));
    },
    actions: {
        logs: function (process) {
            this.set('log.title', process.name);
            this.set('log.content', this.get('logs').filterBy('id', process.id));
            Ember.$('#logs').modal('show');
        },
        kill: function (process) {
            Ember.$.ajax({
                type: 'DELETE',
                url: '/execute/' + process.id
            });
        },
        start: function (process) {
            var pid = process ? process.id : this.get('id');
            var newservice = this.get('service');
            if (!process) {
                var options = $('#custombuild .modal-body input:checked');
                for (var i = 0; i < options.length; i++) {
                    newservice.args[i] = $(options[i]).val();
                }
            }
            Ember.$.ajax({
                type: 'POST',
                url: '/execute/' + pid,
                data: JSON.stringify({
                    service: process ? false : newservice
                }),
                success: function (data) {
                    if (data.service && data.needbuild) {
                        for (var i = 0; i < data.service.args.length; i++) {
                            if (data.service.args[i].match(/\?/g)) {
                                data.service.args[i] = data.service.args[i].replace(/[\?\[\]]/g, '').split(':');
                            } else {
                                data.service.args[i] = [data.service.args[i]];
                            }
                        }
                        this.set('id', data.service.id);
                        this.set('service', data.service);
                        Ember.$('#custombuild').modal('show');
                    }
                }.bind(this)
            });
        }
    }
});
