/*
  LEGEND EXERCISE
  By: Jurre Bransen 11808918
*/

// SVG data
var colors = d3.scaleOrdinal().range(["#ccece6","#99d8c9","#66c2a4","#41ae76","#238b45","#005824"]),
	data = [100, 1000, 10000, 100000, 1000000, 10000000],
	data2 = [1, 2, 3],
	data3 = [2, 3];

// SVG Constants
var	RECTHEIGHT = 29,
	RECTWIDTH = 21,
	TEXTWIDTH = 119.1,
	X1 = 13,
	X2 = 46.5,
	X3 = 50;

// Load the SVG
d3.xml("test.svg").mimeType("image/svg+xml").get(function(error, xml) {
  	if (error) throw error;
  	document.body.appendChild(xml.documentElement);

  	// Create a variable for the svg
  	var svg = d3.select("svg");
  	var g = svg.append("g");

  	// Create text elements for data
	var text = svg.selectAll("g")
		text.selectAll("g")
  		.data(data)
  		.enter()
			.append("text")
			.attr("y", function(d, i){ 
            	return calcY2(i)
            })
			.attr("x", X3)
			.attr("fill","#005824")
			.text(function(d){ return d;});

	// Create three rectangles for the colors
  	var colorRect = svg.append("g")
  		colorRect.selectAll("g")
  		.data(data2)
  		.enter()
  			.append("rect")
  			.attr("class", "st1")
	  		.attr("width", RECTWIDTH)
	  		.attr("height", RECTHEIGHT)
            .attr("x", X1)
            .attr("y", function(i){ 
            	return calcY(i)
            })
	  		.attr("stroke", "black");

  	var textRect = g.selectAll("rect")
  		.data(data3)
  		.enter()
  			.append("g")
  			.append("rect")
  			.attr("class", "st2")
	  		.attr("width", TEXTWIDTH)
	  		.attr("height", RECTHEIGHT)
            .attr("x", X2)
            .attr("y", function(i){ 
            	return calcY(i)
            });

	// Give a color for every element in st1
	var legendColor = d3.selectAll(".st1")
		legendColor.style("fill", function(d, i) {
	      return colors(i);
	    });
});

// Calculate Y of the rectangles
function calcY(c) {
	var a = 96.8;
	var b = 41.9;
	return a + (b * c);
}
// Calculate the Y of the text
function calcY2(c) {
	var a = 33.5;
	var b = 41.9;
	return a + (b * c);
}