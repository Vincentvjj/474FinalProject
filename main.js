var width = 600,
    height = 800,
    centered;


var arrays = loadCrimes(svg);

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

var start = 2010;
var end = 2016;



d3.select('#slider-range').call(d3.slider().scale(d3.time.scale()
    .domain([new Date(2009,1,1), new Date(2016,1,1)]))
    .axis( d3.svg.axis() ).snap(true).value([new Date(2010,1,1),new Date(2016,1,1)])
    .on("slide", function(evt, value) {
      start = new Date(value[0]).getFullYear();
      end = new Date(value[1]).getFullYear();
      document.getElementById("year").innerHTML = "Year: " + start;
      gradientsCrime(start, arrays);

    }));

var rateById = d3.map();

var quantize = d3.scale.quantize()
    .domain([0, .15])
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

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
      .attr("class", function(d) {
        if(d.properties.S_HOOD){
          return "collection " + d.properties.S_HOOD.replace(/\s/g, '');
        } else {
          return "collection " + "none";
        }
         
      })
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
          .attr('style', 'left:' + (mouse[0] + 880) + 'px; top:' + (mouse[1] + 40) + 'px')
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

arrays2 = loadPermits(svg);
landPermits = loadLandPermits(svg);
culture = loadCulture(svg);

function crimeGraph(neighborhood) {
  crimes = [];
  crimeforArea = [];
  for(i = 0; i < arrays.length;i++) {
    if(arrays[i].Neighborhood == neighborhood.replace(/\s+/g, '')) {
      if(crimes.indexOf(arrays[i].Crime) == -1) {
        crimes[arrays[i].Crime] = 1;  
      }
      else {
        console.log("HIAHIAHAI");
        crimes[arrays[i].Crime] = crimes[arrays[i].Crime] + 1;    
      }  
    }     
  }
  console.log(crimes);     
}

function loadCrimes() {
	crimes = [];
    d3.csv("crimes2.csv", function(data) {
        data.forEach(function(d) {
            var str = d["Neighborhood"].replace(/\s+/g, '');
            crimes.push({ "Crime": d["Crime"], "Latitude": d["Latitude"], "Longitude": d["Longitude"], "Year" : d["Year"], "Neighborhood" : str});
        });  

        gradientsCrime(2015,crimes)
    });
    return crimes;
}

function loadPermits() {
  permits = [];
    d3.csv("permits.csv", function(data) {
        data.forEach(function(d) {
            var str = d["Neighborhood"].replace(/\s+/g, '');
            var date = "20"+d["Issue Date"].substring(d["Issue Date"].length-2, d["Issue Date"].length)
            permits.push({ "Permit Type": d["Permit Type"], "Value": d["Value"], "Year": date, 
              "Status": d["Status"], "Latitude": d["Latitude"], "Longitude": d["Longitude"], "Neighborhood" : str});
        });
        // gradientsPermits(2013,permits)
    });
    return permits;
}

