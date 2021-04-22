
var pcp_data, state_list = ["WY", "AK", 'NY', 'AL'], year_list = ['2014', '2015', '2016', '2017', '2018', '2019']

$(document).ready(function () {
  callPcp(state_list, year_list)
})

async function getPcpData() {
  const url = "http://localhost:5000/getPcpData"
  var response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ state_list: state_list, year_list: year_list })
  })
  var response_json = await response.json()
  pcp_data = response_json['data']
  state_list = response_json['state_list']
  year_list = response_json['year_list']

}

async function callPcp(state_list, year_list) {
  // Fetch the data
  await getPcpData(state_list, year_list)

  // Remove pcp svg
  d3.selectAll("#pcp_svg_id").remove()

  // set the dimensions and margins of the chart
  var dragging = {}
  var background

  var margin = { top: 70, right: 10, bottom: 10, left: 10 },
    width = 800 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

  padding_x = 50
  padding_y = 20

  var color = d3.scaleOrdinal()
    .domain(state_list)
    .range(d3.schemeCategory10)

  var highlight = function (d) {
    selected_label = d['state_abbr']

    // first every group turns grey
    d3.selectAll(".line")
      .transition().duration(0)
      .style("stroke", "lightgrey")
      .style("opacity", "0.2")


    // Second the hovered specie takes its color
    d3.selectAll(".state_abbr" + selected_label)
      .transition().duration(100)
      .style("stroke", color(selected_label))
      .style("opacity", "1")

  }

  // Unhighlight
  var doNotHighlight = function (d) {
    d3.selectAll(".line")
      .transition().duration(200).delay(00)
      .style("stroke", function (d) { return (color(d['state_abbr'])) })
      .style("opacity", "1")
  }

  // create svg
  var svg = d3.select("#pcp_plot")
    .append("svg")
    .attr("id", "pcp_svg_id")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scalePoint().range([0 + padding_x, width - padding_x])
  y = {}

  var line = d3.line(),
    axis = d3.axisLeft(),
    foreground;

  x.domain(dimensions = ['state_abbr', 'year', 'disaster_number', 'individual_relief', 'homicide', 'burglary', 'aggravated_assault'])

  x.domain().filter(function (d) {
    if (d == "state_abbr") {
      y[d] = d3.scalePoint()
        // .domain(d3.extent(pcp_data, function (p) { return +p[d]; }))
        .domain(state_list)
        .range([height - padding_y, 0 + padding_y])
    } else if (d == "year") {
      y[d] = d3.scalePoint()
        .domain(['2014', '2015', '2016', '2017', '2018', '2019'])
        .range([height - padding_y, 0 + padding_y])
    } else {
      y[d] = d3.scaleLinear()
        .domain(d3.extent(pcp_data, function (p) { return +p[d]; })).nice()
        .range([height - padding_y, 0 + padding_y])
    }


    y[d].brush = d3.brushY()
      .extent([[-7, y[d].range()[1]], [7, y[d].range()[0]]])
      .on("brush", brush)
      .on("start", brushstart)
      .on("end", brush);
  })

  // Add grey background lines for context.
  background = svg.append("g")
    .attr("class", "background")
    .selectAll("path")
    .data(pcp_data)
    .enter().append("path")
    .attr("d", path)
  // .style('stroke', 'pink')

  // Add blue foreground lines for focus.
  foreground = svg.append("g")
    .attr("class", "foreground")
    .selectAll("path")
    .data(pcp_data)
    .enter().append("path")
    .attr("d", path)
    .attr("class", function (d) { return 'line state_abbr' + d['state_abbr'].toString(); })
    .style("stroke", function (d) { return (color(d['state_abbr'])) })
    .on("mouseover", highlight)
    .on("mouseleave", doNotHighlight)


  // Add a group element for each dimension.
  var g = svg.selectAll(".dimension")
    .data(dimensions)
    .enter().append("g")
    .attr("class", "dimension")
    .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
    .call(d3.drag()
      .subject(function (d) { return { x: x(d) }; })
      .on("start", function (d) {
        dragging[d] = x(d);
        background.attr("visibility", "hidden");
      })
      .on("drag", function (d) {
        dragging[d] = Math.min(width, Math.max(0, d3.event.x));
        foreground.attr("d", path);
        dimensions.sort(function (a, b) { return position(a) - position(b); });
        x.domain(dimensions);
        g.attr("transform", function (d) { return "translate(" + position(d) + ")"; })
      })
      .on("end", function (d) {
        delete dragging[d];
        transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
        transition(foreground).attr("d", path);
        background
          .attr("d", path)
          .transition()
          .delay(500)
          .duration(0)
          .attr("visibility", null);
      })
    );

  // Add an axis and title.
  g.append("g")
    .attr("class", "pcp_axis")
    .each(function (d) { d3.select(this).call(d3.axisLeft(y[d])); })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function (d) { return d; })
    .style("fill", "black")


  g.append("g")
    .attr("class", "brush")
    .each(function (d) { d3.select(this).call(y[d].brush); })
    .selectAll("rect")
    .attr("x", -8)
    .attr("width", 16);

  function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
  }
  function transition(g) {
    return g.transition().duration(500);
  }

  function path(d) {
    return line(dimensions.map(function (p) { return [position(p), y[p](d[p])]; }));
  }

  function brushstart() {
    d3.event.sourceEvent.stopPropagation();
  }

  function brush() {
    var actives = [];
    //filter brushed extents
    svg.selectAll(".brush")
      .filter(function (d) {
        return d3.brushSelection(this);
      })
      .each(function (d) {
        actives.push({
          dimension: d,
          extent: d3.brushSelection(this)
        });
      });
    // set un - brushed foreground line disappear
    foreground.classed("fade", function (d, i) {
      return !actives.every(function (active) {
        var dim = active.dimension;
        return active.extent[0] <= y[dim](d[dim]) && y[dim](d[dim]) <= active.extent[1];
      });
    });
  }

}