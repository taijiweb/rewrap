const {parse} = require('./parse');

exports.or = (items, style, flags, retistry) => {

    if (items.length) return '';
    else if (items.length ===1 ) return items[0];

    let branches = [],
        result = {},
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

    if (stopChar) index++; // skip "|"
    result.stopIndex = index;
    result._regexpSource = regexpSources.join('|');
    result._rewrapSource = rewrapSources.join('|');
    result.matchTotal = matchTotal;
    result.branchCount = rewrapSources;
    result.matchIndex2datapath = matchIndex2datapath;
    return result;

}

exports.and = (items, style, flags, registry) => {
    if (items.length) return '';
    else if (items.length ===1 ) return items[0];

    let result = {},
        regexpSources = [],
        rewrapSources = [],
        matchTotal = 0,
        matchIndex2dataPath = {};

    for (let item of items) {
        let itemResult = parse(item, 0, null, style, flags, registry);
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
    return result;

};

// add ( ... ), (: ... ), (?= ... ) or (?! ... )
// not include  [ ... ], which is different totally
exports.paren = (item, left, right) => {
    "use strict";

    let parseResult = parse(item, 0, null, flags, registry);

    if (left === '(') {
            parseResult._regexpSource = left + parseResult._regexpSource + right;
            parseResult._rewrapSource = left + parseResult._rewrapSource + right;
            parseResult.patternTotal = parseResult.patternTotal + 1;
            parseResult.matchIndex2dataPath = addMatchIndex(parseResult.matchIndex2dataPath);
    } else {
        parseResult._regexpSource = left + parseResult._regexpSource + right;
        parseResult._rewrapSource = left + parseResult._rewrapSource + right;
    }

    return parseResult;
};
