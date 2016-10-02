const {assign} = Object;

const {or, and, getRewrapSource, regexpToRewrap, rewrapToRegexp, paren} = require('./util');

const register = require('./register');

class Rewrap {

    // style: "re" || "wrap"(default)

    constructor(source, sourceStyle, flags) {

        if (!source) {
            this._flags = flags;
            this._regexpSource = this._rewrapSource = '';
            this._regexp = new RegExp('', flags);
            this._sourceStyle = sourceStyle || "wrap";
            this.addSwitch();
            return;
        }

        if (source instanceof Rewrap) {
            this._flags = source.flags || flags;
            this._regexpSource = source._regexpSource;
            if (this._flags === source.flags) {
                this._regexp = source._regexp;
            } else this._regexp = new RegExp(this._regexpSource, this._flags);
            this._sourceStyle = sourceStyle || source._sourceStyle;
            this._rewrapSource = source._rewrapSource;
            this.addSwitch();
            return;
        }

        if (source instanceof RegExp) {
            this._flags = flags || source.flags;
        } else this._flags = flags;

        if (this._sourceStyle == "re") {
            if (source instanceof RegExp) {
                if (this._flags === source.flags) {
                    this._regexp = source;
                    this._regexpSource = source.source;
                } else {
                    this._regexpSource = source.source;
                    this._regexp = new RegExp(this._regexpSource, this._flags);
                }
            } else {
                this._regexpSource = source;
                this._regexp = new RegExp(source, this._flags);
            }
            this._rewrapSource = regexpToRewrap(this._regexpSource);
        } else {
            if (source instanceof RegExp) {
                source = source.source;
            }
            this._rewrapSource = source;
            this._regexpSource = rewrapToRegexp(source);
            this._regexp = new RegExp(this._regexpSource, this._flags);
        }

        this.addSwitch();

    }

    match(text) {
        return text.match(this._regexp);
    }

    addSwitch() {
        Object.defineProperty(this, 're', {get: () => {this._sourceStyle = 're'; return this} });
        Object.defineProperty(this, 'wrap', {get: () => {this._sourceStyle = 'wrap'; return this} });
        return this;
    }

    copy () {
        return assign(new Rewrap(), this);
    }

    port(obj) {
        this._sourceStyle = obj._sourceStyle;
        this._registry = obj._registry;
        return this;
    }

    assign(obj) {
        return assign(this, obj);
    }

    to(item) {
        const result = new Rewrap(item, item._sourceStyle || this._sourceStyle);
        result._registry = this._registry;
        return result;
    }

    flags(value) {
        if (!value) {
            return this._flags;
        } else {
            return new Rewrap(this._rewrapSource, "wrap", this._flags).port(this);
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

    rewrapSource(source) {
        if (!arguments.length) {
            return this._rewrapSource;
        } else {
            return new Rewrap(source, "wrap", this._flags).port(this);
        }
    }

    rewrap(rewrp) {
        if (!arguments.length) {
            return this;
        } else {
            return new Rewrap(rewrp, "wrap", this._flags);
        }
    }

    regexpSource(source) {
        if (!arguments.length) {
            return this._regexpSource;
        } else {
            return new Rewrap(source, "re", this._flags);
        }
    }

    regexp(regexp) {
        if (!arguments.length) {
            return this._regexp;
        } else {
            return new Rewrap(regexp, "re", this._flags);
        }
    }

    name(value) {
        if (!value) {
            return this._name;
        } else {
            new Rewrap(`(@${value}:` + this._rewrapSource +')', 'wrap', this._flags).port(this);
        }
    }

    ref(path) {
        new Rewrap(`@${path}%`, "wrap", this._flags).port(this);
    }

    registry(_registry){
        if (!_registry) {
            return this._registry;
        } else {
            return this.copy().assign({_register});
        }
    }

    or(...items) {
        if (!items.length) return this;

        items = items.map((item) => getRewrapSource(item, this.style));
        if (this._regexpSource) {
            items.unshift(this._rewrapSource);
        }
        let source = or(items);
        return new Rewrap(source, "wrap", this._flags).port(this);
    }

    and(...items) {
        if (!items.length) return this;

        items = items.map((item) => getRewrapSource(item, this.style));
        items.unshift(this._rewrapSource);
        let source = and(items);
        return new Rewrap(source, "wrap", this._flags).port(this);
    }

    paren(item, left='(:', right=')') {
        return new Rewrap(`${left}${getRewrapSource(item, this.style)}${right}`, "wrap", this._flags).port(this);
    }

    parenMe(left='(:', right=')') {
        return new Rewrap(`${left}${this._rewrapSource}${right}`, "wrap", this._flags).port(this);
    }

    mayParen(item) {
        if (!arguments.length) {
            if (needWrap(item)) {
                return this.paren(item);
            } else {
                return this.to(item);
            }
        } else {
            if (needWrap(item)) {
                return this.parenMe();
            } else {
                return this;
            }
        }
    }

    not(item) {
        if (arguments.length) {
            return this.paren(item, '(?!');
        } else {
            return this.paren('(?!');
        }
    }

    any(item) {
        if (arguments.length) {
            return this.mayParen(item).and('*');
        } else {
            return this.mayParen().and('*');
        }
    }

    some(item) {
        if (arguments.length) {
            return this.mayParen(item).and('+');
        } else {
            return this.mayParen().and('+');
        }
    }

    optional(item) {
        if (arguments.length) {
            return this.mayParen(item).and('?');
        } else {
            return this.mayParen().and('?');
        }
    }

    repeat(item, min, max) {
        if (typeof arguments[0] != 'number') {
            return this.mayParen(item).and(`{${min},${max}}`);
        } else {
            return this.mayParen().and(`{${min},${max}}`);
        }
    }

    reverse() {

    }

}

Rewrap.prototype.register = register;

exports = module.exports = Rewrap;