function gradientsCrime(num, array) {
  neighborhoods = [];
  for(i = 0; i < array.length;i++) {
    if(parseInt(arrays[i].Year) == num)  
      if(neighborhoods[arrays[i].Neighborhood] == undefined) {
        neighborhoods[arrays[i].Neighborhood] = 1;
      }
      else {
        neighborhoods[arrays[i].Neighborhood] = neighborhoods[arrays[i].Neighborhood] + 1;
      }
  }
  for(var key in neighborhoods) {
    if(neighborhoods[key] < 5) {
      try {
        d3.select("."+key).transition().style("fill","rgb(200, 200, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(neighborhoods[key] >= 5 && neighborhoods[key] < 10) {
      try {
        d3.select("."+key).transition().style("fill","rgb(150, 150, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(neighborhoods[key] >= 10 && neighborhoods[key] < 20) {
      try {
        d3.select("."+key).transition().style("fill","rgb(100, 100, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }  
    else if(neighborhoods[key] >= 20 && neighborhoods[key] < 30) {
      try {
        d3.select("."+key).transition().style("fill","rgb(50, 50, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(neighborhoods[key] >= 30) {
      try {
        d3.select("."+key).transition().style("fill","rgb(0, 0, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }   
  }
}

function gradientsPermits(num, array) {
  permits = [];
  for(i = 0; i < array.length;i++) {
    if(arrays[i] != undefined) {
      if(parseInt(arrays[i].Year) == num) {  
        if(permits[arrays[i].Neighborhood] == undefined) {
          permits[arrays[i].Neighborhood] = 1;
        }
        else {
          permits[arrays[i].Neighborhood] = permits[arrays[i].Neighborhood] + 1;
        }
      }
    }
  }
  for(var key in permits) {
    if(permits[key] < 5) {
      try {
        d3.select("."+key).transition().style("fill","rgb(200, 200, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(permits[key] >= 5 && permits[key] < 10) {
      try {
        d3.select("."+key).transition().style("fill","rgb(150, 150, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(permits[key] >= 10 && permits[key] < 20) {
      try {
        d3.select("."+key).transition().style("fill","rgb(100, 100, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }  
    else if(permits[key] >= 20 && permits[key] < 30) {
      try {
        d3.select("."+key).transition().style("fill","rgb(50, 50, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(permits[key] >= 30) {
      try {
        d3.select("."+key).transition().style("fill","rgb(0, 0, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }   
  }
}

function loadLandPermits(svg) {
  lpermits = [];
    d3.tsv("data/Land_Use_Permits.txt", function(data) {
        data.forEach(function(d) {
            lpermits.push({ "Address": d["Address"], "Applicant Name": d["Applicant Name"], "NeighborhoodCalculated": d["Neighborhood Calculated"].replace(/\s+/g, ''), 
               "Latitude": d["Latitude"], "Longitude": d["Longitude"], "ApplicationDate" : "20"+d["Application Date"].substring(d["Application Date"].length-2)});
        });
    });
        gradientsLandPermits(2015,lpermits);
    return lpermits;
}

function gradientsLandPermits(num, array) {
  land = [];
  for(i = 0; i < array.length;i++) {
    if(parseInt(arrays[i].Year) == num)  
      if(land[arrays[i].NeighborhoodCalculated] == undefined) {
        land[arrays[i].NeighborhoodCalculated] = 1;
      }
      else {
        land[arrays[i].NeighborhoodCalculated] = land[arrays[i].NeighborhoodCalculated] + 1;
      }
  }
  for(var key in land) {
    if(land[key] < 5) {
      try {
        d3.select("."+key).transition().style("fill","rgb(200, 200, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(land[key] >= 5 && land[key] < 10) {
      try {
        d3.select("."+key).transition().style("fill","rgb(150, 150, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(land[key] >= 10 && land[key] < 20) {
      try {
        d3.select("."+key).transition().style("fill","rgb(100, 100, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }  
    else if(land[key] >= 20 && land[key] < 30) {
      try {
        d3.select("."+key).transition().style("fill","rgb(50, 50, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(land[key] >= 30) {
      try {
        d3.select("."+key).transition().style("fill","rgb(0, 0, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }   
  }
}

function loadCulture(svg) {
  cpermits = [];
    d3.tsv("data/Seattle_Cultural_Space_Inventory-3.txt", function(data) {
        data.forEach(function(d) {
            cpermits.push({ "Name": d["Name"], "Constiuents": d["Constiuents"], "Location": d["Location"], "Neighborhood": d["Neighborhood"].replace(/\s+/g, ''),  "Year Occupied": d["Year Occupied"],
              "Own or Rent": d["Own or Rent"], "Parking Spaces": d["Parking Spaces"], "Square Feet": d["Square Feet"], "Type" : d["Type"]});
        });
    });
    gradientsCulture(2015,lpermits);
    return cpermits;
}
function gradientsCulture(num, array) {
  cult = [];
  for(i = 0; i < array.length;i++) {
    if(parseInt(arrays[i].Year) == num)  
      if(cult[arrays[i].Neighborhood] == undefined) {
        cult[arrays[i].Neighborhood] = 1;
      }
      else {
        cult[arrays[i].Neighborhood] = cult[arrays[i].Neighborhood] + 1;
      }
  }
  for(var key in cult) {
    if(cult[key] < 5) {
      try {
        d3.select("."+key).transition().style("fill","rgb(200, 200, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(cult[key] >= 5 && cult[key] < 10) {
      try {
        d3.select("."+key).transition().style("fill","rgb(150, 150, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(cult[key] >= 10 && cult[key] < 20) {
      try {
        d3.select("."+key).transition().style("fill","rgb(100, 100, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }  
    else if(cult[key] >= 20 && cult[key] < 30) {
      try {
        d3.select("."+key).transition().style("fill","rgb(50, 50, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }
    else if(cult[key] >= 30) {
      try {
        d3.select("."+key).transition().style("fill","rgb(0, 0, 255)");
      }
      catch(err) {
        console.log("hi")
      }
    }   
  }
}

function clicked(d) {
  var x, y, k;
  var array = crimeGraph(d.properties["S_HOOD"]);
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

var playing = false; 

function play() {
  if(playing == true) {
    return;
  }
  playing = true;
  var index = start;
  var timer = setInterval(function() {
    document.getElementById("year").innerHTML = "Year: " + index;
    gradientsCrime(index, arrays);
    index++;
    if(index > end) {
      playing = false;
      clearInterval(timer);
    }
  } , 1000)

}