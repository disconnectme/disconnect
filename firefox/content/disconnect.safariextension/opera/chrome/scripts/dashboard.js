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

    $('.bar_graph').each(function(){
        var graph = d3.select(this).select("svg");

        graph.attr("width", $(this).width())
             .attr("height", 150)

        graph.append("svg:rect")
             .attr("width",20)
             .attr("height",100);
    })
})