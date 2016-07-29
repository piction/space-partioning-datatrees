export interface INode {
    obj: any;
    parent: any;
    left: any;
    right: any;
    dimension: number;
}
export declare class Node {
    obj: any;
    dimension: number;
    parent: INode;
    constructor(obj: any, dimension: number, parent: INode);
    left: INode;
    right: INode;
}
