const {assign} = Object;

const {or, and, paren, parse, addIndexMap} = require('./util');

const {setValueByPath, register} = require('./path-value');

class Rewrap {

    // style: "re" || "wrap"(default)

    constructor(source, sourceStyle, flags, registry) {
        assign(this, parse(source, 0, null, sourceStyle, flags, registry));
        this._flags = this._flags || '';
        this._regexp = new RegExp(this._regexpSource, this._flags);
        this.addSwitch();
    }

    exec(str, data) {
        let result = this._regexp.exec(str);
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
                let len = args.length, matches = args.slice(0, len - 2), offset = args[len - 2];
                let data = this.saveData(matches);
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
        const matchIndex2dataPath = this.matchIndex2dataPath;

        // i=1: skip the match itself
        for (let i=1, len=result.length; i<len; i++) {
            let item = result[i];
            if (item == null) continue;
            let path = matchIndex2dataPath[i - 1];
            if (path) setValueByPath(data, path, item, true); // maybeList: true
        }

        result.$$rewrapData = data;
        return data;
    }

    addSwitch() {
        Object.defineProperty(this, 're', {get: () => {this._sourceStyle = 're'; return this} });
        Object.defineProperty(this, 'wrap', {get: () => {this._sourceStyle = 'wrap'; return this} });
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

    registry(_registry){
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
        return this.and(new Rewrap(`@${path}`, "wrap", this._flags, this._registry));
    }

    save(path) {
        let result;
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

        let parseResult = or(items, this._sourceStyle, this._flags, this._registry);
        return new Rewrap(parseResult);
    }

    and(...items) {
        if (!items.length) return this;

        items.unshift(this);
        let parseResult = and(items, this._sourceStyle, this._flags, this._registry);
        return new Rewrap(parseResult);
    }

    paren(item, left='(?:') {
        return this.and(new Rewrap(paren(item, left)));
    }

    parenMe(left='(?:') {
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
        let result;
        if (arguments.length) {
            result = this.paren(item);
        } else {
            result = this.parenMe();
        }
        return result.concat(`*`);
    }

    some(item) {
        let result;
        if (arguments.length) {
            result = this.paren(item);
        } else {
            result = this.parenMe();
        }
        return result.concat(`+`);
    }

    optional(item) {
        let result;
        if (arguments.length) {
            result = this.paren(item);
        } else {
            result = this.parenMe();
        }
        return result.concat(`?`);
    }

    repeat(item, min, max) {
        let result;
        if (arguments.length === 3) {
            result = this.paren(item);
        } else {
            result = this.parenMe();
            max = min
            min = item
        }
        return result.concat(`{${min},${max}}`);
    }

    times(item, count) {
        let result;
        if (arguments.length === 2) {
            result = this.paren(item);
        } else {
            result = this.parenMe();
            count = item
        }
        return result.concat(`{${count}}`);
    }

    timesMore(item, count) {
        let result;
        if (arguments.length === 2) {
            result = this.paren(item);
        } else {
            result = this.parenMe();
            count = item
        }
        return result.concat(`{${count}}`);
    }

    headTail(head='^', tail='$'){
        return and([head, this, tail], this._sourceStyle, this._flags, this._registry)
    }

    head(head='^'){
        return and([head, this], this._sourceStyle, this._flags, this._registry)
    }


    tail(tail='$'){
        return and([this, tail], this._sourceStyle, this._flags, this._registry)
    }

}

Rewrap.prototype.register = register;

exports = module.exports = Rewrap;
