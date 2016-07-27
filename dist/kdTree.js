"use strict";
var node_1 = require("./node");
var binaryHeap_1 = require("./binaryHeap");
var KdTree = (function () {
    function KdTree(metric, dimensions) {
        this.metric = metric;
        this.dimensions = dimensions;
        this.root = null;
    }
    KdTree.prototype.createTree = function (elements) {
        this.root = this.buildTree(elements, 0, null);
    };
    KdTree.prototype.buildTree = function (elements, depth, parent) {
        var self = this;
        var dim = depth % self.dimensions.length;
        if (elements.length === 0)
            return null;
        if (elements.length === 1)
            return new node_1.Node(elements[0], dim, parent);
        elements.sort(function (a, b) { return a[self.dimensions[dim]] - b[self.dimensions[dim]]; });
        var median = Math.floor(elements.length / 2);
        var node = new node_1.Node(elements[median], dim, parent);
        node.left = self.buildTree(elements.slice(0, median), depth + 1, node);
        node.right = self.buildTree(elements.slice(median + 1), depth + 1, node);
        return node;
    };
    KdTree.prototype.insert = function (element) {
        var self = this;
        function innerSearch(node, parent) {
            if (node === null)
                return parent;
            var dim = self.dimensions[node.dimension];
            return (element[dim] < node.obj[dim]) ? innerSearch(node.left, node) : innerSearch(node.right, node);
        }
        var insertPosition = innerSearch(self.root, null);
        // New Kd-tree 
        if (insertPosition === null) {
            self.root = new node_1.Node(element, 0, null);
            return;
        }
        var newNode = new node_1.Node(element, (insertPosition.dimension + 1) % self.dimensions.length, insertPosition);
        var dim = self.dimensions[insertPosition.dimension];
        if (element[dim] < insertPosition.obj[dim]) {
            insertPosition.left = newNode;
        }
        else {
            insertPosition.right = newNode;
        }
    };
    KdTree.prototype.remove = function (element) {
        var self = this;
        var node;
        function nodeSearch(node) {
            if (node === null)
                return null;
            if (node.obj === element)
                return node;
            var dim = self.dimensions[node.dimension];
            return (element[dim] < node.obj[dim]) ? nodeSearch(node.left) : nodeSearch(node.right);
        }
        function removeNode(node) {
            var innerSelf = self;
            var nextNode;
            var nextObj;
            var pDimension;
            function findMin(node, dim) {
                if (node === null)
                    return null;
                var dimension = innerSelf.dimensions[dim];
                if (node.dimension === dim) {
                    return (node.left !== null) ? findMin(node.left, dim) : node;
                }
                var own = node.obj[dimension];
                var left = findMin(node.left, dim);
                var right = findMin(node.right, dim);
                var min = node;
                if (left !== null && left.obj[dimension] < own) {
                    min = left;
                }
                if (right !== null && right.obj[dimension] < min.obj[dimension]) {
                    min = right;
                }
                return min;
            }
            if (node.left === null && node.right === null) {
                if (node.parent === null) {
                    self.root = null;
                    return;
                }
                //--- Node still has a parent but no subtrees
                pDimension = self.dimensions[node.parent.dimension];
                if (node.obj[pDimension] < node.parent.obj[pDimension]) {
                    node.parent.left = null;
                }
                else {
                    node.parent.right = null;
                }
                return;
            }
            //--- Node with subtrees.. 
            // swap with the minimum element on the node's dimension.
            // If it is empty, we swap the left and right subtrees and do the same
            if (node.right !== null) {
                nextNode = findMin(node.right, node.dimension);
                nextObj = nextNode.obj;
                removeNode(nextNode);
                node.obj = nextObj;
            }
            else {
                nextNode = findMin(node.left, node.dimension);
                nextObj = nextNode.obj;
                removeNode(nextNode);
                node.right = node.left;
                node.left = null;
                node.obj = nextObj;
            }
        } // end removeNode
        node = nodeSearch(this.root); // check if in tree
        if (node === null) {
            return;
        }
        removeNode(node);
    };
    KdTree.prototype.nearest = function (element, maxNodes, maxDistance) {
        var bestNodes = new binaryHeap_1.BinaryHeap(function (e) { return -e[1]; });
        var self = this;
        function nearestSearch(node) {
            var bestChild, dimension = self.dimensions[node.dimension], ownDistance = self.metric(element, node.obj), linearElement = {}, linearDistance, otherChild, i;
            function saveNode(node, distance) {
                bestNodes.push([node, distance]);
                if (bestNodes.size() > maxNodes) {
                    bestNodes.pop();
                }
            }
            for (i = 0; i < self.dimensions.length; i += 1) {
                linearElement[self.dimensions[i]] = (i === node.dimension) ? element[self.dimensions[i]] : node.obj[self.dimensions[i]];
            }
            linearDistance = self.metric(linearElement, node.obj);
            if (node.right === null && node.left === null) {
                if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
                    saveNode(node, ownDistance);
                }
                return;
            }
            if (node.right === null) {
                bestChild = node.left;
            }
            else if (node.left === null) {
                bestChild = node.right;
            }
            else {
                bestChild = (element[dimension] < node.obj[dimension]) ? node.left : node.right;
            }
            // call recursive
            nearestSearch(bestChild);
            if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
                saveNode(node, ownDistance);
            }
            if (bestNodes.size() < maxNodes || Math.abs(linearDistance) < bestNodes.peek()[1]) {
                otherChild = (bestChild === node.left) ? node.right : node.left;
                if (otherChild !== null) {
                    nearestSearch(otherChild);
                }
            }
        } //end nearestSearch
        var i;
        if (maxDistance) {
            for (i = 0; i < maxNodes; i += 1) {
                bestNodes.push([null, maxDistance]);
            }
        }
        if (this.root)
            nearestSearch(this.root);
        var result = [];
        for (i = 0; i < Math.min(maxNodes, bestNodes.content.length); i += 1) {
            if (bestNodes.content[i][0]) {
                result.push([bestNodes.content[i][0].obj, bestNodes.content[i][1]]);
            }
        }
        return result;
    };
    KdTree.prototype.getBalanceFactor = function () {
        function height(node) {
            return (node === null) ? 0 : Math.max(height(node.left), height(node.right)) + 1;
        }
        function count(node) {
            return (node === null) ? 0 : count(node.left) + count(node.right) + 1;
        }
        return height(this.root) / (Math.log(count(this.root)) / Math.log(2));
    };
    return KdTree;
}());
exports.KdTree = KdTree;
//# sourceMappingURL=kdTree.js.map