function US_map(data_init) {

    var width = 560;
    var height = 370;

    var lowColor = 'White'
    var highColor = '#ff8c00'
    var start_year = 0
    var end_year = 0
    console.log(year_range)
    graphTitle = 'All Crimes'

    // D3 Projection
    var projection = d3.geoAlbersUsa()
        .translate([(width) / 2, height / 2]) // translate to center of screen
        .scale([750]); // scale things down so see entire US

    var zoom = d3.zoom()
        // no longer in d3 v4 - zoom initialises with zoomIdentity, so it's already at origin
        // .translate([0, 0]) 
        // .scale(1) 
        .scaleExtent([1, 9])
        .on("zoom", zoomed);

    // Define path generator
    var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
        .projection(projection); // tell path generator to use albersUsa projection

    //Create SVG element and append map to the SVG
    var svg = d3.select("#US-map-svg")
        .append('svg')
        .attr("width", width)
        .attr("height", height);

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .on("click", reset);

    var g = svg.append("g");
    svg.call(zoom);

    g.selectAll("path")
        .data(data_init.features)
        .enter()
        .append("path")
        .attr("d", path)
        // .attr("class", "state");

    // add a legend
    var w = 80,
        h = 300;

    var key = d3.select("#US-map-legend-svg")
        .append("svg")
        .attr('margin-top', '0px')
        .attr("width", w)
        .attr("height", h)
        // .attr("viewbox", "0 0 " + String(width) + " " + String(height))
        // .attr("class", "legend");

    var legend = key.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "100%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    legend.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", highColor)
        .attr("stop-opacity", 1);

    legend.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", lowColor)
        .attr("stop-opacity", 1);

    key.append("rect")
        .attr("width", w - 50)
        .attr("height", h)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(0,10)");

    minVal = data_init.other_features.min_value
    maxVal = data_init.other_features.max_value
    var y = d3.scaleLinear()
        .range([h, 0])
        .domain([minVal, maxVal]);

    var yAxis = d3.axisRight(y);

    key.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(31,10)")
        .call(yAxis)



    function update_US_map(data) {
        console.log(data)
        features = data.other_features.feature_name
        minVal = data.other_features.min_value
        maxVal = data.other_features.max_value
        var ramp = d3.scaleLinear().domain([minVal, maxVal]).range([lowColor, highColor])
            // Bind the data to the SVG and create one path per GeoJSON feature
        g.selectAll("path")
            .data(data.features)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("mousemove", mousemove)
            .on("click", click)
            .style("stroke", "#FFFFFF")
            .style("stroke-width", function(d) {
                if (states.has(d.properties['name'])) {
                    return 4
                } else {
                    return 1
                }
            })
            .style("fill", function(d) {
                return ramp(d.properties[features])
            })
            .style("opacity", function(d) {
                if (states.size == 0) {
                    return 1
                }
                if (states.has(d.properties['name'])) {
                    return 1
                } else {
                    return 0.5
                }
            });

        let div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        function mouseover(d) {
            div.transition()
                .duration(100)
                .style("opacity", 1);
            div.html(`${d.properties['name']} : ${d.properties[features]}`)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");

            g.selectAll("path")
                .data(data.features)
                .style("stroke-width", function(d) {
                    if (states.has(d.properties['name'])) {
                        return 4
                    } else {
                        return 1
                    }
                })
                .style("fill", f => ramp(f.properties[features]))
                .style("opacity", function(f) {
                    if (states.has(f.properties['name'])) {
                        return 1
                    } else if (f.properties['name'] == d.properties['name']) {
                        return 1
                    } else {
                        return 0.50
                    }
                })
        }

        function mousemove(d) {
            div.html(`${d.properties['name']} : ${d.properties[features]}`)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        }

        function mouseout() {
            div.transition()
                .duration('200')
                .style("opacity", 0);

            g.selectAll("path")
                .data(data.features)
                .style("stroke-width", function(d) {
                    if (states.has(d.properties['name'])) {
                        return 4
                    } else {
                        return 1
                    }
                })
                .style("fill", f => ramp(f.properties[features]))
                .style("opacity", function(f) {
                    if (states.size == 0) {
                        return 1
                    }
                    if (states.has(f.properties['name'])) {
                        return 1
                    } else {
                        return 0.50
                    }
                })
        }

        function click(d) {
            if (states.size == 0) {
                states.add(d.properties['name'])
                states_for_donut_chart.add(d.properties['name'])
                states_for_radial_chart.add(d.properties['name'])

                states_trigger.a = d.properties['name']
                states_trigger_for_donut_chart.a = d.properties['name']
                states_trigger_for_radial_chart.a = d.properties['name']

                g.selectAll("path")
                    .data(data.features)
                    .style("stroke-width", function(f) {
                        if (states.has(f.properties['name'])) {
                            return 4
                        } else {
                            return 1
                        }
                    })
                    .style("fill", f => ramp(f.properties[features]))
                    .style("opacity", function(f) {
                        if (states.has(f.properties['name'])) {
                            return 1
                        } else {
                            return 0.5
                        }
                    });

            } else if (states.has(d.properties['name'])) {
                states_for_donut_chart.delete(d.properties['name'])
                states_for_radial_chart.delete(d.properties['name'])
                states.delete(d.properties['name'])

                states_trigger.a = d.properties['name']
                states_trigger_for_donut_chart.a = d.properties['name']
                states_trigger_for_radial_chart.a = d.properties['name']

                g.selectAll("path")
                    .data(data.features)
                    .style("stroke-width", 1)
                    .style("fill", f => ramp(f.properties[features]))
                    .style("opacity", 1);

            } else if (states.size != 0) {
                states_for_donut_chart.clear()
                states_for_radial_chart.clear()
                states.clear()

                states.add(d.properties['name'])
                states_for_donut_chart.add(d.properties['name'])
                states_for_radial_chart.add(d.properties['name'])

                states_trigger.a = d.properties['name']
                states_trigger_for_donut_chart.a = d.properties['name']
                states_trigger_for_radial_chart.a = d.properties['name']

                g.selectAll("path")
                    .data(data.features)
                    .style("stroke-width", function(d) {
                        if (states.has(d.properties['name'])) {
                            return 4
                        } else {
                            return 1
                        }
                    })
                    .style("fill", f => ramp(f.properties[features]))
                    .style("opacity", function(d) {
                        if (states.has(d.properties['name'])) {
                            return 1
                        } else {
                            return 0.5
                        }
                    });
            }
        }

        var y = d3.scaleLinear()
            .range([h, 0])
            .domain([minVal, maxVal]);

        var yAxis = d3.axisRight(y);

        key.selectAll("g.y-axis")
            .transition().duration(100).call(yAxis);
    }

    function reset() {
        svg.transition()
            .duration(750)
            // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
            .call(zoom.transform, d3.zoomIdentity); // updated for d3 v4
    }

    function zoomed() {
        g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
        // g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
        g.attr("transform", d3.event.transform); // updated for d3 v4
    }

    function stopped() {
        if (d3.event.defaultPrevented) d3.event.stopPropagation();
    }

    update_US_map(data_init)


    year_range_trigger.registerListener(function(val) {
        console.log("wtf is happening in years", year_range_trigger.a)
        start_year = year_range[0]
        end_year = year_range[1];
        $('#amount1').text(start_year)
        $('#amount2').text(end_year)
        $(document).ready(function() {
            $.ajax({
                type: 'POST',
                url: "http://127.0.0.1:5000/update_US",
                data: { 'min_year': start_year, 'max_year': end_year, 'crimesList': crimesList },
                success: function(response) {
                    update_US_map(response)
                },
                error: function(error) {
                    console.log(error);
                }
            });
        });
    });

    crimeListTrigger_us_map.registerListener(function(val) {
        console.log("wtf is happening in crime")
        start_year = 1979
        end_year = 2019
        $('#amount1').text(start_year)
        $('#amount2').text(end_year)
        $('#US-map-title-crime').text(humanize(crimesList))
        $(document).ready(function() {
            $.ajax({
                type: 'POST',
                url: "http://127.0.0.1:5000/update_US",
                data: { 'min_year': start_year, 'max_year': end_year, 'crimesList': crimesList },
                success: function(response) {
                    update_US_map(response)
                },
                error: function(error) {
                    console.log(error);
                }
            });
        });
    });


}