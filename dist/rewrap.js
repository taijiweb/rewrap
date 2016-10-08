/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/assets/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!**********************!*\
  !*** ./lib/index.js ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var rewrap = exports = module.exports = function rewrap(source, sourceStyle = 'wrap', flags = null, registry = rewrap._registry) {
	    return new Rewrap(source, sourceStyle, flags, registry);
	};

	var { paren, and, or } = exports.util = __webpack_require__(/*! ./util */ 1);

	var Rewrap = exports.Rewrap = __webpack_require__(/*! ./Rewrap */ 3);

	var re = exports.re = function rewrap(source, flags = null, registry = wrap._registry) {
	    return new Rewrap(source, 're', flags, registry);
	};

	var wrap = exports.wrap = rewrap;

	re.or = (...items) => new Rewrap(or(items, 're', '', wrap._registry));
	re.and = (...items) => new Rewrap(and(items, 're', '', wrap._registry));
	re.paren = (item, left = '(:') => new Rewrap(paren(item, left, 're', '', wrap._registry));
	re.not = item => new Rewrap(item, 're', '', wrap._registry).not();
	re.lookAhead = item => new Rewrap(item, 're', '', wrap._registry).lookAhead();
	re.optional = item => new Rewrap(item, 're', '', wrap._registry).optional();
	re.any = item => new Rewrap(item, 're', '', wrap._registry).any();
	re.some = item => new Rewrap(item, 're', '', wrap._registry).some();
	re.repeat = (min, max) => new Rewrap(item, 're', '', wrap._registry).repeat(min, max);
	re.times = count => new Rewrap(item, 're', '', wrap._registry).times(count);
	re.timesMore = count => new Rewrap(item, 're', '', wrap._registry).timesMore(count);

	wrap.registry = registry => (wrap._registry = registry, wrap);
	wrap.or = (...items) => new Rewrap(or(items, 'wrap', '', wrap._registry));
	wrap.and = (...items) => new Rewrap(and(items, 'wrap', '', wrap._registry));
	wrap.paren = (item, left = '(:') => new Rewrap(paren(item, left, 'wrap', '', wrap._registry));
	wrap.not = item => new Rewrap(item, 'wrap', '', wrap._registry).not();
	wrap.lookAhead = item => new Rewrap(item, 'wrap', '', wrap._registry).lookAhead();
	wrap.optional = item => new Rewrap(item, 'wrap', '', wrap._registry).optional();
	wrap.any = item => new Rewrap(item, 'wrap', '', wrap._registry).any();
	wrap.some = item => new Rewrap(item, 'wrap', '', wrap._registry).some();
	wrap.repeat = (min, max) => new Rewrap(item, 'wrap', '', wrap._registry).repeat(min, max);
	wrap.times = count => new Rewrap(item, 'wrap', '', wrap._registry).times(count);
	wrap.timesMore = count => new Rewrap(item, 'wrap', '', wrap._registry).timesMore(count);

	rewrap._registry = wrap._registry = {};
	var { register } = __webpack_require__(/*! ./path-value */ 2);
	exports.register = register;

