import { hasPrototype } from './make';

export default {
    error(...args) {
        let level = 0;

        if(hasPrototype(args[args.length - 1], Number)) {
            level = args.pop();
        }

        level += 1;

        let stackTrace = (new Error()).stack.split('\n');

        stackTrace = stackTrace.slice(level, stackTrace.length);

        args.push(`\n\n${  stackTrace.join('\n')}`);

        console.error(...args);
    }
};
