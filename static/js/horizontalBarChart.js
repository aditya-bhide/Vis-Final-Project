var disastersPerStateData, totalDisastersOccured

$(document).ready(function () {
  createHorizontalBarGraph(Array.from(disaster_list_for_horizontal_chart), year_range_for_horizontal_bar_chart)
})

async function getDisastersPerStateData(disasterTypeList, year_range) {
  const url = "http://localhost:5000/getDisasterStateStats"

  var response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ disasterTypeList: disasterTypeList, yearList: year_range })
  })

  var response_json = await response.json()
  disastersPerStateData = response_json['data']
  totalDisastersOccured = response_json['totalDisasters']
}

async function createHorizontalBarGraph(disasterTypeList, year_range) {
  await getDisastersPerStateData(disasterTypeList, year_range)

  //set up svg using margin 
  var margin = {
    top: 30,
    right: 30,
    bottom: 30,
    left: 80
  };

  var width = 350 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;


  var svg = d3.select("#horizontalBarChartId")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  // set the ranges
  var y = d3.scaleBand()
    .range([height, 0])
    .padding(0.2);

  var x = d3.scaleLinear()
    .range([0, width]);


  let data = disastersPerStateData

  //sort bars based on value
  data = data.sort(function (a, b) {
    return d3.descending(a.value, b.value);
  })


  // Scale the range of the data in the domains
  x.domain([0, d3.max(data, function (d) { return d.count; })])
  y.domain(data.map(function (d) { return d.state_name; }));
  //y.domain([0, d3.max(data, function(d) { return d.sales; })]);

  // add the x Axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "horizontal-bar-chart-x-axis")
    .call(d3.axisBottom(x));

  // add the y Axis
  svg.append("g")
    .attr("class", "horizontal-bar-chart-y-axis")
    .call(d3.axisLeft(y));


  var bars = svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "bar-class")


  //append rects
  bars.append("rect")
    .attr("class", "bar")
    .attr("y", function (d) {
      return y(d.state_name);
    })
    .attr("height", y.bandwidth() - 5)
    .attr("x", 0)
    .attr("width", function (d) {
      return x(d.count);
    })
    .style("fill", "red")

  //add a value label to the right of each bar
  bars.append("text")
    .attr("class", "label")
    //y position of the label is halfway down the bar
    .attr("y", function (d) {
      return y(d.state_name) + y.bandwidth() / 2 + 4;
    })
    //x position is 3 pixels to the right of the bar
    .attr("x", function (d) {
      return x(d.count) + 3;
    })
    .text(function (d) {
      return d.count;
    })
    .style('fill', 'white')


  async function updateHorizontalBarChart(disasterTypeList, year_range) {
    await getDisastersPerStateData(disasterTypeList, year_range)


    let data = disastersPerStateData

    //sort bars based on value
    data = data.sort(function (a, b) {
      return d3.descending(a.value, b.value);
    })

    d3.select(".horizontal-bar-chart-y-axis").remove()
    d3.select(".horizontal-bar-chart-x-axis").remove()

    // set the ranges
    var y = d3.scaleBand()
      .range([height, 0])
      .padding(0.2);

    var x = d3.scaleLinear()
      .range([0, width]);


    // Scale the range of the data in the domains
    x.domain([0, d3.max(data, function (d) { return d.count; })])
    y.domain(data.map(function (d) { return d.state_name; }));
    //y.domain([0, d3.max(data, function(d) { return d.sales; })]);

    // add the x Axis
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "horizontal-bar-chart-x-axis")
      .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
      .attr("class", "horizontal-bar-chart-y-axis")
      .call(d3.axisLeft(y));


    oldBars = svg.selectAll(".bar-class").remove()

    newBars = svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "bar-class")


    //append rects
    let rect = newBars.append("rect")
      .attr("class", "bar")
      .attr("y", function (d) {
        return y(d.state_name);
      })
      .attr("height", y.bandwidth() - 5)
      .attr("x", 0)
      .attr("width", 0)
      .style("fill", "red")

    rect.transition().duration(400)
      .attr("y", function (d) {
        return y(d.state_name);
      })
      .attr("height", y.bandwidth() - 5)
      .attr("x", 0)
      .attr("width", function (d) {
        return x(d.count);
      })
      .style("fill", "red")


    //add a value label to the right of each bar
    newBars.append("text")
      .attr("class", "label")
      //y position of the label is halfway down the bar
      .attr("y", function (d) {
        return y(d.state_name) + y.bandwidth() / 2 + 4;
      })
      //x position is 3 pixels to the right of the bar
      .attr("x", function (d) {
        return x(d.count) + 3;
      })
      .text(function (d) {
        return d.count;
      })
      .style('fill', 'white')

  }

  disaster_list_trigger_for_horizontal_chart.registerListener(function (val) {
    $(document).ready(function () {
      updateHorizontalBarChart(Array.from(disaster_list_for_horizontal_chart), year_range_for_horizontal_bar_chart)
    });
  });

  year_range_trigger_for_horizontal_bar_chart.registerListener(function (val) {
    $(document).ready(function () {
      updateHorizontalBarChart(Array.from(disaster_list_for_horizontal_chart), year_range_for_horizontal_bar_chart)
    });
  });

}