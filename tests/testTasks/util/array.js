/* eslint no-sparse-arrays: 0 */

const a = [1, , 2, , 3, 'end'];
const b = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const result = module.exports.assignEmpty(a, b);

global.returnsArray = result === a;
global.result = result;
