module.exports = function register(path, value) {

    if (arguments.length === 1) {

        for (let key in path) {
            this.register(key, path[key]);
        }

    } else {

        if (typeof path === 'string') {
            path = path.split(/\s+|\s*,\s*/)
        }

        let part = this._registry || (this._registry = {});

        let i = 0, last = path.length - 1;
        while (i < len) {
            const item = path[i];
            part = part[item] || (part[item] = {});
            i++;
        }

        part[path[last]] = value;

    }

    return this;

};
