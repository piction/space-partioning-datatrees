

export interface INode {
    obj:any,
    parent:any,
    left:any,
    right:any,
    dimension:number
}

export class Node {
   constructor(public obj:any , public dimension:number , public parent:INode){};
    public left :INode = null;
    public right: INode = null;
}
