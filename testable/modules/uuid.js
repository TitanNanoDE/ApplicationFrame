'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.v5 = exports.parse = undefined;

var _make = require('../util/make.js');

var _sha = require('./sha-1.js');

var _sha2 = _interopRequireDefault(_sha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @module Uuid
 */

const UUID_SIZE = 16; // 16 byte / 128 bit

/** @lends module:Uuid~ReadBytesOfHexString# */
let ReadBytesOfHexString = {

    /**
     * the remaining hex string data
     *
     * @type {string}
     */
    _value: null,

    /**
     * [_make description]
     *
     * @constructs
     *
     * @param  {string} value a hex string
     *
     * @return {void}
     */
    _make: function (value) {
        this._value = value;
    },

    /**
     * reads the lowest byte from the hex string, expecting bigendian notation.
     *
     * @return {number} uint8
     */
    readByte: function () {
        let byte = parseInt(this._value.substring(this._value.length - 2), 16);
        this._value = this._value.substring(0, this._value.length - 2);

        return byte >>> 0;
    }
};

let hex8Bit = function (value) {
    while (value.length * 4 < 8) {
        value = '0' + value;
    }

    return value;
};

let hex16Bit = function (value) {
    while (value.length * 4 < 16) {
        value = '0' + value;
    }

    return value;
};

let hex32Bit = function (value) {
    while (value.length * 4 < 32) {
        value = '0' + value;
    }

    return value;
};

let hex48Bit = function (value) {
    while (value.length * 4 < 32) {
        value = '0' + value;
    }

    return value;
};

let parse = exports.parse = function (uuid) {
    let index = 0;
    let buffer = new Uint8Array(UUID_SIZE);
    let [time_low, time_mid, time_hi_and_version, clock_seq, node] = uuid.split('-');

    let pushToBuffer = function (byte) {
        buffer[index++] = parseInt(byte, 16);
    };

    hex32Bit(time_low || '').match(/.{1,2}/g).reverse().forEach(pushToBuffer);
    hex16Bit(time_mid || '').match(/.{1,2}/g).reverse().forEach(pushToBuffer);
    hex16Bit(time_hi_and_version || '').match(/.{1,2}/g).reverse().forEach(pushToBuffer);
    hex16Bit(clock_seq || '').match(/.{1,2}/g).reverse().forEach(pushToBuffer);
    hex48Bit(node || '').match(/.{1,2}/g).reverse().forEach(pushToBuffer);

    return buffer.buffer;
};

/**
 * [v5 description]
 *
 * @param  {string} namespace the name space of the new uuid
 * @param  {string} name      the name of the resource of this uuid
 *
 * @return {string}           uuid string
 */
let v5 = exports.v5 = function (namespace, name) {
    let nameValue = new ArrayBuffer(name.length);
    let namespaceValue = parse(namespace);
    let completeValue = new Uint8Array(nameValue.byteLength + namespaceValue.byteLength);
    let uuidBuffer = new Uint8Array(UUID_SIZE);
    let view = null;
    let hash = null;

    view = new Uint8Array(nameValue);

    for (let i = 0; i < name.length; i++) {
        view[i] = name.charCodeAt(i);
    }

    completeValue.set(new Uint8Array(namespaceValue), 0);
    completeValue.set(new Uint8Array(nameValue), namespaceValue.byteLength);

    hash = (0, _sha2.default)(completeValue.buffer);
    hash = (0, _make.Make)(ReadBytesOfHexString)(hash);

    //time_low (0 - 3)
    for (let i = 0; i < 4; i++) {
        uuidBuffer[i] = hash.readByte();
    }

    // time_mid (4 - 5)
    for (let i = 4; i < 6; i++) {
        uuidBuffer[i] = hash.readByte();
    }

    // time_hi_and_version (6 - 7)
    for (let i = 6; i < 8; i++) {
        uuidBuffer[i] = hash.readByte();
    }

    uuidBuffer[7] = uuidBuffer[7] & 0x0F | 0x50;

    // clock_seq_hi_and_reserved (8)
    uuidBuffer[8] = hash.readByte() & 0x3F | 0x80;

    // clock_seq_low (9)
    uuidBuffer[9] = hash.readByte();

    // node (10 - 15)
    for (let i = 10; i < 16; i++) {
        uuidBuffer[i] = hash.readByte();
    }

    let time_low = hex8Bit(uuidBuffer[3].toString(16)) + hex8Bit(uuidBuffer[2].toString(16)) + hex8Bit(uuidBuffer[1].toString(16)) + hex8Bit(uuidBuffer[0].toString(16));
    let time_mid = hex8Bit(uuidBuffer[5].toString(16)) + hex8Bit(uuidBuffer[4].toString(16));
    let time_hi_and_version = hex8Bit(uuidBuffer[7].toString(16)) + hex8Bit(uuidBuffer[6].toString(16));
    let clock_seq_hi_and_reserved = hex8Bit(uuidBuffer[8].toString(16));
    let clock_seq_low = hex8Bit(uuidBuffer[9].toString(16));
    let node = hex8Bit(uuidBuffer[15].toString(16)) + hex8Bit(uuidBuffer[14].toString(16)) + hex8Bit(uuidBuffer[13].toString(16)) + hex8Bit(uuidBuffer[12].toString(16)) + hex8Bit(uuidBuffer[11].toString(16)) + hex8Bit(uuidBuffer[10].toString(16));

    return `${ time_low }-${ time_mid }-${ time_hi_and_version }-${ clock_seq_hi_and_reserved }${ clock_seq_low }-${ node }`;
};