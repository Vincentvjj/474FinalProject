var width = 960,
    height = 800,
    centered;

var projection = d3.geo.albers()
    .center([0, 47.6097])
    .rotate([122.3331, 0])
    .parallels([50, 60])
    .scale(1200 * 5 * 30)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select(".chart").append("svg")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g");



var tooltip = d3.select('.chart').append('div')
    .attr('class', 'hidden tooltip');

//load the map
d3.json("Neighborhoods.json", function(error, neigh) {
  if (error) {
  	return console.error(error);
  }
  console.log(neigh);
  g.append("g")
    .selectAll(".collection")
      .data(topojson.feature(neigh, neigh.objects.collection).features)
    .enter().append("path")
      .attr("class", function(d) {return "collection " + d.properties.S_HOOD; })
      .attr("d", path)
      .on("click", clicked)
      .on("mousemove", function(d) {
        if(d.properties.S_HOOD == "OOO") {
          return;
        }

        var mouse = d3.mouse(svg.node()).map(function(d) {
          return parseInt(d);
        });
        tooltip.classed('hidden', false)
          .attr('style', 'left:' + (mouse[0] + 770) + 'px; top:' + (mouse[1] + 40) + 'px')
          .html(d.properties.S_HOOD);
      }).on("mouseout", function() {
        tooltip.classed('hidden', true); 
      });

     
  g.append("g")
  .selectAll(".subunit-label")
    .data(topojson.feature(neigh, neigh.objects.collection).features)
  .enter().append("text")
    .attr("class", function(d) { if(d.properties.S_HOOD == "OOO") {return "collection-bad";} else {return "collection-label " + d.properties.S_HOOD;}})
    .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
    .attr("dy", ".35em");
});

arrays = loadCrimes(svg);
arrays2 = loadPermits(svg);
console.log(arrays);
console.log(arrays2);

function loadCrimes(svg) {
	crimes = [];
    d3.csv("crimes2.csv", function(data) {
        data.forEach(function(d) {
            crimes.push({ "Crime": d["Crime"], "Latitude": d["Latitude"], "Longitude": d["Longitude"], "Year" : d["Year"], "Neighborhood" : d["Neighborhood"]});
        });  
        console.log(crimes) 
    });
    return crimes;
}

function loadPermits(svg) {
  permits = [];
    d3.csv("permits.csv", function(data) {
        data.forEach(function(d) {
            permits.push({ "Permit Type": d["Permit Type"], "Value": d["Value"], "Issue Date": d["Issue Date"], 
              "Status": d["Status"], "Latitude": d["Latitude"], "Longitude": d["Longitude"], "Neighborhood" : d["Neighborhood"]});
        });
        console.log(permits)
    });
    return permits;
}

function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}