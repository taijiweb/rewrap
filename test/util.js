
exports.str = function str(obj) {
    "use strict";
    return JSON.stringify(obj);
};

exports.joinKey = function (obj) {
    "use strict";
    return Object.keys(obj).join(' ');
};

exports.join = function (arr) {
    "use strict";
    return arr.join(' ');
};

exports.join2d = function (arr) {
    "use strict";
    return arr.map((x) => x.join(' ')).join(', ');
};