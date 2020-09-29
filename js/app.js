// Global variable declaration of regression line equation
var regression;

var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 330
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
var left = 260 - margin.left

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

chartGroup.append("text")
    .attr("y", 0 - margin.left + 320)
    .attr("x", 0 + height - 50)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Census Data Analysis, USA");

// Initial Params
var chosenXAxis = "income";
var chosenYAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}
// function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
  .domain([d3.min(censusData, d => d[chosenYAxis])-2, d3.max(censusData, d => d[chosenYAxis])])
  .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function render_xAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
// function used for updating yAxis var upon click on axis label
function render_yAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

function renderLine (lineGroup, censusData, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis) {
  // regression data
  var newXaxisData = censusData.map(function(d) { return d[chosenXAxis]; });
  var newYaxisData = censusData.map(function(d) { return d[chosenYAxis]; });
  var newregression = leastSquaresequation(newXaxisData,newYaxisData)

  var newline = d3.line()
    .x(function(d) { return xLinearScale(d[chosenXAxis]); })
    .y(function(d) { return yLinearScale(newregression(d[chosenXAxis])); });

  console.log(chosenXAxis, chosenYAxis);

  lineGroup
    .transition()
    .duration(1000)
    .attr("d", newline);
  return lineGroup;

}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xLabel, yLabel;
  if (chosenYAxis === "poverty") {
    yLabel = "Poverty Rate:";
  }
  else if (chosenYAxis === "smokes") {
    yLabel = "Smoker Rate:";
  }
  else {
    yLabel = "Health Rate:";
  };

  if (chosenXAxis === "income") {
    xLabel = "Income:";
  }
  else if (chosenXAxis === "age") {
    xLabel = "Age:";
  }
  else {
    xLabel = "Obesity:";
  };

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${yLabel} ${d[chosenYAxis]}<br>${xLabel} ${d[chosenXAxis]}`);
    });
  //console.log(toolTip);
  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data/data.csv").then(function(censusData, err) {
  if (err) throw err;

  // parse data
  censusData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.smokes = +data.smokes;
    data.health = +data.healthcare;
    data.income = +data.income;
    data.age = +data.age;
    data.obesity = +data.obesity;
  });
  // regression data
  var XaxisData = censusData.map(function(d) { return d[chosenXAxis]; });
  var YaxisData = censusData.map(function(d) { return d[chosenYAxis]; });
  regression=leastSquaresequation(XaxisData,YaxisData)

  var line = d3.line()
    .x(function(d) { return xLinearScale(d[chosenXAxis]); })
    .y(function(d) { return yLinearScale(regression(d[chosenXAxis])); });

  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(censusData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(${left+70}, 0)`)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "cadetblue")
    .attr("opacity", ".8");


  var lineGroup = chartGroup.append("path")
          //.selectAll("path")
          .datum(censusData)
          .attr("class", "line")
          .attr("d", line);

  // Create group for three x-axis labels
  var XlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var incomeLabel = XlabelsGroup.append("text")
    .attr("x", -100)
    .attr("y", 20)
    .attr("value", "income") // value to grab for event listener
    .classed("active", true)
    .text("Income");

  var ageLabel = XlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age");

  var obesityLabel = XlabelsGroup.append("text")
    .attr("x", 100)
    .attr("y", 20)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obesity");

  // Create group for three y-axis labels
  var YlabelsGroup = chartGroup.append("g")
      .attr("transform",
            `translate(${left}, ${height/2})`);

  var povertyLabel = YlabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty rate");

  var smokesLabel = YlabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x", -120)
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokers rate");

  var healthLabel = YlabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x", 120)
    .attr("dy", "1em")
    .attr("value", "health") // value to grab for event listener
    .classed("inactive", true)
    .text("Health rate");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  XlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = render_xAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates fitting line with new x values
        lineGroup = renderLine(lineGroup, censusData, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "obesity") {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });

    // y axis labels event listener
    YlabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

          // replaces chosenXAxis with value
          chosenYAxis = value;

          // console.log(chosenXAxis)

          // functions here found above csv import
          // updates x scale for new data
          yLinearScale = yScale(censusData, chosenYAxis);

          // updates x axis with transition
          yAxis = render_yAxes(yLinearScale, yAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

          // updates fitting line with new y values
          lineGroup = renderLine(lineGroup, censusData, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          // changes classes to change bold text
          if (chosenYAxis === "smokes") {
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            healthLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "health") {
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            healthLabel
              .classed("active", true)
              .classed("inactive", false);
          }
          else {
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            healthLabel
              .classed("active", false)
              .classed("inactive", true);
          }
        }
      });
})
//.catch(function(error) {
//  console.log(error);
//});
