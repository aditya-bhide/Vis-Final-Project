
var crimeDonutChartData, donutChartStateList = ["NY"], donutChartYearList = ['2019'], totalCrimes
var selectedDonutPath = false


$(document).ready(function () {
  createCrimeDonutChart(donutChartStateList, donutChartYearList)
})

async function getDonutChartData(donutChartStateList, donutChartYearList) {
  const url = "http://localhost:5000/getCrimeDonutChart"

  var response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ state: donutChartStateList, yearList: donutChartYearList })
  })
  var response_json = await response.json()
  crimeDonutChartData = response_json['data']
  totalCrimes = response_json['totalCrimes']

}

async function createCrimeDonutChart(donutChartStateList, donutChartYearList) {
  await getDonutChartData(donutChartStateList, donutChartYearList)

  // set the dimensions and margins of the graph
  var width = 450
  height = 400
  margin = 60


  var data = crimeDonutChartData

  // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
  var radius = Math.min(width, height) / 2.2 - margin

  // append the svg object to the div called crimeDonutChartId
  var svg = d3.select("#crimeDonutChartId")
    .append("svg")
    .attr("id", "crimeDonutChartSvg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 3 + "," + height / 2 + ")")
  // .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  // set the color scale
  var color = d3.scaleOrdinal(d3.schemeBlues[6])
    .domain([0, 14807])
  // .interpolator(d3.interpolateBlues);

  console.log(color.domain())
  // .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])


  // Compute the position of each group on the pie
  var pie = d3.pie()
    .value(function (d) {
      return d.value
    })

  var dataReady = pie(d3.entries(data))
  // console.log(dataReady)

  var shapeGroup = svg.selectAll(".shape-group")
    .data(dataReady)
    .enter()
    .append("g")
    .attr("class", "gDonut")

  var legendGroup = svg.selectAll(".legend-group")
    .data(dataReady)
    .enter()
    .append("g")
    .attr("class", "donutLegend")


  // shape helper to build arcs
  var arcGenerator = d3.arc()
    .innerRadius(50)         // This is the size of the donut hole
    .outerRadius(radius)


  // Another arc that won't be drawn. Just for labels positioning
  var outerArc = d3.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9)


  // Define the div for the tooltip
  var div = d3.select("body").append("div")
    .attr("class", "donut-chart-tooltip")
    .style("opacity", 0);


  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  slices = shapeGroup
    // .selectAll('my-slices')
    // .data(dataReady)
    // .enter()
    .append('path')
    .attr("id", function (d) {
      return "slice-" + d.data.key
    })
    .attr("class", "my-paths")
    .attr('d', arcGenerator)
    .attr('fill', function (d) { return (color(d.data.key)) })
    .attr("stroke", "black")
    .style("stroke-width", "1.5px")
    .style("opacity", 1)

  slices
    .on("mouseover", function (d) {

      if (!selectedDonutPath) {

        // Make tooltip visible
        div.transition()
          .duration(0)
          .style("opacity", .9);

        // Set tooltip text
        div.html(d.data.key + "=" + d.value)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY) + "px");

        // Blur other slices
        d3.selectAll(".my-paths")
          .attr("stroke", "#736f64")
          .style("stroke-width", "0.5px")
          .style("opacity", "0.6")


        // Increase radius of current slice
        d3.select(this)
          .attr("stroke", "black")
          .style("stroke-width", "1.5px")
          .style("opacity", "1")
          .attr("d", d3.arc().innerRadius(50).outerRadius(radius + 6))
      }

    })
    .on("mouseout", function (d) {

      // Hide tooltip
      div.transition()
        .duration(0)
        .style("opacity", 0);

      if (!selectedDonutPath) {
        // Make all slices normal
        d3.selectAll(".my-paths")
          .attr("stroke", "black")
          .style("stroke-width", "1.5px")
          .style("opacity", "1")
          .attr("d", d3.arc().innerRadius(50).outerRadius(radius))
      }

    })
    .on("mousemove", function (d) {
      // Make tooltip visible
      div.transition()
        .duration(0)
        .style("opacity", .9);

      // Set tooltip text
      div.html(d.data.key + "=" + d.value)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");
    })
    .on("click", function (d) {
      if (selectedDonutPath) {

        // Make all slices normal
        d3.selectAll(".my-paths")
          .attr("stroke", "black")
          .style("stroke-width", "1.5px")
          .style("opacity", "1")
          .attr("d", d3.arc().innerRadius(50).outerRadius(radius))

        selectedDonutPath = false

        crimesList = "all"
        crimeListTrigger.a = "all"
      } else {
        // Blur other slices
        d3.selectAll(".my-paths")
          .attr("stroke", "#736f64")
          .style("stroke-width", "0.5px")
          .style("opacity", "0.6")


        // Increase radius of current slice
        d3.select(this)
          .attr("stroke", "black")
          .style("stroke-width", "1.5px")
          .attr("d", d3.arc().innerRadius(50).outerRadius(radius + 6))
          .style("opacity", "1")

        selectedDonutPath = true

        crimesList = d.data.key
        crimeListTrigger.a = d.data.key
      }
    })



  legendCircleX = 140
  legendCircleY = -115

  legendLabelX = 150
  legendLabelY = -115

  legendCircles = legendGroup
    .append("circle")
    .attr("cx", legendCircleX)
    .attr("cy", function (d) {
      legendCircleY = legendCircleY + 20
      return legendCircleY
    })
    .attr("r", 6)
    .style("fill", function (d) {
      return color(d.data.key)
    })

  legendlabels = legendGroup
    .append("text")
    .text(function (d) {
      console.log(d.data.key)
      return d.data.key
    })
    .attr("x", legendLabelX)
    .attr("y", function (d) {
      legendLabelY = legendLabelY + 20
      return legendLabelY
    })
    .style("font-size", "12px")
    .attr("class", "white-font")
    .attr("alignment-baseline", "middle")






  // Add the polylines between chart and labels:
  // polylines = shapeGroup
  //   .append('polyline')
  //   .attr("id", function (d) {
  //     return "polyline-" + d.data.key
  //   })
  //   .attr("stroke", "black")
  //   .style("fill", "none")
  //   .attr("stroke-width", 1)
  //   .attr('points', function (d) {
  //     var posA = arcGenerator.centroid(d) // line insertion in the slice
  //     var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
  //     var posC = outerArc.centroid(d); // Label position = almost the same as posB
  //     var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
  //     posC[0] = radius * 1.25 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
  //     return [posA, posB, posC]
  //   })
  //   .style("opacity", 0)

  // textLabels = shapeGroup
  //   .append('text')
  //   .text(function (d) {
  //     console.log(d.data.key)
  //     return d.data.key
  //   })
  //   .attr("id", function (d) {
  //     return "label-" + d.data.key
  //   })
  //   .attr('transform', function (d) {
  //     var pos = outerArc.centroid(d);
  //     var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
  //     pos[0] = radius * 1.28 * (midangle < Math.PI ? 1 : -1);
  //     return 'translate(' + pos + ')';
  //   })
  //   .style('text-anchor', function (d) {
  //     var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
  //     return (midangle < Math.PI ? 'start' : 'end')
  //   })
  //   .style("opacity", 1)
  //   .attr("fill", "black")

  svg.append("text")
    .attr("text-anchor", "middle")
    .text(totalCrimes)
    .attr("class", "white-font")
    .style("font-size", 24)


}


