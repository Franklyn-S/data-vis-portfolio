// https://observablehq.com/@franklyn-s/vacinacao-da-covid-19-no-mundo@294
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Vacinação da Covid-19 no mundo`
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<code>css</code> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.0/css/bootstrap.min.css" integrity="sha384-PDle/QlgIONtM1aqA2Qemk5gPOE7wFq8+Em+G/hmo5Iq0CCmYZLv3fVRDJ4MMwEA" crossorigin="anonymous">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
   integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
   crossorigin=""/>`
)});
  main.variable(observer("buildvis")).define("buildvis", ["md","container"], function(md,container)
{
  let view = md`${container()}`
  
  return view
}
);
  main.variable(observer("map")).define("map", ["buildvis","L"], function(buildvis,L)
{
  buildvis;
  let mapInstance = L.map('mapid').setView([0,0], 2)
    L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
                attribution:  `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>,
 Map tiles by &copy; <a href="https://carto.com/attribution">CARTO</a>`
                
                }).addTo(mapInstance)
  return mapInstance
}
);
  main.variable(observer("geojson")).define("geojson", ["L","info","map","countrys","style"], function(L,info,map,countrys,style)
{
  function highlightFeature(e) {
		let layer = e.target;
        //console.log(e.target)

		layer.setStyle({
					weight: 2,
					color: '#AAA',
					dashArray: '',
					fillOpacity: 0.7
		});

		if (!L.Browser.ie && !L.Browser.opera) {
			layer.bringToFront();
		}

		info.update(layer.feature);
	}
	let geoj;

	function resetHighlight(e) {
		geoj.resetStyle(e.target);
		info.update();
	}

	function zoomToFeature(e) {
		map.fitBounds(e.target.getBounds());
	}

	function onEachFeature(feature, layer) {
		layer.on({
					mouseover: highlightFeature,
					mouseout: resetHighlight,
					click: zoomToFeature
				});
	}
  geoj = L.geoJson(countrys, {
				style: style,
				onEachFeature: onEachFeature
		}).addTo(map)
  return geoj;
}
);
  main.variable(observer("legend")).define("legend", ["L","blues","colorScale","d3","map"], function(L,blues,colorScale,d3,map)
{
  let legendControl = L.control({position: 'bottomright'});

	legendControl.onAdd = function (map) {

		let div = L.DomUtil.create('div', 'info legend'),
			labels = [],
            n = blues.length,
			from, to;

		for (let i = 0; i < n; i++) {
			let c = blues[i]
            let fromto = colorScale.invertExtent(c);
			labels.push(
				'<i style="background:' + blues[i] + '"></i> ' +
				d3.format("d")(fromto[0]) + (d3.format("d")(fromto[1]) ? '&ndash;' + d3.format("d")(fromto[1]) : '+'));
		}

		div.innerHTML = labels.join('<br />')
		return div
	}

   	legendControl.addTo(map)
  return legendControl
}
);
  main.variable(observer("container")).define("container", function(){return(
function container() { 
  return `
<main role="main" class="container">
    <div class="row">
      <h3> Vacinação ao redor do mundo</h3>
    </div>
    <div id="mapid" class='row'>
    </div>
   <p>Dados retirados do site da <a href="https://www.kaggle.com/gpreda/covid-world-vaccination-progress">kaggle</a></p>
  </main>
 `
}
)});
  main.variable(observer("blues")).define("blues", ["d3"], function(d3){return(
d3.schemeBlues[9]
)});
  main.variable(observer("colorScale")).define("colorScale", ["d3","blues"], function(d3,blues){return(
d3.scaleQuantile()
    .domain([0, 0.25, 2, 5, 10, 25, 250, 600, 1500])
    .range(blues)
)});
  main.variable(observer("countryPopulation")).define("countryPopulation", ["d3"], function(d3){return(
d3.csv('https://raw.githubusercontent.com/Franklyn-S/data-vis-portfolio/main/population_by_country_2020.csv').then(data => {
  return data.map(d => ({country: d['Country (or dependency)'], population: d['Population (2020)']}))
})
)});
  main.variable(observer("zoomToFeature")).define("zoomToFeature", ["map"], function(map){return(
function zoomToFeature(e) {
		map.fitBounds(e.target.getBounds())
	}
)});
  main.variable(observer("info")).define("info", ["L","calculateTaxByCountryName","map"], function(L,calculateTaxByCountryName,map)
{
  // control that shows state info on hover
	let infoControl = L.control()

	infoControl.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info');
		this.update();
		return this._div;
	}

	infoControl.update = function (feat) {
			this._div.innerHTML = '<h5>Número de Vacinação</h5>' +  (feat ?
				'<b>' + feat.properties.name + '</b><br />' + 'Taxa de vacinação por 100 habitantes: ' + (calculateTaxByCountryName(feat.properties.name) || 'Sem dados')
				: 'Passe o mouse sobre um país');
	}

	infoControl.addTo(map);
  return infoControl
}
);
  main.variable(observer("vaccinationsByCountry")).define("vaccinationsByCountry", ["d3"], function(d3){return(
d3.csv('https://raw.githubusercontent.com/Franklyn-S/data-vis-portfolio/main/country_vaccinations.csv').then(data => {
  let countryMap = new Map();
  data.forEach(d => {
    if (!countryMap.get(d.country)){
      countryMap.set(d.country, +d.total_vaccinations_per_hundred)
    }
  })
  return countryMap
})
)});
  main.variable(observer("style")).define("style", ["colorScale","calculateTaxByCountryName"], function(colorScale,calculateTaxByCountryName){return(
function style(feature) {
    console.log(feature.properties.name)
		 return {
					weight: 1,
					opacity: 1,
					color: 'white',
					dashArray: '3',
					fillOpacity: 0.6,
          fillColor: colorScale(calculateTaxByCountryName(feature.properties.name))
				};
	}
)});
  main.variable(observer("countrys")).define("countrys", ["d3"], function(d3){return(
d3.json('https://raw.githubusercontent.com/Franklyn-S/data-vis-portfolio/main/worldMap.geo.json')
)});
  main.variable(observer("calculateTaxByCountryName")).define("calculateTaxByCountryName", ["countryPopulation","vaccinationsByCountry"], function(countryPopulation,vaccinationsByCountry){return(
function calculateTaxByCountryName(name) {
  const countryData = countryPopulation.filter(p => p.country === name)[0]
  if (countryData) {
    if (vaccinationsByCountry.get(name)) {
      return (vaccinationsByCountry.get(name) * countryData.population/100000).toFixed(2)
    }    
  }
  return 0
}
)});
  main.variable(observer()).define(["html"], function(html){return(
html`Esta célula contém os estilos da Visualização
<style>
#mapid {
				width: 750px;
				height: 590px;
			}
			.info {
				padding: 6px 8px;
				font: 14px/16px Arial, Helvetica, sans-serif;
				background: white;
				background: rgba(255,255,255,0.8);
				box-shadow: 0 0 15px rgba(0,0,0,0.2);
				border-radius: 5px;
			}
			.info h4 {
				margin: 0 0 5px;
				color: #777;
			}

			.legend {
				text-align: left;
				line-height: 28px;
				color: #555;
			}
			.legend i {
				width: 18px;
				height: 18px;
				float: left;
				margin-right: 8px;
				opacity: 0.7;
			}
</style>`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  main.variable(observer("$")).define("$", ["require"], function(require){return(
require('jquery').then(jquery => {
  window.jquery = jquery;
  return require('popper@1.0.1/index.js').catch(() => jquery);
})
)});
  main.variable(observer("bootstrap")).define("bootstrap", ["require"], function(require){return(
require('bootstrap')
)});
  main.variable(observer("L")).define("L", ["require"], function(require){return(
require('leaflet@1.6.0')
)});
  return main;
}
