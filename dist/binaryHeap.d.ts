export declare class BinaryHeap {
    private scoreFunction;
    constructor(scoreFunction: (el?: any) => any);
    content: Array<any>;
    bubbleUp(n: number): void;
    sinkDown(n: number): void;
    push(element: any): void;
    pop(): void;
    peek(): any;
    size(): number;
    remove(node: any): void;
}
