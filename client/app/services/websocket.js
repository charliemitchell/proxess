import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {

  processes : Ember.A(),
  logs : Ember.A(),

  init () {
    this._super();

    socket.on('service_started', data => {
      this.trigger('service_started', data);
    });

    socket.on('service_died', data => {
      this.trigger('service_died', data);
    });

    socket.on('log', data => {
      let logs = this.get('logs');
      logs.pushObject(data);
      if (logs.length > 1000) {
        logs.shiftObject();
      }
    });

    socket.on('pmem', data => {
      data.alive = true;
      let ps = this.get('processes');
      let px = ps.findBy('id', data.id);
      if (px) {
        Ember.set(px, 'mem', parseFloat(data.mem.replace(/[^0-9\.]+/g, "")));
      } else {
        ps.pushObject({
          id : data.id,
          mem : parseFloat(data.mem.replace(/[^0-9\.]+/g, ""))
        });
      }
      if (ps.length > 200) {
        ps.shiftObject();
      }
    });

    socket.on('pcpu', data => {
      data.alive = true;
      let ps = this.get('processes');
      let px = ps.findBy('id', data.id);
      if (px) {
        Ember.set(px, 'cpu', parseFloat(data.cpu.replace(/[^0-9\.]+/g, "")));
      } else {
        ps.pushObject({
          id : data.id,
          cpu : parseFloat(data.cpu.replace(/[^0-9\.]+/g, ""))
        });
      }
      if (ps.length > 200) {
        ps.shiftObject();
      }
    });

  }

});
