/**
 * @file ApplicationScopeInterface
 * @deprecated Don't use this file anymore. I will be removed soon.
 */

import { Make } from '../../util/make.js';
import Scopes from '../objects/Scopes.js';
import ApplicationScopePrivatePrototype from './ApplicationScopePrivatePrototype.js';
import Interface from './Interface.js';
import Extendables from '../objects/Extendables.js';
import Engine from '../objects/Engine.js';

let ApplicationScopeInterface = Make({
    on : function(type, listener){
        var scope = Scopes.get(this);

        if (!scope.listeners[type]) {
            scope.listeners[type] = [];
        }

        scope.listeners[type].push(listener);

        return this;
    },

    emit : function(type, data){
        let scope = Scopes.get(this);

        if (scope.listeners[type]) {
            scope.listeners[type].forEach(f => {
                setTimeout(function(){
                    f(data);
                }, 0);
            });
        }
    },

    thread : function(f){
        var scope= Scopes.get(this);

        scope.workers.push(Make(Extendables.ScopeWorker)(f));

        return this;
    },

    prototype : function(object){
        Scopes.get(this).private = Make(object, ApplicationScopePrivatePrototype)(Scopes.get(this));

        return this;
    },

    main : function(f){
        var scope= Scopes.get(this);

        if(scope.private === null)
            scope.private = Make(ApplicationScopePrivatePrototype)(scope);

        scope.thread= f.bind(scope.private);

        Engine.ready.then(scope.thread);

        return this;
    },

    module : function(name, dependencies, f){
        var scope = Scopes.get(this);

        scope.modules.on('available', dependencies).then(function(){
            scope.modules.add(new Promise(function(ready){
                f(scope, ready);
            }));
        });

        return this;
    },

    terminate : function(reason){
        this.emmit('terminate', reason);
    }

}, Interface).get();

export default ApplicationScopeInterface;
