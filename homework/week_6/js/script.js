/*
  Name: Jurre Brandsen
  Student number: 11808918

  This script represents the percentage of elderly people per country per year, 
  ranging from 1960 to 2016
  
  I have used a dataset from the Worldbank (https://data.worldbank.org)

  You can switch through the years by using the slider.
  The graph will update automaticly.

  sources used:
  - http://bl.ocks.org/jeremycflin/b43ab253f3ae02dced07
  - http://benheb.github.io/d3.slider/
  - http://blockbuilder.org/Fil/3b5b4db818d51e89223fa0057b980ce0
*/

window.onload = function () {


    /*****************************
     *     General settings      *
    *****************************/

    // Create the silder
    var slider = document.getElementById("range");
    var output = document.getElementById("years");
    var year = 1960;
    output.innerHTML = slider.value;

    // Remeber what country you are showing
    var show_Country = "";

    queue()
        .defer(d3.json, "data/world_countries.json")
        .defer(d3.json, "data/worlddevelopment.json") // TODO change name
        .defer(d3.json, "data/oldagepercountry.json")
        .await(Ready);

  
    /*****************************
     * Settings for the worldmap *
    *****************************/

    
    // Set worldmap attributes
    var worldmap_Margin = {top: 20, right: 30, bottom: 30, left: 50},
        worldmap_Width = 1180,
        worldmap_Height = 600 - worldmap_Margin.top - worldmap_Margin.bottom;

    // give the attributes to the worldmap svg
    var worldmap = d3.select("#worldmap")
              .attr("width", worldmap_Width)
              .attr("height", worldmap_Height)
              .attr("id", "worldmap");
    
    // Easy acces to group elements for the worldmap
    var worldmap_Group = worldmap.append("g");

    // Create the vertical legend axis
    var y2 = d3.scale.linear()
        .range([0, 200])
        .domain([27, 0])
        .nice();

    var yAxis2 = d3.svg.axis()
        .scale(y2)
        .orient("right");

    //  Create the colorscale
    var color_Scale = d3.scale.linear()
        .domain([27,0])
        .range(["#ff3300", "#2e9e2e"]);

    // Set the path scale
    var projection = d3.geo.mercator()
        .scale(200)
        .translate( [worldmap_Width / 2, worldmap_Height / 1.5]);

    // Initailise the path
    var path = d3.geo.path()
        .projection(projection);


    /*****************************
     * Settings for the barchart *
    *****************************/


    // Set the barchart attributes
    var barchart_Margin = {top: 20, right: 20, bottom: 70, left: 40},
        barchart_Width = 1200 - barchart_Margin.left - barchart_Margin.right,
        barchart_Height = 300 - barchart_Margin.top - barchart_Margin.bottom;

    
    var barchart = d3.select("#barchart")
        .attr("width", barchart_Width + barchart_Margin.left + barchart_Margin.right)
        .attr("height", barchart_Height + barchart_Margin.top + barchart_Margin.bottom)
        .attr("id", "barchart")
        .append("g")
        .attr("transform", "translate(" + barchart_Margin.left + "," + barchart_Margin.top + ")");

    // Create the horizontal barchart axis
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, barchart_Width], .15);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    // Create the vertical barchart axis
    var y = d3.scale.linear()
        .range([barchart_Height, 0]);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("right");


    /*****************************************************************************************
    * Function Ready takes four arguments:                                                   *
    * - error:                     opens the 404.html page when data isn't loaded correctly  *
    * - country(JSON):             loads the data of every country in polygons               *
    * - population(JSON):          Uses the data of country to color the countries           *
    * - population_per_year(JSON): Reads the population per year, per country                *
    *****************************************************************************************/


    function Ready(error, country, population, population_per_year ) {
        
        // Open the 404.html page if the data isn't loaded correctly
        if (error) {
            window.open("404.html","_self");
        };

        // Create a dict and merge the country and population data together
        var population_By_Id = {};
        
        population.forEach(function(d,i) { 
            population_By_Id[d.id] = +population[i][year]; 
        });

        // Set the tooltips
        var tip_Name = d3.tip()
            .attr("id", "d3-tip-name")
            .html(function(d) {
                  return document.getElementById("countrypopulation").innerHTML = d.properties.name + " in ";
            });     

        // Create the worldmap
        worldmap_Group.attr("id", "countries")
            .selectAll("path")
            .data(country.features)
            .enter()
            .append("path")
                .attr("d", path)
                .style("stroke", "white")
                .style("stroke-width", 0.3)
                .style("opacity",0.8)

                // Color every country based on its data
                .style("fill", function(d) { 
                    return color_Scale(population_By_Id[d.id]); 
                })

                // Mouse events
                .on("mouseover", function(d) {
                    d3.select(this)
                    .style("opacity", 1)
                    .style("stroke","white")
                    .style("stroke-width", 5);
                })

                .on("click",function(d) {
                    tip_Name.show(d);
                    show_Country = d.nr;
                    update_Graph(show_Country, population_per_year, barchart, x, barchart_Height, xAxis, yAxis);
                })
                .on("mouseout", function(d) {
                    d3.select(this)
                    .style("opacity", 0.8)
                    .style("stroke","white")
                    .style("stroke-width", 0.3);
                });

        // Call the tooltips
        worldmap.call(tip_Name);

        // Legend
        make_Legend(worldmap, color_Scale, yAxis2);

        // Silder
        slider.oninput = function() {
            output.innerHTML = this.value;
            year = this.value;
            update_Year(year, population, country, worldmap_Group, barchart);
        };

        // Make the detailed population graph
        detailed_Population_Graph(population_per_year, x, y, barchart_Height, xAxis, yAxis);
    };


    /**********************************************************************************************
    * Function update_Year takes five arguments:                                                  *
    * - year(VAR):        Updated by using the slider and will return one red bar in the barchart *
    * - population(JSON): Uses the data of country to color the countries based on the year var   *
    * - country(JSON):    loads the data of every country in polygons                             *
    * - worldmap_Group:   Group element for all countries                                         *
    * - barchart:         Returns the right color in the barchart                                 *
    **********************************************************************************************/


    function update_Year(year, population, country, worldmap_Group, barchart) {

        population_By_Id = {};

        population.forEach(function(d,i) { 
            population_By_Id[d.id] = +population[i][year]; 
        });

        worldmap_Group.attr("class", "countries")
            .selectAll("path")
            .data(country.features)
            .transition()
            .duration(20)
            .style("fill", function(d) { 
                return color_Scale(population_By_Id[d.id]); 
            });

        barchart.selectAll(".bar")
            .style("fill", function(d) { 
                if (d.year == year) { 
                    return "red";
                }
                else {
                    return "green";
                };
            });
    };


    /**********************************************************************************************
    * Function update_Year takes five arguments:                                                  *
    * - year(VAR):        Updated by using the slider and will return one red bar in the barchart *
    * - population(JSON): Uses the data of country to color the countries based on the year var   *
    * - country(JSON):    loads the data of every country in polygons                             *
    * - worldmap_Group:   Group element for all countries                                         *
    * - barchart:         Returns the right color in the barchart                                 *
    **********************************************************************************************/


    function make_Legend(worldmap, color_Scale, yAxis2) {

      var legend = worldmap.append("defs")
          .append("svg:linearGradient")
              .attr("id", "gradient")
              .attr("x1", "0%")
              .attr("y1", "0%")
              .attr("x2", "0%")
              .attr("y2", "100%");

      worldmap.append("rect")
          .attr("width", 20)
          .attr("height", 200)
          .style("fill", "url(#gradient)")
          .attr("transform", "translate(20,250)");

      legend.selectAll("stop") 
          .data(color_Scale.range())                  
          .enter()
          .append("stop")
              .attr("offset", function(d, i) { 
                  return i / (color_Scale.range().length - 1); 
              })
              .attr("stop-color", function(d) { 
                  return d; 
              });
                          
      worldmap.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(41,250)")
          .call(yAxis2)
          .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 30)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Percentage");
    };

    /**********************************************************************************************
    * Function detailed_Population_Graph takes seven arguments:                                   *
    * - population_per_year(JSON): formatted data in a multi array                                *
    * - x(VAR):                    Used to determine the domain of the horizontal axis            *
    * - y(VAR):                    Used to determine the domain of the vertical axis              *
    * - barchart_Height(VAR):      Call to the barchart height                                    *
    * - xAxis(VAR):                Call to the xAxis                                              * 
    * - yAxis(VAR):                Call to the xAxis                                              *
    **********************************************************************************************/


    function detailed_Population_Graph(population_per_year, x, y, barchart_Height, xAxis, yAxis) {

      x.domain(population_per_year[0].map(function(d) { 
          return d.year;
      }));

      y.domain([0, d3.max(color_Scale.domain(), function(d) { 
          return d; 
      })]);

      var tip = d3.tip()
          .attr("class", "d3-tip")
          .html(function(d) {
              var format = d3.format(".1f")
              return document.getElementById("value").innerHTML = "The percentage of elderly people in " + d.year + " was " + format(d.value) + ".";
          }); 

      barchart.append("g")
          .attr("class", "x axis xaxis")
          .attr("transform", "translate(0," + barchart_Height + ")")
          .call(xAxis)
          .selectAll("text")
          .style("text-anchor", "end")
          .style("fill", "none")
          .attr("dx", "-.8em")
          .attr("dy", "-.55em")
          .attr("transform", "rotate(-90)" );

      barchart.append("g")
          .attr("class", "y axis yaxis")
          .call(yAxis)
          .style("fill", "none")
          .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", -15)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Percentage");

      barchart.selectAll("bar")
          .data(population_per_year[0])
          .enter()
          .append("rect")
              .style("fill", function(d) { 
                  if (d.year == year) { 
                      return "red";
                  }
                  else {
                      return "green";
                  };
              })
              .attr("class", "bar")
              .attr("x", function(d) { 
                  return x(d.year);
              })
              .attr("width", x.rangeBand())
              .attr("y", function(d) { 
                  return y(d.value); 
              })
              .attr("height", function(d) { 
                  return barchart_Height - y(d.value); 
              })
              .on("mouseover", function(d) {
                    tip.show(d);
                    d3.selectAll(".bar")
                        .style("fill", "green");
                    d3.select(this)
                        .style("fill","red");
              })
              .on("mouseout", function(d) {
                    d3.select(this)
                        .style("fill","green");
                    document.getElementById("value").innerHTML = "";
              });

              barchart.call(tip);
    };


    /************************************************************************************
    * Function update_Graph takes five arguments:                                       *
    * - show_Country(VAR):         When a country is clicked, it will retrun a number.  *
    *                              This number is used to select the correct data       *
    * - population_per_year(JSON): formatted data in a multi array                      *
    * - barchart(SVG):             Call the barchart                                    *
    * - x(VAR):                    Used to get the correct width per bar                *
    * - barchart_Height(VAR):      Call to the barchart height                          *
    * - xAxis(SVG)                 Make visable                                         *
    * - yAxis(SVG)                 Make visable                                         *
    ************************************************************************************/


    function update_Graph (show_Country, population_per_year, barchart, x, barchart_Height, xAxis, yAxis) {
        
        barchart.selectAll("text")
            .style("fill", "black");

        barchart.select(".yaxis")
            .style("fill", "black");            

        barchart.selectAll(".bar")
            .data(population_per_year[show_Country])
            .transition()
            .duration(300)
            .ease("quad")
            .attr("x", function(d) 
            { 
                return x(d.year); 
            })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { 
                return y(d.value); 
            })

            .attr("height", function(d) { 
                return barchart_Height - y(d.value); 
            });
    };
};