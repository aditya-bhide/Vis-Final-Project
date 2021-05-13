var crimeDonutChartData,
    totalCrimes

var crimeDonutChartData, totalCrimes
var selectedDonutPath = false
var selectedDonutPathId = ""

$(document).ready(function () {
    createCrimeDonutChart(Array.from(states_for_donut_chart), year_range)
})

async function getDonutChartData(states, year_range) {
    const url = "http://localhost:5000/getCrimeDonutChart"

    var response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ state: states, yearList: year_range })
    })
    var response_json = await response.json()
    crimeDonutChartData = response_json['data']
    totalCrimes = response_json['totalCrimes']

}

async function createCrimeDonutChart(states, year_range) {
    await getDonutChartData(states, year_range)

    // set the dimensions and margins of the graph
    var width = 370
    height = 370
    var margin = { top: 80, right: 0, bottom: 0, left: 60 }


    var data = crimeDonutChartData
    console.log(data)
    // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    var radius = Math.min(width, height) / 2.5 - 40
    var innerRadius = 50

    // append the svg object to the div called crimeDonutChartId
    var svg = d3.select("#crimeDonutChartId")
        .append("svg")
        .attr("id", "crimeDonutChartSvg")
        .attr("width", width + margin.left + 20)
        .attr("height", height + 30)
        .append("g")
        .attr("transform", "translate(" + (width / 3 + margin.left) + "," + height / 2 + ")")
    // .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // set the color scale
    var color = d3.scaleOrdinal(d3.schemeBlues[6])
        .domain([0, 14807])
    // .interpolator(d3.interpolateBlues);

    // Compute the position of each group on the pie
    var pie = d3.pie()
        .value(function (d) {
            return d.value
        })

    var dataReady = pie(d3.entries(data))

    // shape helper to build arcs
    var arcGenerator = d3.arc()
        .innerRadius(innerRadius) // This is the size of the donut hole
        .outerRadius(radius)

    // Another arc that won't be drawn. Just for labels positioning
    var outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9)

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "donut-chart-tooltip")
        .style("opacity", 0);

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


    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    slices = shapeGroup
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
                    .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(radius + 6))
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
                    .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(radius))
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
                if (this.id == selectedDonutPathId) {
                    // Make all slices normal
                    d3.selectAll(".my-paths")
                        .attr("stroke", "black")
                        .style("stroke-width", "1.5px")
                        .style("opacity", "1")
                        .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(radius))

                    selectedDonutPath = false
                    selectedDonutPathId = ""

                    crimesList = "all_crimes"
                    crimeListTrigger_line_chart.a = "all_crimes"
                    crimeListTrigger_us_map.a = "all_crimes"

                } else {
                    // Blur other slices
                    d3.selectAll(".my-paths")
                        .attr("stroke", "#736f64")
                        .style("stroke-width", "0.5px")
                        .style("opacity", "0.6")
                        .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(radius))

                    // Increase radius of current slice
                    d3.select(this)
                        .attr("stroke", "black")
                        .style("stroke-width", "1.5px")
                        .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(radius + 6))
                        .style("opacity", "1")

                    selectedDonutPathId = this.id

                    crimesList = d.data.key
                    crimeListTrigger_us_map.a = d.data.key
                    crimeListTrigger_line_chart.a = d.data.key
                }

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
                    .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(radius + 6))
                    .style("opacity", "1")

                selectedDonutPath = true
                selectedDonutPathId = this.id

                crimesList = d.data.key
                crimeListTrigger_us_map.a = d.data.key
                crimeListTrigger_line_chart.a = d.data.key
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


    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("id", "donut-middle-text")
        .text(totalCrimes)
        .attr("class", "white-font")
        .style("font-size", 24)

    states_trigger_for_donut_chart.registerListener(function (val) {
        $(document).ready(function () {
            updateDonutChart(Array.from(states_for_donut_chart), year_range)
        });
    });


    year_range_trigger_for_donut_chart.registerListener(function (val) {
        $(document).ready(function () {
            updateDonutChart(Array.from(states_for_donut_chart), year_range)
        });
    });



    async function updateDonutChart(states, year_range) {
        await getDonutChartData(states, year_range)

        var data = crimeDonutChartData

        // Compute the position of each group on the pie
        var pie = d3.pie()
            .value(function (d) {
                return d.value
            })

        var dataReady = pie(d3.entries(data))

        oldGroups = svg.selectAll(".gDonut").remove()

        var newGroups = svg.selectAll(".shape-group")
            .data(dataReady)
            .enter()
            .append("g")
            .attr("class", "gDonut")


        newSlices = newGroups
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

        newSlices
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
                        .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(radius + 6))
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
                        .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(radius))
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
                    if (this.id == selectedDonutPathId) {
                        // Make all slices normal
                        d3.selectAll(".my-paths")
                            .attr("stroke", "black")
                            .style("stroke-width", "1.5px")
                            .style("opacity", "1")
                            .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(radius))

                        selectedDonutPath = false
                        selectedDonutPathId = ""

                        crimesList = "all_crimes"
                        crimeListTrigger_line_chart.a = "all_crimes"
                        crimeListTrigger_us_map.a = "all_crimes"

                    } else {
                        // Blur other slices
                        d3.selectAll(".my-paths")
                            .attr("stroke", "#736f64")
                            .style("stroke-width", "0.5px")
                            .style("opacity", "0.6")
                            .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(radius))

                        // Increase radius of current slice
                        d3.select(this)
                            .attr("stroke", "black")
                            .style("stroke-width", "1.5px")
                            .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(radius + 6))
                            .style("opacity", "1")

                        selectedDonutPathId = this.id

                        crimesList = d.data.key
                        crimeListTrigger_us_map.a = d.data.key
                        crimeListTrigger_line_chart.a = d.data.key
                    }

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
                        .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(radius + 6))
                        .style("opacity", "1")

                    selectedDonutPath = true
                    selectedDonutPathId = this.id

                    crimesList = d.data.key
                    crimeListTrigger_us_map.a = d.data.key
                    crimeListTrigger_line_chart.a = d.data.key
                }
            })

        if (selectedDonutPath) {
            selected_path_element = d3.select('#' + selectedDonutPathId)

            // Blur other slices
            d3.selectAll(".my-paths")
                .attr("stroke", "#736f64")
                .style("stroke-width", "0.5px")
                .style("opacity", "0.6")


            // Increase radius of current slice
            selected_path_element
                .attr("stroke", "black")
                .style("stroke-width", "1.5px")
                .attr("d", d3.arc().innerRadius(innerRadius).outerRadius(radius + 6))
                .style("opacity", "1")
        }






        svg.select("#donut-middle-text")
            .attr("text-anchor", "middle")
            .text(totalCrimes)
            .attr("class", "white-font donut-middle-text")
            .style("font-size", 24)
    }
}