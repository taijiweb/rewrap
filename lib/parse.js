const {getValueByPath} = require('./path-value');

const parse = exports.parse = (source, index, stopChar, style, flags, registry) => {

    if (source._rewrapSource) return source;
    source = source.source || source;

    let result = {_sourceStyle: style, _flags: flags, _registry: registry},
        regexpSources = [],
        rewrapSources = [],
        matchTotal = 0,
        matchIndex2dataPath = {};

    let char = source[index];

    let branchCount = 0;
    while (char && char !== stopChar) {
        let branch = parseBranch(source, index, stopChar, style, flags, registry);
        index = branch.stopIndex;
        char = source[index];
        regexpSources.push(branch._regexpSource);
        rewrapSources.push(branch._rewrapSource);
        const branchMatchIndex2dataPath = branch.matchIndex2dataPath;
        for (let i in branchMatchIndex2dataPath) {
            matchIndex2dataPath[matchTotal + i] = branchMatchIndex2dataPath[i];
        }
        matchTotal += branch.matchTotal;
        branchCount++;
    }

    if (stopChar) index++; // skip "|"

    result.stopIndex = index;
    result._regexpSource = regexpSources.join('|');
    result._regexp = new RegExp(result._regexpSource, flags);
    if (style === 're') {
        result._rewrapSource = convertToRewrapSource(source)
    } else {
        result._rewrapSource = source;
    }
    result.matchTotal = matchTotal;
    result.branchCount = rewrapSources;
    result.matchIndex2dataPath = matchIndex2dataPath;
    return result;
};

parseBranch = (source, index, stopChar, style, flags, registry) => {
    "use strict";

    let result = {},
        regexpSources = [],
        rewrapSources = [],
        matchTotal = 0,
        matchIndex2dataPath = {};

    let char = source[index];
    let segmentCount = 0;
    while (char && char !== stopChar) {
        let segment = parseSegment(source, index, stopChar, style, flags, registry);
        index = segment.stopIndex;
        char = source[index];
        regexpSources.push(segment._regexpSource);
        rewrapSources.push(segment._rewrapSource);
        const segmentMatchIndex2dataPath = segment.matchIndex2dataPath;
        for (let i in segmentMatchIndex2dataPath) {
            matchIndex2dataPath[matchTotal + i] = segmentMatchIndex2dataPath[i];
        }
        matchTotal += segment.matchTotal;
        segmentCount++;
    }
    result.stopIndex = index;
    result._regexpSource = regexpSources.join('');
    result._rewrapSource = rewrapSources.join('');
    result.matchTotal = matchTotal;
    result.matchIndex2dataPath = matchIndex2dataPath;
    return result;
};

const parseSegment = (source, index, stopChar, style, flags, registry) => {
    "use strict";

    let base = parseSegmentBase(source, index, style, flags, registry);
    if (!base) return;

    let result = {},
        regexpSource,
        rewrapSource,
        matchTotal = base.matchTotal,
        matchIndex2dataPath = {},
        baseName,
        dataName,
        baseRegexpSource,
        repeat,
        nongreedy;


    index = base.stopIndex;

    let i = parseDataName(source, index);
    if (i) {
        baseName = source.slice(index + 1, i);
    }
    if (i && base.needParen) {
        matchIndex2dataPath = addIndexMap(base.matchIndex2dataPath, baseName);
        baseRegexpSource = '(' + base.regexpSource, ')';
        matchTotal++;
    } else {
        matchIndex2dataPath = base.matchIndex2dataPath;
        matchIndex2dataPath[0] = baseName;
        baseRegexpSource = base.regexpSource;
    }
    if (i) {
        index  = i;
        if (source[index] === '%') index++;
    }

    let char = source[index];
    if (char === '*') {
        repeat = {min:0, max:Infinity};
        index++;
    } else if (char ==='+') {
        repeat = {min:1, max:Infinity};
        index++;
    } else if (char === '{') {
        let i = matchAnyDigitChar(source, index + 2), min, max;
        if (i) {
            min = source.slice(index, i) * 1;
            char = source[i];
            if (char === ',') {
                let j = matchAnyDigitChar(source, i + 1);
                if (j) {
                    max = source.slice(i + 1, j) * 1;
                } else {
                    max = Infinity;
                    j = i;
                }
                if (source[j] === '}') {
                    repeat = {min, max};
                    index = j + 1;
                }
            } else if (char === '}') {
                repeat = min;
                index = i + 2;
            }
        }
    } else {
        repeat = {min:1, max:1}
    }

    if (repeat && source[index] === '?') {
        index++;
    }

    const repeatStop = index;


    let repeatSpan = source.slice(repeatStart, repeatStop);
    if (style === 're') {
        regexpSource = source;
        rewrapSource = convertToRewrapSource(source);
    } else {
        if (repeatSpan) {
            baseRegexpSource = '(:' + baseRegexpSource + ')';
        }
        regexpSource = baseRegexpSource + repeatSpan;
        rewrapSource = source;
        i = parseDataName(source, index, style);
        if (i) {
            dataName = source.slice(index + 1, i);
            matchIndex2dataPath = addIndexMap(matchIndex2dataPath, dataName);
            regexpSource = '(' + regexpSource + ')';
            matchTotal++;
            index = i;
            if (source[index] === '%') index++;
        }
    }

    result._regexpSource = regexpSource;
    result._rewrapSource = rewrapSource;
    result.matchIndex2dataPath = matchIndex2dataPath;
    result.matchTotal = matchTotal;
    result.stopIndex = index;

    return result;

};

