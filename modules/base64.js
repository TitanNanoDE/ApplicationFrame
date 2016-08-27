/**
 * @module Base64
 * @version v1.2
 * @description part of the ApplicationFrame
 * @copyright by Jovan Gerodetti (TitanNano.de)
 * @license The following Source is licensed under the Appache 2.0 License. - http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * [Base64 description]
 *
 * @namespace
 * @static
 */
let Base64 = {

    /**
     * Decodes a base64 string to a bye buffe
     *
     * @param  {string} string the data to decode
     *
     * @return {ArrayBuffer} the decoded data
     */
    decode : function(string){
        let catalog = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let buffer = new ArrayBuffer((string.length * 6) / 8);
        let viewer = new Int8Array(buffer);
        let counter = 0;
        let freeBytes = 0;

        if (string.match(/=/g) !== null) {
            freeBytes = string.match(/=/g).length;
        }

        string.replace(/=/g, '');

        for (let i = 0; i < string.length; i += 4) {
            let x, oB1, oB2, oB3, oB4, nB1, cache, nB2, nB3;

            x = (string[i] === '+') ? '\\+' : string[i];
            oB1= catalog.search(x);

            x = (string[i+1] === '+') ? '\\+' : string[i+1];
            oB2 = catalog.search(x);

            x = (string[i+2] === '+') ? '\\+' : string[i+2];
            oB3 = catalog.search(x);

            x = (string[i+3] === '+') ? '\\+' : string[i+3];
            oB4 = catalog.search(x);


// ----------------------------- Handling original Byte 1 -----------------------------
            nB1 = oB1 << 2;

// ----------------------------- Handling original Byte 2 -----------------------------
            cache = oB2 >> 4;
            nB1 = nB1 | cache;

            nB2 = oB2 << 4;

// ----------------------------- Handling original Byte 3 & 4 -----------------------------
            cache = oB3 >> 2;
            nB2 = nB2 | cache;

            nB3 = oB3 << 6;
            nB3 = nB3 | oB4;


            viewer[counter] = nB1;
            counter += 1;

            viewer[counter] = nB2;
            counter += 1;

            viewer[counter] = nB3;
            counter += 1;
        }

        buffer = buffer.slice(0, buffer.byteLength - freeBytes);

        return buffer;
    }
};

export default Base64;
