exports = module.exports = function rewrap(source, options){
    return new Rewrap(source, options);
};

const Rewrap = exports.Rewrap = require('./Rewrap');

const {assign} = Object;

exports.util = require('./util');

const re = exports.re = new Rewrap('', 're');
const wrap = exports.wrap = new Rewrap('', 'wrap');

for (let method of 'rewrap regexp or and not any some optional repeat paren parenMe mayParen reverse'.split(' ')) {
    exports[method] = wrap[method].bind(wrap);
}