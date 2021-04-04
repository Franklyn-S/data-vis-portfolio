// https://observablehq.com/@franklyn-s/similar-song-network@114
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Similar Song Network

Songs similar to one another according to [last.fm](http://www.last.fm/api) are linked together. Song nodes are sized based on playcounts, and colored by artist.

Data from [last.fm](http://www.last.fm/api/show/track.getSimilar). Some songs include additional links for effect.<br/>Popular songs are defined as those with playcounts above the median for all songs in network. This example is a simpler version of the [tutorial](http://flowingdata.com/2012/08/02/how-to-make-an-interactive-network-visualization/)</a> by [Jim Vallandingham](http://vallandingham.me/).

The root of the network is <b> Lady Gaga: Poker Face </b>
`
)});
  main.variable(observer("buildvis")).define("buildvis", ["d3","DOM","dataset","forceSimulation","popularity2radius","drag"], function(d3,DOM,dataset,forceSimulation,popularity2radius,drag)
{
  const width = 960
  const height = 800
  
  const svg = d3.select(DOM.svg(width, height))
                .attr("viewBox", [-width / 2, -height / 2, width, height])
  
  // Configure os nodes e os links
  const nodes = dataset.nodes;
  const links = dataset.links;
  
  // Crie a constante simulation usando a função forceSimulation definida em outra célula
  const simulation = forceSimulation(nodes, links).on("tick", ticked);
  //Crie os elementos svg para os links e guarde-os em link
  const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link');
  
  const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('r', d => popularity2radius(d.playcount))
      .call(drag(simulation));
      
  node.append('title')
    .text(d => `${d.artist}: ${d.name}`)
               
   //Crie os elementos svg para os nodes e guarde-os em node
  
  // Defina a função ticked
  function ticked() {
    // Reposicionando as arestas
    link.attr('x1', d => d.source.x);
    link.attr('y1', d => d.source.y);
    link.attr('x2', d => d.target.x);
    link.attr('y2', d => d.target.y);
    
    // Reposicionando os nós
    node.attr('cx', d=> d.x);
    node.attr('cy', d=> d.y);
  }
  // Once we append the vis elments to it, we return the DOM element for Observable to display above.
  return svg.node()
}
);
  main.variable(observer("forceSimulation")).define("forceSimulation", ["d3"], function(d3){return(
function forceSimulation(nodes, links) {
  return d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(50))
      .force("charge", d3.forceManyBody().strength(-50).distanceMax(270))
      .force("center", d3.forceCenter())
}
)});
  main.variable(observer("popularity2radius")).define("popularity2radius", ["d3","dataset"], function(d3,dataset){return(
d3.scaleSqrt() // instead of scaleLinear()
  .domain(d3.extent(dataset.nodes, d => d.playcount))
  .range([2, 20])
)});
  main.variable(observer("drag")).define("drag", ["d3"], function(d3){return(
function drag(simulation){
  function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

  function dragged(d) {
    d.fx = d3.event.x
    d.fy = d3.event.y
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
  }

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended)
}
)});
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
d3.json("https://gist.githubusercontent.com/emanueles/7b7723386677bb13763208216fd89c1f/raw/d09478158ba0fe8aa616deee8bcfe908bba17f15/songs.json")
)});
  main.variable(observer()).define(["md"], function(md){return(
md`## Exercício1

Ao final do tutorial, acrescente à descrição da visualização, na célula md no topo da página, que música e artista constituem a raiz da árvore e publique o seu notebook. 

## Exercício 2

Crie um novo notebook e visualize os dados no arquivo [lesmiserables.json](https://gist.githubusercontent.com/emanueles/1dc73efc65b830f111723e7b877efdd5/raw/2c7a42b5d27789d74c8708e13ed327dc52802ec6/lesmiserables.json), com base no notebook atual (a melhor maneira é criando um fork do notebook atual).

Mude a cor dos nós (pode ser qualquer cor à sua escolha), e mostre-os com tamanho (área) proporcional ao número de arestas conectadas a ele (grau do nó). Mostre o nome do personagem e o número de conexões no tooltip.`
)});
  main.variable(observer()).define(["html"], function(html){return(
html`Esta célula contém os estilos da visualização.
<style>
line.link {
  fill: none;
  stroke: #ddd;
  stroke-opacity: 0.8;
  stroke-width: 1.5px;
}
<style>`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3@5')
)});
  return main;
}
