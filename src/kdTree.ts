import {INode, Node} from "node";

export class KdTree {
    
    public nodes:Array<INode>;
    public root:Node = null;
    constructor( metric:()=>number, private dimensions:Array<string>){}

    public buildTree(elements:Array<any> , depth:number,  parent:INode) : Node{
        var dim : number = depth % this.dimensions.length;
        if(elements.length === 0) return null;
        if(elements.length === 1) return new Node(elements[0],dim, parent);
        
        elements.sort((a,b) => a[this.dimensions[dim]] - b[this.dimensions[dim]]);
        var median:number = Math.floor(elements.length/2);
        var node: Node = new Node(elements[median],dim, parent);
        node.left = this.buildTree(elements.slice(0,median),depth + 1, <INode> node);
        node.right = this.buildTree(elements.slice(median+1),depth + 1, <INode> node);
        return node;
    }
    public insert( element:any) {
        function innerSearch( node :INode , parent :INode) : INode {
            if(node === null) return parent;
            var dim :string = this.dimensions[node.dimension];
            return (element[dim] < node.obj[dim]) ? innerSearch(node.left , node) : innerSearch(node.right , node);
        }
        var insertPosition = innerSearch(this.root,null);
        
        // New Kd-tree 
        if(insertPosition === null) {
            this.root = new Node(element,0,null);
        }
        var newNode :Node = new Node(element,(insertPosition.dimension + 1 ) % this.dimensions.length , insertPosition);
        var dim : string = this.dimensions[insertPosition.dimension];
        
        if(element[dim] < insertPosition.obj[dim]) { insertPosition.left = newNode;}
        else { insertPosition.right = newNode;}
    }
    public remove (element: any) {
        
        function nodeSearch(node :INode ): INode  {
            if(node === null) return null;
            if(node.obj === element) return node;
            var dim = this.dimensions[node.dimension];
            return (element[dim] < node.obj[dim]) ?  nodeSearch(node.left) : nodeSearch(node.right);
        }
        function removeNode(node:INode):void {

            function findMin(node :INode , dim :number):Node {
                if(node === null) return null;
                var dimension = this.dimensions[node.dimension];
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
                    this.root =null;
                    return;
                }
                //--- Node still has a parent but no subtrees
                var pDimension = this.dimensions[node.parent.dimansion];
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
            var nextNode : INode;
            var nextObj : any;
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

        var node = nodeSearch(this.root); // check if in tree
        if (node === null) { return; }
        removeNode(node);
        
    }


}