// https://observablehq.com/@franklyn-s/d3-com-crossfilter-e-dc-js/2@846
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Vacinação Covid-19 Brasil e EUA

Visualizando dados de vacinação contra Covid-19 de final de 2020 e inicio de 2021, uma comparação entre Brasil e EUA.`
)});
  main.variable(observer("datasetVaccines")).define("datasetVaccines", ["d3"], function(d3){return(
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
  main.variable(observer("datasetVaccinesBrazilUSA")).define("datasetVaccinesBrazilUSA", ["datasetVaccines"], function(datasetVaccines){return(
datasetVaccines.filter(d => d.country === 'Brazil' || d.country === 'United States')
)});
  main.variable(observer("datasetVaccinesBrazil")).define("datasetVaccinesBrazil", ["datasetVaccines"], function(datasetVaccines)
{
  let day_counter = 0
  let datasetVaccinesBrazil = datasetVaccines.filter(d => d.country === 'Brazil').map(d => {
    day_counter = day_counter + 1
    return { ...d, day_counter: day_counter}
  })
  return datasetVaccinesBrazil
}
);
  main.variable(observer("datasetVaccinesUSA")).define("datasetVaccinesUSA", ["datasetVaccines"], function(datasetVaccines)
{
  let day_counter = 0
  let datasetVaccinesUSA = datasetVaccines.filter(d => d.country === 'United States').map(d => {
    day_counter = day_counter + 1
    return { ...d, day_counter: day_counter}
  })
  return datasetVaccinesUSA
}
);
  main.variable(observer("factsVaccinesBrazil")).define("factsVaccinesBrazil", ["crossfilter","datasetVaccinesBrazil"], function(crossfilter,datasetVaccinesBrazil){return(
crossfilter(datasetVaccinesBrazil)
)});
  main.variable(observer("factsVaccinesUSA")).define("factsVaccinesUSA", ["crossfilter","datasetVaccinesUSA"], function(crossfilter,datasetVaccinesUSA){return(
crossfilter(datasetVaccinesUSA)
)});
  main.variable(observer("dayDimVaccineBrazil")).define("dayDimVaccineBrazil", ["factsVaccinesBrazil"], function(factsVaccinesBrazil){return(
factsVaccinesBrazil.dimension(d => d.day_counter)
)});
  main.variable(observer("dateDimVaccineBrazil")).define("dateDimVaccineBrazil", ["factsVaccinesBrazil"], function(factsVaccinesBrazil){return(
factsVaccinesBrazil.dimension(d => d.date)
)});
  main.variable(observer("dayGroupBrazil")).define("dayGroupBrazil", ["dayDimVaccineBrazil"], function(dayDimVaccineBrazil){return(
dayDimVaccineBrazil.group().reduceSum(d => d.daily_vaccinations)
)});
  main.variable(observer("dayDimVaccineUSA")).define("dayDimVaccineUSA", ["factsVaccinesUSA"], function(factsVaccinesUSA){return(
factsVaccinesUSA.dimension(d => d.day_counter)
)});
  main.variable(observer("dateDimVaccineUSA")).define("dateDimVaccineUSA", ["factsVaccinesUSA"], function(factsVaccinesUSA){return(
factsVaccinesUSA.dimension(d => d.date)
)});
  main.variable(observer("dailyVaccinesBrazil")).define("dailyVaccinesBrazil", ["dateDimVaccineBrazil"], function(dateDimVaccineBrazil){return(
dateDimVaccineBrazil.group().reduceSum(d => d.daily_vaccinations)
)});
  main.variable(observer("dayGroupUSA")).define("dayGroupUSA", ["dayDimVaccineUSA"], function(dayDimVaccineUSA){return(
dayDimVaccineUSA.group().reduceSum(d => d.daily_vaccinations)
)});
  main.variable(observer("dailyVaccinesUSA")).define("dailyVaccinesUSA", ["dateDimVaccineUSA"], function(dateDimVaccineUSA){return(
dateDimVaccineUSA.group().reduceSum(d => d.daily_vaccinations)
)});
  main.variable(observer("xLinearScaleVaccineBrazil")).define("xLinearScaleVaccineBrazil", ["d3","dayDimVaccineBrazil","dateDimVaccineBrazil"], function(d3,dayDimVaccineBrazil,dateDimVaccineBrazil){return(
d3.scaleLinear()
  .domain([dayDimVaccineBrazil.bottom(1)[0].day_counter, dateDimVaccineBrazil.top(1)[0].day_counter])
)});
  main.variable(observer("xScaleVaccineBrazil")).define("xScaleVaccineBrazil", ["d3","dateDimVaccineBrazil"], function(d3,dateDimVaccineBrazil){return(
d3.scaleTime()
  .domain([dateDimVaccineBrazil.bottom(1)[0].date, dateDimVaccineBrazil.top(1)[0].date])
)});
  main.variable(observer("xScaleVaccineUSA")).define("xScaleVaccineUSA", ["d3","dateDimVaccineUSA"], function(d3,dateDimVaccineUSA){return(
d3.scaleTime()
  .domain([dateDimVaccineUSA.bottom(1)[0].date, dateDimVaccineUSA.top(1)[0].date])
)});
  main.variable(observer("buildvis")).define("buildvis", ["md","container","dc","width","dateDimVaccineBrazil","xScaleVaccineBrazil","d3","dailyVaccinesBrazil"], function(md,container,dc,width,dateDimVaccineBrazil,xScaleVaccineBrazil,d3,dailyVaccinesBrazil)
{
  let view = md`${container('chart1','Vacinas da COVID-19 por dia')}`
  let lineChart = dc.lineChart(view.querySelector("#chart1"))
  lineChart.width(width)
           .height(500)
           .dimension(dateDimVaccineBrazil)
           .margins({top: 30, right: 50, bottom: 25, left: 60})
           .x(xScaleVaccineBrazil)
           .xUnits(d3.timeDays)
           .renderHorizontalGridLines(true)
           .legend(dc.legend().x(width-200).y(10).itemHeight(13).gap(5))
           .group(dailyVaccinesBrazil, ' no Brazil')
           .ordinalColors(['green']),

  dc.renderAll()
  return view      
}
);
  main.variable(observer("buildviscomposite")).define("buildviscomposite", ["md","container","dc","width","dateDimVaccineUSA","xScaleVaccineUSA","d3","dailyVaccinesBrazil","dailyVaccinesUSA"], function(md,container,dc,width,dateDimVaccineUSA,xScaleVaccineUSA,d3,dailyVaccinesBrazil,dailyVaccinesUSA)
{
  let view = md`${container('chart2','Vacinas da COVID-19 por dia')}`
  let compositeChart = dc.compositeChart(view.querySelector("#chart2"))
  compositeChart.width(width)
           .height(500)
           .dimension(dateDimVaccineUSA)
           .margins({top: 30, right: 50, bottom: 25, left: 80})
           .x(xScaleVaccineUSA)
           .xUnits(d3.timeDays)
           .renderHorizontalGridLines(true)
           .legend(dc.legend().x(width-200).y(10).itemHeight(13).gap(6))
          .compose([
                  dc.lineChart(compositeChart)
                    .group(dailyVaccinesBrazil, ' no Brasil')
                    .ordinalColors(['green']),
                  dc.lineChart(compositeChart)
                    .group(dailyVaccinesUSA, ' nos EUA')
                    .ordinalColors(['steelblue'])])
  dc.renderAll()
  return view      
}
);
  main.variable(observer("buildviscomposite2")).define("buildviscomposite2", ["md","container","dc","width","dayDimVaccineBrazil","xLinearScaleVaccineBrazil","d3","dayGroupBrazil","dayGroupUSA"], function(md,container,dc,width,dayDimVaccineBrazil,xLinearScaleVaccineBrazil,d3,dayGroupBrazil,dayGroupUSA)
{
  let view = md`${container('chart','Vacinas da COVID-19 do inicio da vacinação')}`
  let compositeChart = dc.compositeChart(view.querySelector("#chart"))
  compositeChart.width(width)
           .height(500)
           .dimension(dayDimVaccineBrazil)
           // .group(dateGroup)
           .margins({top: 30, right: 50, bottom: 25, left: 80})
           .x(xLinearScaleVaccineBrazil) //xLinearScaleVaccineBrazil
           .xUnits(d3.timeDays)
           .renderHorizontalGridLines(true)
           .legend(dc.legend().x(width-200).y(10).itemHeight(13).gap(6))
           .brushOn(false)
          .compose([
                  dc.lineChart(compositeChart)
                    .group(dayGroupBrazil, ' no Brasil')
                    .ordinalColors(['green']),
                  dc.lineChart(compositeChart)
                    .group(dayGroupUSA, ' nos EUA')
                    .ordinalColors(['steelblue'])])
  dc.renderAll()
  return view      
}
);
  main.variable(observer("container")).define("container", function(){return(
function container(id, title) { 
  return `
<div class='container'>
<div class='content'>
<div class='container'>
<div class='row'>
    <div class='span12' id='${id}'>
      <h4>${title}</h4>
    </div>
  </div>
</div>
</div>
</div>`
}
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<link rel="stylesheet" type="text/css" href="https://unpkg.com/dc@4/dist/style/dc.css" />`
)});
  main.variable(observer("dc")).define("dc", ["require"], function(require){return(
require("dc")
)});
  main.variable(observer("crossfilter")).define("crossfilter", ["require"], function(require){return(
require("crossfilter2")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3")
)});
  return main;
}
