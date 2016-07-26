import d3 = require('d3');



var MARGIN = { top: 20, right: 120, bottom: 20, left: 120 },
    width = 960 - MARGIN.right - MARGIN.left,
    height = 600 - MARGIN.top - MARGIN.bottom;

var svg = d3.select("#tree").append("svg")
    .attr("width", width + MARGIN.right + MARGIN.left)
    .attr("height", height + MARGIN.top + MARGIN.bottom);

var tree = d3.tree().size([height, width]);
var cluster = d3.cluster().size([height, width]);


export class CollapsibleTree {

    render(data) {
        svg.selectAll('*').remove();
        var g = svg.append("g").attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");


        function getStringFromNode(node) {
            return (node === null ) ? "" :( "[" + Math.round(node.obj.x) + "," +  Math.round(node.obj.y) + "]");
        }

        var flat =[];
    
        function flatByTraverse (node)
        {
            if (node === null) return;
            var found = false;
            for( var i =0 ; i < flat.length ; i++) 
            {
                if ( flat[i].name === getStringFromNode(node) )
                    {
                        found=true;
                        console.log("double found : ",getStringFromNode(node) );
                        break;
                    }
            }
            if(!found ) {
                flat.push({ name: getStringFromNode(node), parent :getStringFromNode(node.parent)});
            }
            flatByTraverse(node.left);
            flatByTraverse(node.right);
        }
        flatByTraverse(data);
        var h_root = d3.stratify()
            .id(function(d) { return d.name; })
            .parentId(function(d) { return d.parent; })
            (flat);

        tree(h_root);

        var link = g.selectAll(".link")
            .data(h_root.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .attr("d", function (d) {
                return "M" + d.y + "," + d.x
                    + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                    + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                    + " " + d.parent.y + "," + d.parent.x;
            });

       
        var node = g.selectAll(".node")
            .data(h_root.descendants())
            .enter().append("g")
            .attr("class", function (d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
            .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; })

        node.append("circle")
            .attr("r", 2.5);

        node.append("text")
            .attr("dy", 3)
            .attr("x", function (d) { return d.children ? -8 : 8; })
            .style("text-anchor", function (d) { return d.children ? "end" : "start"; })
            .text(function (d) { return d.data.name; });
    }

}










