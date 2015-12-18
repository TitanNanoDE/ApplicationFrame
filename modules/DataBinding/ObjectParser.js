
/**
 * Parses an object expression
 *
 * @param {string} source
 * @param {ScopePrototype} scope
 */
let ObjectParser = function(source){
    let target = null;
    let key = false;
    let read = true;
    let skip = true;
    let keyBuffer = '';
    let valueBuffer = '';
    let run = false;

    source.split('').forEach((char) => {
        if (run) {
            if (char === '{') {
                target = {};
                key = true;
            } else if(char === ' ' && !skip) {
                read = false;
            } else if(key && read) {
                keyBuffer += char;
                skip = false;
            } else if(char === ':') {
                skip = read = true;
                key = false;
            } else if(char === ',') {
                target[keyBuffer] = valueBuffer;
                keyBuffer = valueBuffer = '';
                key = skip = true;
            } else if(char === '}') {
                target[keyBuffer] = valueBuffer;
                run = false;
            } else if(!key && read) {
                valueBuffer += char;
                skip = false;
            }
        }
    });

}

export default ObjectParser;
