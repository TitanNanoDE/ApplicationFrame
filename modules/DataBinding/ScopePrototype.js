import { parseExpression } from './Parser';
import { recycle, watcherList, destoryScope } from './Bind.js';

/**
* Prototype for data binding scopes.
*/
let ScopePrototype = {

    /**
    * will apply the current state of the bound model.
    *
    * @param {function} [fn]            function to execute before rendering
    * @param {boolean} [localRecycle]   only recycle the current scope
    *
    * @return {void}
    */
    __apply__ : function(fn, localRecycle){
        if (fn) {
            fn();
        }

        return recycle(localRecycle ? this : null);
    },

    __watch__ : function(expression, cb) {
        if (!watcherList.has(this)) {
            watcherList.set(this, []);
        }

        watcherList.get(this).push({
            expression : expression,
            cb : cb
        });
    },

    __destroy__ : function(inProgress) {
        return destoryScope(this, inProgress);
    },

    /**
    * resolves when the expression returns not undefined or null
    *
    * @param  {string|Function}   expression the expression to evaluate
    *
    * @return {Promise}                      resolves when stable
    */
    require: function(expression) {
        return new Promise((done) => {
            let value = null;

            if (typeof expression === 'function') {
                value = expression();
            } else {
                value = parseExpression(expression, this);
            }

            if (value !== undefined && value !== null) {
                done(value);
            }
        });
    }
};

export default ScopePrototype;
