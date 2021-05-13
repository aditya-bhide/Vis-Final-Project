// http://bl.ocks.org/jfreels/7015635

function multi_line_chart(data) {
    var svg = d3.select("#line-chart-svg")
        .append('svg')
        .attr("width", 600)
        .attr("height", 390);
    ticks_values = [1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019]
    var svg = d3.select("#line-chart-svg svg"),
        margin = {
            top: 10,
            right: 70,
            bottom: 110,
            left: 60
        },
        margin2 = {
            top: 340,
            right: 70,
            bottom: 20,
            left: 60
        },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        height2 = +svg.attr("height") - margin2.top - margin2.bottom;
    //var parseDate = d3.timeParse("%m/%d/%Y %H:%M");
    xValue = d => d['year']
    yValue = d => d['crimes']
    yValueR = d => d['disasters']

    yAxisLabel = 'Crime'
    yRAxisLabel = 'Disaster'
    xAxisLabel = 'Years'

    svg.append("circle").attr("class", "dot1-legend").attr("cx", 470).attr("cy", 10).attr("r", 6)
    svg.append("circle").attr("class", "dot2-legend").attr("cx", 470).attr("cy", 30).attr("r", 6)
    svg.append("text").attr('class', 'text1-legend').attr("x", 480).attr("y", 10).text(yAxisLabel).attr("alignment-baseline", "middle")
    svg.append("text").attr('class', 'text2-legend').attr("x", 480).attr("y", 30).text(yRAxisLabel).attr("alignment-baseline", "middle")

    var x = d3.scaleLinear().range([0, width]),
        x2 = d3.scaleLinear().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        yR = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0]),
        y2R = d3.scaleLinear().range([height2, 0]);

    var xAxis = d3.axisBottom(x).tickFormat(d3.format("d")),
        xAxis2 = d3.axisBottom(x2).tickFormat(d3.format("d")),
        yAxis = d3.axisLeft(y),
        yAxisR = d3.axisRight(yR);

    var brush = d3.brushX()
        .extent([
            [0, 0],
            [width, height2]
        ])
        .on("brush end", brushed);

    var zoom = d3.zoom()
        .scaleExtent([1, 10])
        .translateExtent([
            [0, 0],
            [width, height]
        ])
        .extent([
            [0, 0],
            [width, height]
        ])
        .on("zoom", zoomed);

    var line1 = d3.line()
        .x(function(d) {
            return x(xValue(d));
        })
        .y(function(d) {
            return y(yValue(d));
        });

    var line1_mini = d3.line()
        .x(function(d) {
            return x2(xValue(d));
        })
        .y(function(d) {
            return y2(yValue(d));
        });

    var line2 = d3.line()
        .x(function(d) {
            return x(xValue(d));
        })
        .y(function(d) {
            return yR(yValueR(d));
        });

    var line2_mini = d3.line()
        .x(function(d) {
            return x2(xValue(d));
        })
        .y(function(d) {
            return y2R(yValueR(d));
        });


    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);


    var Line_chart1 = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("clip-path", "url(#clip)");

    var Line_chart2 = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("clip-path", "url(#clip)");

    var Line_chart1_points = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("clip-path", "url(#clip)");

    var Line_chart2_points = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("clip-path", "url(#clip)");

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    focus.append("g")
        .attr("class", "axis axis--y")

    focus.append("g")
        .attr("transform", "translate(" + width + ", 0)")
        .attr("class", "axis axis--y-R")


    x.domain(d3.extent(data.line_chart_data_crime, d => xValue(d)))
    y.domain([0, d3.max(data.line_chart_data_crime, d => yValue(d))]).nice()
    yR.domain([0, d3.max(data.line_chart_data_disaster, d => yValueR(d))]).nice()

    x2.domain(x.domain());
    y2.domain(y.domain());
    y2R.domain(yR.domain());

    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    focus.select(".axis--x").append('text')
        .attr("class", "axis-labels-y")
        .attr('fill', 'black')
        .attr('y', 45)
        .attr('x', width / 2)
        .text(xAxisLabel)
        .style('text-anchor', 'middle')

    focus.select(".axis--y").transition().duration(1000).call(yAxis);
    focus.select(".axis--y").append('text')
        .attr("class", "axis-labels-yR")
        .attr('fill', 'black')
        .attr('y', -45)
        .attr('x', -height / 2)
        .text(yAxisLabel)
        .style('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)');


    focus.select(".axis--y-R").transition().duration(1000).call(yAxisR);
    focus.select(".axis--y-R").append('text')
        .attr("class", "axis-labels")
        .attr('fill', 'black')
        .attr('y', -47)
        .attr('x', height / 2)
        .text(yRAxisLabel)
        .style('text-anchor', 'middle')
        .attr('transform', 'rotate(90)');

    Line_chart1.append("path")
        .datum(data.line_chart_data_crime)
        .attr("class", "line1")
        .attr("d", line1);

    Line_chart2.data([data.line_chart_data_disaster])
        .append("path")
        .attr("class", "line2")
        .attr("d", line2);

    Line_chart1_points.selectAll("circle")
        .data(data.line_chart_data_crime)
        .enter().append('circle')
        .attr("class", "dot1")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .attr("cx", d => x(xValue(d)))
        .attr("cy", d => y(yValue(d)))
        .attr("r", 5)

    Line_chart2_points.selectAll("circle")
        .data(data.line_chart_data_disaster)
        .enter().append('circle')
        .attr("class", "dot2")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .attr("cx", d => x(xValue(d)))
        .attr("cy", d => yR(yValueR(d)))
        .attr("r", 5)

    context.append("path")
        .datum(data.line_chart_data_crime)
        .attr("class", "line1-mini")
        .attr("d", line1_mini);

    context.append("path")
        .datum(data.line_chart_data_disaster)
        .attr("class", "line2-mini")
        .attr("d", line2_mini);

    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

    svg.append("rect")
        .attr("class", "zoom")
        .attr("width", width)
        .attr("height", 5)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom)

    function variableChange(data) {
        x.domain(d3.extent(data.line_chart_data_crime, d => xValue(d)))
        y.domain([0, d3.max(data.line_chart_data_crime, d => yValue(d))]).nice()
        yR.domain([0, d3.max(data.line_chart_data_disaster, d => yValueR(d))]).nice()

        x2.domain(x.domain());
        y2.domain(y.domain());
        y2R.domain(yR.domain());

        // d3.select('.brush').call(brush.move, x.range())

        if (crimesList == 'all_crimes') {
            d3.select(".text1-legend").text(yAxisLabel)
        } else {
            d3.select(".text1-legend").text(crimesList)
        }
        if (disasterList == 'all_disasters') {
            d3.select(".text2-legend").text(yRAxisLabel)
        } else {
            d3.select(".text2-legend").text(disasterList)
        }
        d3.select(".axis--x").transition().duration(1000).call(xAxis);
        d3.select(".axis--y").transition().duration(1000).call(yAxis);
        d3.select(".axis--y-R").transition().duration(1000).call(yAxisR);

        d3.select('.line1').datum(data.line_chart_data_crime).transition().duration(1000).attr('d', line1)
        d3.select('.line2').datum(data.line_chart_data_disaster).transition().duration(1000).attr('d', line2)

        points1 = Line_chart1_points.selectAll('.dot1').data(data.line_chart_data_crime)

        points1.enter().append('circle')
            .merge(points1)
            .attr("class", "dot1")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .transition().duration(1000)
            .attr("cx", d => x(xValue(d)))
            .attr("cy", d => y(yValue(d)))
            .attr("r", 5);

        points1.exit().remove()

        points2 = Line_chart2_points.selectAll('.dot2').data(data.line_chart_data_disaster)

        points2.enter().append('circle')
            .merge(points2)
            .attr("class", "dot2")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .transition().duration(1000)
            .attr("cx", d => x(xValue(d)))
            .attr("cy", d => yR(yValueR(d)))
            .attr("r", 5);

        points2.exit().remove()

        d3.select('.line1-mini').datum(data.line_chart_data_crime).transition().duration(1000).attr('d', line1_mini)
        d3.select('.line2-mini').datum(data.line_chart_data_disaster).transition().duration(1000).attr('d', line2_mini)
    }

    function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
        var s = d3.event.selection || x2.range();
        x.domain(s.map(x2.invert, x2));
        console.log()
        start_date = parseInt(s.map(x2.invert, x2)[0])
        end_date = parseInt(s.map(x2.invert, x2)[1])
        if ((start_date != parseInt(year_range[0]) && start_date != null) || (end_date != parseInt(year_range[1]) && end_date != null)) {
            year_range_trigger.a = parseInt(start_date)
            year_range[0] = parseInt(start_date)
            year_range[1] = parseInt(end_date)

            $("#div-year-range-text-start").text(year_range[0])
            $("#div-year-range-text-end").text(year_range[1])

            year_range_trigger_for_donut_chart.a = parseInt(start_date)
            year_range_for_donut_chart[0] = parseInt(start_date)
            year_range_for_donut_chart[1] = parseInt(end_date)

            year_range_trigger_for_radial_chart.a = parseInt(start_date)
            year_range_for_radial_chart[0] = parseInt(start_date)
            year_range_for_radial_chart[1] = parseInt(end_date)

        }

        d3.select('.line1').attr('d', line1)
        d3.select('.line2').attr('d', line2)
        Line_chart1_points.selectAll(".dot1").attr("cx", d => x(xValue(d))).attr("cy", d => y(yValue(d)))
        Line_chart2_points.selectAll(".dot2").attr("cx", d => x(xValue(d))).attr("cy", d => yR(yValueR(d)))

        focus.select(".axis--x").call(xAxis);
        svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
            .scale(width / (s[1] - s[0]))
            .translate(-s[0], 0));
    }

    states_trigger.registerListener(function(val) {
        // console.log(Array.from(states))
        $(document).ready(function() {
            $.ajax({
                type: 'POST',
                url: "http://127.0.0.1:5000/update_line_chart",
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({ 'states': Array.from(states), 'crimes': crimesList, 'disasters': disasterList }),
                success: function(response) {
                    variableChange(response)
                        // console.log(response)
                },
                error: function(error) {
                    console.log(error);
                }
            });
        });
    });

    crimeListTrigger_line_chart.registerListener(function(val) {
        // console.log("crimeListTrigger in line chart")
        $(document).ready(function() {
            $.ajax({
                type: 'POST',
                url: "http://127.0.0.1:5000/update_line_chart",
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({ 'states': Array.from(states), 'crimes': crimesList, 'disasters': disasterList }),
                success: function(response) {
                    variableChange(response)
                        // console.log(response)
                },
                error: function(error) {
                    console.log(error);
                }
            });
        });
    });

    disasterListTrigger_line_chart.registerListener(function(val) {
        // console.log("disaster trigger in line chart")
        $(document).ready(function() {
            $.ajax({
                type: 'POST',
                url: "http://127.0.0.1:5000/update_line_chart",
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify({ 'states': Array.from(states), 'crimes': crimesList, 'disasters': disasterList }),
                success: function(response) {
                    variableChange(response)
                        // console.log(response)
                },
                error: function(error) {
                    console.log(error);
                }
            });
        });
    });

    function zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;
        x.domain(t.rescaleX(x2).domain());

        start_date = parseInt(t.rescaleX(x2).domain()[0])
        end_date = parseInt(t.rescaleX(x2).domain()[1])
        if ((start_date != parseInt(year_range[0]) && start_date != null) || (end_date != parseInt(year_range[1]) && end_date != null)) {
            year_range_trigger.a = parseInt(start_date)
            year_range[0] = parseInt(start_date)
            year_range[1] = parseInt(end_date)

            $("#div-year-range-text-start").text(year_range[0])
            $("#div-year-range-text-end").text(year_range[1])

            year_range_trigger_for_donut_chart.a = parseInt(start_date)
            year_range_for_donut_chart[0] = parseInt(start_date)
            year_range_for_donut_chart[1] = parseInt(end_date)

            year_range_trigger_for_radial_chart.a = parseInt(start_date)
            year_range_for_radial_chart[0] = parseInt(start_date)
            year_range_for_radial_chart[1] = parseInt(end_date)


        }

        d3.select('.line1').attr('d', line1)
        d3.select('.line2').attr('d', line2)
        Line_chart1_points.selectAll(".dot1")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .attr("cx", d => x(xValue(d)))
            .attr("cy", d => y(yValue(d)))

        Line_chart2_points.selectAll(".dot2")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .attr("cx", d => x(xValue(d)))
            .attr("cy", d => yR(yValueR(d)))

        focus.select(".axis--x").call(xAxis);
        context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    }

    let div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    function mouseover(d) {
        // console.log(d)
        if ("crimes" in d) {
            div.html(`Crime Value: ${yValue(d)}`)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px")
                .style("opacity", 1);
        } else {
            div.html(`Disaster Value: ${yValueR(d)}`)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px")
                .style("opacity", 1);
        }
    }

    function mouseout(d) {
        div.transition()
            .duration('200')
            .style("opacity", 0);
    }


}