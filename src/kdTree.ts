import {INode, Node} from "./node";
import {BinaryHeap} from "./binaryHeap";

export class KdTree {
    
    public nodes:Array<INode>;
    public root:Node = null;
    constructor( private metric:(...args:any[])=>number, private dimensions:Array<string>){}

    public createTree(elements:Array<any>):void {
        this.root = this.buildTree(elements, 0, null);
    }
    private buildTree(elements:Array<any> , depth:number,  parent:INode) : Node{
        var self = this;
        var dim : number = depth % self.dimensions.length;
        if(elements.length === 0) return null;
        if(elements.length === 1) return new Node(elements[0],dim, parent);
        
        elements.sort((a,b) => a[self.dimensions[dim]] - b[self.dimensions[dim]]);
        var median:number = Math.floor(elements.length/2);
        var node: Node = new Node(elements[median],dim, parent);
        node.left = self.buildTree(elements.slice(0,median),depth + 1, <INode> node);
        node.right = self.buildTree(elements.slice(median+1),depth + 1, <INode> node);
        return node;
    }
    public insert( element:any) {
        var self = this;
        function innerSearch( node :INode , parent :INode) : INode {
            if(node === null) return parent;
            var dim :string = self.dimensions[node.dimension];
            return (element[dim] < node.obj[dim]) ? innerSearch(node.left , node) : innerSearch(node.right , node);
        }
        var insertPosition = innerSearch(self.root,null);
        
        // New Kd-tree 
        if(insertPosition === null) {
            self.root = new Node(element,0,null);
            return;
        }
        var newNode :Node = new Node(element,(insertPosition.dimension + 1 ) % self.dimensions.length , insertPosition);
        var dim : string = self.dimensions[insertPosition.dimension];
        
        if(element[dim] < insertPosition.obj[dim]) { insertPosition.left = newNode;}
        else { insertPosition.right = newNode;}
    }
    public remove (element: any) {
        var self = this;
        var node :INode;
        function nodeSearch(node :INode ): INode  {
            if(node === null) return null;
            if(node.obj === element) return node;
            var dim = self.dimensions[node.dimension];
            return (element[dim] < node.obj[dim]) ?  nodeSearch(node.left) : nodeSearch(node.right);
        }
        function removeNode(node:INode):void {
            var innerSelf = self;
            var nextNode : INode;
            var nextObj : any;
            var pDimension :string;
            function findMin(node :INode , dim :number):Node {
                if(node === null) return null;
                var dimension = innerSelf.dimensions[dim];
                if(node.dimension === dim) {
                    return (node.left !==null) ? findMin(node.left,dim) : node ;
                }

                var own = node.obj[dimension];
                var left = findMin(node.left,dim);
                var right = findMin(node.right, dim);
                var min = node;
                if( left !== null && left.obj[dimension] < own) { min = left;}
                if( right !== null && right.obj[dimension] < min.obj[dimension]) { min = right;}
                return min;
            }

            if(node.left === null && node.right === null ) {
                if(node.parent === null) {
                    self.root =null;
                    return;
                }
                //--- Node still has a parent but no subtrees
                pDimension = self.dimensions[node.parent.dimension];
                if(node.obj[pDimension] < node.parent.obj[pDimension]) {
                    node.parent.left =null;
                } else  {
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
            } else {
                nextNode = findMin(node.left, node.dimension);
                nextObj = nextNode.obj;
                removeNode(nextNode);
                node.right = node.left;
                node.left = null;
                node.obj = nextObj;
            }
        }// end removeNode

        node = nodeSearch(this.root); // check if in tree
        if (node === null) { return; }
        removeNode(node);
    }
    public nearest(element: any, maxNodes?:number , maxDistance?:number): Array<Node> {
        var bestNodes = new BinaryHeap((e)=> -e[1]);
        var self = this;
        function nearestSearch(node:INode) {
            var bestChild:any,
            dimension = self.dimensions[node.dimension],
            ownDistance = self.metric(element, node.obj),
            linearElement:any= {},
            linearDistance:number,
            otherChild:any,
            i:number;

            function saveNode(node:INode, distance:number) {
                bestNodes.push([node, distance]);
                if (bestNodes.size() > maxNodes) {bestNodes.pop();}
            }

            for (i = 0; i < self.dimensions.length; i += 1) {
                linearElement[self.dimensions[i]] = (i === node.dimension) ? element[self.dimensions[i]] :  node.obj[self.dimensions[i]];
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
            } else if (node.left === null) {
                bestChild = node.right;
            } else {
                bestChild = (element[dimension] < node.obj[dimension]) ? node.left :node.right;
            }
            // call recursive
            nearestSearch(bestChild);

            if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
                saveNode(node, ownDistance);
            }

            if (bestNodes.size() < maxNodes || Math.abs(linearDistance) < bestNodes.peek()[1]) {
                otherChild =(bestChild === node.left) ? node.right : node.left;
                if (otherChild !== null) {
                    nearestSearch(otherChild);
                }
            }
        }//end nearestSearch

        var i:number;
        if (maxDistance) {
            for (i = 0; i < maxNodes; i += 1) { bestNodes.push([null, maxDistance]); }
        }
        if(this.root)
            nearestSearch(this.root);

        var result:Array<any> = [];

        for (i = 0; i < Math.min(maxNodes, bestNodes.content.length); i += 1) {
            if (bestNodes.content[i][0]) {
                result.push([bestNodes.content[i][0].obj, bestNodes.content[i][1]]);
            }
        }
        return result;
    }
    public getBalanceFactor ():number {
       function height(node:INode):number {
        return (node === null) ? 0 :Math.max(height(node.left), height(node.right)) + 1;
      }
      function count(node:INode):number {
        return (node === null) ? 0 : count(node.left) + count(node.right) + 1;
      }
      return height(this.root) / (Math.log(count(this.root)) / Math.log(2));
    }
    
}