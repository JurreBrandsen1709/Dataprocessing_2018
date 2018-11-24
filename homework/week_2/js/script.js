/*
* Insert function inserts a character at a certain spot in a string.
* Credit to Base33 at Stackoverflow for the insert function.
* https://stackoverflow.com/questions/4313841/javascript-how-can-i-insert-a-string-at-a-specific-index/4314044
*/
String.prototype.insert = function (index, string) {
  if (index > 0)
    return this.substring(0, index) + string + this.substring(index, this.length);
  else
    return string + this;
};

window.onload = function () {

	// Init an XMLHttpRequest
	var xhr = new XMLHttpRequest();

	// Location of the data
	var url = 'knmi data.txt';

	// Check if the data is send correctly
	xhr.onreadystatechange = checkIfLoaded;

	// Formulate the request
	xhr.open("GET", url, true);

	// Send request
    xhr.send();

    // Check if the XMLHttpRequest is correct
	function checkIfLoaded() {

		// Error handling
		if (xhr.readyState < 4) {
			return;
		}
		if (xhr.status !== 200) {
			return;
		}

		// Send the data to the id 'dataFromAjax' (for exercise purposes)
		document.getElementById("dataFromAjax").innerHTML = this.responseText;
		
		// Execute the drawChart function	
		drawChart();
	}	
}

/*
 * The function drawChart reads data from the textfield 'dataFromAjax'.
 * Next, it uses trim, strip and insert to create workable data.
 * Finaly, the chart can be drawn using pure javascript.
 */
function drawChart() {

	// Get the value of the textarea witht the ID 'rawdata'
    var rawdata = document.getElementById('dataFromAjax').value;

    // Split the data
    var row = rawdata.split('\n');
    var seperate;

    // Create four empty array's
    var tempDate = [];
    var tempMaxtemp = [];
    var maxtemp = [];
    var date = [];

    // Split the date and maxtemp and add the into seperate array's
    for (i = 1; i < row.length; i++){
    	row[i] = row[i].trim();
    	seperate = row[i].split(',');
    	seperate[1] = seperate[1].trim();

    	// Append the date and the maxtemp to temporary array's
    	tempDate.push(seperate[0]);
    	tempMaxtemp.push(seperate[1]);
    };

    /*
     * Convert every element in the tempDate into a string.
     * Add '-' at index 4 and 7 to create a valid datestring.
     * push the datestring to the date array.
     */
    for (i = 0; i < tempDate.length; i++){
    	var string = tempDate[i];
    	string = string.insert(4,'-');
    	string = string.insert(7,'-');
    	string = new Date(string);
    	date.push(string);
    }

    // Convert strings to Javascript numbers
    for (i = 0; i < tempMaxtemp.length; i++){
    	var temp = tempMaxtemp[i];
    	var stringToFloat = parseFloat(temp);
    	maxtemp.push(stringToFloat)
    }

	// Get a reference to the canvas 
	var canvas = document.getElementById('canvas'); 
	
	// Limits
	canvas.height = 600;
	canvas.width = 1000;

	var padding = 100;
	var paddingTop = 50;

	var plotHeight = canvas.height - 100;
	var minPlotHeight = plotHeight - 275;


	// Get a reference to the drawing context 
	var c = canvas.getContext('2d'); 

	// Outlines of the chart
	c.fillStyle = 'black'; 
	c.lineWidth = 2; 
	c.beginPath(); 
	c.moveTo(padding, paddingTop); 
	c.lineTo(padding, plotHeight - 100); 
	c.moveTo(canvas.width - 5, paddingTop);
	c.lineTo(canvas.width - 5, (plotHeight - 100) + 5);
	c.moveTo(padding, paddingTop);
	c.lineTo(canvas.width - 5, paddingTop);
	c.stroke(); 

	// Draw Y-axis text
	for(var i=0; i<8; i++) { 
		c.fillText((6 - i) * 5 + '', padding - 25, i * paddingTop + paddingTop); 
	    
	    // Draw small vertical lines
	    c.beginPath(); 
	    c.moveTo(padding - 5, i * paddingTop + paddingTop); 
	    c.lineTo(padding, i * paddingTop + paddingTop);
	    c.stroke(); 
	}

	// Draw vertical lines (extra style)
	c.lineWidth = .1
	for(var i = 0; i < 8; i++) { 
	    c.beginPath(); 
	    c.moveTo(canvas.width, i * paddingTop + paddingTop);
	    c.lineTo(padding, i * paddingTop + paddingTop);
	    c.stroke(); 
	}

	// Labels for the X-axis
	var labels = ['Jan 01','Feb 01','Mar 01',
				  'April 01','May 01','June 01', 
				  'July 01','Aug 01', 'Sept 01', 'Oct 01', 
				  'Nov 01', 'Dec 01']; 
	
	// Draw X-axis text
	c.lineWidth = 1;
	for (var i = 0; i < 12; i++) { 
	    c.fillText(labels[i], padding + i * 75, 420);
	   
	    // Draw small lines on the X-axis
	    c.moveTo(padding + 75 * i, 400); 
		c.lineTo(padding + 75* i, 405); 
		c.stroke(); 
	}

    // Declare domain and range
    var domain = [Math.min.apply(0,maxtemp),
    			  Math.max.apply(0,maxtemp)]
    var range = [minPlotHeight, plotHeight];
	var yaxis = createTransform(domain, range);

	// Declare the startpoint of the line graph
    var start = yaxis(maxtemp[0]);

    // Draw the linegraph
	c.beginPath();
	c.moveTo(padding, start);
	c.lineWidth = .5;
	for (var i = 1; i < date.length; i++){
		var yPos = yaxis(maxtemp[i]);
		c.lineJoin = 'round';
		c.lineTo(padding + (canvas.width - padding - 5) / maxtemp.length * i, yPos);
	}
	c.stroke();  
	c.closePath();

	// Text for months
	c.font = '22px Impact, Charcoal';
	c.fillText('Months in 2016 →', padding, 460);

	// Text for header
	c.textAlign = 'right'
	c.fillText('Maximum temperature per day in The Bilt, 2016 - 2017', canvas.width - 5, 40);

	// Vertical text
	c.textAlign = 'left'
	c.translate(50, plotHeight - 100);
	c.rotate(-0.5*Math.PI);
	var vertText = 'Temperature in Celsius →';
	c.fillText(vertText , 0, 0);
	c.restore();

	// dashed lines for the 0 - line
	c.beginPath();
	c.lineWidth = 15;
	c.setLineDash([5, 10]);
	c.lineWidth = 2;
	c.moveTo(50, 55);
	c.lineTo(50, canvas.width - 5);
	c.stroke();
	c.endPath();
};

/*
 * Credit to data.mprog for this funciton
 */
function createTransform(domain, range){
	// Domain is a two-element array of the data bounds [domain_min, domain_max]
	// Range is a two-element array of the screen bounds [range_min, range_max]

    var domain_min = domain[0]
    var domain_max = domain[1]
    var range_min = range[0]
    var range_max = range[1]

    // Formulas to calculate the alpha and the beta
   	var alpha = (range_max - range_min) / (domain_max - domain_min)
    var beta = range_max - alpha * domain_max

    // Returns the function for the linear transformation (y = a * x + b)
    return function(x){
      return canvas.height - (alpha * x + beta);
    }
}







