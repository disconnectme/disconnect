$(function(){
    var originalData = {
        "blockedRequests" : {
            "2013-11-23" : 200,
            "2013-11-24" : 105,
            "2013-11-25" : 500,
            "2013-11-26" : 300,
            "2013-11-27" : 100,
            "2013-11-28" : 234,
            "2013-11-29" : 120,
            "2013-11-30" : 635,
            "2013-12-01" : 1505,
            "2013-12-02" : 1691,
            "2013-12-03" : 1185,
            "2013-12-04" : 243,
            "2013-12-05" : 1071,
            "2013-12-06" : 92
        },
        "hardenedRequests" : {
            "2013-11-23" : 172,
            "2013-11-24" : 144,
            "2013-11-25" : 404,
            "2013-11-26" : 308,
            "2013-11-27" : 172,
            "2013-11-28" : 392,
            "2013-11-29" : 300,
            "2013-11-30" : 1172,
            "2013-12-01" : 200,
            "2013-12-02" : 104,
            "2013-12-03" : 108,
            "2013-12-04" : 472,
            "2013-12-05" : 39,
            "2013-12-06" : 872
        }
    };

    var valueData = [
        {
            "label": "User Value",
            "value": 1.99
        },
        {
            "label": "Average Value",
            "value": 3.00
        }
    ]

    var originalCommunityData = {
        "blockedRequests" : {
            "2013-11-30" : 63500,
            "2013-12-01" : 150500,
            "2013-12-02" : 169100,
            "2013-12-03" : 118500,
            "2013-12-04" : 243000,
            "2013-12-05" : 107100,
            "2013-12-06" : 92030
        },
        "hardenedRequests" : {
            "2013-11-30" : 1172*100,
            "2013-12-01" : 200*100,
            "2013-12-02" : 104*100,
            "2013-12-03" : 108*100,
            "2013-12-04" : 472*100,
            "2013-12-05" : 39*100,
            "2013-12-06" : 872*100
        }
    }

    ss_options = {
        enableResize: false,
        gutterX: 3,
        gutterY: 3,
        paddingX: 3,
        paddingY: 0,
        minColumns: 3,
        dragWhitelist: '.draggable',
        align: "left"
    }

    /* Adds the drag and drop functionality to the boxes */
    $('#main_left').shapeshift(ss_options);

    var d3_bandwidth_data = massageData(calculateBandwidth(originalData.blockedRequests), true),
        d3_blocked_requests = massageData(originalData.blockedRequests, true),
        d3_secure_requests = massageData(originalData.hardenedRequests, true),
        week = d3_bandwidth_data.length - 1,
        weeks = d3_bandwidth_data.length - 1,
        previous_arrow = $("#previous"),
        next_arrow = $("#next");


    updateDateBox(moment(_.findKey(originalData.blockedRequests)), moment(_.findLastKey(originalData.blockedRequests)));

    createBarGraph("#blocked_requests", d3_bandwidth_data[week])
    createBarGraph("#secured_requests", d3_blocked_requests[week])
    createBarGraph("#bandwidth_saved", d3_bandwidth_data[week], "MB")

    createPieChart("#user_value",valueData)

    previous_arrow.on("click", function(){
        if(!$(this).hasClass("inactive")){
            week--;

            if(week ===0) {
                $(this).addClass("inactive");
            }
            if(week < weeks) {
                next_arrow.removeClass("inactive");
            }
            console.log("update graphs to previous week");

            // Update Blocked Requests
            updateBarGraph("#blocked_requests", d3_bandwidth_data[week],week);
            updateBarGraph("#secured_requests", d3_blocked_requests[week],week);
            updateBarGraph("#bandwidth_saved", d3_bandwidth_data[week],week, "MB");

        }
    })

    next_arrow.on("click", function(){
        if(!$(this).hasClass("inactive")){
            week++;

            if(week === weeks) {
                $(this).addClass("inactive");
            }
            if(week > 0) {
                previous_arrow.removeClass("inactive");
            }
            console.log("update graphs to previous week");

            // Update Blocked Requests
            updateBarGraph("#blocked_requests", d3_bandwidth_data[week],week);
            updateBarGraph("#secured_requests", d3_blocked_requests[week],week);
            updateBarGraph("#bandwidth_saved", d3_bandwidth_data[week],week, "MB");

        }
    })

    createCommunityChart("#community_stats", originalCommunityData)


    function createBarGraph(element,data,data_label) {

        var data_label = data_label || false,
            height = 150,
            barWidth = 18,
            barSpace = 17,
            width = $(element).width(),
            y = d3.scale.linear()
                  .domain([0, d3.max(data, function(d){
                      return d.value;
                  })])
                  .range([height - 22,0]);

        svg = d3.select(element).append("svg:svg")
                  .attr("width", width)
                  .attr("height", height);

        /*--- Add bar graph rectangles */
        graph = svg.append("svg:g")
                    .attr("width", (barWidth + barSpace) * data.length - barSpace)
                    .attr("transform", "translate(23, 0)")
                    .selectAll("rect")
                    .data(data)
                    .enter()
                    .append("svg:rect")
                    .attr("width",barWidth)
                    .attr("height", function(d,e){
                        return height - 20 - y(d.value)
                    })
                    .attr("x", function(d,i) {
                        return i * (barWidth + barSpace) + 2
                    })
                    .attr("y", function(d) {
                        return y(d.value) + 20
                    })
                    .on("mouseenter", function(d,i){
                        var labels = d3.select(element)
                                .select(".values")
                                .selectAll("text")
                        labels.attr("fill-opacity", function(d,x) {
                                return x==i ? 1 : 0
                        })
                    })
                    .on("mouseout", function(d,i){
                        d3.select(element).select(".values")
                          .selectAll("text")
                          .attr("fill-opacity",0)
                    })

        //--- Add the value(text) for each graph
        svg
            .append("svg:g")
            .attr("transform", "translate(23, 0)")
            .classed("values", true)
            .selectAll("text")
            .data(data).enter()
            .append("svg:text")
            .attr("x", function(d,i) {
                return i * (barWidth + barSpace) + 11;
            })
            .attr("y", function(d) { return y(d.value) + 10 })
            .attr("dy", ".5em")
            .attr("text-anchor", "middle")
            .attr("fill-opacity",0)
            .text(function(d) {
                if(data_label) {
                    return d.value + data_label
                }
                return d.value;
            })

        // Add the day of each graph
        // svg
        //     .append("svg:g")
        //     .attr("transform", "translate(23,0)")
        //     .classed("days",true)
        //     .selectAll("text")
        //     .data(data).enter()
        //     .append("svg:text")
        //     .attr("x", function(d,i) {
        //         return i * (barWidth + barSpace) + 11;
        //     })
        //     .attr("y", function(d) { return height - 10 })
        //     .attr("dy", ".5em")
        //     .attr("text-anchor", "middle")
        //     .attr("fill-opacity",1)
        //     .text(function(d) {

        //         return moment(d.date).format('dd');
        //     })

        //--- Add navigation arrows
        // arrow_left = svg.append("svg:g")
        //     .attr("id","left_arrow")
        //     .attr("transform", "translate(10,0)")
        //     .append("svg:polygon")
        //     .classed("arrow", true)
        //     .attr("points","7.417,8.565 0,4.282 7.417,0")
        //     .on("click", function(){
        //         if(!d3.select(this).classed("inactive")){
        //             week--;
        //             updateGraph(element,allData,week)
        //         }
        //     })

        // arrow_right = svg.append("svg:g")
        //     .attr("id","right_arrow")
        //     .attr("transform", "translate(" + (width - 20) + ",0)")
        //     .append("svg:polygon")
        //     .classed("arrow", true)
        //     .classed("inactive",true)
        //     .attr("points", "0,8.565 7.417,4.282 0,0")
        //     .on("click", function(){
        //         if(!d3.select(this).classed("inactive")){
        //             week++;
        //             updateGraph(element,allData,week)
        //         }
        //     })

    }

    function updateBarGraph(element,data,week,data_label) {
        // if(set < allData.length-1) {
        //     d3.select(element).select("#right_arrow > polygon").classed("inactive",false)
        // }
        // if(set > 0) {
        //     d3.select(element).select("#left_arrow > polygon").classed("inactive",false)
        // }

        // if(set == allData.length-1) {
        //     d3.select(element).select("#right_arrow > polygon").classed("inactive",true)
        // }

        // if(set == 0) {
        //     d3.select(element).select("#left_arrow > polygon").classed("inactive",true)
        // }


        var height = $(element).height(),
            data_label = data_label || false,
            y = d3.scale.linear()
              .domain([0, d3.max(data, function(d){
                  return d.value;
              })])
              .range([height - 22,0])

        d3.select(element).select("svg")
            .selectAll("rect")
            .data(data)
            .transition()
            .duration(1000)
            .attr("height", function(d,e){
                return height - 20 - y(d.value)
             })
            .attr("y", function(d) {
                return y(d.value) + 20
             })

        d3.select(element).select(".values")
            .selectAll("text")
            .data(data)
            .transition()
            .duration(1000)
            .attr("y", function(d) { return y(d.value) + 10 })
            .attr("text-anchor", "middle")
            .text(function(d) {
                if(data_label) {
                    return d.value + data_label
                }
                return d.value;
            })
    }

    function createCommunityChart(element,raw_data) {


        var width = $(element).width(),
            height = $(element).height(),
            blockedRequests = massageData(raw_data.blockedRequests),
            securedRequests = massageData(raw_data.hardenedRequests),
            savedBandwidth = massageData(calculateBandwidth(raw_data.blockedRequests)),
            margin = 20;

        var xScale = d3.scale.linear()
                .domain([0, blockedRequests.length])
                .range([0,width])


        graph = d3.select(element).select(".graph")
            .append("svg:svg")
            .attr("width", $(element).width())
            .attr("height", $(element).height());

        var rulers = graph.append("svg:g").classed("rulers",true)
                        .attr("transform", "translate(37, 0)")
                        .selectAll("line")
                        .data(blockedRequests)
                        .enter()
                        .append("svg:line")
                        .attr("x1", function(d,i){
                            return xScale(i);
                        })
                        .attr("y1", 0)
                        .attr("x2", function(d,i){
                            return xScale(i);
                        })
                        .attr("y2", height)


        createLineChart(blockedRequests, "blocked_requests");
        createLineChart(securedRequests, "secured_requests");
        // createLineChart(savedBandwidth, "saved_bandwidth");

        function createLineChart(data,group_name){
            var yScale = d3.scale.linear()
                    .domain([d3.max(data, function(d){
                        return d.value
                    }), 0])
                    .range([0, height - margin]);

            var xScale = d3.scale.linear()
                    .domain([0, data.length])
                    .range([0,width])

            var line = d3.svg.line()
                     .x(function(d,i) {
                        return xScale(i)
                     })
                     .y(function(d){
                        return yScale(d.value)
                     })

            current_graph = graph.append("svg:g").classed(group_name, true);

            current_graph.append("svg:g").classed("line",true)
             .attr("transform", "translate(37, 10)")
             .append("svg:path").attr("d", line(data))
             .attr("fill", "none")

            current_graph.append("svg:g").classed("dots",true)
                .attr("transform", "translate(37, 10)")
                .selectAll("circle")
                .data(data)
                .enter()
                .append("svg:circle")
                .attr("cx", function(d,i){
                    return xScale(i)
                })
                .attr("cy", function(d,i){
                    return yScale(d.value);
                })
                .attr("r",3)
                .on("mouseover", function(d,i){
                    console.log(d.value);
                })
        }
    }

    function createPieChart(element,data){


        var width = $(element).width(),
            height= $(element).height(),
            svg = d3.select(element)
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height),
            arc = d3.svg.arc(),
            n = 1,
            outerRadius = Math.min(width - (width/4),height - (height/4)) * .5,
            innerRadius = outerRadius * .85,
            pie = d3.layout.pie().sort(null).value(function(d){
                return d.value }),
            arc_colors = [
                "#323743",
                "#00ae68"
            ]

        var value_text = svg
                    .append("svg:text")
                    .attr("x", width/2)
                    .attr("y", height/2)
                    .attr("text-anchor", "middle")
                    .classed("value_text", true)
                    .text("$" + data[0].value);

        var value_label = svg.append("text")
                    .classed("value_label", true)
                    .attr("x",width/2)
                    .attr("y",height/2 + 30)
                    .attr("text-anchor", "middle")
                    .text(data[0].label)

        svg.selectAll(".arc")
        .data(arcs(data,data))
        .enter().append("g")
            .classed("arc",true)
            .attr("transform", "translate(" + width / 2 + "," + height /2 + ")")
        .append("path")
            .attr("fill", function(d,i){
                return arc_colors[i]
            })
            .attr("d",arc)
            .on("mouseover", function(d,i){
                d3.select(element).select(".value_text").text("$" + d.value.toFixed(2));
                d3.select(element).select(".value_label").text(d.data.label);
            })
            .on("mouseout", function(d,i){
                d3.select(element).select(".value_text").text("$" + data[0].value);
                d3.select(element).select(".value_label").text(data[0].label);
            })

        function arcs(data){
            var arcs0 = pie(data),
                arcs1 = pie(data),
                i = -1,
                arc;
            while(i++ < n){
                arc = arcs0[i];
                arc.innerRadius = innerRadius;
                arc.outerRadius = outerRadius;
                arc.next = arcs1[i];
            }
            return arcs0;
        }
    }

    function massageData(obj,completeWeek) {

        var completeWeek = completeWeek || false; // If value is true, it will make sure we have data for the complete week.

        /* Calculate amount of days we have for data */
        var first_date = moment(_.findKey(obj)),
            last_date = moment(_.findLastKey(obj)),
            originalFormat = "YYYY-MM-DD";

        if(completeWeek) {
            first_date = first_date.startOf('week').format(originalFormat);
            last_date = last_date.endOf('week').format(originalFormat);
        } else {
            first_date = first_date.format(originalFormat);
            last_date = last_date.format(originalFormat)
        }

        var total_days = moment(last_date).diff(moment(first_date), "days");
        arrayOfData = [];



        /* Divide object into an array of objects. Add days that are missing from the data set */
        for(var i = 0; i <= total_days; i++) {
            var day = moment(first_date).add("days",i).format('YYYY-MM-DD');
            if(_.has(obj,day)) {
                arrayOfData.push({
                    date: day,
                    value: obj[day]
                })
            } else {
                arrayOfData.push({
                    date: day,
                    value: 0
                })
            }
        }

        if(completeWeek) {
            arrayOfData = divideIntoWeeks(arrayOfData);
        }
        return arrayOfData;
    }

    function divideIntoWeeks(array) {
        /* Group data every 7 days */
        var division_times = (array.length - 1) / 7,
            finalArray = [];

        for(var i = 0; i < division_times; i++) {
            finalArray.push(array.splice(0,7))
        }

        return finalArray;
    }

    function updateDateBox(first_day,last_day) {
        var dateString = "From <strong>";
            dateString += first_day.format("dddd, MMMM DD, YYYY");
            dateString += "</strong> to <strong>";
            dateString += last_day.format("dddd, MMMM DD, YYYY");
            dateString += "</strong>";

        $("#date_box span.text").html(dateString);
    }

    function updateStats(week) {

    }

    function calculateBandwidth(data){
        var bandwidthSaved = {};

        _.forIn(data, function(value,key){
            bandwidthSaved[key] = Number(Math.round(value * 0.010495737084205).toFixed(1))
        })
        return bandwidthSaved;
    }
})