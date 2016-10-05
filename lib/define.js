exports = module.exports = function rewrap(source, sourceStyle='wrap', flags='', registry={}){
    return new Rewrap(source, sourceStyle, flags, registry);
};

const Rewrap = exports.Rewrap = require('./Rewrap');

const re = exports.re = new Rewrap('', 're', '', {});
const wrap = exports.wrap = new Rewrap('', 'wrap', '', {});

for (let method of 'rewrap regexp or and not any some optional repeat paren parenMe'.split(' ')) {
    exports[method] = wrap[method].bind(wrap);
}