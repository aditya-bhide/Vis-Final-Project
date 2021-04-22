function US_map(data) {
    // const margin = { top: 60, right: 90, bottom: 90, left: 120 };
    // const width = svg_width - margin.left - margin.right
    // const height = svg_height - margin.top - margin.bottom
    var width = 800;
    var height = 370;

    var lowColor = '#f9f9f9'
    var highColor = '#bc2a66'

    var selected_states = new Set()

    // D3 Projection
    var projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2]) // translate to center of screen
        .scale([750]); // scale things down so see entire US

    // Define path generator
    var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
        .projection(projection); // tell path generator to use albersUsa projection

    //Create SVG element and append map to the SVG
    var svg = d3.select("#US-map-svg")
        .append('svg')
        .attr("width", width)
        .attr("height", height);

    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "state");

    // add a legend
    var w = 100,
        h = 300;

    var key = d3.select("#US-map-svg")
        .append("svg")
        .attr('margin-top', '50px')
        .attr("width", w)
        .attr("height", h)
        .attr("class", "legend");

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
        .attr("width", w - 60)
        .attr("height", h)
        .style("fill", "url(#gradient)")
        .attr("transform", "translate(0,10)");

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
        console.log(data)
        var ramp = d3.scaleLinear().domain([minVal, maxVal]).range([lowColor, highColor])
        console.log(minVal, maxVal)
            // Bind the data to the SVG and create one path per GeoJSON feature

        svg.selectAll("path")
            .data(data.features)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("mousemove", mousemove)
            .on("click", click)
            .style("stroke", "#000000")
            .style("stroke-width", "1")
            .style("fill", function(d) {
                if (!selected_states.has(d.properties['name'])) {
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
        }

        function click(d) {
            if (selected_states.has(d.properties['name'])) {
                d3.select(this).style("fill", function(d) {
                    return ramp(d.properties[features])
                })
                selected_states.delete(d.properties['name'])
            } else if (selected_states.size < 5) {
                console.log(selected_states)
                selected_states.add(d.properties['name'])
                d3.select(this).style("fill", "#FFFF00")
            }

            // $(document).ready(function() {
            //     $.ajax({
            //         type: 'POST',
            //         url: "http://127.0.0.1:5000/select_state",
            //         data: { states: selected_states },
            //         success: function(response) {
            //             update_US_map(response)
            //         },
            //         error: function(error) {
            //             console.log(error);
            //         }
            //     });
            // });

        }

        var y = d3.scaleLinear()
            .range([h, 0])
            .domain([minVal, maxVal]);

        var yAxis = d3.axisRight(y);

        key.selectAll("g.y-axis")
            .call(yAxis);


    }


    update_US_map(data)

    $(function() {
        $("#slider-range").slider({
            range: true,
            min: 1980,
            max: 2019,
            values: [1980, 1980],
            slide: function(event, ui) {
                $("#amount").val(ui.values[0] + " - " + ui.values[1]);

                $(document).ready(function() {
                    $.ajax({
                        type: 'POST',
                        url: "http://127.0.0.1:5000/update_US_years",
                        data: { 'min_year': ui.values[0], 'max_year': ui.values[1] },
                        success: function(response) {
                            update_US_map(response)
                        },
                        error: function(error) {
                            console.log(error);
                        }
                    });
                });
            }
        });
        $("#amount").val($("#slider-range").slider("values", 0) +
            " - " + $("#slider-range").slider("values", 1));
    });
}