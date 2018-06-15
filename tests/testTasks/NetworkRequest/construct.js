/* global NetworkRequest */
global.NetworkRequest = NetworkRequest;
global.instance = Object.create(NetworkRequest).constructor('https://example.org', { method: 'POST', type: 'json' });
