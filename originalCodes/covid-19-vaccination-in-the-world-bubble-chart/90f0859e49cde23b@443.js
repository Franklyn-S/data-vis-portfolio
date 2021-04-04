// https://observablehq.com/@franklyn-s/covid-19-vaccination-in-the-world-bubble-chart@443
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Covid-19 vaccination in the World ~ Bubble Chart

Bubble charts are non-hierarchical [packed circles](/@d3/circle-packing). The area of each circle is proportional its value (here, file size). The organic appearance of these diagrams can be intriguing, but also consider a [treemap](/@d3/treemap) or a humble [bar chart](/@d3/horizontal-bar-chart).`
)});
  main.variable(observer("chart")).define("chart", ["pack","totalVaccination","d3","width","height","DOM","format"], function(pack,totalVaccination,d3,width,height,DOM,format)
{
  const root = pack(totalVaccination);
  
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("font-size", 10)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle");

  const leaf = svg.selectAll("g")
    .data(root.leaves())
    .join("g")
      .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`);

  leaf.append("circle")
      .attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
      .attr("r", d => d.r)
      .attr("fill-opacity", 0.7)
      .attr("fill", '#4682B4');

  leaf.append("clipPath")
      .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
    .append("use")
      .attr("xlink:href", d => d.leafUid.href);

  leaf.append("text")
      .attr("clip-path", d => d.clipUid)
    .selectAll("tspan")
    .data(d => d.data.country.split(/(?=[A-Z][a-z])|\s+/g))
    .join("tspan")
      .attr("x", 0)
      .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
      .text(d => d);

  leaf.append("title")
      .text(d => `${d.data.country === undefined ? "" : `${d.data.country}
`}${format(d.value)}
${d.data.date}
`);
    
  return svg.node();
}
);
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
d3.csv('https://raw.githubusercontent.com/Franklyn-S/data-vis-portfolio/main/country_vaccinations.csv').then(function(data) {
  let parseDate = d3.utcParse("%Y-%m-%d");
  return data.map(d => ({
    ...d,
    date: parseDate(d.date),
    total_vaccinations: +d.total_vaccinations,
    people_vaccinated: +d.people_vaccinated,
    people_fully_vaccinated: +d.people_fully_vaccinated,
    daily_vaccinations_raw: +d.daily_vaccinations_raw,
    daily_vaccinations: +d.daily_vaccinations,
    total_vaccinations_per_hundred: +d.total_vaccinations_per_hundred,
    people_vaccinated_per_hundred: +d.people_vaccinated_per_hundred,
    people_fully_vaccinated_per_hundred: +d.people_fully_vaccinated_per_hundred,
    daily_vaccinations_per_million: +d.daily_vaccinations_per_million,
  }));
})
)});
  main.variable(observer("pack")).define("pack", ["d3","width","height"], function(d3,width,height){return(
dataset => d3.pack()
    .size([width - 2, height - 2])
    .padding(3)
  (d3.hierarchy({children: dataset})
    .sum(d => d.daily_vaccinations))
)});
  main.variable(observer("width")).define("width", function(){return(
932
)});
  main.variable(observer("height")).define("height", ["width"], function(width){return(
width
)});
  main.variable(observer("format")).define("format", ["d3"], function(d3){return(
d3.format(",d")
)});
  main.variable(observer("crossfilter")).define("crossfilter", ["require"], function(require){return(
require("crossfilter2")
)});
  main.variable(observer("facts")).define("facts", ["crossfilter","dataset"], function(crossfilter,dataset){return(
crossfilter(dataset)
)});
  main.variable(observer()).define(["facts"], function(facts){return(
facts.groupAll(d => d.country)
)});
  main.variable(observer("totalVaccination")).define("totalVaccination", ["dataset"], function(dataset)
{
  const distincts = []
  const maxVaccinations = []

  for (var i = 0; i < dataset.length; i++)
   if (distincts.indexOf(dataset[i].country ) === -1){
      distincts.push(dataset[i].country)
   }
  
  for(var i of distincts){
    const byCountry = dataset.filter(d => d.country === i).reduce(function(prev, current) {
      return (prev.y > current.y) ? prev : current
    })
    maxVaccinations.push(byCountry)
  }
  
  return maxVaccinations
}
);
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6")
)});
  return main;
}
