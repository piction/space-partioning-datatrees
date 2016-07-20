System.register("node", [], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Node;
    return {
        setters:[],
        execute: function() {
            Node = (function () {
                function Node(obj, dimansion, parent) {
                    this.obj = obj;
                    this.dimansion = dimansion;
                    this.parent = parent;
                    this.left = null;
                    this.right = null;
                }
                ;
                return Node;
            }());
            exports_1("Node", Node);
        }
    }
});
System.register("kdTree", ["node"], function(exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    var node_1;
    var KdTree;
    return {
        setters:[
            function (node_1_1) {
                node_1 = node_1_1;
            }],
        execute: function() {
            KdTree = (function () {
                function KdTree(metric, dimensions) {
                    this.dimensions = dimensions;
                    this.root = null;
                }
                KdTree.prototype.buildTree = function (elements, depth, parent) {
                    var _this = this;
                    var dim = depth % this.dimensions.length;
                    if (elements.length === 0)
                        return null;
                    if (elements.length === 1)
                        return new node_1.Node(elements[0], dim, parent);
                    elements.sort(function (a, b) { return a[_this.dimensions[dim]] - b[_this.dimensions[dim]]; });
                    var median = Math.floor(elements.length / 2);
                    var node = new node_1.Node(elements[median], dim, parent);
                    node.left = this.buildTree(elements.slice(0, median), depth + 1, node);
                    node.right = this.buildTree(elements.slice(median + 1), depth + 1, node);
                    return node;
                };
                KdTree.prototype.insert = function (element) {
                    function innerSearch(node, parent) {
                        if (node === null)
                            return parent;
                        var dim = this.dimensions[node.dimansion];
                        return (element[dim] < node.obj[dim]) ? innerSearch(node.left, node) : innerSearch(node.right, node);
                    }
                    var insertPosition = innerSearch(this.root, null);
                    // New Kd-tree 
                    if (insertPosition === null) {
                        this.root = new node_1.Node(element, 0, null);
                    }
                    var newNode = new node_1.Node(element, (insertPosition.dimansion + 1) % this.dimensions.length, insertPosition);
                    var dim = this.dimensions[insertPosition.dimansion];
                    if (element[dim] < insertPosition.obj[dim]) {
                        insertPosition.left = newNode;
                    }
                    else {
                        insertPosition.right = newNode;
                    }
                };
                return KdTree;
            }());
            exports_2("KdTree", KdTree);
        }
    }
});
//# sourceMappingURL=index.js.map