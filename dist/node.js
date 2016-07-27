"use strict";
var Node = (function () {
    function Node(obj, dimension, parent) {
        this.obj = obj;
        this.dimension = dimension;
        this.parent = parent;
        this.left = null;
        this.right = null;
    }
    ;
    return Node;
}());
exports.Node = Node;
//# sourceMappingURL=node.js.map