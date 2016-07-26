
import {KdTree} from "../src/kdTree";
import {CollapsibleTree} from "./collapsibleTree";


var canvas, ctx;
var points = [];

var distance  = function (a:any, b:any):number {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return dx*dx + dy*dy;
}
var tree = new KdTree(distance, ["x","y"]);
var testCollapse = new CollapsibleTree();

function getCount() 
{
    var total = 0;
    function count(node)
    {
        if(node == null) return 0;
        total += 1;
        count(node.right);
        count(node.left);
    }
    count(tree.root);
    return total;
}

function renderTree() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
    render(tree.root, [[0, canvas.width], [0, canvas.height]]);
    testCollapse.render(tree.root);

    function render(node, bounds) {
        if(node == null) return;

        ctx.beginPath();
        ctx.fillStyle = "#00f";
        ctx.beginPath();
        ctx.arc(node.obj.x, node.obj.y, 5, 0, Math.PI*2);
        ctx.closePath();
        ctx.fill();

        var leftBounds = [];
        leftBounds[0] = bounds[0].slice(0);
        leftBounds[1] = bounds[1].slice(0);

        var rightBounds = [];
        rightBounds[0] = bounds[0].slice(0);
        rightBounds[1] = bounds[1].slice(0);

        ctx.beginPath();
        if(node.dimension == 0) { // was split on x value
            ctx.moveTo(node.obj.x, bounds[1][0]);
            ctx.lineTo(node.obj.x, bounds[1][1]);
            leftBounds[0][1] = node.obj.x;
            rightBounds[0][0] = node.obj.x;
        } else {
            ctx.moveTo(bounds[0][0], node.obj.y);
            ctx.lineTo(bounds[0][1], node.obj.y);
            leftBounds[1][1] = node.obj.y;
            rightBounds[1][0] = node.obj.y;
        }
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = "rgba(255,0,0,0.2)";
        ctx.fillRect(bounds[0][0], bounds[1][0], bounds[0][1]-bounds[0][0], bounds[1][1]-bounds[1][0]);

        render(node.left, leftBounds);
        render(node.right, rightBounds);
    }
}

window.document.addEventListener("DOMContentLoaded", function(event) { 
    canvas = document.getElementById("canvas");
	ctx = canvas.getContext('2d');

     document.getElementById("add").addEventListener("click", function(){
        var point = {
            x: Math.random()*canvas.width,
            y: Math.random()*canvas.height
        };
        points.push(point);
        tree.insert(point);
        renderTree();
        console.log("Total : " , getCount());
    });
    document.getElementById("rebuild").addEventListener("click", function(){
        tree = new KdTree(distance, ["x", "y"]);
        tree.createTree(points);
        console.log("Show tree:", tree);
        renderTree();
    });

    document.getElementById("canvas").addEventListener("click", function(event){
          var pointSearch = {
            x: event.x,
            y: event.y
        };
        var nearestResults = tree.nearest({x: pointSearch.x, y: pointSearch.y}, 5,30000);
        var point = nearestResults[0][0];
        console.log("Show result founded:", nearestResults);
        points.splice(points.indexOf(point), 1);
        tree.remove(point);
        renderTree();
        console.log("Total after removed : ", getCount());
        console.log("_Balance factor : ",tree.getBalanceFactor());
    });
});


