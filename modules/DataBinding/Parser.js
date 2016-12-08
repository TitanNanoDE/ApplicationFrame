/**
 * @module DataBinding/Parser
 */

/**
 * Parses an object expression
 *
 * @param {string} source - the string to parse.
 * @return {Object} the parsed result.
 */
export let ObjectParser = function(source){
    let target = null;
    let key = false;
    let keyBuffer = '';
    let valueBuffer = '';
    let run = true;

    source.split('').forEach((char) => {
        if (run) {
            if (char === '{') {
                target = {};
                key = true;
            } else if(char === ':') {
                key = false;
            } else if(char === ',') {
                target[keyBuffer.trim()] = valueBuffer.trim();
                keyBuffer = valueBuffer = '';
                key = true;
            } else if(char === '}') {
                target[keyBuffer.trim()] = valueBuffer.trim();
                run = false;
            } else if(key) {
                keyBuffer += char;
            } else if(!key) {
                valueBuffer += char;
            }
        }
    });

    return target;
};

/**
 * Parses a given expression in the context of the given scope.
 *
 * @param {string} expression - the expression to parse.
 * @param {ScopePrototype} scope - the scope on which the expression should be parsed.
 * @return {*} the result value.
 */
export let parseExpression = function(expression, ...contexts){
	let chain = expression.match(/\w+(?:\([^)]*\))*/g) || [];
    let scope = null;
    let functionTest = /\(([^)]*)\)/;

    for (let i = 0; i < contexts.length; i++) {
        scope = contexts[i];

        chain.forEach((item) => {
            let pos = item.search(functionTest);

            if (scope) {
                if (pos > 0) {
                    let args = item.match(functionTest)[1].split(',').map(item => item.trim());
                    let scopeChild = scope[item.substring(0, pos)];

                    if (scopeChild) {
                        args = args.map(arg => parseExpression(arg, ...contexts));
                        scope = scopeChild.apply(scope, args);
                    } else {
                        return null;
                    }
                } else {
                    scope = scope[item];
                }
            }
        });

        if (scope !== null && scope !== undefined) {
            break;
        }
    }

    return (scope !== null && typeof scope !== "undefined") ? scope : '';
};

/**
 * Assings an value to an expression in an given scope
 *
 * @param {string} expression the expression on whith the value should be assigned
 * @param {ScopePrototype} scope the scope to operate on
 * @param {string} value the value to assign
 *
 * @return {void}
 */
export let assignExpression = function(expression, scope, value){
    let chain = expression.split('.');

    chain.forEach((property, index) => {
        if (chain.length -1 !== index) {
            scope = scope[property];
        } else {
            scope[property] = value;
        }
    });
}
