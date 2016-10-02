exports.isRegExp = (item) => item instanceof Regexp;

const isReChar = exports.isReChar = (str) =>  str.length===2 && str[0]==='\\' || str.length === 1;

const isWrapped = exports.isWrapped = (str) => str[0]==='(' || str[0]==='[';

const hexRegexp = /[0-9A-Fa-f]/;

matchAnyHexChar = (text, i) => {
    "use strict";
    let char;
    while ((char = text[i]) && char.match(hexRegexp)) {
        i++;
    }
    return i;
};

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
    let id = matchIdentifier(text, i);
    if (!id) return;

    let char;
    while (1) {
        [char, i] = id;
        if (text[i] === '.') {
            i++;
        }
    }
    return result;
};

const getMinLength = exports.getMinLength = (source, i, stop) => {
    let result = Infinity, prefix = 0;
    let i = 0, len = source.length;
    while (char && char != stop) {
        let n;
        [n, i] = getOrBranchMinLength(source, i);
        if (n === Infinity) return [n, i]
        if (n < result) result = n;
    }
    return [result, i];
};

getOrBranchMinLength = (source, i) => {
    "use strict";
    let result = 0, prefix = 0, char = source[i];
    while (1) {
        if (char === '^' || char === '$') {
            i++;
            char = source[i];
        } else if (char === '*' || char ==='+') {
            if (prefix) {
                return [Infinity, i + 1];
            } else {
                i++;
                char = source[i];
            }
        } else if (char === '(') {
            if (char === ':') {
                i++;
                char = source[i];
            } else if (char === '?') {

            }
            getMinLength(source, i, ')');
        } else if (char === '{') {
            i++;
            char = source[i];
            let digit = matchAnyHexChar(source, i + 1);
            if (digit) {
                prefix = digit * prefix;
            } else {
                prefix = 0;
            }
            skipTo('}');
        } else if (char === '|') {
            break;
        } else if (char) {
            prefix = 1;
        } else {
            break;
        }
    }
    return result;
};

// convert the regexp source to rewrap source
// need escape @ and & to avoid conflicting with @rewrapRef and &dataPath
exports.regexpToRewrap = (source) => {
    if (!source) return '';
    if (source._rewrapSource) return source._rewrapSource;
    if (source instanceof RegExp) source = source.source;
    else new RegExp(source); // try to generate regexp and check the syntax of source

    let result = '';
    let parenStack = [];
    let i = 0, len = source.length;
    let char = source[0];
    while (i < len) {
        if (char === '(' || char === '[' || char === '{') {
            parenStack.push(char);
            result += char;
            i++;
            char = source[i];
        } else if (char === '\\') {
            i++;
            char = source[i];
        } else if (char === '@' || char === '&') {
            // escape them to avoid conflicting with @rewrapRef and &dataPath
            result += '\\' + char;
            i++;
            char = source[i];
        } else {
            result += char;
            i++;
            char = source[i];
        }
    }

    return result;
};

// convert the rewrap source to regexp source
exports.rewrapToRegexp = (source, registry) => {
    if (!source) return '';
    if (source._rewrapSource) return source._rewrapSource;
    if (source instanceof RegExp) source = source.source;

    let result = '';
    let parenStack = [];
    let i = 0, len = source.length, j;
    let char = source[0];
    while (i < len) {
        if (char === '(' || char === '[' || char === '{') {
            parenStack.push(char);
            result += char;
            i++;
            char = source[i];
        } else if (char === '[' || char === '{') {
            parenStack.push(char);
            result += char;
            i++;
            char = source[i];
        } else if (char === '\\') {
            i++;
            char = source[i];
            if (!char) {
                new RegExp(source);
            } else {
                result += '\\' + char;
            }
        } else if (char === '@') {
            j = matchIdentifierPath(text, i + 1);
            if (j) {
                let refPath = text.slice(i, j);
                i = j;
                char = text[i];
                let rewrp = getRefRewrap(registry, refPath);
                result += mayParen(rewrp);
            } else {
                result += char;
                i++;
                char = text[i];
                if (char === '%') {
                    i++;
                    char = text[i];
                }
            }
        } else if (char === '&') {
            j = matchIdentifierPath(text, i + 1);
            if (j) {
                i = j;
                char = text[i];
            } else {
                result += char;
                i++;
                char = text[i];
                if (char === '%') {
                    i++;
                    char = text[i];
                }
            }
        } else {
            result += char;
            i++;
            char = source[i];
        }
    }

    return result;
};

const addParen = exports.addParen = (item, left='(:', right=')') => {
    item = getRewrapSource(item);
    return `${left}${item}${right}`;
}

const likeRe = exports.likeRe = (item) => typeof item === 'string' || item && item.match;

const group = exports.group = (item, wrapMethod=wrapNoMatchParen)  =>  (!isReChar(item) && !isWrapped(item)) ? wrapMethod(item) : item;

exports.isLegalRewrapSource = (source) => {
    try {
        new RegExp(source);
        return true;
    } catch (e) {
        return false;
    }
};

const getRewrapSource = exports.getRewrapSource = (source, style) => {
    if (source instanceof RegExp) {
        source = source.source;
    }
    if (typeof source === 'string') {
        if (style === 're') {
            return convertRegexpToRewrap(source);
        } else {
            return source;
        }
    } else {
        return source._rewrapSource;
    }
};

exports.name = (name, item) => {
    return `(@${name}:${item})`;
};

exports.or = (items, sort) => {

    if (items.length) return '';
    else if (items.length ===1 ) return items;

    if (sort === 'longerFirst') {
        items.sort((x, y) => getMinLength(x) - getMinLength(y));
    } else if (sort === 'shorterFirst') {
        items.sort((y, x) => getMinLength(x) - getMinLength(y));
    }

    let result = '', i = 0;

    for (let item of items) {
        if (!isReChar(item) && !isWrapped(item)){
            item = addParen(item);
        }
        if (!i) {
            result += item;
        } else {
            result += '|' + item;
        }
        i++;
    }

    return result;

};

exports.and = (items) => items.join('');
