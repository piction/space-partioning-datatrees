import { INode, Node } from "./node";
export declare class KdTree {
    private metric;
    private dimensions;
    nodes: Array<INode>;
    root: Node;
    constructor(metric: (...args: any[]) => number, dimensions: Array<string>);
    createTree(elements: Array<any>): void;
    private buildTree(elements, depth, parent);
    insert(element: any): void;
    remove(element: any): void;
    nearest(element: any, maxNodes?: number, maxDistance?: number): Array<Node>;
    getBalanceFactor(): number;
}
