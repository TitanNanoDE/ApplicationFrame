import WorkerStorage from './lib/WorkerStorage';
import ServiceWorkerEventTarget from './lib/ServiceWorkerEventTarget';

const FIVE_MINUTES = 1000 * 60 * 5;

const Cache = {
    register(manifestUrl) {
        return fetch(manifestUrl)
            .then(response => response.json())
            .then(manifest => Promise.all([caches.open(manifest.name), manifest]))
            .then(([cache, manifest]) => [manifest, cache.addAll(manifest.staticFiles)])
            .then(([manifest]) => {
                WorkerStorage.write('config', { key: 'cacheName', value: manifest.name });
                WorkerStorage.write('config', { key: 'cacheUpdate', value: Date.now() });
                WorkerStorage.write('config', { key: 'cacheUrl', value: manifestUrl });
                WorkerStorage.write('config', { key: 'staticFileBuildId', value: manifest.buildId });
            });
    },

    cleanUp() {
        return Promise.all([
            caches.keys(),
            WorkerStorage.read('config').where('key').equals('cacheName').get()
        ]).then(([keys, [currentKey]]) => keys.forEach(key => key !== currentKey.value && caches.delete(key)));
    },

    init() {
        return WorkerStorage.read('config')
            .where('key').equals('cacheUpdate')
            .or('key').equals('staticFileBuildId')
            .or('key').equals('cacheUrl')
            .get().then(([cacheUpdate, staticFileBuildId, cacheUrl]) => {
                if ((Date.now() - cacheUpdate.value) < FIVE_MINUTES) {
                    return;
                }

                return fetch(cacheUrl.value)
                    .then(response => response.json())
                    .then(manifest => {
                        if (manifest.buildId > staticFileBuildId.value) {
                            console.log('[SW] updating static files...');

                            return Promise.all([manifest, caches.open(manifest.name)]);
                        }

                        return Promise.reject();
                    })
                    .then(([manifest, cache]) => cache.addAll(manifest.staticFiles))
                    .then(() => ServiceWorkerEventTarget.emit('update-available'))
                    .catch((error) => error && console.error(error));
            });
    },

    matchStatic(request) {
        const requestUrl = request.url.replace(/#.*$/, '');
        let indexRequest = null;

        if (requestUrl.search(/\/$/) > -1) {
            indexRequest = new Request(`${requestUrl  }index.html`, {
                method: request.method,
                body: request.body,
                mode: (request.mode === 'navigate' ? 'cors' : request.mode),
                credentials: request.credentials,
                redirect: request.redirect,
                referrer: request.referrer,
                referrerPolicy: request.referrerPolicy,
                integrity: request.integrity,
                cache: request.cache,
                keepalive: request.keepalive,
                signal: request.signal,
            });
        }

        return WorkerStorage.read('config').where('key').equals('cacheName').get()
            .then(cacheName => {
                const queries = [];

                queries.push(caches.match(request, {
                    ignoreSearch: true,
                    cacheName: cacheName.value
                }));

                if (indexRequest) {
                    queries.push(caches.match(indexRequest, {
                        cacheName: cacheName.value,
                    }));
                }

                return Promise.all(queries);
            }).then(responses => responses.find(item => !!item));
    }
};

export default Cache;
