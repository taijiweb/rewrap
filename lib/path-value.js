exports.getValueByPath = (data, path, defaultValue) => {
    "use strict";

    if (!data) return defaultValue;
    if (typeof path === 'string') {
        path = path.trim().split();
    }

    for (let item of path) {
        if (data) data = data[item];
    }

    if (data == null) return defaultValue;
    else return data;

};

const setValueByPath = exports.setValueByPath = (data, path, value, maybeList) => {
    "use strict";

    if (typeof path === 'string') {
        path = path.split(/\s+|\s*,\s*/)
    }

    let i = 0, last = path.length - 1;
    while (i < len) {
        const item = path[i];
        let holder = data[item];
        if (holder && typeof holder !== 'object') throw 'type error: can not set value by path to non object.';
        data = holder || (data[item] = {});
        i++;
    }

    const lastItem = path[last];
    if (maybeList) {
        if (!data[lastItem]) data[lastItem] = value;
        else if (typeof data[lastItem] !== 'string') data[lastItem].push(value);
        else data[lastItem] = [data[lastItem], value];
    } else data[lastItem] = value;

};

exports.register = function register(path, value) {

    const registry = this._registry || (this._registry = {});

    if (arguments.length === 1) {

        for (let key in path) {
            setValueByPath(registry, key, path[key], false);
        }

    } else {
        setValueByPath(registry, path, value || this, false);
    }

    return this;

};
