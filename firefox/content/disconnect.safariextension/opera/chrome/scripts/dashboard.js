$(function(){
    $('#main_left').shapeshift({
        enableResize: false,
        gutterX: 3,
        gutterY: 3,
        paddingX: 3,
        paddingY: 3,
        minColumns: 3,
        align: "left"
    });

    var blockedRequests = {
        "2012-11-31" : 635,
        "2013-12-01" : 1505,
        "2013-12-02" : 1691,
        "2013-12-03" : 1185,
        "2013-12-04" : 243,
        "2013-12-05" : 1071,
        "2013-12-06" : 92
    };

    blockedRequestsArray = [];

    convertToArray(blockedRequests)

    function convertToArray(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key)) {
                console.log(obj[key])
                blockedRequestsArray.push(
                    {
                        date : key,
                        value: obj[key]
                    })
            }
        }
    }

    console.log(blockedRequestsArray)

    var securedRequests = [
        1172,
        0,
        104,
        108,
        472,
        39,
        872
    ];

    var bandwidthSaved = []

    for(var i = 0, all = blockedRequests.length; i < all; i++) {
        bandwidthSaved.push(Math.round((blockedRequests[i] * 0.010495737084205).toFixed(1)))
    }

    // console.log(bandwidthSaved)

    barGraph("#blocked_requests", blockedRequestsArray)
    // barGraph("#secured_requests", securedRequests)
    // barGraph("#bandwidth_saved", bandwidthSaved, "MB")
    // $('.bar_graph').each(function(){
    //     var height = 150,
    //         barWidth = 18,
    //         barSpace = 17
    //         width = $(this).width();
    //         graph = d3.select(this).select("svg")
    //                   .attr("width", width)
    //                   .attr("height", height)
    //                   .append("svg:g")
    //                   .attr("width", (barWidth + barSpace) * blockedRequests.length - barSpace)
    //                   .attr("transform", "translate(23, 0)")
    //                   .selectAll("rect")
    //                   .data(blockedRequests)
    //                   .enter();


    //     var x = d3.scale.ordinal()
    //               .domain(blockedRequests)
    //               .rangeRoundBands([0, width]);

    //     var y = d3.scale.linear()
    //         .domain([0, d3.max(blockedRequests)])
    //         .range([height - 40,0]);

    //     graph.append("svg:rect")
    //              .attr("width",18)
    //              .attr("height", function(d,e){
    //                 return height - 20 - y(d)
    //              })
    //              .attr("x", function(d,i) {
    //                 return i * (barWidth + barSpace) + 2
    //              })
    //              .attr("y", function(d) {
    //                 return y(d) + 20
    //              })
    //              .on("mouseenter", function(d,i){
    //                 var labels = d3.selectAll("text")
    //                     .attr("fill-opacity", function(d,x) {
    //                         return x==i ? 1 : 0
    //                     })
    //              })
    //              .on("mouseout", function(d,i){
    //                 d3.selectAll("text")
    //                     .attr("fill-opacity",0)

    //              })

    //     graph.append("svg:text")
    //         .attr("x", function(d,i) {
    //             return i * (barWidth + barSpace) + 11;
    //         })
    //         .attr("y", function(d) { return y(d) + 10 })
    //         .attr("dy", ".5em")
    //         .attr("text-anchor", "middle")
    //         .attr("fill-opacity",0)
    //         .text(function(d) {
    //             return d;
    //         })
    // })

    function barGraph(element,data,data_label) {
        // console.log('Create a new graph: ', element)
        var data_label = data_label || false;
        var height = 150,
            barWidth = 18,
            barSpace = 17
            width = $(element).width();
            graph = d3.select(element).append("svg:svg")
                      .attr("width", width)
                      .attr("height", height)
                      .append("svg:g")
                      .attr("width", (barWidth + barSpace) * blockedRequests.length - barSpace)
                      .attr("transform", "translate(23, 0)")
                      .selectAll("rect")
                      .data(data)
                      .enter();


        var y = d3.scale.linear()
            .domain([0, d3.max(data, function(d){
                return d.value;
            })])
            .range([height - 22,0]);

        graph.append("svg:rect")
                 .attr("width",18)
                 .attr("height", function(d,e){
                    console.log("We made it")
                    return height - 20 - y(d.value)
                 })
                 .attr("x", function(d,i) {
                    return i * (barWidth + barSpace) + 2
                 })
                 .attr("y", function(d) {
                    return y(d.value) + 20
                 })
                 .on("mouseenter", function(d,i){
                    var labels = d3.select(element).selectAll("text")
                        .attr("fill-opacity", function(d,x) {
                            return x==i ? 1 : 0
                        })
                 })
                 .on("mouseout", function(d,i){
                    d3.select(element).selectAll("text")
                        .attr("fill-opacity",0)

                 })

        graph.append("svg:text")
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
    }
})