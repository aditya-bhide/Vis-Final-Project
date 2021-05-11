function US_map(data) {

    var width = 560;
    var height = 370;

    var lowColor = '#f9f9f9'
    var highColor = '#bc2a66'
    var start_year = 0
    var end_year = 0

    // D3 Projection
    var projection = d3.geoAlbersUsa()
        .translate([(width) / 2, height / 2]) // translate to center of screen
        .scale([750]); // scale things down so see entire US

    var zoom = d3.zoom()
        // no longer in d3 v4 - zoom initialises with zoomIdentity, so it's already at origin
        // .translate([0, 0]) 
        // .scale(1) 
        .scaleExtent([1, 8])
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
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "state");

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
        .attr("width", w - 40)
        .attr("height", h)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(0,10)");

    // console.log(data)
    minVal = data.other_features.min_value
    maxVal = data.other_features.max_value
    var y = d3.scaleLinear()
        .range([h, 0])
        .domain([minVal, maxVal]);

    var yAxis = d3.axisRight(y);

    key.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(41,10)")
        .call(yAxis)

    function update_US_map(data) {
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
            .style("stroke-width", 1)
            .style("fill", function(d) {
                if (!states.has(d.properties['name'])) {
                    return ramp(d.properties[features])
                } else {
                    return "FFFF00"
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

            d3.select(this).style("stroke-width", 4)
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

            d3.select(this).style("stroke-width", 1)

        }

        function click(d) {
            if (states.has(d.properties['name'])) {
                d3.select(this).style("fill", function(d) {
                    return ramp(d.properties[features])
                })
                states.delete(d.properties['name'])
                states_trigger.a = d.properties['name']
            } else if (states.size < 5) {
                states.add(d.properties['name'])
                states_trigger.a = d.properties['name']
                d3.select(this).style("fill", "#FFFF00")
            }
        }

        var y = d3.scaleLinear()
            .range([h, 0])
            .domain([minVal, maxVal]);

        var yAxis = d3.axisRight(y);

        key.selectAll("g.y-axis")
            .call(yAxis);
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


    update_US_map(data)


    year_range_trigger.registerListener(function(val) {
        // console.log("Here prinintng", year_range)

        start_year = year_range[0]
        end_year = year_range[1];
        $('#amount1').text(start_year)
        $('#amount2').text(end_year)
        $(document).ready(function() {
            $.ajax({
                type: 'POST',
                url: "http://127.0.0.1:5000/update_US_years",
                data: { 'min_year': start_year, 'max_year': end_year },
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