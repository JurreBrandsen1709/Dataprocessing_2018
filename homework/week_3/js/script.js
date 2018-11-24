/*
  PERCENTAGE OF U.S. MEN WHO HAVE NEVER MARRIED, BY AGE, 1980-2015
  By: Jurre Bransen 11808918
  Based on: https://www.reddit.com/r/dataisbeautiful/comments/7b31li/percentage_of_us_women_never_married_by_age_1980/
  Sources: - http://alignedleft.com/tutorials/d3/
           - https://github.com/d3/d3/wiki/Tutorials
           - https://bost.ocks.org/mike/bar/
*/

// Settings before initialising the graph
var svg = d3.select("svg"),
    margin = {top: 75, right: 30, bottom: 50, left: 75},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
    x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]),
    color = d3.scaleOrdinal().range(["#6b486b", "#d0743c"]);

// Get data from the file 'married' in the map data
d3.json("data/married.json", function(data) {

  // D3 tooltip settings
  var tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-15, 0])
    .html(function(d) { 
      var format = d3.format(".1f")
      return "Age: " + d.name + "<br/>" + "Percentage: " + format(d.value); 
    });

  // Initialise the tooltip
  svg.call(tip);

  // Set X- and Y domains
  x.domain(data.map(function(d) { 
    return d.name; 
  }));
  y.domain([0, d3.max(data, function(d) {
   return d.value; 
  })]);

  // Make the X-axis
  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
  g.append("text")
    .attr("x", 0)
    .attr("y", height + margin.bottom - 10)
    .text("Age");

  // Make the Y-Axis
  g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y));

  // Text markup for vertical Pencentage
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -80)
    .attr("x", -610)
    .attr("dy", "3em")
    .attr("text-anchor", "end")
    .text("Percentage");

  // Make bars with the data from married.json
  g.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { 
      return x(d.name);
    })
    .attr("y", function(d) {  
      return y(d.value); 
    })
    .attr("width", x.bandwidth() - 3)
    .attr("height", function(d) { 
      return height - y(d.value); 
    })
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .style("fill", function(d, i) {
      return color(i);
    });

  // Legend of 1980
  var legend = g.append("g")
  legend.append("rect")
    .attr("x", width - 19)
    .attr("width", 40)
    .attr("height", 20)
    .attr("fill", color);
  legend.append("text")
    .attr("x", width - 60)
    .attr("y", 16)
    .text("1980");

  // Legend of 1980
  legend.append("rect")
    .attr("x", width - 19)
    .attr("y", 30)
    .attr("width", 40)
    .attr("height", 20)
    .attr("fill", "#d0743c");
  legend.append("text")
    .attr("x", width - 60)
    .attr("y", 45)
    .text("2015");
});