const parseSegmentBase = (source, index, stopChar, style, flags, registry) => {
    "use strict";

    let char = source[index];
    if (!char || char === '|' || char === stopChar) return;

    let result = {},
        lookAhead = false,
        regexpSource,
        start = index,
        matchTotal = 0,
        matchIndex2dataPath = {};

    if (char === '[') {
        while (1) {
            index++;
            char = source[index];
            if (!char) throw 'expect ], unexpected end of text';
            if (char === ']') {
                let j = 1;
                while (source[index - j] === '\\') {
                    j++;
                }
                if (j%2 === 0) {
                    index ++;
                    break;
                }
            }
        }
        regexpSource = source.slice(start, index);
    } else if (char === '(') {
        let head;
        index++;
        char = source[index];
        if (char === '?') {
            index++;
            char = source[index];
            head = '(?';
            if (char === '=' || char === '!') {
                lookAhead = char;
                index++;
                head += char;
            }
        } else if (char === ':') {
            head = '(:';
        } else {
            head = '(';
        }
        let content = parse(source, index + 1, ')', style, flags, registry);
        if (head === '(') {
            matchIndex2dataPath = addIndexMap(matchIndex2dataPath);
            matchTotal = content.matchTotal + 1;
        } else {
            matchIndex2dataPath = content.matchIndex2dataPath;
            matchTotal = content.matchTotal;
        }

        regexpSource = head + content.regexpSource + ')';
        index = content.stopIndex;
        if (source[index] !== ')')
            throw 'expect )';
        index++;
    } else if (char === '*' || char === '+' || char === '?') {
        throw `unexpected "${char}`;
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
            let path;
            if (path = matchIdentifierPath(source, index)) {
                let ref = getValueByPath(register, path);
                if (!ref._rewrapSource) {
                    ref = parse(ref.source || ref, 0, null, 're', {});
                }
                result = ref;
                regexpSource = ref.regexpSource;
                index += path.length;
                char = source[index];
                if (char === '%') index++;
            }
        } else {
            regexpSource = char;
            index++;
        }
    }
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
        i = matchIdentifierPath(source, index);
        return i;
    }
};

matchAnyHexChar = (text, i) => {
    "use strict";
    let char;
    while ((char = text[i]) && char.match(hexRegexp)) {
        i++;
    }
    return i;
};

matchAnyHexChar = (text, i) => {
    "use strict";
    let char;
    while ((char = text[i]) && char.match(hexRegexp)) {
        i++;
    }
    return i;
};

const hexRegexp = /[0-9A-Fa-f]/;

matchAnyDigitChar = (text, index) => {
    "use strict";
    let char;
    let i = index;
    while ((char = text[i]) && char.match(digitRegexp)) {
        i++;
    }
    if (i > index) return i;
    else return;
};

const digitRegexp = /[0-9]/;


matchIdentifier = (text, i) => {
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

matchIdentifierPath = (text, i) => {
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
        result[i] = matchIndex2dataPath[i];
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
            result += '\\' + char;
        }
        i++;
        char = source[i];
    }

    return result;
};