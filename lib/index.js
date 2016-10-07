const rewrap = exports = module.exports = function rewrap(source, sourceStyle='wrap', flags='', registry=rewrap._registry){
    return new Rewrap(source, sourceStyle, flags, registry);
};

const {paren, and, or} = exports.util = require('./util');

const Rewrap = exports.Rewrap = require('./Rewrap');

const re = exports.re = function rewrap(source, flags='', registry=re._registry) {
    return new Rewrap(source, 're', flags, registry)
};

const wrap = exports.wrap = rewrap;

re.or = (...items) =>  new Rewrap(or(items, 're', ''));
re.and = (...items) =>  new Rewrap(and(items, 're', ''));
re.paren = (item, left='(:') => new Rewrap(paren(item, left, 're', ''));
re.not = (item) => new Rewrap(item, 're', '').not();
re.lookAhead = (item) => new Rewrap(item, 're', '').lookAhead();
re.optional = (item) => new Rewrap(item, 're', '').optional();
re.any = (item) => new Rewrap(item, 're', '').any();
re.some = (item) => new Rewrap(item, 're', '').some();
re.repeat = (min, max) => new Rewrap(item, 're', '').repeat(min, max);
re.times = (count) => new Rewrap(item, 're', '').times(count);
re.timesMore = (count) => new Rewrap(item, 're', '').timesMore(count);

wrap.registry = (registry) => (wrap._registry = registry, wrap);
wrap.or = (...items) =>  new Rewrap(or(items, 'wrap', '', wrap._registry));
wrap.and = (...items) =>  new Rewrap(and(items, 'wrap', '', wrap._registry));
wrap.paren = (item, left='(:') => new Rewrap(paren(item, left, 'wrap', '', wrap._registry));
wrap.not = (item) => new Rewrap(item, 'wrap', '', wrap._registry).not();
wrap.lookAhead = (item) => new Rewrap(item, 'wrap', '', wrap._registry).lookAhead();
wrap.optional = (item) => new Rewrap(item, 'wrap', '', wrap._registry).optional();
wrap.any = (item) => new Rewrap(item, 'wrap', '', wrap._registry).any();
wrap.some = (item) => new Rewrap(item, 'wrap', '', wrap._registry).some();
wrap.repeat = (min, max) => new Rewrap(item, 'wrap', '', wrap._registry).repeat(min, max);
wrap.times = (count) => new Rewrap(item, 'wrap', '', wrap._registry).times(count);
wrap.timesMore = (count) => new Rewrap(item, 'wrap', '', wrap._registry).timesMore(count);

rewrap._registry = wrap._registry = {};
const {register} = require('./path-value');
exports.register = register;


