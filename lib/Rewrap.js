const {assign} = Object;

const {parse, addMatchIndex} = require('./parse');

const {or, and, paren} = require('./util');

const {setValueByPath, register} = require('./path-value');

class Rewrap {

    // style: "re" || "wrap"(default)

    constructor(source, sourceStyle, flags, registry) {
        assign(this, parse(source, 0, null, sourceStyle, flags, registry));
        this.addSwitch();
    }

    match(text, data) {
        let result = text.match(this._regexp);
        if (!result) return null;

        data = data || {};
        const matchIndex2dataPath = this.matchIndex2dataPath;
        for (let i=0, len=result.length; i<len; i++) {
            let item = result[i];
            if (item == null) continue;
            let path = matchIndex2dataPath[i];
            if (path) setValueByPath(data, path, item, true); // maybeList: true
        }

        result.$$rewrapData = data;
        return result;
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

    rewrap(value) {
        if (!arguments.length) {
            return this;
        } else {
            return new Rewrap(value, 'wrap', this._flags, this._registry).portStyle(this);
        }
    }

    regexp(regexp) {
        if (!arguments.length) {
            return this._regexp;
        } else {
            return new Rewrap(regexp, "re", this._flags, this._registry).portStyle(this);
        }
    }

    registry(_registry){
        if (!_registry) {
            return this._registry;
        } else {
            return this.copy().set('_registry', value);
        }
    }

    ref(path) {
        new Rewrap(`@${path}`, "wrap", this._flags, this._registry).portStyle(this);
    }

    save(path) {
        let result;
        if (this.needParen) {
            result = this.parenMe('(');
            result.matchIndex2dataPath = addMatchIndex(result.matchIndex2dataPath, path);
        } else {
            result = this.copy();
            result.matchIndex2dataPath[0] = path;
        }

        return result;
    }

    or(...items) {
        if (!items.length) return this;

        if (this._rewrapSource) {
            items.unshift(this);
        }
        let parseResult = or(items, this.style, this._flags, this._retistry);
        return new Rewrap(parseResult);
    }

    and(...items) {
        if (!items.length) return this;

        items.unshift(this);
        let parseResult = and(items, this.style, this._flags, this._retistry);
        return new Rewrap(parseResult);
    }

    paren(item, left='(:', right=')') {
        return new Rewrap(paren(item, left, right));
    }

    parenMe(left='(:', right=')') {
        return new Rewrap(paren(this, left, right));
    }

    not(item) {
        if (arguments.length) {
            return this.paren(item, '(?!');
        } else {
            return this.parenMe('(?!');
        }
    }

    any(item) {
        let result;
        if (arguments.length) {
            result = this.paren(item);
        } else {
            result = this.parenMe();
        }
        result._regexpSource += '*';
        result._rewrapSource += '*';
        result.needParen = true;
        result.needGroup = true;
        result.inGroup = false;
        return result;
    }

    some(item) {
        if (arguments.length) {
            result = this.paren(item);
        } else {
            result = this.parenMe();
        }
        result._regexpSource += '+';
        result._rewrapSource += '+';
        return result;
    }

    optional(item) {
        let result;
        if (arguments.length) {
            result = this.paren(item);
        } else {
            result = this.parenMe();
        }
        result._regexpSource += '?';
        result._rewrapSource += '?';
        result.needParen = true;
        result.needGroup = true;
        result.inGroup = false;
        return result;
    }

    repeat(item, min, max) {
        if (typeof arguments[0] != 'number') {
            return this.paren(item)._concat();
        } else {
            return this.parenMe()._concat(`{${min},${max}}`);
        }
        let result;
        if (arguments.length) {
            result = this.paren(item);
        } else {
            result = this.parenMe();
        }
        result._regexpSource += `{${min},${max}}`;
        result._rewrapSource += `{${min},${max}}`;
        result.needParen = true;
        result.needGroup = true;
        result.inGroup = false;
        return result;
    }

}

Rewrap.prototype.register = register;

exports = module.exports = Rewrap;