/***/ },
/* 1 */
/*!*********************!*\
  !*** ./lib/util.js ***!
  \*********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var { getValueByPath } = __webpack_require__(/*! ./path-value */ 2);

	exports.or = (items, style, flags, registry) => {

	    if (!items.length) return '';else if (items.length === 1) return parse(items[0], 0, null, style, flags, registry);

	    var branches = [],
	        result = { _sourceStyle: style, _flags: flags, _registry: registry },
	        regexpSources = [],
	        rewrapSources = [],
	        matchTotal = 0,
	        matchIndex2datapath = {};

	    for (var item of items) {
	        branches.push(parse(item, 0, null, style, flags, registry));
	    }

	    for (var branch of branches) {
	        regexpSources.push(branch._regexpSource);
	        rewrapSources.push(branch._rewrapSource);
	        var branchMatchIndex2datapath = branch.matchIndex2datapath;
	        for (var _i in branchMatchIndex2datapath) {
	            matchIndex2datapath[matchTotal + _i] = branchMatchIndex2datapath[_i];
	        }
	        matchTotal += branch.matchTotal;
	    }

	    result._regexpSource = regexpSources.join('|');
	    result._rewrapSource = rewrapSources.join('|');
	    result.matchTotal = matchTotal;
	    result.branchCount = rewrapSources;
	    result.matchIndex2datapath = matchIndex2datapath;
	    result.needParen = true;
	    result.needGroup = true;
	    result.isOr = true;
	    result._flags = result._flags || '';
	    return result;
	};

	var and = exports.and = (items, style, flags, registry) => {
	    if (!items.length) return '';else if (items.length === 1) return parse(items[0], 0, null, style, flags, registry);

	    var result = { _sourceStyle: style, _flags: flags, _registry: registry },
	        regexpSources = [],
	        rewrapSources = [],
	        matchTotal = 0,
	        matchIndex2dataPath = {};

	    for (var item of items) {
	        var itemResult = parse(item, 0, null, style, flags, registry);
	        if (itemResult.isOr) {
	            itemResult._regexpSource = '(?:' + itemResult._regexpSource + ')';
	            itemResult._rewrapSource = '(?:' + itemResult._rewrapSource + ')';
	        }
	        regexpSources.push(itemResult._regexpSource);
	        rewrapSources.push(itemResult._rewrapSource);
	        var itemMatchIndex2dataPath = itemResult.matchIndex2dataPath;
	        for (var _i2 in itemMatchIndex2dataPath) {
	            matchIndex2dataPath[matchTotal + _i2] = itemMatchIndex2dataPath[_i2];
	        }
	        matchTotal += itemResult.matchTotal;
	    }

	    result._regexpSource = regexpSources.join('');
	    result._rewrapSource = rewrapSources.join('');
	    result.matchTotal = matchTotal;
	    result.branchCount = rewrapSources;
	    result.matchIndex2dataPath = matchIndex2dataPath;
	    result.needParen = true;
	    result.needGroup = true;
	    result._flags = result._flags || '';
	    return result;
	};

	// add ( ... ), (?: ... ), (?= ... ) or (?! ... )
	// not include  [ ... ], which is different totally
	exports.paren = (item, left, style, flags, registry) => {
	    "use strict";

	    var right = ')';

	    var parseResult = parse(item, 0, null, style, flags, registry);

	    if (left === '(' && parseResult.needParen) {
	        parseResult._regexpSource = left + parseResult._regexpSource + right;
	        parseResult._rewrapSource = left + parseResult._rewrapSource + right;
	        parseResult.patternTotal = parseResult.patternTotal + 1;
	        parseResult.matchIndex2dataPath = addIndexMap(parseResult.matchIndex2dataPath);
	        parseResult.needParen = false;
	        parseResult.needGroup = false;
	    } else if (left === '(?:' && parseResult.needGroup) {
	        parseResult._regexpSource = left + parseResult._regexpSource + right;
	        parseResult._rewrapSource = left + parseResult._rewrapSource + right;
	        parseResult.needGroup = false;
	    } else if (left !== '(?:') {
	        parseResult._regexpSource = left + parseResult._regexpSource + right;
	        parseResult._rewrapSource = left + parseResult._rewrapSource + right;
	        parseResult.needGroup = false;
	    }

	    parseResult._flags = parseResult._flags || '';

	    return parseResult;
	};

	var parse = exports.parse = (source, index, stopChar, style, flags, registry) => {

	    if (source._rewrapSource != null) return source;else if (Object.prototype.toString.call(source) === '[object Array]') {
	        return and(source, 'wrap', flags, registry);
	    }

	    var sourceFlags = source.flags;
	    source = source.source || source;
	    var start = index;

	    var result = { _sourceStyle: style, _flags: flags, _registry: registry },
	        regexpSources = [],
	        rewrapSources = [],
	        matchTotal = 0,
	        matchIndex2dataPath = {};

	    var char = source[index];

	    var branchCount = 0,
	        branch = void 0;
	    while (1) {
	        branch = parseBranch(source, index, stopChar, style, flags, registry);
	        regexpSources.push(branch._regexpSource);
	        rewrapSources.push(branch._rewrapSource);
	        var branchMatchIndex2dataPath = branch.matchIndex2dataPath;
	        for (var _i3 in branchMatchIndex2dataPath) {
	            matchIndex2dataPath[matchTotal + _i3 * 1] = branchMatchIndex2dataPath[_i3];
	        }
	        matchTotal += branch.matchTotal;
	        branchCount++;
	        index = branch.stopIndex;
	        char = source[index];
	        if (char === '|') {
	            index++;
	            char = source[index];
	        } else if (!char || char === stopChar) {
	            break;
	        }
	    }

	    result.stopIndex = index;
	    result._regexpSource = regexpSources.join('|');
	    if (style === 're') {
	        result._rewrapSource = convertToRewrapSource(source.slice(start, index));
	    } else {
	        result._rewrapSource = source.slice(start, index);
	    }
	    result.matchTotal = matchTotal;
	    result.branchCount = rewrapSources;
	    result.matchIndex2dataPath = matchIndex2dataPath;
	    result.isOr = branchCount > 1;
	    result.needParen = branchCount > 1 || branch && branch.needParen;
	    result.needGroup = branchCount > 1 || branch && branch.needGroup;
	    result._flags = flags != null && flags || sourceFlags || '';
	    return result;
	};

	var parseBranch = (source, index, stopChar, style, flags, registry) => {
	    "use strict";

	    var result = {},
	        regexpSources = [],
	        matchTotal = 0,
	        matchIndex2dataPath = {},
	        start = index;

	    var char = source[index];
	    var segment = void 0,
	        segmentCount = 0;
	    while (1) {
	        segment = parseSegment(source, index, stopChar, style, flags, registry);
	        regexpSources.push(segment._regexpSource);
	        var segmentMatchIndex2dataPath = segment.matchIndex2dataPath;
	        for (var _i4 in segmentMatchIndex2dataPath) {
	            matchIndex2dataPath[matchTotal + _i4 * 1] = segmentMatchIndex2dataPath[_i4];
	        }
	        matchTotal += segment.matchTotal;
	        segmentCount++;
	        index = segment.stopIndex;
	        char = source[index];
	        if (!char || char === '|' || char === stopChar) break;
	    }
	    result.stopIndex = index;
	    result._regexpSource = regexpSources.join('');
	    if (style === 're') {
	        result._rewrapSource = convertToRewrapSource(source.slice(start, index));
	    } else {
	        result._rewrapSource = source.slice(start, index);
	    }
	    result.matchTotal = matchTotal;
	    result.matchIndex2dataPath = matchIndex2dataPath;
	    result.needParen = segmentCount > 1 || segment && segment.needParen;
	    result.needGroup = segmentCount > 1 || segment && segment.needGroup;
	    return result;
	};

	var parseSegment = (source, index, stopChar, style, flags, registry) => {
	    "use strict";

	    var base = parseSegmentBase(source, index, stopChar, style, flags, registry),
	        result = {},
	        regexpSource = base._regexpSource,
	        matchTotal = base.matchTotal,
	        matchIndex2dataPath = base.matchIndex2dataPath,
	        baseName = void 0,
	        dataName = void 0,
	        repeated = void 0,
	        needParen = base.needParen,
	        needGroup = base.needGroup;

	    index = base.stopIndex;

	    var i = parseDataName(source, index);
	    if (i) {
	        baseName = source.slice(index + 1, i);
	        if (base.needParen) {
	            matchIndex2dataPath = addIndexMap(matchIndex2dataPath, baseName);
	            regexpSource = '(' + regexpSource + ')';
	            matchTotal++;
	        } else {
	            matchIndex2dataPath[0] = baseName;
	        }
	        needParen = false;
	        needGroup = false;
	        index = i;
	        if (source[index] === '%') index++;
	    }

	    var repeatStart = index;

	    var char = source[index];
	    if (char === '*' || char === '+' || char === '?') {
	        repeated = true;
	        index++;
	    } else if (char === '{') {
	        var _i5 = matchAnyDigitChar(source, index + 2);
	        if (_i5 > index + 2) {
	            if (source[_i5] === ',') {
	                var j = matchAnyDigitChar(source, _i5 + 1);
	                if (j > _i5 + 1 && source[j] === '}') {
	                    repeated = true;
	                    index = j + 1;
	                }
	            } else if (source[_i5] === '}') {
	                repeated = true;
	                index = _i5 + 2;
	            }
	        }
	    }

	    if (repeated && source[index] === '?') {
	        index++;
	    }

	    var repeatStop = index;
	    var repeatSpan = source.slice(repeatStart, repeatStop);

	    regexpSource += repeatSpan;
	    if (style !== 're') {
	        i = parseDataName(source, index, style);
	        if (i) {
	            if (needParen || repeatSpan) {
	                dataName = source.slice(index + 1, i);
	                matchIndex2dataPath = addIndexMap(matchIndex2dataPath, dataName);
	                regexpSource = '(' + regexpSource + ')';
	                matchTotal++;
	                index = i;
	                if (source[index] === '%') index++;
	            } else {
	                matchIndex2dataPath[0] = dataName;
	            }
	            needParen = false;
	            needGroup = false;
	        }
	    }

	    result._regexpSource = regexpSource;
	    result.matchIndex2dataPath = matchIndex2dataPath;
	    result.matchTotal = matchTotal;
	    result.stopIndex = index;
	    result.needParen = needParen;
	    result.needGroup = needGroup;

	    return result;
	};

	var parseSegmentBase = (source, index, stopChar, style, flags, registry) => {
	    "use strict";

	    var result = {},
	        regexpSource = void 0,
	        start = index,
	        matchTotal = 0,
	        matchIndex2dataPath = {},
	        needParen = true,
	        needGroup = false;

	    var char = source[index];
	    if (!char || char === '|' || char === ')' || char === stopChar) {
	        regexpSource = '';
	    } else if (char === '[') {
	        while (1) {
	            index++;
	            char = source[index];
	            if (!char) throw 'expect ], unexpected end of text';
	            if (char === ']') {
	                if (!isEscaping(source, index)) {
	                    index++;
	                    break;
	                }
	            }
	        }
	        regexpSource = source.slice(start, index);
	    } else if (char === '(') {
	        var head = void 0;
	        char = source[index];
	        if (char === '?') {
	            index++;
	            char = source[index];
	            head = '(?';
	            if (char === '=' || char === '!') {
	                index++;
	                head += char;
	            }
	        } else {
	            head = '(';
	        }
	        var content = parse(source, index + head.length, ')', style, flags, registry);
	        if (head === '(') {
	            matchIndex2dataPath = addIndexMap(matchIndex2dataPath);
	            matchTotal = content.matchTotal + 1;
	            needParen = false;
	        } else {
	            matchIndex2dataPath = content.matchIndex2dataPath;
	            matchTotal = content.matchTotal;
	        }

	        regexpSource = head + content._regexpSource + ')';
	        index = content.stopIndex;
	        if (source[index] !== ')') throw 'expect )';
	        index++;
	    } else if (char === '*' || char === '+' || char === '?') {
	        throw `unexpected ${ char }`;
	    } else if (char === '\\') {
	        index++;
	        char = source[index];
	        if (char === 'x') {
	            index++;
	            if (!source[index].match(/0-9A-Fa-f/)) {} else {
	                index++;
	                if (!source[index].match(/0-9A-Fa-f/)) {
	                    result.content = `\\x${ hex1 }${ hex2 }`;
	                    index++;
	                }
	            }
	        } else if (char === 'u') {
	            index++;
	            char = source[index];
	            var unicode = flags.match(/u/i);
	            if (unicode && char === '{') {
	                var j = matchAnyHexChar(source, index);
	                var count = j - i;
	                if (count !== 4 && count !== 5) {
	                    throw 'expect 4 or 5 hex digits char';
	                } else {
	                    char = index[j];
	                    if (char === '}') {
	                        index = j;
	                    } else {
	                        throw 'expect } after "\\u{hhhh" or "\\u{hhhhh"';
	                    }
	                }
	            } else {
	                var text = souce.slice(index, index + 4);
	                if (!text.match(/[0-9A-Fa-f]{4}/)) {
	                    throw 'expect \\uhhhh';
	                }
	                index += 4;
	            }
	        }
	        regexpSource = source.slice(start, index);
	    } else {
	        if (char === '@' && style === 'wrap') {
	            var _i6 = matchIdentifierPath(source, index + 1);
	            if (_i6 > index + 1) {
	                var name = source.slice(index + 1, _i6);
	                var ref = getValueByPath(registry, name);
	                if (!ref) throw 'no definition for ' + name;
	                ref = parse(ref.source || ref, 0, null, 're', {});
	                regexpSource = ref._regexpSource;
	                needParen = ref.needParen;
	                needGroup = ref.needGroup;
	                matchIndex2dataPath = ref.matchIndex2dataPath;
	                matchTotal = ref.matchTotal;
	                index = _i6;
	                char = source[index];
	                if (char === '%') index++;
	            }
	        } else {
	            regexpSource = char;
	            index++;
	        }
	    }
	    result.matchIndex2dataPath = matchIndex2dataPath;
	    result.matchTotal = matchTotal;
	    result.needParen = needParen;
	    result.needGroup = needGroup;
	    result._regexpSource = regexpSource;
	    result.stopIndex = index;
	    return result;
	};

	var parseDataName = (source, index, style) => {
	    "use strict";

	    if (style === 're') {
	        return;
	    } else if (source[index] === '&') {
	        index++;
	        index = matchIdentifierPath(source, index);
	        return index;
	    }
	};

	var matchAnyHexChar = (text, i) => {
	    "use strict";

	    var char = void 0;
	    while ((char = text[i]) && char.match(hexRegexp)) {
	        i++;
	    }
	    return i;
	};

	var hexRegexp = /[0-9A-Fa-f]/;

	var matchAnyDigitChar = (text, index) => {
	    "use strict";

	    var char = void 0;
	    var i = index;
	    while ((char = text[i]) && char.match(digitRegexp)) {
	        i++;
	    }
	    return i;
	};

	var digitRegexp = /[0-9]/;

	var matchIdentifier = (text, i) => {
	    "use strict";

	    var char = text[i];

	    if (!char || !char.match(/[_A-Za-z]/)) return;

	    i++;
	    char = text[i];
	    while (char && char.match(/[_A-Za-z0-9]/)) {
	        i++;
	        char = text[i];
	    }

	    return i;
	};

	var matchIdentifierPath = (text, i) => {
	    "use strict";

	    i = matchIdentifier(text, i);
	    if (!i) return;

	    while (1) {
	        var result = i;
	        if (text[i] === '.') i++;
	        i = matchIdentifier(text, i);
	        if (!i) return result;
	    }
	};

	var addIndexMap = exports.addIndexMap = (matchIndex2dataPath, dataName) => {
	    "use strict";

	    var result = {};
	    for (var _i7 in matchIndex2dataPath) {
	        result['' + (_i7 * 1 + 1)] = matchIndex2dataPath[_i7];
	    }
	    if (dataName) result[0] = dataName;

	    return result;
	};

	// convert the regexp source to rewrap source
	// need escape @ and & to avoid conflicting with @rewrapRef and &dataPath
	var convertToRewrapSource = exports.convertToRewrapSource = (source, register, unicode) => {
	    if (!source) return '';
	    if (source._rewrapSource) return source._rewrapSource;
	    if (source instanceof RegExp) {
	        source = source.source;
	    }

	    var result = '',
	        i = 0,
	        char = source[i];
	    while (char) {
	        if (char === '@' || char === '&') {
	            // escape them to avoid conflicting with @rewrapRef and &dataPath
	            if (!isEscaping(source, i)) {
	                result += '\\' + char;
	            }
	        } else result += char;
	        i++;
	        char = source[i];
	    }

	    return result;
	};

	var isEscaping = (source, index) => {
	    var j = index - 1;
	    while (source[j] === '\\') {
	        j--;
	    }
	    return (index - j) % 2 === 0;
	};

