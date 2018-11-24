window.onload = function () {

    // Set the canvas
    var margin = {top: 20, right: 300, bottom: 50, left: 110},
        paddingWidth = 100,
        paddingHeight = 350,
        width = window.innerWidth - margin.left - margin.right - paddingWidth,
        height = window.innerHeight - margin.top - margin.bottom - paddingHeight;

    // Make the X- and Y scaling of the svg
    var x = d3.scale.linear()
          .range([0, width]);

    var y = d3.scale.linear()
          .range([height, 0]);

    // Set a color range
    var color = d3.scale.category10();

    // Select the SVG
    var svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var g = svg.append("g")

    // Display current year
    document.getElementById("currentQuarter").innerHTML = "Quarter 1";

    // Define the X- and Yaxisis
    var xAxis = d3.svg.axis()
          .scale(x)
          .ticks(15)
          .orient("bottom");

    var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left");

    // Create array for specific elements
    var touchdownPerQtr = [],
        minutesPerQtr = [];

    // Quarter switch
    var displayQuarter = 0

    // Control which line you want to show
    var showCircle = ".mouse-per-line circle";
    var showText = ".mouse-per-line text";

    // Load the data from the JSON file
    d3.json("data/touchdown.json", function(error, data) {
      
        // Error handling
        if (error) {
          alert("There was a error loading the page. Please refresh.");
          throw error;
        }

        // Convert into intergers
        data.forEach(function(d) {
            d.Minute = +d.Minute;
            d.Touchdowns = +d.Touchdowns;
        });

        // Group data in nests
        var dataNest = d3.nest()
            .key(function(d) { return d.Season;})
            .key(function(d) { return d.Qtr; })
            .entries(data);

        // Set the X domain
        x.domain(d3.extent(data, function(d) { 
            return d.Minute; 
        }));   

        // Gather specific data
        dataNest.forEach(function(d) { 
            for (var i = 0; i < 16; i++) {
                touchdownPerQtr.push(d.values[displayQuarter].values[i].Touchdowns)
                minutesPerQtr.push(d.values[displayQuarter].values[i].Minute)
            }
        });

        // Set the Y domain
        y.domain(d3.extent(touchdownPerQtr))
        .nice();

        // Make the X axis
        makeX(svg, height, width, xAxis);

        // Make the Y axis
        makeY(svg, height, width, yAxis);

        // Define the line
        var touchdownline = d3.svg.line() 
            .x(function(d) { 
                return x(d.Minute); 
            })
            .y(function(d) {
                return y(d.Touchdowns); 
            });

        // Draw the lines for all the years
        dataNest.forEach(function(d) { 
            g.append("path")
                .attr("class", "line " + d.key)
                .style("stroke", function() {
                    return d.color = color(d.key); 
                })
                .attr("d", touchdownline(d.values[displayQuarter].values));
        });

        // Change the quarter by getting the value of a button
        d3.selectAll('button[name="quarter"]').on("click", function(e){
          var value = this.getAttribute("value");
          changeQuarter(value, x, dataNest, y, g, data, svg, color, yAxis);
        });

        // Draw the legend (based on: https://bl.ocks.org/mbostock/3887118, Mike Bostock)
        var legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter()
            .append("g")
                .attr("id", function(d) {
                    return d; 
                })
                .attr("class", "legend")
                .attr("transform", function(d, i) {
                    return "translate(0," + i * 20 + ")";
                })

        legend.append("circle")
            .attr("r", 8)
            .style("fill", color)
            .attr("cx", width + margin.right - 100)
            .attr("cy", 10)

            // Select all the years
            .on("click", function(d) {
                d3.selectAll(".line")
                    .attr("opacity", .2);
                d3.select("." + d)
                    .attr("opacity", 1);
                showCircle = ("." + d + " circle")
                showText = ("." + d + " text")
            })

        legend.append("text")
            .attr("x", (width + margin.right) - 10)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) {
                return d;
            });

        var selectAll = svg.append("g")
            .attr("id", "showAll")
            .attr("transform", "translate(0, 160)");

        selectAll.append("circle")
            .attr("r", 8)
            .style("fill", "white")
            .attr("cx", width + margin.right - 100)
            .attr("cy", 10)

            // Select all the years
            .on("click", function(d) {
                d3.selectAll(".line")
                    .attr("opacity", 1);
                showCircle = (".mouse-per-line circle")
                showText = (".mouse-per-line text")
            })

        selectAll.append("text")
            .attr("x", (width + margin.right) - 15)
            .attr("y", 9)
            .attr("dy", ".35em")
            .attr("fill", "white")
            .style("text-anchor", "end")
            .text("Show all");

  /* Mouseover event: See the amount of touchdowns per Quarter
     Source: https://stackoverflow.com/questions/34886070/multiseries-line-chart-with-mouseover-tooltip, Mark
  */

        // General mouse event handler
        var mouseG = svg.append("g")
            .attr("class", "mouse-over-effects");

        // Create a vertical line indicator
        mouseG.append("path")
            .attr("class", "mouse-line")
            .style("stroke-dasharray", ("3, 3"))
            .style("stroke", "white")
            .style("opacity", "0");

        // Collect all lines
        var lines = document.getElementsByClassName('line');

        // Create a group element for every circle in the mouseover event.
        var mousePerLine = mouseG.selectAll('.mouse-per-line')
            .data(dataNest)
            .enter()
            .append("g")
                .attr("class", function(d) { return d.key + " mouse-per-line"});

        // Make the circles
        mousePerLine.append("circle")
            .attr("r", 10)
            .style("stroke", function(d) {
                return color(d.key);
            })
            .style("fill", "none")
            .style("stroke-width", "2px")
            .style("opacity", "0");

        // Make the text
        mousePerLine.append("text")
            .attr("transform", "translate(15,3)")
            .attr("fill", "white")
            .style("font-size", "15px");

        // Capture the mouse movements in a rect
        mouseG.append('svg:rect')
            .data(dataNest)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')

            // Hide all elements if mouseout
            .on('mouseout', function() {
                d3.select(".mouse-line")
                    .style("opacity", "0");
                d3.selectAll(".mouse-per-line circle")
                    .style("opacity", "0");
                d3.selectAll(".mouse-per-line text")
                    .style("opacity", "0");
            })

            // On mouse in show line, circles and text
            .on('mouseover', function() { 
                d3.select(".mouse-line")
                    .style("opacity", "1");
                d3.selectAll(showCircle)
                    .style("opacity", "1");
                d3.selectAll(showText)
                    .style("opacity", "1");
            })

            // Capture the mousemove in a variable for calculations
            .on('mousemove', function() {
                var mouse = d3.mouse(this);

            // Move the vertical line to where your mouse is
            d3.select(".mouse-line")
                .attr("stoke", "white")
                .attr("d", function() {
                    var d = "M" + mouse[0] + "," + height;
                    d += " " + mouse[0] + "," + 0;
                    return d;
                });

            // Position the circle and text
            d3.selectAll(".mouse-per-line")
                .attr("transform", function(d, i) {
                    var beginning = 0,
                        end = lines[i].getTotalLength(),
                        target = null;

                    // Quick maths
                    while (true) {
                        target = Math.floor((beginning + end) / 2);
                        pos = lines[i].getPointAtLength(target);
                        if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                            break;
                        }
                        if (pos.x > mouse[0]) {
                            end = target;
                        }     
                        else if (pos.x < mouse[0]) {
                            beginning = target;
                        }
                        else
                            break; 
                    }

                    // Update the text with the amount of touchdowns
                    d3.select(this).select('text')
                        .text(y.invert(pos.y).toFixed(0) + " Touchdowns");

                    // Return the posisition 
                    return "translate(" + mouse[0] + "," + pos.y +")";
                });
            });
      });
}

