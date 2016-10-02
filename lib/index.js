exports = module.exports = require('./define');

exports._registry = exports.re._registry = exports.wrap._registry = require('./builtins');
exports.register = require('./register');