import WorkerStorage from './lib/WorkerStorage';
import { ServiceWorker } from './index';
import InjectionReceiver from '../core/InjectionReceiver';

const FIVE_MINUTES = 1000 * 60 * 5;

export const CacheMeta = {
    __proto__: InjectionReceiver,
};

const meta = CacheMeta.constructor();

// [meta*]
export const Cache = {
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
            .or('key').equals('cacheName')
            .get().then(([cacheUpdate, staticFileBuildId, cacheUrl, cacheName]) => {
                return Promise.all([caches.has(cacheName.value), cacheUpdate, staticFileBuildId, cacheUrl]);
            }).then(([hasCache, cacheUpdate, staticFileBuildId, cacheUrl]) => {
                if (!cacheUpdate || !staticFileBuildId || !cacheUrl) {
                    return Promise.reject();
                }

                if (!hasCache) {
                    return this.register(cacheUrl);
                }

                if ((Date.now() - cacheUpdate.value) < FIVE_MINUTES) {
                    return;
                }

                return fetch(cacheUrl.value)
                    .then(response => response.json())
                    .then(manifest => {
                        if (manifest.buildId === staticFileBuildId.value) {
                            return WorkerStorage
                                .write('config', { key: 'cacheUpdate', value: Date.now() })
                                .then(() => Promise.reject());
                        }

                        console.log('[SW] updating static files...');

                        return Promise.all([manifest, caches.open(manifest.name)]);
                    })
                    .then(([manifest, cache]) => Promise.all([manifest, cache.addAll(manifest.staticFiles)]))
                    .then(([manifest]) => {
                        meta.injected(ServiceWorker).emit('update-available');

                        return Promise.all([
                            WorkerStorage.write('config', { key: 'cacheUpdate', value: Date.now() }),
                            WorkerStorage.write('config', { key: 'staticFileBuildId', value: manifest.buildId }),
                            WorkerStorage.write('config', { key: 'cacheName', value: manifest.name })
                        ]);
                    }).catch((error) => error && console.error(error));
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
            .then(([cacheName]) => {
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