/***/ },
/* 2 */
/*!***************************!*\
  !*** ./lib/path-value.js ***!
  \***************************/
/***/ function(module, exports) {

	"use strict";

	exports.getValueByPath = (data, path, defaultValue) => {
	    "use strict";

	    if (!data) return defaultValue;
	    if (typeof path === 'string') {
	        path = path.trim().split();
	    }

	    for (var item of path) {
	        if (data) data = data[item];
	    }

	    if (data == null) return defaultValue;else return data;
	};

	var setValueByPath = exports.setValueByPath = (data, path, value, maybeList) => {
	    "use strict";

	    if (typeof path === 'string') {
	        path = path.split(/\s+|\s*,\s*/);
	    }

	    var i = 0,
	        last = path.length - 1;
	    while (i < last) {
	        var item = path[i];
	        var holder = data[item];
	        if (holder && typeof holder !== 'object') throw 'type error: can not set value by path to non object.';
	        data = holder || (data[item] = {});
	        i++;
	    }

	    var lastItem = path[last];
	    if (maybeList) {
	        if (!data[lastItem]) data[lastItem] = value;else if (typeof data[lastItem] !== 'string') data[lastItem].push(value);else data[lastItem] = [data[lastItem], value];
	    } else data[lastItem] = value;
	};

	exports.register = function register(path, value) {

	    var registry = this._registry || (this._registry = {});

	    if (typeof path !== 'string') {

	        for (var key in path) {
	            setValueByPath(registry, key, path[key], false);
	        }
	    } else {
	        if (value == null) value = this;
	        setValueByPath(registry, path, value || this, false);
	    }

	    return this;
	};

/***/ },
/* 3 */
/*!***********************!*\
  !*** ./lib/Rewrap.js ***!
  \***********************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var { assign } = Object;

	var { or, and, paren, parse, addIndexMap } = __webpack_require__(/*! ./util */ 1);

	var { setValueByPath, register } = __webpack_require__(/*! ./path-value */ 2);

	class Rewrap {

	    // style: "re" || "wrap"(default)

	    constructor(source, sourceStyle, flags, registry) {
	        assign(this, parse(source, 0, null, sourceStyle, flags, registry));
	        this._flags = this._flags || '';
	        this._regexp = new RegExp(this._regexpSource, this._flags);
	        this.addSwitch();
	    }

	    exec(str, data) {
	        var result = this._regexp.exec(str);
	        if (!result) return null;

	        this.saveData(result, data);
	        return result;
	    }

	    test(str) {
	        return this._regexp.test(str);
	    }

	    [Symbol.match](str, data) {
	        var result = RegExp.prototype[Symbol.match].call(this._regexp, str);
	        if (!result) return null;

	        if (!this._flags.match(/g/)) {
	            this.saveData(result, data);
	        }
	        return result;
	    }

	    match(str, data) {
	        return this[Symbol.match](str, data);
	    }

	    [Symbol.replace](str, item) {
	        "use strict";

	        if (typeof item === 'string') {
	            return RegExp.prototype[Symbol.replace].call(this._regexp, str, item);
	        } else {
	            return RegExp.prototype[Symbol.replace].call(this._regexp, str, (...args) => {
	                var len = args.length,
	                    matches = args.slice(0, len - 2),
	                    offset = args[len - 2];
	                var data = this.saveData(matches);
	                return item(matches, data, offset, str);
	            });
	        };
	    }

	    replace(str, item) {
	        "use strict";

	        return this[Symbol.replace](str, item);
	    }

	    [Symbol.search](str) {
	        return RegExp.prototype[Symbol.search].call(this._regexp, str);
	    }

	    search(str) {
	        "use strict";

	        return this[Symbol.search](str);
	    }

	    [Symbol.split](str, limit) {
	        return RegExp.prototype[Symbol.split].call(this._regexp, str, limit);
	    }

	    split(str, limit) {
	        "use strict";

	        return this[Symbol.split](str, limit);
	    }

	    saveData(result, data) {
	        data = data || {};
	        var matchIndex2dataPath = this.matchIndex2dataPath;

	        // i=1: skip the match itself
	        for (var i = 1, len = result.length; i < len; i++) {
	            var item = result[i];
	            if (item == null) continue;
	            var path = matchIndex2dataPath[i - 1];
	            if (path) setValueByPath(data, path, item, true); // maybeList: true
	        }

	        result.$$rewrapData = data;
	        return data;
	    }

	    addSwitch() {
	        Object.defineProperty(this, 're', { get: () => {
	                this._sourceStyle = 're';return this;
	            } });
	        Object.defineProperty(this, 'wrap', { get: () => {
	                this._sourceStyle = 'wrap';return this;
	            } });
	        return this;
	    }

	    set(attr, value) {
	        this[attr] = value;
	        return this;
	    }

	    assign(obj) {
	        return assign(this, obj);
	    }

	    copy() {
	        "use strict";

	        return new Rewrap(this);
	    }

	    flags(value) {
	        if (!value) {
	            return this._flags;
	        } else {
	            return this.copy().set('_flags', value);
	        }
	    }

	    sourceStyle(value) {
	        if (!value) {
	            return this._sourceStyle;
	        } else {
	            this._sourceStyle = this;
	            return this;
	        }
	    }

	    portStyle(obj) {
	        "use strict";

	        this._sourceStyle = this._sourceStyle;
	        return this;
	    }

	    registry(_registry) {
	        if (!_registry) {
	            return this._registry;
	        } else {
	            return this.copy().set('_registry', value);
	        }
	    }

	    rewrap(value) {
	        if (!arguments.length) {
	            return this;
	        } else {
	            return this.and(new Rewrap(value, 'wrap', this._flags, this._registry));
	        }
	    }

	    regexp(regexp) {
	        if (!arguments.length) {
	            return this._regexp;
	        } else {
	            return this.and(new Rewrap(regexp, "re", this._flags, this._registry));
	        }
	    }

	    ref(path) {
	        return this.and(new Rewrap(`@${ path }`, "wrap", this._flags, this._registry));
	    }

	    save(path) {
	        var result = void 0;
	        if (this.needParen) {
	            result = this.parenMe('(');
	            result.matchIndex2dataPath = addIndexMap(result.matchIndex2dataPath, path);
	        } else {
	            result = this.copy();
	            result.matchIndex2dataPath[0] = path;
	        }

	        return result;
	    }

	    concat(str) {
	        "use strict";

	        this._regexpSource += str;
	        this._rewrapSource += str;
	        return this;
	    }

	    or(...items) {
	        if (!items.length) return this;

	        if (this._rewrapSource) {
	            items.unshift(this);
	        }

	        var parseResult = or(items, this._sourceStyle, this._flags, this._registry);
	        return new Rewrap(parseResult);
	    }

	    and(...items) {
	        if (!items.length) return this;

	        items.unshift(this);
	        var parseResult = and(items, this._sourceStyle, this._flags, this._registry);
	        return new Rewrap(parseResult);
	    }

	    paren(item, left = '(?:') {
	        return this.and(new Rewrap(paren(item, left)));
	    }

	    parenMe(left = '(?:') {
	        return new Rewrap(paren(this, left));
	    }

	    not(item) {
	        if (arguments.length) {
	            return this.paren(item, '(?!');
	        } else {
	            return this.parenMe('(?!');
	        }
	    }

	    lookAhead(item) {
	        if (arguments.length) {
	            return this.paren(item, '(?=');
	        } else {
	            return this.parenMe('(?=');
	        }
	    }

	    any(item) {
	        var result = void 0;
	        if (arguments.length) {
	            result = this.paren(item);
	        } else {
	            result = this.parenMe();
	        }
	        return result.concat(`*`);
	    }

	    some(item) {
	        var result = void 0;
	        if (arguments.length) {
	            result = this.paren(item);
	        } else {
	            result = this.parenMe();
	        }
	        return result.concat(`+`);
	    }

	    optional(item) {
	        var result = void 0;
	        if (arguments.length) {
	            result = this.paren(item);
	        } else {
	            result = this.parenMe();
	        }
	        return result.concat(`?`);
	    }

	    repeat(item, min, max) {
	        var result = void 0;
	        if (arguments.length === 3) {
	            result = this.paren(item);
	        } else {
	            result = this.parenMe();
	            max = min;
	            min = item;
	        }
	        return result.concat(`{${ min },${ max }}`);
	    }

	    times(item, count) {
	        var result = void 0;
	        if (arguments.length === 2) {
	            result = this.paren(item);
	        } else {
	            result = this.parenMe();
	            count = item;
	        }
	        return result.concat(`{${ count }}`);
	    }

	    timesMore(item, count) {
	        var result = void 0;
	        if (arguments.length === 2) {
	            result = this.paren(item);
	        } else {
	            result = this.parenMe();
	            count = item;
	        }
	        return result.concat(`{${ count }}`);
	    }

	    headTail(head = '^', tail = '$') {
	        return and([head, this, tail], this._sourceStyle, this._flags, this._registry);
	    }

	    head(head = '^') {
	        return and([head, this], this._sourceStyle, this._flags, this._registry);
	    }

	    tail(tail = '$') {
	        return and([this, tail], this._sourceStyle, this._flags, this._registry);
	    }

	}

	Rewrap.prototype.register = register;

	exports = module.exports = Rewrap;

/***/ }
/******/ ]);