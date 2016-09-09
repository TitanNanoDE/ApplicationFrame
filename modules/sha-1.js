
/**
 * casts any number to an unsigned 32-bit integer
 *
 * @param  {number} value any numeric value
 *
 * @return {number}       an int32 number
 */
let uint32 = function(value) {
    //cast to integer
    value = value | 0;

    //make value unsigned
    value = value >>> 0;

    //limit to 32 bit
    value = value % Math.pow(2, 32);

    return value;
}

/**
 * rotates the bits of an uint32 value to the left.
 *
 * @param  {number} value should be uint to prevent unwanted side effects
 * @param  {number} amount the amount of bits to shift <= 32
 *
 * @return {number}       the rotated value already casted to uint32
 */
let leftRotateBits = function(value, amount) {
    value = (value << amount) | (value >>> 32 - amount);
    value = uint32(value);

    return value;
}

/**
 * makes sure a hex value is 32-bit long.
 *
 * @param  {string} value a hex string
 *
 * @return {string}       a hex string which is definetely 32-bit long
 */
let hex32Bit = function(value) {
    while (value.length * 4 < 32) {
        value = '0' + value;
    }

    return value;
}

/**
 * makes sure a hex value is 32-bit long.
 *
 * @param  {string} value a hex string
 *
 * @return {string}       a hex string which is definetely 32-bit long
 */
let hex64Bit = function(value) {
    while (value.length * 4 < 64) {
        value = '0' + value;
    }

    return value;
}

/**
 * creates a new array buffer from the utf-8 encoded string.
 *
 * @param  {string} value the original value
 *
 * @return {ArrayBuffer}       the encoded value
 */
let stringToBuffer = function(value) {
    // make sure every character is only 8 bit long
    value = unescape(encodeURIComponent(value));

    let bufferView = new Uint8Array(value.length);

    // push message into buffer
    for (let i = 0; i < value.length; i++) {
        bufferView[i] = value.charCodeAt(i);
    }

    return bufferView.buffer;
}

/**
 * the sha-1 algorithm.
 *
 * @param  {(ArrayBuffer|string)} message the message to hash
 *
 * @return {string}         the hex representation of the hash value
 */
let sha1 = function(message) {

    if (typeof message === 'string') {
        message = stringToBuffer(message);
    }

    // initial values
    let h0 = 0x67452301;
    let h1 = 0xEFCDAB89;
    let h2 = 0x98BADCFE;
    let h3 = 0x10325476;
    let h4  = 0xC3D2E1F0;

    let messageLength = message.byteLength;
    let bufferSize = 0;
    let buffer = null;
    let view = null;

    // calculate buffer size. First in bit and then convert to byte.
    bufferSize = (messageLength + 1) * 8;
    bufferSize = bufferSize + (448 - (bufferSize % 512)) + 64;
    bufferSize = bufferSize / 8;
    buffer = new ArrayBuffer(bufferSize);
    view = new Uint8Array(buffer);

    //apply data to our local buffer
    view.set(new Uint8Array(message), 0);

    // append the 1 bit. No idea why this is not just a single bit.
    view[messageLength] = 0x80;


    //reorder bytes
    for(let i = 0; i < messageLength + 1; i+= 4) {
        let temp = 0;

        temp = view[i];
        view[i] = view[i+3];
        view[i+3] = temp;

        temp = view[i+1];
        view[i+1] = view[i+2];
        view[i+2] = temp;
    }

    //append the message length
    view = new Uint32Array(buffer);
    let length = hex64Bit((messageLength * 8).toString(16));
    view[view.length - 2] = parseInt(length.substring(0, length.length - 8), 16);
    view[view.length - 1] = parseInt(length.substring(length.length - 8), 16);

    // process each chunk
    for (let i = 0; i < bufferSize / (512 / 8); i++) {
        let a = h0;
        let b = h1;
        let c = h2;
        let d = h3;
        let e = h4;
        let temp = 0;

        view = new Uint32Array(80);
        view.set(new Uint32Array(buffer.slice(i * 512, (i + 1 ) * 512)), 0);

        for (let i = 16; i < 80; i++) {
            view[i] = leftRotateBits(view[i - 3] ^ view[i - 8] ^ view[i - 14] ^ view[i - 16], 1);
        }

        for (let i = 0; i < 80; i++) {
            let f = null;
            let k = null;

            if (i > -1 && i < 20) {
                f = uint32((b & c) ^ (~b & d))
                k = 0x5A827999;
            } else if (i > 19 && i < 40) {
                f = uint32(b ^ c ^ d);
                k = 0x6ED9EBA1;
            } else if (i > 39 && i < 60) {
                f = uint32((b & c) ^ (b & d) ^ (c & d));
                k = 0x8F1BBCDC;
            } else if (i > 59 && i < 80) {
                f = uint32(b ^ c ^ d);
                k = 0xCA62C1D6;
            }

            temp = uint32(leftRotateBits(a, 5) + f + e + k + view[i]);
            e = uint32(d);
            d = uint32(c);
            c = leftRotateBits(b, 30);
            b = uint32(a)
            a = uint32(temp);
        }

        h0 = uint32(h0 + a);
        h1 = uint32(h1 + b);
        h2 = uint32(h2 + c);
        h3 = uint32(h3 + d);
        h4 = uint32(h4 + e);
    }

    return hex32Bit(h0.toString(16)) + hex32Bit(h1.toString(16)) + hex32Bit(h2.toString(16)) + hex32Bit(h3.toString(16)) + hex32Bit(h4.toString(16));
}

export default sha1;
