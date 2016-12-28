'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});


let binaryToHex = function (buffer) {
    let result = '';

    // choose chunk size
    if (buffer.length * 8 % 32 === 0) {
        buffer = new Uint32Array(buffer);
    } else if (buffer.length * 8 % 16 === 0) {
        buffer = new Uint16Array(buffer);
    } else {
        buffer = new Uint8Array(buffer);
    }

    buffer.forEach(chunk => {
        chunk = chunk.toString(16);

        while (chunk.length < buffer.BYTES_PER_ELEMENT * 2) {
            chunk = '0' + chunk;
        }

        result += chunk;
    });

    return result;
};

const sha256Native = exports.sha256Native = function (data) {
    if (typeof data === 'string') {
        data = new TextEncoder('utf-8').encode(data);
    }

    return window.crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
        return binaryToHex(hashBuffer);
    });
};