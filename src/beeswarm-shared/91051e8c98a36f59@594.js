export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["cars-2.csv",new URL("./files/53c407ee531bab128477148c9e28c49dd06bf83a93ae317e58dbb9fc819db0d4f6c4fb9646fa2fe20faad76addee20cfc360eab2362eeaec3340a5e4655b9996",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Beeswarm shared`
)});
  main.variable(observer("chartOrderedByContinent")).define("chartOrderedByContinent", ["d3","width","height","xAxis","dodge","datasetVaccines2","radius","padding","xScaleTime","margin","continents","continentOf"], function(d3,width,height,xAxis,dodge,datasetVaccines2,radius,padding,xScaleTime,margin,continents,continentOf)
{
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);
  
  const colors = d3.schemeTableau10;
  
  svg.append("g")
      .call(xAxis);

   // svg.append("g")
   //    .call(yAxis);
  
  svg.append("g")
    .selectAll("circle")
    .data(dodge(datasetVaccines2, {radius: radius * 2 + padding, x: d => xScaleTime(d.date)}))
    .join("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => height - margin.bottom - radius - padding - d.y)
      .attr("r", radius)
      .attr("fill", d => colors[continents.indexOf(continentOf(d.data.country))])
    .append("title")
      .text(d => d.data.country + "\n" + d.data.date + "\n" + d.data.daily_vaccinations);

    // Add one dot in the legend for each name.
  var size = 20
  svg.selectAll("mydots")
    .data(continents)
    .enter()
    .append("rect")
      .attr("x", 100)
      .attr("y", function(d,i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("width", size)
      .attr("height", size)
      .style("fill", function(d){ return colors[continents.indexOf(d)]})
  
  // Add one dot in the legend for each name.
  svg.selectAll("mylabels")
    .data(continents)
    .enter()
    .append("text")
      .attr("x", 100 + size*1.2)
      .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", function(d){ return colors[continents.indexOf(d)]})
      .text(function(d){ return d})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle")
  
  return svg.node();
}
);
  main.variable(observer()).define(["continents"], function(continents){return(
continents
)});
  main.variable(observer("dodge")).define("dodge", function(){return(
function dodge(data, {radius = 1, x = d => d} = {}) {
  const radius2 = radius ** 2;
  const circles = data.map((d, i, data) => ({x: +x(d, i, data), data: d})).sort((a, b) => a.x - b.x);
  const epsilon = 1e-3;
  let head = null, tail = null;

  // Returns true if circle ⟨x,y⟩ intersects with any circle in the queue.
  function intersects(x, y) {
    let a = head;
    while (a) {
      if (radius2 - epsilon > (a.x - x) ** 2 + (a.y - y) ** 2) {
        return true;
      }
      a = a.next;
    }
    return false;
  }

  // Place each circle sequentially.
  for (const b of circles) {

    // Remove circles from the queue that can’t intersect the new circle b.
    while (head && head.x < b.x - radius2) head = head.next;

    // Choose the minimum non-intersecting tangent.
    if (intersects(b.x, b.y = 0)) {
      let a = head;
      b.y = Infinity;
      do {
        let y = a.y + Math.sqrt(radius2 - (a.x - b.x) ** 2);
        if (y < b.y && !intersects(b.x, y)) b.y = y;
        a = a.next;
      } while (a);
    }

    // Add b to the queue.
    b.next = null;
    if (head === null) head = tail = b;
    else tail = tail.next = b;
  }

  return circles;
}
)});
  main.variable(observer("data")).define("data", ["FileAttachment"], async function(FileAttachment){return(
(await FileAttachment("cars-2.csv").csv({typed: true})).map(({Name: name, Weight_in_lbs: value}) => ({name, value: +value}))
)});
  main.variable(observer("blues")).define("blues", ["d3"], function(d3)
{
  let colors = d3.schemeBlues[9];
  return [colors[0], colors[2], colors[4], colors[6], colors[8]]
}
);
  main.variable(observer("colorScale2")).define("colorScale2", ["d3","blues"], function(d3,blues){return(
d3.scaleQuantize()
               .domain([0, 100]) //
               .range(blues)
)});
  main.variable(observer("orderByDailyVaccination")).define("orderByDailyVaccination", function(){return(
(d1, d2) => {
  if (d1.daily_vaccinations < d2.daily_vaccinations) {
    return -1;
  }
  if (d1.daily_vaccinations > d2.daily_vaccinations) {
    return 1;
  }
  // a deve ser igual a b
  return 0;
}
)});
  main.variable(observer("orderByContinent")).define("orderByContinent", ["continentOf"], function(continentOf){return(
(d1, d2) => {
  if(continentOf(d1.country) < continentOf(d2.country)){
    return -1;
  }
  if(continentOf(d1.country) > continentOf(d2.country)){
    return 1;
  }
  if(continentOf(d1.country) === continentOf(d2.country)){
    return 0;
  }
}
)});
  main.variable(observer("datasetVaccines")).define("datasetVaccines", ["d3","orderByDailyVaccination"], function(d3,orderByDailyVaccination){return(
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
  })).sort(orderByDailyVaccination);
})
)});
  main.variable(observer("datasetVaccines2")).define("datasetVaccines2", ["d3","orderByDailyVaccination","orderByContinent"], function(d3,orderByDailyVaccination,orderByContinent){return(
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
  })).sort(orderByDailyVaccination).sort(orderByContinent);
})
)});
  main.variable(observer("continentOf")).define("continentOf", ["dataContinet"], function(dataContinet){return(
function continentOf(name){
  if(name === "Russia")
    return "Asia";
  if(name === "Jersey")
    return "Europe";
  if(name === "Isle of Man")
    return "Europe";
  if(name === "Guernsey")
    return "Europe";
  if(name === "Faeroe Islands")
    return "Europe";
  if(name === "Czechia")
    return "Europe"
  if(name === "Cote d'Ivoire")
    return "Europe"
  if(name === "Northern Cyprus")
    return "Europe";
  for(var row of dataContinet){
    if(row.country === name)
      return row.continent;
  }
  return "";
}
)});
  main.variable(observer("continents")).define("continents", ["dataContinet"], function(dataContinet)
{
  const continents = []
  for(var row of dataContinet)
    if (continents.indexOf(row.continent) === -1)
      continents.push(row.continent)
  return continents.sort().reverse().filter(i => i !== "Antarctica")
}
);
  main.variable(observer()).define(["continentOf"], function(continentOf){return(
continentOf("United States")
)});
  main.variable(observer("dataContinet")).define("dataContinet", ["d3"], function(d3){return(
d3.json("https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-continent.json")
)});
  main.variable(observer("factsVaccines")).define("factsVaccines", ["crossfilter","datasetVaccines"], function(crossfilter,datasetVaccines){return(
crossfilter(datasetVaccines)
)});
  main.variable(observer("dateDim")).define("dateDim", ["factsVaccines"], function(factsVaccines){return(
factsVaccines.dimension(d => d.date)
)});
  main.variable(observer("dailyVaccinationsDim")).define("dailyVaccinationsDim", ["factsVaccines"], function(factsVaccines){return(
factsVaccines.dimension(d => d.daily_vaccinations)
)});
  main.variable(observer("x")).define("x", ["d3","data","margin","width"], function(d3,data,margin,width){return(
d3.scaleLinear()
    .domain(d3.extent(data, d => d.value))
    .range([margin.left, width - margin.right])
)});
  main.variable(observer("xScaleTime")).define("xScaleTime", ["d3","dateDim","margin","width"], function(d3,dateDim,margin,width){return(
d3.scaleTime()
  .domain([dateDim.bottom(1)[0].date, dateDim.top(1)[0].date])
  .range([margin.left, width - margin.right])
)});
  main.variable(observer("xAxis")).define("xAxis", ["height","margin","d3","xScaleTime"], function(height,margin,d3,xScaleTime){return(
g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScaleTime).tickSizeOuter(0))
)});
  main.variable(observer()).define(["dailyVaccinationsDim"], function(dailyVaccinationsDim){return(
dailyVaccinationsDim.bottom(1)[0]
)});
  main.variable(observer("yScaleDailyVaccinations")).define("yScaleDailyVaccinations", ["d3","dailyVaccinationsDim","margin","height"], function(d3,dailyVaccinationsDim,margin,height){return(
d3.scaleTime()
  .domain([dailyVaccinationsDim.bottom(1)[0].date, dailyVaccinationsDim.top(1)[0].date])
  .range([margin.bottom, height - margin.top])
)});
  main.variable(observer("yAxis")).define("yAxis", ["d3","yScaleDailyVaccinations"], function(d3,yScaleDailyVaccinations){return(
g => g
    .attr("transform", `translate(0,30)`)
    .call(d3.axisLeft(yScaleDailyVaccinations).tickSizeOuter(0))
)});
  main.variable(observer("height")).define("height", function(){return(
900
)});
  main.variable(observer("radius")).define("radius", function(){return(
3
)});
  main.variable(observer("padding")).define("padding", function(){return(
1.5
)});
  main.variable(observer("margin")).define("margin", function(){return(
{top: 20, right: 20, bottom: 30, left: 20}
)});
  main.variable(observer("crossfilter")).define("crossfilter", ["require"], function(require){return(
require("crossfilter2")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6")
)});
  return main;
}
