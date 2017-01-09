import RouteChangeType from './RouteChangeType';

const processingMap = new Map([
    [RouteChangeType.ADD, processEnterActions],
    [RouteChangeType.LOST, processLeaveActions]
]);

const routeItemWasEntered = function(item, path) {
    return item.path == path && item.enter && (!item.persistent || !item.active);
}

const routeItemWasLost = function(item, path) {
    return item.path === path && item.exit;
}

const processEnterActions = function(items, path) {
    items.forEach((item) => {
        if (routeItemWasEntered(item, path)) {
            item.enter(path);
            if(item.persistent) item.active= true;
        }
    });
}

const processLeaveActions = function(items, path, count) {
    items.forEach((item) => {
        if (routeItemWasLost(item, path)) {
            if (!item.persistent || count === 1) {
                item.exit(path);

                if (item.persistent) {
                    path = path.split('/');
                    path.pop();
                    delete this.state.overrides[path.join('/')];
                    item.active = false;
                }

            } else {
                path = path.split('/');
                path.pop();
                this.state.overrides[path.join('/')] = path;
            }
        }
    });
}

const RouteChange = {

    type: null,
    path: '',
    state: null,

    constructor(type, path, state){
        this.type = type;
        this.path = path;
        this.state = state;
    },

    trigger(count) {
		let path= this.path;

        let type = Object.values(RouteChangeType).find(type => type === this.type);

        if (type) {
            processingMap.get(type)(this.state.actions, path, count);

		} else {
		    console.error('[AF-Router]', 'unknown RouteChangeType!', this.type);
		}
	}
};

export default RouteChange;
