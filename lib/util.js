exports.isRegExp = (item) => item instanceof Regexp;

const isReChar = exports.isReChar = (str) =>  str.length===2 && str[0]==='\\' || str.length === 1;

const isWrapped = exports.isWrapped = (str) => str[0]==='(' || str[0]==='[';

exports.getMinLength = (item) => {

};

exports.getMaxLength = (item) => {

};

// convert the regexp source to rewrap source
exports.regexpToRewrap = (source, unicodeFlag) => {
    if (!source) return '';
    if (source._rewrapSource) return source._rewrapSource;
    if (source instanceof RegExp) source = source.source;

    let result = '';
    let parenStack = [];
    let i = 0; len = source.length, j;
    let char = source[0];
    while (i < len) {
        if (char === '(' || char === '[' || char === '{') parenStack.push(char);
        else if (char === '\\') {
            i++;
            char = source[i];
            if (!char) {
                new RegExp(source);
            } if (char === 'u') {
                i++;
                char = source[i];
                if (char === '{') {
                    if (unicodeFlag) {
                        [char, j] = matchAnyHexChar(source, i + 1);
                        let count = j - i;
                        if (char !== '}' || count < 4 || count > 5) throw `${i - 2}: expect "\\u{hhhh}" or "\\u{hhhhh}"`;
                        i = j;
                    } else {

                    }
                } else {
                    [char, j] = matchAnyHexChar(source, i + 1);
                    if (j - i !== 4) throw `${i - 1}: expect "\\uhhhh"`;
                    i = j;
                }
            } else if (char === 'c') {
                i++;
                char = source[i];
                if (char.match(/^[A-Z]$/)) {
                    i++;
                }
            } else if (char === 'x') {
                [char, j] = matchAnyHexChar(source, i + 1);
                if (j - i < 2) throw `${i - 1}: expect "\\xhh"`;
                i = j;
            }
        } else {
            i++;
            char = source[i];
        }
    }
};

const hexRegexp = /[0-9A-Fa-f]/;

matchAnyHexChar = (text, i) => {
    "use strict";
    let char = text[i];
    while (char && char.match(hexRegexp)) {
        i++;
        char = text[i];
    }
    return [char, i];
};

// convert the rewrap source to regexp source
exports.rewrapToRegexp = (source) => {

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
