import Ember from 'ember';
import moment from 'moment';

export default Ember.Controller.extend({

  init () {
    this._super();

    this.get('websocket').on('service_started', (svc) => {
      let model = this.get('model');
      let ps = model.processes.findBy('id', svc.id);
      if (ps) {
        Ember.set(ps, 'alive', true);
      }
    });
    this.get('websocket').on('service_died', (svc) => {
      let model = this.get('model');
      let ps = model.processes.findBy('id', svc.id);
      if (ps) {
        Ember.set(ps, 'alive', false);
      }
    });

  },

  onProcessAliveCountChange : Ember.observer('model.processes.@each.alive', function () {
    this.set('model.runningCount', this.get('model.processes').filter(p => p.alive).length);
  }),

  searchTerm : '',

  searchResults : Ember.computed('searchTerm', function (a) {
    let searchTerm = this.get('searchTerm');
    let regexp = new RegExp(searchTerm, 'i');
    return this.get('model.processes').filter(ps => regexp.test(ps.name));
  }),

  sortedProcesses : Ember.computed.sort('model.processes', function (a, b) {
    return a.name > b.name;
  }),

  totalPMEM : Ember.computed('websocket.processes.@each.mem', function () {
    return this.get('websocket.processes').map(x => x.mem).reduce(function(a, b) { return a + b; }, 0)
  }),

  totalPCPU : Ember.computed('websocket.processes.@each.cpu', function () {
    return this.get('websocket.processes').map(x => x.cpu).reduce(function(a, b) { return a + b; }, 0)
  }),

  avgPCPU : Ember.computed('pmemHistory.[]', function () {
    var history = this.get('pmemHistory');
    var sum = history.slice(1, 200).map(x => x[1]).filter(x => x).reduce(function(a, b) { return a + b; }, 0);
    var length = history.length || 0.1;
    return Math.round( sum / length);
  }),

  pmemHistory : [['Time', '% Memory']],
  pcpuHistory : [['Time', '% CPU']],

  pmem : Ember.computed('totalPMEM', function () {
    var history = this.get('pmemHistory');
    if (history.length > 200) {
      history.shiftObject();
      history.shiftObject();
      history.unshiftObject(['Time', '% Memory']);
    }
    history.pushObject([ moment().format('h:m:s'),this.get('totalPMEM')]);
    return history;
  }),

  pcpu : Ember.computed('totalPCPU', function () {
    var history = this.get('pmemHistory');
    if (history.length > 200) {
      history.shiftObject();
      history.shiftObject();
      history.unshiftObject(['Time', '% CPU']);
    }
    history.pushObject([ moment().format('h:m:s') ,this.get('totalPCPU')]);
    return history;
  }),

  lines : {
    curveType: 'function',
    lineWidth: 1,
    legend: 'none',
    colors: ['#F5BE0C'],
    enableInteractivity : false,
    height: 170,
    chartArea : {
      backgroundColor : '#444',
      width:'90%',
      height:'70%'
    },
    backgroundColor : {
      fill : '#444'
    },
    vAxis : {
      gridlines : {
        color: '#222',
        count: 2
      },
      viewWindow : {
        max : 100,
        min : 0
      },
      textStyle : {
        color: '#222'
      }
    },
    hAxis : {
      textStyle : {
        color: '#222'
      }
    }
  },

  onLogging : Ember.observer('websocket.logs.@each.id', function () {
    if (this.get('currentLogPid')) {
      this.set('log.content', this.get('websocket.logs').filterBy('id', this.get('currentLogPid')));
    }
  }),

  scrollLogContent : Ember.observer('log.content.[]', function () {
    Ember.run.next(() => {
      let bottom = document.getElementById('log-content-bottom');
      bottom && bottom.scrollIntoView({block: "end", behavior: "smooth"});
    });
  }),

  showingLogs : false,

  log : {
    content : []
  },

  logLevelMax : Ember.computed('websocket.mode', function () {
    return this.get('websocket.mode') === 'ALL';
  }),

  currentLogPid : false,

  actions : {

    logs : function (process) {
      this.set('showingLogs', true);
      this.set('log.title', process.name);
      this.set('log.content', this.get('websocket.logs').filterBy('id', process.id));
      this.set('currentLogPid', process.id);
    },

    hideLogs () {
      this.set('showingLogs', false);
      this.set('currentLogPid', false);
      this.set('logs', {});
    },

    clearLog () {
      this.set('log.content', Ember.A());
    },

    kill : function (process) {
      Ember.$.ajax({
        type : 'DELETE',
        url : '/execute/' + process.id
      });
    },

    start : function (process) {
      Ember.$.ajax({
        type : 'POST',
        url : '/execute/' + process.id
      }).then(data => Ember.set(process, 'pid', data));
    }

  }
});
