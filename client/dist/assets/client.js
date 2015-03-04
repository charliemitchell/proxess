/* jshint ignore:start */

/* jshint ignore:end */

define('client/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'client/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  var App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('client/components/ember-notify', ['exports', 'ember-notify/components/ember-notify'], function (exports, Notify) {

	'use strict';

	exports['default'] = Notify['default'];

});
define('client/controllers/dashboard', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({

        logs: Ember['default'].A(),

        log: {
            title: "",
            content: []
        },

        totalPMEM: 0,
        totalPCPU: 0,

        updatePMEM: function updatePMEM(proc) {
            var total = 0;

            proc.mem = parseFloat(proc.mem.replace(/[^0-9\.]+/g, ""));

            var process = this.get("model.processes").findBy("id", proc.id),
                idx = this.get("model.processes").indexOf(process);

            this.set("model.processes." + idx + ".pmem", proc.mem);

            this.get("model.processes").forEach(function (p) {
                total += p.pmem || 0;
            });

            this.set("totalPMEM", total.toFixed(2));
        },

        updatePCPU: function updatePCPU(proc) {
            var total = 0;

            proc.cpu = parseFloat(proc.cpu.replace(/[^0-9\.]+/g, ""));

            var process = this.get("model.processes").findBy("id", proc.id),
                idx = this.get("model.processes").indexOf(process);

            this.set("model.processes." + idx + ".pcpu", proc.cpu);

            this.get("model.processes").forEach(function (p) {
                total += p.pcpu || 0;
            });
            total = total > 100 ? 100 : total;

            this.set("totalPCPU", total.toFixed(2));
        },

        actions: {

            logs: function logs(process) {
                this.set("log.title", process.name);
                this.set("log.content", this.get("logs").filterBy("id", process.id));
                Ember['default'].$("#logs").modal("show");
            },

            kill: function kill(process) {
                Ember['default'].$.ajax({
                    type: "DELETE",
                    url: "/execute/" + process.id
                });
            },
            start: function start(process) {
                console.log(process);
                Ember['default'].$.ajax({
                    type: "POST",
                    url: "/execute/" + process.id
                });
            }
        }
    });

});
define('client/controllers/process/edit', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({
        command: "",
        args: "",
        cwd: "",
        name: "",

        actions: {

            save: function save() {
                var data = {
                    command: this.get("command"),
                    args: this.get("args").slice(","),
                    cwd: this.get("cwd"),
                    name: this.get("name"),
                    id: this.get("model.id"),
                    _id: this.get("model._id") };

                Ember['default'].$.ajax({
                    type: "PUT",
                    url: "process/" + data.id,
                    data: JSON.stringify(data),
                    success: (function () {
                        this.notify.success("Process Updated");
                    }).bind(this)
                });
            },

            remove: function remove() {
                var confirmed = confirm("Are You Sure You Would Like To Remove This Process?");
                if (confirmed) {
                    Ember['default'].$.ajax({
                        type: "DELETE",
                        url: "process/" + this.get("model.id"),
                        success: (function () {
                            this.notify.success("Process Removed");
                            this.transitionToRoute("process.list");
                        }).bind(this)
                    });
                }
            },

            revert: function revert() {
                this.set("command", this.get("model.command")).set("cwd", this.get("model.cwd")).set("args", this.get("model.args").join(", ")).set("name", this.get("model.name"));
            }
        }
    });

});
define('client/controllers/process/list', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({});

});
define('client/controllers/process/manage', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({});

});
define('client/controllers/process/new', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Controller.extend({

        args: "",

        transformArgs: (function () {
            var args = this.get("args").split(",").without("");
            this.set("model.args", args);
        }).observes("args"),

        actions: {
            save: function save() {
                Ember['default'].$.ajax({
                    type: "POST",
                    url: "/process",
                    data: JSON.stringify(this.get("model")),
                    success: (function (response) {
                        this.notify.success("Process Saved!");
                        this.transitionToRoute("process.list");
                    }).bind(this)
                });
            }
        }
    });

});
define('client/helpers/to-string', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports.toString = toString;

  function toString(input) {
    return input.join(", ");
  }

  exports['default'] = Ember['default'].Handlebars.makeBoundHelper(toString);

});
define('client/initializers/ajax-setup', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports.initialize = initialize;

    function initialize() {
        // Force JSON Headers on Everything
        Ember['default'].$.ajaxSetup({
            contentType: "application/json"
        });
    }

    exports['default'] = {
        name: "ajax-setup",
        initialize: initialize
    };
    /* container, application */

});
define('client/initializers/app-version', ['exports', 'client/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;

  exports['default'] = {
    name: "App Version",
    initialize: function initialize(container, application) {
      var appName = classify(application.toString());
      Ember['default'].libraries.register(appName, config['default'].APP.version);
    }
  };

});
define('client/initializers/ember-notify', ['exports', 'ember-notify'], function (exports, Notify) {

  'use strict';

  exports['default'] = {
    name: "ember-notify",
    initialize: function initialize(container, app) {
      container.optionsForType("notify", { instantiate: false, singleton: true });
      app.register("notify:main", Notify['default']);
      app.inject("route", "notify", "notify:main");
      app.inject("controller", "notify", "notify:main");
    }
  };

});
define('client/initializers/export-application-global', ['exports', 'ember', 'client/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal && !window[classifiedName]) {
      window[classifiedName] = application;
    }
  }

  ;

  exports['default'] = {
    name: "export-application-global",

    initialize: initialize
  };

});
define('client/models/process', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].Model.extend({});

});
define('client/router', ['exports', 'ember', 'client/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    this.resource("process", function () {
      this.route("new");
      this.route("edit", { path: "edit/:id" });
      this.route("manage");
      this.route("list");
    });
    this.route("dashboard");
  });

  exports['default'] = Router;

});
define('client/routes/dashboard', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return Ember['default'].$.getJSON("/dashboard").then(function (alive) {

                alive.processes.forEach(function (process) {
                    if (alive.running.findBy("id", process.id)) {
                        process.alive = true;
                    } else {
                        process.alive = false;
                    }
                });

                return alive;
            });
        }
    });

});
define('client/routes/process', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('client/routes/process/edit', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model(params) {
            return Ember['default'].$.getJSON("/process/" + params.id).then(function (data) {
                return data;
            });
        }
    });

});
define('client/routes/process/list', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return Ember['default'].$.getJSON("/process").then(function (list) {
                return list;
            });
        }
    });

});
define('client/routes/process/manage', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('client/routes/process/new', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].Route.extend({
        model: function model() {
            return {
                name: "",
                cmd: "",
                cwd: "",
                args: []
            };
        }
    });

});
define('client/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"id","wrapper");
        var el2 = dom.createTextNode("\n\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment(" Navigation ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("nav");
        dom.setAttribute(el2,"class","navbar navbar-inverse navbar-fixed-top");
        dom.setAttribute(el2,"role","navigation");
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Brand and toggle get grouped for better mobile display ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","navbar-header");
        var el4 = dom.createTextNode("\n                ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("button");
        dom.setAttribute(el4,"type","button");
        dom.setAttribute(el4,"class","navbar-toggle");
        dom.setAttribute(el4,"data-toggle","collapse");
        dom.setAttribute(el4,"data-target",".navbar-ex1-collapse");
        var el5 = dom.createTextNode("\n                    ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","sr-only");
        var el6 = dom.createTextNode("Toggle navigation");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                    ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","icon-bar");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                    ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","icon-bar");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                    ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("span");
        dom.setAttribute(el5,"class","icon-bar");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n                ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"class","navbar-brand");
        dom.setAttribute(el4,"href","index.html");
        var el5 = dom.createTextNode("Proxess");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Top Menu Items ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ul");
        dom.setAttribute(el3,"class","nav navbar-right top-nav");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" Sidebar Menu Items - These collapse to the responsive navigation menu on small screens ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","collapse navbar-collapse navbar-ex1-collapse");
        var el4 = dom.createTextNode("\n                ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("ul");
        dom.setAttribute(el4,"class","nav navbar-nav side-nav");
        var el5 = dom.createTextNode("\n                    ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        dom.setAttribute(el5,"id","dashboard");
        var el6 = dom.createTextNode("\n                        ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("a");
        dom.setAttribute(el6,"href","#/dashboard");
        var el7 = dom.createElement("i");
        dom.setAttribute(el7,"class","fa fa-fw fa-desktop");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode(" Dashboard");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                    ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        dom.setAttribute(el5,"id","processes");
        var el6 = dom.createTextNode("\n                        ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("a");
        dom.setAttribute(el6,"href","#/process/list");
        var el7 = dom.createElement("i");
        dom.setAttribute(el7,"class","fa fa-fw fa-cogs");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode(" Processes");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                    ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        dom.setAttribute(el5,"id","groups");
        var el6 = dom.createTextNode("\n                        ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("a");
        var el7 = dom.createElement("i");
        dom.setAttribute(el7,"class","fa fa-fw fa-cubes");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode(" Groups (Coming Soon)");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                    ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("li");
        dom.setAttribute(el5,"id","process");
        var el6 = dom.createTextNode("\n                        ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("a");
        dom.setAttribute(el6,"href","#/process/new");
        var el7 = dom.createElement("i");
        dom.setAttribute(el7,"class","fa fa-fw fa-cog");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode(" New Process");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" /.navbar-collapse ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"id","page-wrapper");
        var el3 = dom.createTextNode("\n\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","container-fluid");
        dom.setAttribute(el3,"style","padding:80px 10px 10px 10px");
        var el4 = dom.createTextNode("\n\n                ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n\n            ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n            ");
        dom.appendChild(el2, el3);
        var el3 = dom.createComment(" /.container-fluid ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n\n        ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n        ");
        dom.appendChild(el1, el2);
        var el2 = dom.createComment(" /#page-wrapper ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" /#wrapper ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n    ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, inline = hooks.inline;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[3]); }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0, 5, 1]),0,1);
        var morph1 = dom.createMorphAt(fragment,3,4,contextualElement);
        content(env, morph0, context, "outlet");
        inline(env, morph1, context, "ember-notify", [], {"messageStyle": "bootstrap", "closeAfter": 4000});
        return fragment;
      }
    };
  }()));

});
define('client/templates/components/ember-notify', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("a");
            dom.setAttribute(el1,"class","close");
            var el2 = dom.createTextNode("×");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n    ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("span");
            dom.setAttribute(el1,"class","message");
            var el2 = dom.createTextNode("");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, element = hooks.element, content = hooks.content;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            var element1 = dom.childAt(fragment, [3]);
            if (this.cachedFragment) { dom.repairClonedNode(element1,[0]); }
            var morph0 = dom.createMorphAt(element1,-1,0);
            var morph1 = dom.createUnsafeMorphAt(element1,0,-1);
            element(env, element0, context, "action", ["close"], {"target": "view"});
            content(env, morph0, context, "message.message");
            content(env, morph1, context, "message.raw");
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "view", [get(env, context, "view.messageClass")], {"message": get(env, context, "message"), "closeAfter": get(env, context, "closeAfter"), "class": "clearfix"}, child0, null);
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0,1]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        block(env, morph0, context, "each", [get(env, context, "messages")], {"keyword": "message"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('client/templates/dashboard', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("a");
            dom.setAttribute(el1,"class","btn btn-danger");
            var el2 = dom.createTextNode("stop");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, element = hooks.element;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element1 = dom.childAt(fragment, [1]);
            element(env, element1, context, "action", ["kill", get(env, context, "process")], {});
            return fragment;
          }
        };
      }());
      var child1 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("                                ");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("a");
            dom.setAttribute(el1,"class","btn btn-success");
            var el2 = dom.createTextNode("start");
            dom.appendChild(el1, el2);
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, element = hooks.element;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            var element0 = dom.childAt(fragment, [1]);
            element(env, element0, context, "action", ["start", get(env, context, "process")], {});
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("a");
          dom.setAttribute(el1,"class","list-group-item");
          var el2 = dom.createTextNode("\n                            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2,"class","text-right");
          var el3 = dom.createTextNode("\n");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("                            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                            \n                            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2,"class","text-right");
          var el3 = dom.createTextNode("\n                                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("a");
          dom.setAttribute(el3,"class","btn btn-primary");
          var el4 = dom.createTextNode("logs");
          dom.appendChild(el3, el4);
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                            \n                            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2,"class","pull-left");
          dom.setAttribute(el2,"style","width:calc(100% - 143px)");
          var el3 = dom.createElement("i");
          dom.setAttribute(el3,"class","fa fa-fw fa-gear");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(" ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode(" ");
          dom.appendChild(el2, el3);
          var el3 = dom.createElement("i");
          dom.setAttribute(el3,"class","fa fa-fw fa-comment");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, subexpr = hooks.subexpr, concat = hooks.concat, attribute = hooks.attribute, block = hooks.block, element = hooks.element, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element2 = dom.childAt(fragment, [1]);
          var element3 = dom.childAt(element2, [3, 1]);
          var attrMorph0 = dom.createAttrMorph(element2, 'id');
          var morph0 = dom.createMorphAt(dom.childAt(element2, [1]),0,1);
          var morph1 = dom.createMorphAt(dom.childAt(element2, [5]),1,2);
          attribute(env, attrMorph0, element2, "id", concat(env, [subexpr(env, context, "unbound", [get(env, context, "process.id")], {})]));
          block(env, morph0, context, "if", [get(env, context, "process.alive")], {}, child0, child1);
          element(env, element3, context, "action", ["logs", get(env, context, "process")], {});
          content(env, morph1, context, "process.name");
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createUnsafeMorphAt(fragment,0,1,contextualElement);
          content(env, morph0, context, "entry.log");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment(" Page Heading ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-12");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ol");
        dom.setAttribute(el3,"class","breadcrumb");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.setAttribute(el4,"class","active");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("i");
        dom.setAttribute(el5,"class","fa fa-cogs");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" Processes\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" /.row ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n    \n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-3 col-md-3 col-sm-6");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","panel panel-green");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","panel-heading");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","row");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col-xs-3");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("i");
        dom.setAttribute(el7,"class","fa fa-cogs fa-5x");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col-xs-9 text-right");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","huge");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        var el8 = dom.createTextNode("Processes Running");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"href","#");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","panel-footer");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","pull-left");
        var el7 = dom.createTextNode("View Details");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","pull-right");
        var el7 = dom.createElement("i");
        dom.setAttribute(el7,"class","fa fa-arrow-circle-right");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","clearfix");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-3 col-md-3 col-sm-6");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","panel panel-yellow");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","panel-heading");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","row");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col-xs-3");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("i");
        dom.setAttribute(el7,"class","fa fa-cubes fa-5x");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col-xs-9 text-right");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","huge");
        var el8 = dom.createTextNode("0");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        var el8 = dom.createTextNode("Groups Running");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"href","#");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","panel-footer");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","pull-left");
        var el7 = dom.createTextNode("View Details");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","pull-right");
        var el7 = dom.createElement("i");
        dom.setAttribute(el7,"class","fa fa-arrow-circle-right");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","clearfix");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-3 col-md-3 col-sm-6");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","panel panel-red");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","panel-heading");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","row");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col-xs-3");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("i");
        dom.setAttribute(el7,"class","fa fa-pie-chart fa-5x");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col-xs-9 text-right");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","huge");
        var el8 = dom.createTextNode("%");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        var el8 = dom.createTextNode("Memory Used");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"href","#");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","panel-footer");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","pull-left");
        var el7 = dom.createTextNode("View Details");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","pull-right");
        var el7 = dom.createElement("i");
        dom.setAttribute(el7,"class","fa fa-arrow-circle-right");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","clearfix");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-3 col-md-3 col-sm-6");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","panel panel-red");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","panel-heading");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","row");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col-xs-3");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("i");
        dom.setAttribute(el7,"class","fa fa-tachometer fa-5x");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col-xs-9 text-right");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"class","huge");
        var el8 = dom.createTextNode("%");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        var el8 = dom.createTextNode("CPU Used");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"href","#");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","panel-footer");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","pull-left");
        var el7 = dom.createTextNode("View Details");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","pull-right");
        var el7 = dom.createElement("i");
        dom.setAttribute(el7,"class","fa fa-arrow-circle-right");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","clearfix");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" /.row ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-12");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","panel panel-default");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","panel-heading");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h3");
        dom.setAttribute(el5,"class","panel-title");
        var el6 = dom.createElement("i");
        dom.setAttribute(el6,"class","fa fa-database fa-fw");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(" Your Stored Processes");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","panel-body");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","list-group");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("                    \n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" /.row ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n\n\n\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","modal");
        dom.setAttribute(el1,"id","logs");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","modal-dialog");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","modal-content");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","modal-header");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h4");
        dom.setAttribute(el5,"class","modal-title");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","modal-body");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("p");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","modal-footer");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("paper-button");
        dom.setAttribute(el5,"raised","");
        dom.setAttribute(el5,"role","button");
        dom.setAttribute(el5,"data-dismiss","modal");
        var el6 = dom.createTextNode("Dismiss");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element4 = dom.childAt(fragment, [6]);
        var element5 = dom.childAt(fragment, [14, 1, 1]);
        var morph0 = dom.createMorphAt(dom.childAt(element4, [1, 1, 1, 1, 3, 1]),-1,-1);
        var morph1 = dom.createMorphAt(dom.childAt(element4, [5, 1, 1, 1, 3, 1]),-1,0);
        var morph2 = dom.createMorphAt(dom.childAt(element4, [7, 1, 1, 1, 3, 1]),-1,0);
        var morph3 = dom.createMorphAt(dom.childAt(fragment, [10, 1, 1, 3, 1]),0,1);
        var morph4 = dom.createMorphAt(dom.childAt(element5, [1, 1]),-1,-1);
        var morph5 = dom.createMorphAt(dom.childAt(element5, [3, 1]),0,1);
        content(env, morph0, context, "model.runningCount");
        content(env, morph1, context, "totalPMEM");
        content(env, morph2, context, "totalPCPU");
        block(env, morph3, context, "each", [get(env, context, "model.processes")], {"keyword": "process"}, child0, null);
        content(env, morph4, context, "log.title");
        block(env, morph5, context, "each", [get(env, context, "log.content")], {"keyword": "entry"}, child1, null);
        return fragment;
      }
    };
  }()));

});
define('client/templates/index', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h2");
        var el2 = dom.createTextNode(" Welcome To Proxess");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("p");
        var el2 = dom.createTextNode("Click On Dashboard to start and stop processes, or choose \"New Process\" from the menu to get started");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        return fragment;
      }
    };
  }()));

});
define('client/templates/process', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('client/templates/process/edit', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h3");
        var el2 = dom.createTextNode(" Editing ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("hr");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-6");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","panel");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","panel-heading");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","row");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col-xs-3");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col-xs-9 text-right");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        var el8 = dom.createTextNode("New Configuration");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","row");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col-sm-12");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:100px;");
        var el8 = dom.createTextNode("Name");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:calc(100% - 105px)");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:100px;");
        var el8 = dom.createTextNode("CMD");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:calc(100% - 105px)");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:100px;");
        var el8 = dom.createTextNode("ARGS");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:calc(100% - 105px)");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:100px;");
        var el8 = dom.createTextNode("CWD");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:calc(100% - 105px)");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"style","cursor:pointer");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","panel-footer");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","pull-left");
        var el7 = dom.createTextNode("Save");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","pull-right");
        var el7 = dom.createElement("i");
        dom.setAttribute(el7,"class","fa fa-arrow-circle-right");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","clearfix");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-6");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","panel panel-primary");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","panel-heading");
        dom.setAttribute(el4,"style","min-height:159px");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","row");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col-xs-3");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col-xs-9 text-right");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        var el8 = dom.createTextNode("Current Configuration");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","row");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col-sm-12");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:100px;");
        var el8 = dom.createTextNode("Name");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:calc(100% - 105px)");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:100px;");
        var el8 = dom.createTextNode("CMD");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:calc(100% - 105px)");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:100px;");
        var el8 = dom.createTextNode("ARGS");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:calc(100% - 105px)");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:100px;");
        var el8 = dom.createTextNode("CWD");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:calc(100% - 105px)");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"style","cursor:pointer");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","panel-footer");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","pull-left");
        var el7 = dom.createTextNode("Revert to This Configuration");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","clearfix");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-sm-12 text-right");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("button");
        dom.setAttribute(el3,"type","button");
        dom.setAttribute(el3,"class","btn btn-primary");
        var el4 = dom.createTextNode("Delete This Process");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, inline = hooks.inline, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [4]);
        var element1 = dom.childAt(element0, [1, 1]);
        var element2 = dom.childAt(element1, [1]);
        var element3 = dom.childAt(element2, [3, 1]);
        var element4 = dom.childAt(element1, [3]);
        var element5 = dom.childAt(element0, [3, 1]);
        var element6 = dom.childAt(element5, [1]);
        var element7 = dom.childAt(element6, [3, 1]);
        var element8 = dom.childAt(element5, [3]);
        var element9 = dom.childAt(fragment, [6, 1, 1]);
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,-1);
        var morph1 = dom.createMorphAt(dom.childAt(element2, [1, 1]),0,1);
        var morph2 = dom.createMorphAt(dom.childAt(element3, [3]),0,1);
        var morph3 = dom.createMorphAt(dom.childAt(element3, [7]),0,1);
        var morph4 = dom.createMorphAt(dom.childAt(element3, [11]),0,1);
        var morph5 = dom.createMorphAt(dom.childAt(element3, [15]),0,1);
        var morph6 = dom.createMorphAt(dom.childAt(element6, [1, 1]),0,1);
        var morph7 = dom.createMorphAt(dom.childAt(element7, [3]),0,1);
        var morph8 = dom.createMorphAt(dom.childAt(element7, [7]),0,1);
        var morph9 = dom.createMorphAt(dom.childAt(element7, [11]),0,1);
        var morph10 = dom.createMorphAt(dom.childAt(element7, [15]),0,1);
        content(env, morph0, context, "model.name");
        content(env, morph1, context, "model.name");
        inline(env, morph2, context, "input", [], {"class": "full", "placeholder": "", "value": get(env, context, "name")});
        inline(env, morph3, context, "input", [], {"class": "full", "placeholder": "", "value": get(env, context, "command")});
        inline(env, morph4, context, "input", [], {"class": "full", "placeholder": "", "value": get(env, context, "args")});
        inline(env, morph5, context, "input", [], {"class": "full", "placeholder": "", "value": get(env, context, "cwd")});
        element(env, element4, context, "action", ["save"], {});
        content(env, morph6, context, "model.name");
        content(env, morph7, context, "model.name");
        content(env, morph8, context, "model.command");
        inline(env, morph9, context, "to-string", [get(env, context, "model.args")], {});
        content(env, morph10, context, "model.cwd");
        element(env, element8, context, "action", ["revert"], {});
        element(env, element9, context, "action", ["remove"], {});
        return fragment;
      }
    };
  }()));

});
define('client/templates/process/list', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createTextNode("edit");
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            dom.detectNamespace(contextualElement);
            var fragment;
            if (env.useFragmentCache && dom.canClone) {
              if (this.cachedFragment === null) {
                fragment = this.build(dom);
                if (this.hasRendered) {
                  this.cachedFragment = fragment;
                } else {
                  this.hasRendered = true;
                }
              }
              if (this.cachedFragment) {
                fragment = dom.cloneNode(this.cachedFragment, true);
              }
            } else {
              fragment = this.build(dom);
            }
            return fragment;
          }
        };
      }());
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("                        ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("a");
          dom.setAttribute(el1,"class","list-group-item");
          var el2 = dom.createTextNode("\n                            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("span");
          dom.setAttribute(el2,"class","badge");
          var el3 = dom.createTextNode("\n                                ");
          dom.appendChild(el2, el3);
          var el3 = dom.createTextNode("\n                            ");
          dom.appendChild(el2, el3);
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                            ");
          dom.appendChild(el1, el2);
          var el2 = dom.createElement("i");
          dom.setAttribute(el2,"class","fa fa-fw fa-gear");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode(" ");
          dom.appendChild(el1, el2);
          var el2 = dom.createTextNode("\n                        ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,1);
          var morph1 = dom.createMorphAt(element0,4,5);
          block(env, morph0, context, "link-to", ["process.edit", get(env, context, "process.id")], {}, child0, null);
          content(env, morph1, context, "process.name");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createComment(" Page Heading ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-12");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("ol");
        dom.setAttribute(el3,"class","breadcrumb");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("li");
        dom.setAttribute(el4,"class","active");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("i");
        dom.setAttribute(el5,"class","fa fa-cogs");
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode(" Processes\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" /.row ");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-12");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","panel panel-default");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","panel-heading");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("h3");
        dom.setAttribute(el5,"class","panel-title");
        var el6 = dom.createElement("i");
        dom.setAttribute(el6,"class","fa fa-database fa-fw");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode(" Your Stored Processes");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","panel-body");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","list-group");
        var el6 = dom.createTextNode("\n");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("                    \n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createComment(" /.row ");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [6, 1, 1, 3, 1]),0,1);
        block(env, morph0, context, "each", [get(env, context, "model")], {"keyword": "process"}, child0, null);
        return fragment;
      }
    };
  }()));

});
define('client/templates/process/manage', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[0]); }
        var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
        content(env, morph0, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('client/templates/process/new', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("h2");
        var el2 = dom.createTextNode(" Create A New Process ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","row");
        var el2 = dom.createTextNode("\n    ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","col-lg-12");
        var el3 = dom.createTextNode("\n        ");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","panel");
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("div");
        dom.setAttribute(el4,"class","panel-heading");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","row");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col-xs-3");
        var el7 = dom.createTextNode("\n                        \n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col-xs-9 text-right");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        var el8 = dom.createTextNode("New Configuration");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","row");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","col-sm-12");
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:100px;");
        var el8 = dom.createTextNode("Name");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:calc(100% - 105px)");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:100px;");
        var el8 = dom.createTextNode("CMD");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:calc(100% - 105px)");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:100px;");
        var el8 = dom.createTextNode("ARGS");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:calc(100% - 105px)");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:100px;");
        var el8 = dom.createTextNode("CWD");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                        ");
        dom.appendChild(el6, el7);
        var el7 = dom.createElement("div");
        dom.setAttribute(el7,"style","display:inline-block; width:calc(100% - 105px)");
        var el8 = dom.createTextNode("\n                            ");
        dom.appendChild(el7, el8);
        var el8 = dom.createTextNode("\n                        ");
        dom.appendChild(el7, el8);
        dom.appendChild(el6, el7);
        var el7 = dom.createTextNode("\n                    ");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n            ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("a");
        dom.setAttribute(el4,"href","#/process/new");
        var el5 = dom.createTextNode("\n                ");
        dom.appendChild(el4, el5);
        var el5 = dom.createElement("div");
        dom.setAttribute(el5,"class","panel-footer");
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","pull-left");
        var el7 = dom.createTextNode("Save");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("span");
        dom.setAttribute(el6,"class","pull-right");
        var el7 = dom.createElement("i");
        dom.setAttribute(el7,"class","fa fa-arrow-circle-right");
        dom.appendChild(el6, el7);
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                    ");
        dom.appendChild(el5, el6);
        var el6 = dom.createElement("div");
        dom.setAttribute(el6,"class","clearfix");
        dom.appendChild(el5, el6);
        var el6 = dom.createTextNode("\n                ");
        dom.appendChild(el5, el6);
        dom.appendChild(el4, el5);
        var el5 = dom.createTextNode("\n            ");
        dom.appendChild(el4, el5);
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n        ");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n    ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n    \n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, inline = hooks.inline, element = hooks.element;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [2, 1, 1]);
        var element1 = dom.childAt(element0, [1, 3, 1]);
        var element2 = dom.childAt(element0, [3]);
        var morph0 = dom.createMorphAt(dom.childAt(element1, [3]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element1, [7]),0,1);
        var morph2 = dom.createMorphAt(dom.childAt(element1, [11]),0,1);
        var morph3 = dom.createMorphAt(dom.childAt(element1, [15]),0,1);
        inline(env, morph0, context, "input", [], {"class": "full", "placeholder": "My Simple Python Service", "value": get(env, context, "model.name")});
        inline(env, morph1, context, "input", [], {"class": "full", "placeholder": "python", "value": get(env, context, "model.command")});
        inline(env, morph2, context, "input", [], {"class": "full", "placeholder": "-m, SimpleHTTPServer, 8080", "value": get(env, context, "controller.args")});
        inline(env, morph3, context, "input", [], {"class": "full", "placeholder": "/Users/charlie/servers/myservice/", "value": get(env, context, "model.cwd")});
        element(env, element2, context, "action", ["save"], {});
        return fragment;
      }
    };
  }()));

});
define('client/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('client/tests/controllers/dashboard.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/dashboard.js should pass jshint', function() { 
    ok(true, 'controllers/dashboard.js should pass jshint.'); 
  });

});
define('client/tests/controllers/process/edit.jshint', function () {

  'use strict';

  module('JSHint - controllers/process');
  test('controllers/process/edit.js should pass jshint', function() { 
    ok(false, 'controllers/process/edit.js should pass jshint.\ncontrollers/process/edit.js: line 39, col 63, Missing semicolon.\ncontrollers/process/edit.js: line 40, col 63, Missing semicolon.\n\n2 errors'); 
  });

});
define('client/tests/controllers/process/list.jshint', function () {

  'use strict';

  module('JSHint - controllers/process');
  test('controllers/process/list.js should pass jshint', function() { 
    ok(true, 'controllers/process/list.js should pass jshint.'); 
  });

});
define('client/tests/controllers/process/manage.jshint', function () {

  'use strict';

  module('JSHint - controllers/process');
  test('controllers/process/manage.js should pass jshint', function() { 
    ok(true, 'controllers/process/manage.js should pass jshint.'); 
  });

});
define('client/tests/controllers/process/new.jshint', function () {

  'use strict';

  module('JSHint - controllers/process');
  test('controllers/process/new.js should pass jshint', function() { 
    ok(false, 'controllers/process/new.js should pass jshint.\ncontrollers/process/new.js: line 18, col 37, \'response\' is defined but never used.\n\n1 error'); 
  });

});
define('client/tests/helpers/resolver', ['exports', 'ember/resolver', 'client/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('client/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('client/tests/helpers/start-app', ['exports', 'ember', 'client/app', 'client/router', 'client/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('client/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('client/tests/helpers/to-string.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/to-string.js should pass jshint', function() { 
    ok(true, 'helpers/to-string.js should pass jshint.'); 
  });

});
define('client/tests/initializers/ajax-setup.jshint', function () {

  'use strict';

  module('JSHint - initializers');
  test('initializers/ajax-setup.js should pass jshint', function() { 
    ok(true, 'initializers/ajax-setup.js should pass jshint.'); 
  });

});
define('client/tests/models/process.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/process.js should pass jshint', function() { 
    ok(true, 'models/process.js should pass jshint.'); 
  });

});
define('client/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('client/tests/routes/dashboard.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/dashboard.js should pass jshint', function() { 
    ok(true, 'routes/dashboard.js should pass jshint.'); 
  });

});
define('client/tests/routes/process.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/process.js should pass jshint', function() { 
    ok(true, 'routes/process.js should pass jshint.'); 
  });

});
define('client/tests/routes/process/edit.jshint', function () {

  'use strict';

  module('JSHint - routes/process');
  test('routes/process/edit.js should pass jshint', function() { 
    ok(true, 'routes/process/edit.js should pass jshint.'); 
  });

});
define('client/tests/routes/process/list.jshint', function () {

  'use strict';

  module('JSHint - routes/process');
  test('routes/process/list.js should pass jshint', function() { 
    ok(true, 'routes/process/list.js should pass jshint.'); 
  });

});
define('client/tests/routes/process/manage.jshint', function () {

  'use strict';

  module('JSHint - routes/process');
  test('routes/process/manage.js should pass jshint', function() { 
    ok(true, 'routes/process/manage.js should pass jshint.'); 
  });

});
define('client/tests/routes/process/new.jshint', function () {

  'use strict';

  module('JSHint - routes/process');
  test('routes/process/new.js should pass jshint', function() { 
    ok(true, 'routes/process/new.js should pass jshint.'); 
  });

});
define('client/tests/test-helper', ['client/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('client/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('client/tests/unit/controllers/dashboard-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:dashboard", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('client/tests/unit/controllers/dashboard-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/dashboard-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/dashboard-test.js should pass jshint.'); 
  });

});
define('client/tests/unit/controllers/process/edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:process/edit", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('client/tests/unit/controllers/process/edit-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/process');
  test('unit/controllers/process/edit-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/process/edit-test.js should pass jshint.'); 
  });

});
define('client/tests/unit/controllers/process/list-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:process/list", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('client/tests/unit/controllers/process/list-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/process');
  test('unit/controllers/process/list-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/process/list-test.js should pass jshint.'); 
  });

});
define('client/tests/unit/controllers/process/manage-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:process/manage", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('client/tests/unit/controllers/process/manage-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/process');
  test('unit/controllers/process/manage-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/process/manage-test.js should pass jshint.'); 
  });

});
define('client/tests/unit/controllers/process/new-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:process/new", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('client/tests/unit/controllers/process/new-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers/process');
  test('unit/controllers/process/new-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/process/new-test.js should pass jshint.'); 
  });

});
define('client/tests/unit/helpers/to-string-test', ['client/helpers/to-string', 'qunit'], function (to_string, qunit) {

  'use strict';

  qunit.module("ToStringHelper");

  // Replace this with your real tests.
  qunit.test("it works", function (assert) {
    var result = to_string.toString(42);
    assert.ok(result);
  });

});
define('client/tests/unit/helpers/to-string-test.jshint', function () {

  'use strict';

  module('JSHint - unit/helpers');
  test('unit/helpers/to-string-test.js should pass jshint', function() { 
    ok(true, 'unit/helpers/to-string-test.js should pass jshint.'); 
  });

});
define('client/tests/unit/initializers/ajax-setup-test', ['ember', 'client/initializers/ajax-setup', 'qunit'], function (Ember, ajax_setup, qunit) {

  'use strict';

  var container, application;

  qunit.module("AjaxSetupInitializer", {
    beforeEach: function beforeEach() {
      Ember['default'].run(function () {
        application = Ember['default'].Application.create();
        container = application.__container__;
        application.deferReadiness();
      });
    }
  });

  // Replace this with your real tests.
  qunit.test("it works", function (assert) {
    ajax_setup.initialize(container, application);

    // you would normally confirm the results of the initializer here
    assert.ok(true);
  });

});
define('client/tests/unit/initializers/ajax-setup-test.jshint', function () {

  'use strict';

  module('JSHint - unit/initializers');
  test('unit/initializers/ajax-setup-test.js should pass jshint', function() { 
    ok(true, 'unit/initializers/ajax-setup-test.js should pass jshint.'); 
  });

});
define('client/tests/unit/models/process-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("process", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('client/tests/unit/models/process-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/process-test.js should pass jshint', function() { 
    ok(true, 'unit/models/process-test.js should pass jshint.'); 
  });

});
define('client/tests/unit/routes/dashboard-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:dashboard", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('client/tests/unit/routes/dashboard-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/dashboard-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/dashboard-test.js should pass jshint.'); 
  });

});
define('client/tests/unit/routes/process-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:process", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('client/tests/unit/routes/process-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/process-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/process-test.js should pass jshint.'); 
  });

});
define('client/tests/unit/routes/process/edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:process/edit", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('client/tests/unit/routes/process/edit-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/process');
  test('unit/routes/process/edit-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/process/edit-test.js should pass jshint.'); 
  });

});
define('client/tests/unit/routes/process/list-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:process/list", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('client/tests/unit/routes/process/list-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/process');
  test('unit/routes/process/list-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/process/list-test.js should pass jshint.'); 
  });

});
define('client/tests/unit/routes/process/manage-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:process/manage", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('client/tests/unit/routes/process/manage-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/process');
  test('unit/routes/process/manage-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/process/manage-test.js should pass jshint.'); 
  });

});
define('client/tests/unit/routes/process/new-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:process/new", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('client/tests/unit/routes/process/new-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/process');
  test('unit/routes/process/new-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/process/new-test.js should pass jshint.'); 
  });

});
define('client/tests/unit/views/dashboard-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("view:dashboard");

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var view = this.subject();
    assert.ok(view);
  });

});
define('client/tests/unit/views/dashboard-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views');
  test('unit/views/dashboard-test.js should pass jshint', function() { 
    ok(true, 'unit/views/dashboard-test.js should pass jshint.'); 
  });

});
define('client/tests/unit/views/process/edit-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("view:process/edit");

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var view = this.subject();
    assert.ok(view);
  });

});
define('client/tests/unit/views/process/edit-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views/process');
  test('unit/views/process/edit-test.js should pass jshint', function() { 
    ok(true, 'unit/views/process/edit-test.js should pass jshint.'); 
  });

});
define('client/tests/unit/views/process/list-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("view:process/list");

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var view = this.subject();
    assert.ok(view);
  });

});
define('client/tests/unit/views/process/list-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views/process');
  test('unit/views/process/list-test.js should pass jshint', function() { 
    ok(true, 'unit/views/process/list-test.js should pass jshint.'); 
  });

});
define('client/tests/views/dashboard.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/dashboard.js should pass jshint', function() { 
    ok(false, 'views/dashboard.js should pass jshint.\nviews/dashboard.js: line 28, col 55, Missing semicolon.\nviews/dashboard.js: line 42, col 11, Missing semicolon.\nviews/dashboard.js: line 7, col 9, \'socket\' is not defined.\nviews/dashboard.js: line 13, col 9, \'socket\' is not defined.\nviews/dashboard.js: line 19, col 9, \'socket\' is not defined.\nviews/dashboard.js: line 36, col 9, \'socket\' is not defined.\nviews/dashboard.js: line 40, col 9, \'socket\' is not defined.\nviews/dashboard.js: line 48, col 9, \'socket\' is not defined.\nviews/dashboard.js: line 49, col 9, \'socket\' is not defined.\nviews/dashboard.js: line 50, col 9, \'socket\' is not defined.\nviews/dashboard.js: line 51, col 9, \'socket\' is not defined.\nviews/dashboard.js: line 7, col 48, \'data\' is defined but never used.\nviews/dashboard.js: line 13, col 45, \'data\' is defined but never used.\n\n13 errors'); 
  });

});
define('client/tests/views/process/edit.jshint', function () {

  'use strict';

  module('JSHint - views/process');
  test('views/process/edit.js should pass jshint', function() { 
    ok(true, 'views/process/edit.js should pass jshint.'); 
  });

});
define('client/tests/views/process/list.jshint', function () {

  'use strict';

  module('JSHint - views/process');
  test('views/process/list.js should pass jshint', function() { 
    ok(true, 'views/process/list.js should pass jshint.'); 
  });

});
define('client/tests/views/process/new.jshint', function () {

  'use strict';

  module('JSHint - views/process');
  test('views/process/new.js should pass jshint', function() { 
    ok(true, 'views/process/new.js should pass jshint.'); 
  });

});
define('client/views/dashboard', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        didInsertElement: function didInsertElement() {
            var controller = this.get("controller");

            socket.on("service_started", (function (data) {
                this.updateUI(function (model) {
                    controller.set("model", model);
                });
            }).bind(this));

            socket.on("service_died", (function (data) {
                this.updateUI(function (model) {
                    controller.set("model", model);
                });
            }).bind(this));

            socket.on("log", (function (data) {

                controller.get("logs").pushObject(data);

                // Cap The Amount of Logs to Hold In The Front End
                if (controller.get("logs").length > 1500) {
                    controller.get("logs").shift();
                }

                this.$("#" + data.id).addClass("activity");

                setTimeout((function () {
                    this.$("#" + data.id).removeClass("activity");
                }).bind(this), 1000);
            }).bind(this));

            socket.on("pmem", (function (data) {
                controller.updatePMEM(data);
            }).bind(this));

            socket.on("pcpu", function (data) {
                controller.updatePCPU(data);
            });

            Ember['default'].$("li.active").removeClass("active");
            Ember['default'].$("#dashboard").addClass("active");
        },
        willClearRender: function willClearRender() {
            socket.off("service_started");
            socket.off("service_died");
            socket.off("pmem");
            socket.off("pcpu");
        },

        updateUI: function updateUI(callback) {
            Ember['default'].$.getJSON("/dashboard").then(function (alive) {

                alive.processes.forEach(function (process) {
                    if (alive.running.findBy("id", process.id)) {
                        process.alive = true;
                    } else {
                        process.alive = false;
                    }
                });

                callback(alive);
            });
        }
    });

});
define('client/views/process/edit', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        didInsertElement: function didInsertElement() {

            (function () {
                // @this --> controller
                this.set("cwd", this.get("model.cwd")).set("name", this.get("model.name")).set("args", this.get("model.args").join(", ")).set("command", this.get("model.command"));
            }).call(this.get("controller"));
        }
    });

});
define('client/views/process/list', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        didInsertElement: function didInsertElement() {
            Ember['default'].$("li.active").removeClass("active");
            Ember['default'].$("#processes").addClass("active");
        }
    });

});
define('client/views/process/new', ['exports', 'ember'], function (exports, Ember) {

    'use strict';

    exports['default'] = Ember['default'].View.extend({
        didInsertElement: function didInsertElement() {
            Ember['default'].$("li.active").removeClass("active");
            Ember['default'].$("#process").addClass("active");
        }
    });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('client/config/environment', ['ember'], function(Ember) {
  var prefix = 'client';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("client/tests/test-helper");
} else {
  require("client/app")["default"].create({"name":"client","version":"0.0.0.432e673b"});
}

/* jshint ignore:end */
//# sourceMappingURL=client.map