// Animated D3 Scatter Plot

// A little housekeeping to keep things neat
// =======================================
// Setting aside the graph size
var width = parseInt(d3.select("#scatter").style("width"));
var height = width - width / 4;

// Spacing
var margin = 20;
var labelArea = 110;
var tPadB = 40;
var tPadL = 40;

// Create the SVG for the graph
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");

// Set radius on the dots for the graph
var circRadius;
function crGet() {
    if (width <= 530) {
        circRadius = 5;
    } else {
        circRadius = 10;
    }
};
crGet();

// Labeling Axes
// ==============================
// X-axis 
svg.append("g").attr("class", "xText");
var xText = d3.select(".xText");
function xTextRefresh() {
    xText.attr("transform", 
        "translate(" + ((width - labelArea) / 2 + labelArea) +
        ", " + (height - margin - tPadB) + ")"
    );
};
xTextRefresh();

xText.append("text")
    .attr("y", -26)
    .attr("data-name", "poverty")
    .attr("data-axis", "x")
    .attr("class", "aText active x")
    .text("In Poverty (%)");

xText.append("text")
    .attr("y", 0)
    .attr("data-name", "age")
    .attr("data-axis", "x")
    .attr("class", "aText active x")
    .text("Age (Median)");

xText.append("text")
    .attr("y", 26)
    .attr("data-name", "income")
    .attr("data-axis", "x")
    .attr("class", "aText active x")
    .text("Household Income (Median)");

var leftTextX = margin + tPadL;
var leftTextY = (height + labelArea) / 2 - labelArea;

// Y-axis
svg.append("g").attr("class", "yText");
var yText = d3.select(".yText");
function yTextRefresh() {
    yText.attr("transform", "translate" + leftTextX + ")rotate(-90)");
};
yTextRefresh();

yText.append("text")
    .attr("y", -26)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Obese (%)");

yText.append("text")
    .attr("y", 0)
    .attr("data-name", "obesity")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Smokes (%)");

yText.append("text")
    .attr("y", 26)
    .attr("data-name", "healthcare")
    .attr("data-axis", "y")
    .attr("class", "aText active y")
    .text("Lacks Healthcare (%)");

// Bring in the CSV
// ==========================
d3.csv("assets/data/data.csv"),then(function(data) {
    visualize(data);
});

