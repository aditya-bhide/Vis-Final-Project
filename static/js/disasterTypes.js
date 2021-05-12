var disasterTypesData, totalDisasters, radialBarChartStateList = ["CA", "NY", "TX"], radialBarChartYearList = ["1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019']
var selectedRadialBarFlag = false

$(document).ready(function () {
  createDisasterTypeChart(radialBarChartStateList, radialBarChartYearList)
})

async function getDisasterTypesData(radialBarChartStateList, radialBarChartYearList) {
  const url = "http://localhost:5000/getDisasterTypes"

  var response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ state: radialBarChartStateList, yearList: radialBarChartYearList })
  })

  var response_json = await response.json()
  disasterTypesData = response_json['data']
  totalDisasters = response_json['totalDisasters']
}

async function createDisasterTypeChart(radialBarChartStateList, radialBarChartYearList) {
  await getDisasterTypesData(radialBarChartStateList, radialBarChartYearList)

  var margin = { top: 40, right: 0, bottom: 0, left: 0 }
  width = 400 - margin.left - margin.right
  height = 400 - margin.top - margin.bottom

  innerRadius = 50
  outerRadius = Math.min(width, height) / 2.2

  var svg = d3.select("#radialBarChartId")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")")

  let data = disasterTypesData

  let maxCount = 0
  for (var i = 0; i < data.length; i++) {
    if (maxCount < data[i]['count']) {
      maxCount = data[i]['count']
    }
  }

  // Scales
  var x = d3.scaleBand()
    .range([0, 2 * Math.PI])
    .align(0)
    .domain(data.map(function (d) { return d.incident_type }))

  var y = d3.scaleRadial()
    .range([innerRadius, outerRadius])
    .domain([0, maxCount])

  // Define the div for the tooltip
  var div = d3.select("body").append("div")
    .attr("class", "radial-bar-tooltip")
    .style("opacity", 0);



  var radialGroup = svg.selectAll(".radial-group")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "gRadial")

  // Add the bars
  var path = radialGroup
    .append("path")
    .attr("id", function (d) {
      return "path-" + d.incident_type
    })
    .attr("class", "radialBarChartPaths")
    .attr("fill", "#69b3a2")
    .attr("stroke", "black")
    .style("stroke-width", "0.6px")
    .attr("d", d3.arc()     // imagine your doing a part of a donut plot
      .innerRadius(innerRadius)
      .outerRadius(function (d) { return y(d['count']); })
      .startAngle(function (d) { return x(d.incident_type); })
      .endAngle(function (d) { return x(d.incident_type) + x.bandwidth(); })
      .padAngle(0.01)
      .padRadius(innerRadius))

    .on("mouseover", function (d) {

      if (!selectedRadialBarFlag) {
        // Make tooltip visible
        div.transition()
          .duration(0)
          .style("opacity", .9);

        // Set tooltip text
        div.html(d.incident_type + "=" + d.count)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY) + "px");

        // Blur other bars
        d3.selectAll(".radialBarChartPaths")
          .attr("stroke", "#736f64")
          .style("stroke-width", "0.3px")
          .style("opacity", "0.2")


        // Increase selected path size
        d3.select(this)
          .attr("stroke", "black")
          .style("stroke-width", "0.6px")
          .style("opacity", "1")

          .attr("d", d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(function (d) { return y(d['count'] + 40); })
            .startAngle(function (d) { return x(d.incident_type); })
            .endAngle(function (d) { return x(d.incident_type) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius + 10)
          )

        // Push label text
        d3.select(this.parentNode).selectAll(".radialLabelClass")
          .attr("text-anchor", function (d) { return (x(d.incident_type) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
          .attr("transform", function (d) { return "rotate(" + ((x(d.incident_type) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y(d['count']) + 20) + ",0)"; })
      }
    })
    .on("mousemove", function (d) {

      // Show tooltip
      div.transition()
        .duration(0)
        .style("opacity", .9);

      // Set tooltip text
      div.html(d.incident_type + "=" + d.count)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY) + "px");

    })
    .on("mouseout", function (d) {

      // Hide tooltip
      div.transition()
        .duration(0)
        .style("opacity", 0);
      if (!selectedRadialBarFlag) {


        // Set bars back to normal stroke width and stroke color
        d3.selectAll(".radialBarChartPaths")
          .attr("stroke", "black")
          .style("stroke-width", "0.6px")
          .style("opacity", "1")
          .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius(innerRadius)
            .outerRadius(function (d) { return y(d['count']); })
            .startAngle(function (d) { return x(d.incident_type); })
            .endAngle(function (d) { return x(d.incident_type) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius))

        // Move text label back to position
        d3.select(this.parentNode).select(".radialLabelClass")
          .attr("text-anchor", function (d) { return (x(d.incident_type) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
          .attr("transform", function (d) { return "rotate(" + ((x(d.incident_type) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y(d['count']) + 10) + ",0)"; })
      }
    })
    .on("click", function (d) {

      // Depending on flag, select/unselect the radialBar
      if (selectedRadialBarFlag) {

        // Set bars back to normal stroke width and stroke color
        d3.selectAll(".radialBarChartPaths")
          .attr("stroke", "black")
          .style("stroke-width", "0.6px")
          .style("opacity", "1")

          .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius(innerRadius)
            .outerRadius(function (d) { return y(d['count']); })
            .startAngle(function (d) { return x(d.incident_type); })
            .endAngle(function (d) { return x(d.incident_type) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius))

        // Move text label back to position
        d3.select(this.parentNode).select(".radialLabelClass")
          .attr("text-anchor", function (d) { return (x(d.incident_type) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
          .attr("transform", function (d) { return "rotate(" + ((x(d.incident_type) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y(d['count']) + 10) + ",0)"; })

        selectedRadialBarFlag = false
        disasterList = "all_disasters"
        disasterListTrigger_line_chart.a = "all_disasters"

      } else {

        // Blur other paths
        d3.selectAll(".radialBarChartPaths")
          .attr("stroke", "#736f64")
          .style("stroke-width", "0.3px")
          .style("opacity", "0.2")



        // Increase selected path size
        d3.select(this)
          .attr("stroke", "black")
          .style("stroke-width", "0.6px")
          .style("opacity", "1")
          .attr("d", d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(function (d) { return y(d['count'] + 40); })
            .startAngle(function (d) { return x(d.incident_type); })
            .endAngle(function (d) { return x(d.incident_type) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius + 10)
          )

        // Push label text
        d3.select(this.parentNode).selectAll(".radialLabelClass")
          .attr("text-anchor", function (d) { return (x(d.incident_type) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
          .attr("transform", function (d) { return "rotate(" + ((x(d.incident_type) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y(d['count']) + 20) + ",0)"; })

        disasterList = d.incident_type
        disasterListTrigger_line_chart.a = d.incident_type
        selectedRadialBarFlag = true
      }
    })

  // Add the labels
  radialGroup
    .append("g")
    .attr("id", function (d) {
      return "radialBarChartLabel-" + d.incident_type
    })
    .attr("class", "radialLabelClass")
    .attr("text-anchor", function (d) { return (x(d.incident_type) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
    .attr("transform", function (d) { return "rotate(" + ((x(d.incident_type) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y(d['count']) + 10) + ",0)"; })
    .append("text")
    .attr("class", "radialLabelTextClass")
    .text(function (d) { return (d.incident_type) })
    .attr("transform", function (d) { return (x(d.incident_type) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
    .style("font-size", "11px")
    .attr("class", "white-font")
    .attr("alignment-baseline", "middle")

  svg.append("text")
    .attr("text-anchor", "middle")
    .text(totalDisasters)
    .style("font-size", 24)
    .attr("class", "white-font")


  // function updateDisasterTypesChart(radialBarChartStateList, radialBarChartYearList) {
  //   await getDisasterTypesData(radialBarChartStateList, radialBarChartYearList)

  //   data = disasterTypesData

  //   let maxCount = 0
  //   for (var i = 0; i < data.length; i++) {
  //     if (maxCount < data[i]['count']) {
  //       maxCount = data[i]['count']
  //     }
  //   }

  //   x.domain(data.map(function (d) { return d.incident_type }))
  //   y.domain([0, maxCount])

  //   radialGroupUpdate = d3.selectAll(".gRadial")
  //     .data(data)

  //   radialGroupUpdate.enter()
  //     .append("g")
  //     .merge(radialGroupUpdate)
  //     .attr("class", "gRadial")


  //   // Add the bars
  //   var path = radialGroupUpdate
  //     .append("path")
  //     .attr("id", function (d) {
  //       return "path-" + d.incident_type
  //     })
  //     .attr("class", "radialBarChartPaths")
  //     .attr("fill", "#69b3a2")
  //     .attr("stroke", "black")
  //     .style("stroke-width", "0.6px")
  //     .attr("d", d3.arc()     // imagine your doing a part of a donut plot
  //       .innerRadius(innerRadius)
  //       .outerRadius(function (d) { return y(d['count']); })
  //       .startAngle(function (d) { return x(d.incident_type); })
  //       .endAngle(function (d) { return x(d.incident_type) + x.bandwidth(); })
  //       .padAngle(0.01)
  //       .padRadius(innerRadius))

  //     .on("mouseover", function (d) {

  //       if (!selectedRadialBarFlag) {
  //         // Make tooltip visible
  //         div.transition()
  //           .duration(0)
  //           .style("opacity", .9);

  //         // Set tooltip text
  //         div.html(d.incident_type + "=" + d.count)
  //           .style("left", (d3.event.pageX) + "px")
  //           .style("top", (d3.event.pageY) + "px");

  //         // Blur other bars
  //         d3.selectAll(".radialBarChartPaths")
  //           .attr("stroke", "#736f64")
  //           .style("stroke-width", "0.3px")
  //           .style("opacity", "0.2")


  //         // Increase selected path size
  //         d3.select(this)
  //           .attr("stroke", "black")
  //           .style("stroke-width", "0.6px")
  //           .style("opacity", "1")

  //           .attr("d", d3.arc()
  //             .innerRadius(innerRadius)
  //             .outerRadius(function (d) { return y(d['count'] + 40); })
  //             .startAngle(function (d) { return x(d.incident_type); })
  //             .endAngle(function (d) { return x(d.incident_type) + x.bandwidth(); })
  //             .padAngle(0.01)
  //             .padRadius(innerRadius + 10)
  //           )

  //         // Push label text
  //         d3.select(this.parentNode).selectAll(".radialLabelClass")
  //           .attr("text-anchor", function (d) { return (x(d.incident_type) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
  //           .attr("transform", function (d) { return "rotate(" + ((x(d.incident_type) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y(d['count']) + 20) + ",0)"; })
  //       }
  //     })
  //     .on("mousemove", function (d) {

  //       // Show tooltip
  //       div.transition()
  //         .duration(0)
  //         .style("opacity", .9);

  //       // Set tooltip text
  //       div.html(d.incident_type + "=" + d.count)
  //         .style("left", (d3.event.pageX) + "px")
  //         .style("top", (d3.event.pageY) + "px");

  //     })
  //     .on("mouseout", function (d) {

  //       // Hide tooltip
  //       div.transition()
  //         .duration(0)
  //         .style("opacity", 0);
  //       if (!selectedRadialBarFlag) {


  //         // Set bars back to normal stroke width and stroke color
  //         d3.selectAll(".radialBarChartPaths")
  //           .attr("stroke", "black")
  //           .style("stroke-width", "0.6px")
  //           .style("opacity", "1")
  //           .attr("d", d3.arc()     // imagine your doing a part of a donut plot
  //             .innerRadius(innerRadius)
  //             .outerRadius(function (d) { return y(d['count']); })
  //             .startAngle(function (d) { return x(d.incident_type); })
  //             .endAngle(function (d) { return x(d.incident_type) + x.bandwidth(); })
  //             .padAngle(0.01)
  //             .padRadius(innerRadius))

  //         // Move text label back to position
  //         d3.select(this.parentNode).select(".radialLabelClass")
  //           .attr("text-anchor", function (d) { return (x(d.incident_type) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
  //           .attr("transform", function (d) { return "rotate(" + ((x(d.incident_type) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y(d['count']) + 10) + ",0)"; })
  //       }
  //     })
  //     .on("click", function (d) {

  //       // Depending on flag, select/unselect the radialBar
  //       if (selectedRadialBarFlag) {

  //         // Set bars back to normal stroke width and stroke color
  //         d3.selectAll(".radialBarChartPaths")
  //           .attr("stroke", "black")
  //           .style("stroke-width", "0.6px")
  //           .style("opacity", "1")

  //           .attr("d", d3.arc()     // imagine your doing a part of a donut plot
  //             .innerRadius(innerRadius)
  //             .outerRadius(function (d) { return y(d['count']); })
  //             .startAngle(function (d) { return x(d.incident_type); })
  //             .endAngle(function (d) { return x(d.incident_type) + x.bandwidth(); })
  //             .padAngle(0.01)
  //             .padRadius(innerRadius))

  //         // Move text label back to position
  //         d3.select(this.parentNode).select(".radialLabelClass")
  //           .attr("text-anchor", function (d) { return (x(d.incident_type) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
  //           .attr("transform", function (d) { return "rotate(" + ((x(d.incident_type) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y(d['count']) + 10) + ",0)"; })

  //         selectedRadialBarFlag = false

  //       } else {

  //         // Blur other paths
  //         d3.selectAll(".radialBarChartPaths")
  //           .attr("stroke", "#736f64")
  //           .style("stroke-width", "0.3px")
  //           .style("opacity", "0.2")



  //         // Increase selected path size
  //         d3.select(this)
  //           .attr("stroke", "black")
  //           .style("stroke-width", "0.6px")
  //           .style("opacity", "1")
  //           .attr("d", d3.arc()
  //             .innerRadius(innerRadius)
  //             .outerRadius(function (d) { return y(d['count'] + 40); })
  //             .startAngle(function (d) { return x(d.incident_type); })
  //             .endAngle(function (d) { return x(d.incident_type) + x.bandwidth(); })
  //             .padAngle(0.01)
  //             .padRadius(innerRadius + 10)
  //           )

  //         // Push label text
  //         d3.select(this.parentNode).selectAll(".radialLabelClass")
  //           .attr("text-anchor", function (d) { return (x(d.incident_type) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
  //           .attr("transform", function (d) { return "rotate(" + ((x(d.incident_type) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y(d['count']) + 20) + ",0)"; })

  //         selectedRadialBarFlag = true
  //       }
  //     })

  //   // Add the labels
  //   radialGroupUpdate
  //     .append("g")
  //     .attr("id", function (d) {
  //       return "radialBarChartLabel-" + d.incident_type
  //     })
  //     .attr("class", "radialLabelClass")
  //     .attr("text-anchor", function (d) { return (x(d.incident_type) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
  //     .attr("transform", function (d) { return "rotate(" + ((x(d.incident_type) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + (y(d['count']) + 10) + ",0)"; })
  //     .append("text")
  //     .attr("class", "radialLabelTextClass")
  //     .text(function (d) { return (d.incident_type) })
  //     .attr("transform", function (d) { return (x(d.incident_type) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
  //     .style("font-size", "11px")
  //     .attr("class", "white-font")
  //     .attr("alignment-baseline", "middle")

  //   radialGroupUpdate.exit().remove()

  //   svg.append("text")
  //     .attr("text-anchor", "middle")
  //     .text(totalDisasters)
  //     .style("font-size", 24)
  //     .attr("class", "white-font")

  // }



}