/* 
  makeX takes the variable svg as an argument
  to make an Xaxis with the given svg settings
*/
function makeX(svg, height, width, xAxis) {
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)

      // Create a label
      .append("text")
          .attr("class", "label")
          .attr("x", width)
          .attr("y", 45)
          .style("text-anchor", "end")
          .text("Minutes");
}

/* 
  makeY takes the variable svg as an argument.
  to make an Xaxis with the given svg settings
*/
function makeY(svg, height, width, yAxis) {
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)

  // Create a label
  .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("dy", ".71em")

      .style("text-anchor", "end")
      .text("Touchdowns")
}

/* 
  changeQuarter is a function that will change the data,
  based on the variable 'displayQuarter'. This variable is changed by getting the 
  value of the button that is pressed at the index.
*/
function changeQuarter(displayQuarter, x, dataNest, y, g, data, svg, color, yAxis) {
  
    var qtrnr = parseInt(displayQuarter) + 1;

    // Create array for specific elements
    var touchdownPerQtr = [],
        minutesPerQtr = [];

    // Display current Quarter
    document.getElementById("currentQuarter").innerHTML = "Quarter " + qtrnr;

    // Set the X domain
    x.domain(d3.extent(data, function(d) { 
        return d.Minute; 
    }));   

    // Gather specific data
    dataNest.forEach(function(d) { 
        for (var i = 0; i < 16; i++) {
            touchdownPerQtr.push(d.values[displayQuarter].values[i].Touchdowns)
            minutesPerQtr.push(d.values[displayQuarter].values[i].Minute)
        }
    });

    // Set the Y domain
    y.domain(d3.extent(touchdownPerQtr))
    .nice();

    // Define the line
    var touchdownline = d3.svg.line() 
        .x(function(d) { 
            return x(d.Minute); 
        })
        .y(function(d) {
            return y(d.Touchdowns); 
        });

    // Draw the lines for all the years 
    g.selectAll("path")
        .data(dataNest)
        .transition()
        .duration(1000)
        .delay(function(d, i) {
            return i / data.length * 300;
        })
        .style("stroke", function(d) {
            return d.color = color(d.key); 
        })
        .attr("d", function(d) { 
            return touchdownline(d.values[displayQuarter].values)
        });

     // Update Y Axis
     svg.select(".y.axis")
         .transition()
         .duration(1000)
         .call(yAxis);
}
/*
  Name: Jurre Brandsen
  Student number: 11808918

  This script is used to make a multilinegraph
  This graph displays the amount of touchdowns made per minute per quarter

  You can switch through the quarters by pressing buttons.
  The graph will update automaticly.

  sources used:
  - http://learnjsdata.com/group_data.html
  - http://bl.ocks.org/WilliamQLiu/76ae20060e19bf42d774
  - http://bl.ocks.org/wdickerson/64535aff478e8a9fd9d9facccfef8929
*/