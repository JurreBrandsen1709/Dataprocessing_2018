/*
  Name: Jurre Brandsen
  Student number: 11808918

  This script will draw a scatterplot,
  to show the correlation between the national GDP
  and Child deaths in a county
*/

window.onload = function () {

  // Set the canvas
  var margin = {top: 20, right: 50, bottom: 50, left: 110},
      width = 800 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom,
      padding = 18,

      // Make the X- and Y scaling of the svg
      x = d3.scale.linear()
          .range([0, width]),
      y = d3.scale.linear()
          .range([height, 0]),

      // Set a color range
      color = d3.scale.category10(),

      // Select the SVG
      svg = d3.select("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),

      // Define the X- and Yaxisis
      xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom"),
      yAxis = d3.svg.axis()
          .scale(y)
          .orient("left");

  // Load the data from the JSON file
  d3.json("data/poverty.json", function(error, data) {
    
      // Error handling
      if (error) throw error;

      // Convert into intergers
      data.forEach(function(d) {
          d.income1960 = +d.income1960;
          d.mort1960 = +d.mort1960;
          d.income2015 = +d.income2015;
      });

      // Display current year
      document.getElementById("currentYear").innerHTML = "1960";

      // Tooltip for 1960
      var tip = d3.tip()
          .attr("class", "d3-tip")
          .offset([-15, 0])
          .html(function(d) { 
              return "<strong>Country: </strong> <span style='color:red'>" + 
              d.country + 
              "</span><br/><strong>GDP: </strong><span style='color:red'>" + 
              d.income1960 + 
              "</span><span> Billion</span><br/><strong>Deaths per 1000 childs born: </strong><span style='color:red'>" + 
              d.mort1960 + 
              "</span>";
          });

      // After the setup, call tip
      svg.call(tip);

      // Tooltip for 1960
      var tip2 = d3.tip()
          .attr("class", "d3-tip")
          .offset([-15, 0])
          .html(function(d) { 
              return "<strong>Country: </strong> <span style='color:red'>" + 
              d.country + 
              "</span><br/><strong>GDP: </strong><span style='color:red'>" + 
              d.income2015 + 
              "</span><span> Billion</span><br/><strong>Deaths per 1000 childs born: </strong><span style='color:red'>" + 
              d.mort2015 + 
              "</span>";
          });

      // After the setup, call tip
      svg.call(tip2);

      // Set the X- and Y domains
      x.domain(d3.extent(data, function(d) { 
          return d.income1960; 
      }))
      .nice();
      y.domain(d3.extent(data, function(d) {
          return d.mort1960; 
      }))
      .nice();
      
      // Make the X axis
      makeX(svg);

      // Make the Y axis
      makeY(svg);

      // initialise the default data from 1960
      svg.selectAll(".dot")
          .data(data)
          .enter()
          .append("circle")
              .attr("class", function(d) {
                  return d.continent + " continent";
              })
              .attr("r", 5)
              .style("fill", function (d) {
                  return color(d.continent);
              })
              .attr("cx", function(d) {
                  return x(d.income1960); })
              .attr("cy", function(d) {
                  return y(d.mort1960);
              })

      // Mouseover for the data from 1960
      svg.selectAll(".continent")
      .on("mouseover", function(d) {
            tip.show(d);
            mouseOver();
            d3.select(this)
            .attr("opacity", 1)
            .attr("r", 7);
        })

        // Mouseover for the data from 1960
        .on("mouseout", function(d) {
            tip.hide(d);
            mouseOut();
            d3.select(this)
            .attr("r", 5);
        })

      /*
      On click, change data to 2015
      function based on: http://bl.ocks.org/WilliamQLiu/bd12f73d0b79d70bfbae, Will
      */
      d3.select(".plot2")
          .on("click", function() {

              // Display current year
              document.getElementById("currentYear").innerHTML = "2015";

              // Set the X- and Y domains
              x.domain(d3.extent(data, function(d) { 
                  return d.income2015; 
              }))
              .nice();
              y.domain([0, d3.max(data, function(d) {
                  return d.mort2015; 
              })])
              .nice();

              // Update circles
              svg.selectAll("circle")
                  .data(data)
                  .transition()
                  .duration(1000)
                  .each("start", function() {
                      d3.select(this) 
                      .attr("r", 8);
                  })
                  .delay(function(d, i) {
                      return i / data.length * 300;
                  })
                  .attr("cx", function(d) {
                      return x(d.income2015); 
                  })
                  .attr("cy", function(d) {
                      return y(d.mort2015);
                  })
                  .each("end", function() {
                      d3.select(this)
                      .transition()
                      .duration(500)
                      .attr("r", 5);
                  });

              // Update X Axis
              svg.select(".x.axis")
                  .transition()
                  .duration(1000)
                  .call(xAxis);

               // Update Y Axis
               svg.select(".y.axis")
                   .transition()
                   .duration(1000)
                   .call(yAxis);

              // Mouseover for the data from 2015
              svg.selectAll(".continent")
              .on("mouseover", function(d) {
                    tip2.show(d);
                    mouseOver();
                    d3.select(this)
                    .attr("opacity", 1)
                    .attr("r", 7);
                })

                // Mouseover for the data from 2015
                .on("mouseout", function(d) {
                    tip2.hide(d);
                    mouseOut();
                    d3.select(this)
                    .attr("r", 5);
                })
          }); 

      /*
      On click, change data to 1960
      function based on: http://bl.ocks.org/WilliamQLiu/bd12f73d0b79d70bfbae, Will 
      */
      d3.select(".plot1")
          .on("click", function() {

              // Display current year
              document.getElementById("currentYear").innerHTML = "1960";

              d3.select("currentYear")
                  .text("1960");

              // Set the X- and Y domains
              x.domain(d3.extent(data, function(d) { 
                  return d.income1960; 
              }))
              .nice();
              y.domain([0, d3.max(data, function(d) {
                  return d.mort1960; 
              })])
              .nice();

              // Update circles
              svg.selectAll("circle")
                  .data(data)
                  .transition()
                  .duration(1000)
                  .each("start", function() {
                      d3.select(this) 
                      .attr("r", 8);
                  })
                  .delay(function(d, i) {
                      return i / data.length * 300;
                  })
                  .attr("cx", function(d) {
                      return x(d.income1960); 
                  })
                  .attr("cy", function(d) {
                      return y(d.mort1960);
                  })
                  .each("end", function() {
                      d3.select(this)
                      .transition()
                      .duration(500)
                      .attr("r", 5);
                  });

              // Update X Axis
              svg.select(".x.axis")
                  .transition()
                  .duration(1000)
                  .call(xAxis);

               // Update Y Axis
               svg.select(".y.axis")
                   .transition()
                   .duration(1000)
                   .call(yAxis);

              // Mouseover for the data from 1960
              svg.selectAll(".continent")
              .on("mouseover", function(d) {
                    tip.show(d);
                    mouseOver();
                    d3.select(this)
                    .attr("opacity", 1)
                    .attr("r", 7);
                })

                // Mouseover for the data from 1960
                .on("mouseout", function(d) {
                    tip.hide(d);
                    mouseOut();
                    d3.select(this)
                    .attr("r", 5);
                })
          }); 

      // Draw the legend (based on: https://bl.ocks.org/mbostock/3887118, Mike Bostock)
      var legend = svg.selectAll(".legend")
          .data(color.domain())
          .enter()
          .append("g")
              .attr("id", function(d) {
                  return d; 
              })
              .attr("transform", function(d, i) {
                  return "translate(0," + i * 20 + ")";
              })

      legend.append("circle")
          .attr("r", 8)
          .style("fill", color)
          .attr("cx", 630)
          .attr("cy", 10)

          // Select all the continents
          .on("mouseover", function(d) {
              d3.selectAll(".continent")
              .attr("opacity", .2);
              d3.selectAll("." + d)
              .attr("r", 7)
              .attr("opacity", 1);
          })

          .on("mouseout", function(d) {
              d3.selectAll(".continent")
              .attr("opacity", 1)
              .attr("r", 5);
          });

      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) {
              return d;
          });
  });

  /* 
    makeX takes the variable svg as an argument
    to make an Xaxis with the given svg settings
  */
  function makeX(svg) {
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
            .text("GDP in Billions");
  }

  /* 
    makeY takes the variable svg as an argument.
    to make an Xaxis with the given svg settings
  */
  function makeY(svg) {
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
        .text("Deaths per 1000 born childs")
  }

  /*
    mouseOver takes no arguments.
    It is used to make the selected dot stand out.
  */
  function mouseOver() {
    d3.selectAll(".continent")
        .attr("opacity", .2);
    d3.select(this)
        .transition()
        .duration(1000)
  }

  /*
    mouseOut takes no arguments.
    It is used to make the selected dot stand out.
  */
  function mouseOut() {
    d3.selectAll(".continent")
        .attr("opacity", 1);
    d3.select(this)
        .transition()
        .duration(100)
  }
}

/*
  sources used:
  - https://bl.ocks.org/mbostock/3887118
  - http://bl.ocks.org/WilliamQLiu/bd12f73d0b79d70bfbae
*/