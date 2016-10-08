const {getValueByPath} = require('./path-value');

exports.or = (items, style, flags, registry) => {

    if (!items.length) return '';
    else if (items.length === 1 ) return parse(items[0], 0, null, style, flags, registry);

    let branches = [],
        result = {_sourceStyle: style, _flags: flags, _registry: registry},
        regexpSources = [],
        rewrapSources = [],
        matchTotal = 0,
        matchIndex2datapath = {};

    for (let item of items) {
        branches.push(parse(item, 0, null, style, flags, registry));
    }

    for (let branch of branches) {
        regexpSources.push(branch._regexpSource);
        rewrapSources.push(branch._rewrapSource);
        const branchMatchIndex2datapath = branch.matchIndex2datapath;
        for (let i in branchMatchIndex2datapath) {
            matchIndex2datapath[matchTotal + i] = branchMatchIndex2datapath[i];
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

}

const and = exports.and = (items, style, flags, registry) => {
    if (!items.length) return '';
    else if (items.length ===1 ) return parse(items[0], 0, null, style, flags, registry);

    let result = {_sourceStyle: style, _flags: flags, _registry: registry},
        regexpSources = [],
        rewrapSources = [],
        matchTotal = 0,
        matchIndex2dataPath = {};

    for (let item of items) {
        let itemResult = parse(item, 0, null, style, flags, registry);
        if (itemResult.isOr) {
            itemResult._regexpSource = '(?:' + itemResult._regexpSource + ')';
            itemResult._rewrapSource = '(?:' + itemResult._rewrapSource + ')';
        }
        regexpSources.push(itemResult._regexpSource);
        rewrapSources.push(itemResult._rewrapSource);
        const itemMatchIndex2dataPath = itemResult.matchIndex2dataPath;
        for (let i in itemMatchIndex2dataPath) {
            matchIndex2dataPath[matchTotal + i] = itemMatchIndex2dataPath[i];
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

    const right = ')';

    let parseResult = parse(item, 0, null, style, flags, registry);


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

const parse = exports.parse = (source, index, stopChar, style, flags, registry) => {

    if (source._rewrapSource != null) return source;
    else if (Object.prototype.toString.call(source) === '[object Array]') {
        return and(source, 'wrap', flags, registry)
    }

    let sourceFlags = source.flags;
    source = source.source || source;
    const start = index;

    let result = {_sourceStyle: style, _flags: flags, _registry: registry},
        regexpSources = [],
        rewrapSources = [],
        matchTotal = 0,
        matchIndex2dataPath = {};

    let char = source[index];

    let branchCount = 0, branch;
    while (1) {
        branch = parseBranch(source, index, stopChar, style, flags, registry);
        regexpSources.push(branch._regexpSource);
        rewrapSources.push(branch._rewrapSource);
        const branchMatchIndex2dataPath = branch.matchIndex2dataPath;
        for (let i in branchMatchIndex2dataPath) {
            matchIndex2dataPath[matchTotal + i * 1] = branchMatchIndex2dataPath[i];
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

const parseBranch = (source, index, stopChar, style, flags, registry) => {
    "use strict";

    let result = {},
        regexpSources = [],
        matchTotal = 0,
        matchIndex2dataPath = {},
        start = index;

    let char = source[index];
    let segment, segmentCount = 0;
    while (1) {
        segment = parseSegment(source, index, stopChar, style, flags, registry);
        regexpSources.push(segment._regexpSource);
        const segmentMatchIndex2dataPath = segment.matchIndex2dataPath;
        for (let i in segmentMatchIndex2dataPath) {
            matchIndex2dataPath[matchTotal + i * 1] = segmentMatchIndex2dataPath[i];
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

const parseSegment = (source, index, stopChar, style, flags, registry) => {
    "use strict";

    let base = parseSegmentBase(source, index, stopChar, style, flags, registry),
        result = {},
        regexpSource = base._regexpSource,
        matchTotal = base.matchTotal,
        matchIndex2dataPath = base.matchIndex2dataPath,
        baseName,
        dataName,
        repeated,
        needParen = base.needParen,
        needGroup = base.needGroup;


    index = base.stopIndex;

    let i = parseDataName(source, index);
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
        index  = i;
        if (source[index] === '%') index++;
    }

    let repeatStart = index;

    let char = source[index];
    if (char === '*' || char ==='+' || char ==='?') {
        repeated = true;
        index++;
    } else if (char === '{') {
        let i = matchAnyDigitChar(source, index + 2);
        if (i > index + 2) {
            if (source[i] === ',') {
                let j = matchAnyDigitChar(source, i + 1);
                if (j > i+ 1 && source[j] === '}') {
                    repeated = true;
                    index = j + 1;
                }
            } else if (source[i] === '}') {
                repeated = true;
                index = i + 2;
            }
        }
    }

    if (repeated && source[index] === '?') {
        index++;
    }

    const repeatStop = index;
    let repeatSpan = source.slice(repeatStart, repeatStop);

    regexpSource += repeatSpan;
    if (style !== 're') {
        i = parseDataName(source, index, style);
        if (i){
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

const parseSegmentBase = (source, index, stopChar, style, flags, registry) => {
    "use strict";


    let result = {},
        regexpSource,
        start = index,
        matchTotal = 0,
        matchIndex2dataPath = {},
        needParen = true,
        needGroup = false;

    let char = source[index];
    if (!char || char === '|' || char === ')' || char === stopChar) {
        regexpSource = '';
    } else if (char === '[') {
        while (1) {
            index++;
            char = source[index];
            if (!char) throw 'expect ], unexpected end of text';
            if (char === ']') {
                if (!isEscaping(source, index)) {
                    index ++;
                    break;
                }
            }
        }
        regexpSource = source.slice(start, index);
    } else if (char === '(') {
        let head;
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
        let content = parse(source, index + head.length, ')', style, flags, registry);
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
        if (source[index] !== ')')
            throw 'expect )';
        index++;
    } else if (char === '*' || char === '+' || char === '?') {
        throw `unexpected ${char}`;
    } else if (char === '\\') {
        index++;
        char = source[index];
        if (char === 'x') {
            index++;
            if (!source[index].match(/0-9A-Fa-f/)) {
            } else {
                index++;
                if (!source[index].match(/0-9A-Fa-f/)){
                    result.content = `\\x${hex1}${hex2}`;
                    index++;
                }
            }
        } else if (char === 'u') {
            index++;
            char = source[index];
            let unicode = flags.match(/u/i);
            if (unicode && char === '{') {
                let j = matchAnyHexChar(source, index);
                let count = j - i;
                if (count !== 4 && count !== 5) {
                    throw 'expect 4 or 5 hex digits char';
                } else {
                    char = index[j];
                    if (char === '}') {
                        index = j
                    } else {
                        throw 'expect } after "\\u{hhhh" or "\\u{hhhhh"';
                    }
                }
            } else {
                let text = souce.slice(index, index + 4);
                if (!text.match(/[0-9A-Fa-f]{4}/)) {
                    throw 'expect \\uhhhh'
                }
                index += 4;
            }
        }
        regexpSource = source.slice(start, index);
    } else {
        if (char === '@' && style === 'wrap') {
            let i = matchIdentifierPath(source, index + 1);
            if (i > index + 1 ) {
                let name = source.slice(index + 1, i);
                let ref = getValueByPath(registry, name);
                if (!ref)
                    throw 'no definition for ' + name;
                ref = parse(ref.source || ref, 0, null, 're', {});
                regexpSource = ref._regexpSource;
                needParen = ref.needParen;
                needGroup = ref.needGroup;
                matchIndex2dataPath = ref.matchIndex2dataPath;
                matchTotal = ref.matchTotal;
                index = i;
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

const parseDataName = (source, index, style) => {
    "use strict";
    if (style === 're') {
        return;
    } else if (source[index] === '&') {
        index++;
        index = matchIdentifierPath(source, index);
        return index;
    }
};

const matchAnyHexChar = (text, i) => {
    "use strict";
    let char;
    while ((char = text[i]) && char.match(hexRegexp)) {
        i++;
    }
    return i;
};

const hexRegexp = /[0-9A-Fa-f]/;

const matchAnyDigitChar = (text, index) => {
    "use strict";
    let char;
    let i = index;
    while ((char = text[i]) && char.match(digitRegexp)) {
        i++;
    }
    return i;
};

const digitRegexp = /[0-9]/;


const matchIdentifier = (text, i) => {
    "use strict";

    let char = text[i];

    if (!char || !char.match(/[_A-Za-z]/)) return;

    i++;
    char = text[i];
    while (char && char.match(/[_A-Za-z0-9]/)) {
        i++;
        char = text[i];
    }

    return i;
};

const matchIdentifierPath = (text, i) => {
    "use strict";
    i = matchIdentifier(text, i);
    if (!i) return;

    while (1) {
        let result = i;
        if (text[i] === '.') i++;
        i = matchIdentifier(text, i);
        if (!i) return result;
    }
};

const addIndexMap = exports.addIndexMap = (matchIndex2dataPath, dataName) => {
    "use strict";

    const result = {};
    for (let i in matchIndex2dataPath) {
        result['' + (i*1 + 1)] = matchIndex2dataPath[i];
    }
    if (dataName) result[0] = dataName;

    return result;
};

// convert the regexp source to rewrap source
// need escape @ and & to avoid conflicting with @rewrapRef and &dataPath
const convertToRewrapSource = exports.convertToRewrapSource = (source, register, unicode) => {
    if (!source) return '';
    if (source._rewrapSource) return source._rewrapSource;
    if (source instanceof RegExp) {
        source = source.source;
    }

    let result = '', i = 0, char = source[i];
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

const isEscaping = (source, index) => {
    let j = index - 1;
    while (source[j] === '\\') {
        j--;
    }
    return (index - j) % 2 === 0;
};
