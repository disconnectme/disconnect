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

    /* Adds the drag and drop functionality to the boxes */
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

    $('#main_left').shapeshift(ss_options);

    var bandwidthData = calculateBandwidth(originalData.blockedRequests)


    createBarGraph("#blocked_requests", originalData.blockedRequests)
    createBarGraph("#secured_requests", originalData.hardenedRequests)
    createBarGraph("#bandwidth_saved", bandwidthData, "MB")

    createCommunityChart("#community_stats", originalCommunityData)


    function createBarGraph(element,raw_data,data_label) {

        var allData = massageData(raw_data, true),
            allData = divideIntoWeeks(allData),
            week = allData.length-1,
            data = allData[week],
            data_label = data_label || false,
            height = 150,
            barWidth = 18,
            barSpace = 17
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
        svg
            .append("svg:g")
            .attr("transform", "translate(23,0)")
            .classed("days",true)
            .selectAll("text")
            .data(data).enter()
            .append("svg:text")
            .attr("x", function(d,i) {
                return i * (barWidth + barSpace) + 11;
            })
            .attr("y", function(d) { return height - 10 })
            .attr("dy", ".5em")
            .attr("text-anchor", "middle")
            .attr("fill-opacity",1)
            .text(function(d) {

                return moment(d.date).format('dd');
            })

        //--- Add navigation arrows
        arrow_left = svg.append("svg:g")
            .attr("id","left_arrow")
            .attr("transform", "translate(10,0)")
            .append("svg:polygon")
            .classed("arrow", true)
            .attr("points","7.417,8.565 0,4.282 7.417,0")
            .on("click", function(){
                if(!d3.select(this).classed("inactive")){
                    week--;
                    updateGraph(element,allData,week)
                }
            })

        arrow_right = svg.append("svg:g")
            .attr("id","right_arrow")
            .attr("transform", "translate(" + (width - 20) + ",0)")
            .append("svg:polygon")
            .classed("arrow", true)
            .classed("inactive",true)
            .attr("points", "0,8.565 7.417,4.282 0,0")
            .on("click", function(){
                if(!d3.select(this).classed("inactive")){
                    week++;
                    updateGraph(element,allData,week)
                }
            })

        function updateGraph(element,allData,set) {
            if(set < allData.length-1) {
                d3.select(element).select("#right_arrow > polygon").classed("inactive",false)
            }
            if(set > 0) {
                d3.select(element).select("#left_arrow > polygon").classed("inactive",false)
            }

            if(set == allData.length-1) {
                d3.select(element).select("#right_arrow > polygon").classed("inactive",true)
            }

            if(set == 0) {
                d3.select(element).select("#left_arrow > polygon").classed("inactive",true)
            }

            var data = allData[set],
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

    function massageData(obj,completeWeek) {

        var completeWeek = completeWeek || false; // If value is true, it will make sure we have data for the complete week.

        /* Calculate amount of days we have for data */
        var first_date = moment(_.findKey(obj)),
            last_date = moment(_.findLastKey(obj)),
            originalFormat = "YYYY-MM-DD";

        updateDateBox(first_date,last_date);

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
            dateString += first_day.format("MMMM DD, YYYY");
            dateString += "</strong> to <strong>";
            dateString += last_day.format("MMMM DD, YYYY");
            dateString += "</strong>";

        $("#date_box").html(dateString);
    }

    function calculateBandwidth(data){
        var bandwidthSaved = {};

        _.forIn(data, function(value,key){
            bandwidthSaved[key] = Number(Math.round(value * 0.010495737084205).toFixed(1))
        })
        return bandwidthSaved;
    }
})