// Defining the visualize function to handle manipulating elements 
function visualize(theData) {
    // Set default data to reference
    var currentX = "poverty";
    var currentY = "obesity";

    // Set up empty variables for use later
    var xMin;
    var xMax;
    var yMin;
    var yMax;

    // Get some tooltip rules set
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([40, -60])
        .html(function(d) {
            console.log(d)

            var xKey;
            var stateName = "<div>" + d.state + "</div>";
            var yKey = "<div>" + currentY + ": " + d[currentY] + "%</div>";

            if (currentX == "poverty") {
                xKey = "<div>" + currentX + ": " + d[currentX] + "%</div>";
            } else {
                xKey = "<div>" + currentX + ": " + parseFloat(d[currentX]).toLocaleString("en") + "</div>";
            }

            return stateName + xKey + yKey;
        });

    svg.call(toolTip);

    // Dynamic changes for the graph
    function xMinMax() {
        xMin = d3.min(theData, function(d) {
            return parseFloat(d[currentX]) * 0.90;
        });

        xMax = d3.max(theData, function(d) {
            return parseFloat(d[currentX]) * 1.10;
        });
    }

    function yMinMax() {
       yMin = d3.min(theData, function(d) {
           return parseFloat(d[currentY]) * 0.90;
       });
       
       yMax = d3.max(theData, function(d) {
           return parseFloat(d[currentY]) * 1.10;
       });
    }

    function labelChange(axis, clickedText) {
        d3.selectAll(".aText")
            .filter("." + axis)
            .filter(".active")
            .classed("active", false)
            .classed("inactive", true);
        
        clickedText.classed("inactive", false).classed("active", true);
    }

    // Plot time!
    // ============================
    // Set the min and max values on the axes
    xMinMax();
    yMinMax();

    // Now scale the graph
    var xScale = d3.scaleLinear()
        .domain([xMin, xMax])
        .range([margin + labelArea, width - margin]);
    var yScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([height - margin - labelArea, margin]);

    // Set up the axes
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    function tickCount() {
        if (width <= 500) {
            xAxis.ticks(5);
            yAxis.ticks(5);
        } else {
            xAxis.ticks(10);
            yAxis.ticks(10);
        }
    }
    tickCount();

    // Append the axes
    svg.append("g")
        .call(xAxis)
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
    svg.append("g")
        .call(yAxis)
        .attr("class", "yAxis")
        .attr("transform", "translate(" + (margin + labelArea) + ", 0)");

    // Now for the dots and their labels
    var theCircles = svg.selectAll("g theCircles").data(theData).enter();

    theCircles.append("circle")
        .attr("cx", function(d) {
            return xScale(d[currentX]);
        })
        .attr("cy", function(d) {
            return yScale(d[currentY]);
        })
        .attr("r", circRadius)
        .attr("class", function(d) {
            return "stateCircle" + d.abbr;
        })
        .on("mouseover", function(d) {
            toolTip.show(d, this);
            d3.select(this).style("stroke", "#323232")
        })
        .on("mouseout", function(d) {
            toolTip.hide(d);
            d3.select(this).style("stroke", "#e3e3e3");
        });

    theCircles.append("text")
        .text(function(d) {
            return d.abbr;
        })
        .attr("dx", function(d) {
            return xScale(d[currentX]);
        })
        .attr("dy", function(d) {
            return yScale(d[currentY]) + circRadius / 3;
        })
        .attr("font-size", circRadius)
        .attr("class", "stateText")
        .on("mouseover", function(d) {
            toolTip.show(d);
            d3.select("." + d.abbr).style("stroke", "#323232");
        })
        .on("mouseout", function(d) {
            toolTip.hide(d);
            d3.select("." + d.abbr).style("stroke", "#e3e3e3");
        });

    // Making the graph actually dynamic
    // ==============================
    d3.selectAll(".aText").on("click", function() {
        // Save the selected text for reference
        var self = d3.select(this);

        if (self.classed("inactive")) {
            var axis = self.attr("data-axis");
            var name = self.attr("data-name");

            if (axis == "x") {
                currentX = name;
                xMinMax();
                xScale.domain([xMin, xMax]);

                svg.select(".xAxis").transition().duration(300).call(xAxis);

                // Change the dot location on axis change
                d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition()
                        .attr("cx", function(d) {
                            return xScale(d[currentX]);
                        })
                        .duration(300);
                });

                // Change the state text locations as well
                d3.selectAll(".stateText").each(function() {
                    d3.select(this)
                        .transition()
                        .attr("dx", function(d) {
                            return xScale(d[currentX]);
                        })
                        .duration(300);
                });

                // Swap status of the clicked label and the previous label
                labelChange(axis, self);
            } else {
                currentY = name;
                yMinMax();
                yScale.domain([yMin, yMax]);

                svg.select(".yAxis").transition().duration(300).call(yAxis);

                // Change dot location on axis change
                d3.selectAll("circle").each(function() {
                    d3.select(this)
                        .transition()
                        .attr("cy", function(d) {
                            return yScale(d[currentY]);
                        })
                        .duration(300);
                });

                // Change the state texts too
                d3.selectAll(".stateText").each(function() {
                    d3.select(this)
                        .transition()
                        .attr("dy", function(d) {
                            return yScale(d[currentY]) + circRadius / 3;
                        })
                        .duration(300);
                });

                // Swap active class to new label
                labelChange(axis, self);
            }
        }
    });

    // Mobile
    // ======================
    d3.select(window).on("resize", resize);

    function resize() {
        // Redefine the width, height and leftTextY (the three variables dependent on the width of the window).
        width = parseInt(d3.select("#scatter").style("width"));
        height = width - width / 3.9;
        leftTextY = (height + labelArea) / 2 - labelArea;
    
        // Apply the width and height to the svg canvas.
        svg.attr("width", width).attr("height", height);
    
        // Change the xScale and yScale ranges
        xScale.range([margin + labelArea, width - margin]);
        yScale.range([height - margin - labelArea, margin]);
    
        // Update the axis scales
        svg.select(".xAxis")
            .call(xAxis)
            .attr("transform", "translate(0," + (height - margin - labelArea) + ")");
    
        svg.select(".yAxis").call(yAxis);
    
        // Update the ticks on each axis.
        tickCount();
    
        // Change the labels.
        xTextRefresh();
        yTextRefresh();
    
        // Update radius of dots
        crGet();
    
        // Change the dots on axis change
        d3.selectAll("circle")
            .attr("cy", function(d) {
                return yScale(d[curY]);
            })
            .attr("cx", function(d) {
                return xScale(d[curX]);
            })
            .attr("r", function() {
                return circRadius;
            });
    
        // Change the location and size of the state texts, too.
        d3.selectAll(".stateText")
            .attr("dy", function(d) {
                return yScale(d[curY]) + circRadius / 3;
            })
            .attr("dx", function(d) {
                return xScale(d[curX]);
            })
            .attr("r", circRadius / 3);
    }
}