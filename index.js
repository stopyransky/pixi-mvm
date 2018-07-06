/**
   GOAL - create minimum viable example of data visualization in PIXI.js and/or THREE.js  with use of D3.js as supporting library
  FEATURES:
  - (data representation) represents underlying data, allows representation of hierarchy as defined in data
    - tooltips on hover
  - (performance, item quantity) performing well for 1000+ items (preferably unlimited/10k interactive items)
  - (item complexity) each item can be simple as dot or rectangle but also complex as ineractive svg, image sprite etc 
  - (interactivity) each item should be interactive on pointer events (including drag and scroll), precisely:
    - clicks
    - mouseovers, mouseouts
    - dragging element
    - dragging empty space event (panning, rotating)
    - zooming on scroll 
  - (motion) motion based on physics, interaction and individual behavior (agents simulation, d3.simulation)
  - (animation, transition) transitioning between 2d and 3d views and back 
  - (high visual appeal) enabling one or multiple shader passes / filters for different effects per whole scene or single item
*/

/* TODOS
 *  - zooming / panning
 *  - tooltips on hover
 *  - transitions to other vis types
 */

let width = window.innerWidth;
let height = window.innerHeight;
let transform = d3.zoomIdentity;
let mouse = [width / 2, height / 2];
let time = 0.0;
const data = {
  sprites: [],
  links: []
};
const numberOfItems = 1000;
let globalDragging = false;

// set filters applied to whole scene
const dotFilter = new PIXI.filters.DotFilter(); // works

const bloomFilter = new PIXI.filters.BloomFilter(); // works - background artifacts

const advancedBloomFilter = new PIXI.filters.AdvancedBloomFilter({
  treshold: 0.2, //Defines how bright a color needs to be to affect bloom. // default 0.5,
  brightness: 2.0, // dfault 1.0
  bloomScale: 1.8, // default 1.0
  quality: 8, // default 4
  blur: 3 // default 2
});

const shockwaveFilter = new PIXI.filters.ShockwaveFilter([0.0, 0.0], {
  wavelength: 100,
  speed: 100,
  // brightness: 12,
  radius: 1
});

const glitchFilter = new PIXI.filters.GlitchFilter({
  offset: 20,
  fillMode: 4
});

const crtFilter = new PIXI.filters.CRTFilter({
  curvature: 0,
  lineWidth: 1.0, // default 1.0
  lineContrast: 0.3,
  vignetting: 0.0, // 0.3
  noise: 0.2,
  noiseSize: 2
});

const zoomBlurFilter = new PIXI.filters.ZoomBlurFilter({
  strength: 0.1,
  center: [0.5, 0.5],
  innerRadius: 0,
  radius: -1
});

const godrayFilter = new PIXI.filters.GodrayFilter({
  angle: 30,
  gain: 0.5,
  lacunarity: 2.5,
  parallel: true,
  time: 0
});


// create pixi application
const app = new PIXI.Application(width, height, { antialias: true });
app.renderer.backgroundColor = 0x232323;

app.stage.filters = [
  // dotFilter,
  // bloomFilter,
  advancedBloomFilter,
  //  new PIXI.filters.GlowFilter({

  //  })
  //  zoomBlurFilter,x,
  // godrayFilter,
   crtFilter,
  //  shockwaveFilter,
  //  glitchFilter,
  // new PIXI.filters.GlowFilter(15, 2, 1, 0xFF0000, 0.5),
  // new PIXI.filters.PixelateFilter(), // works
  // new PIXI.filters.OldFilmFilter(),
];

// capture mouse position from app.renderer at every mouse move
// implementing interactivity via PIXI
window.addEventListener("mousemove", function() {
  mouse = app.renderer.plugins.interaction.mouse.global;
});

// append canvas to document body
document.body.appendChild(app.view); // app.view = <canvas> object

// pixiCanvas.call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom))

console.log(app.view)
let canvasSelection = d3.select(app.view) // d3 canvas selection =/= app.view
  .call(d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", function zoomed() {
    console.log("zooming")
    transform = d3.event.transform;
    simulationUpdateOnZoom();
  }));

function simulationUpdateOnZoom(){
  let context = app.view.getContext('webgl')
  context.save();
  context.clearRect(0, 0, width, height);
  context.translate(transform.x, transform.y);
  context.scale(transform.k, transform.k);
  // tempData.edges.forEach(function(d) {
  //       context.beginPath();
  //       context.moveTo(d.source.x, d.source.y);
  //       context.lineTo(d.target.x, d.target.y);
  //       context.stroke();
  //   });

  //   // Draw the nodes
  //   tempData.nodes.forEach(function(d, i) {

  //       context.beginPath();
  //       context.arc(d.x, d.y, radius, 0, 2 * Math.PI, true);
  //       context.fillStyle = d.col ? "red":"black"
  //       context.fill();
  //   });

  context.restore();
  transform = d3.zoomIdentity;
}
function usePIXIInteractionEvents(sprite) {
  sprite
    .on("pointerdown", onDragStart)
    .on("pointerup", onDragEnd)
    .on("pointerupoutside", onDragEnd)
    .on("pointerover", onMouseOver)
    .on("pointerout", onMouseOut)
    .on("pointermove", onDragMove);
}

// particle texture generator - used for sprites
function makeParicleTexture(props) {
  // like canvas.context
  const gfx = new PIXI.Graphics();

  // set fill and line style
  gfx.beginFill(props.fill);
  gfx.lineStyle(props.strokeWidth, props.stroke);

  // draw shape
  // to draw other shapes use drawRect(), drawRoundedRect, drawCircle
  gfx.moveTo(props.strokeWidth, props.strokeWidth);
  gfx.lineTo(props.size - props.strokeWidth, props.strokeWidth);
  gfx.lineTo(props.size - props.strokeWidth, props.size - props.strokeWidth);
  gfx.lineTo(props.strokeWidth, props.size - props.strokeWidth);
  gfx.lineTo(props.strokeWidth, props.strokeWidth);
  gfx.endFill();

  //make texture
  const texture = app.renderer.generateTexture(gfx, PIXI.SCALE_MODES.LINEAR, 2);

  return texture;
}

// make particle texture
const texture = makeParicleTexture({
  fill: 0xd30000,
  stroke: 0xffffff,
  strokeWidth: 1,
  size: 10
});

// make particle texture on hover
const textureHover = makeParicleTexture({
  fill: 0xffffff,
  stroke: 0xffffff,
  strokeWidth: 1,
  size: 12
});

// a graphic representing links network
const linksGraphics = new PIXI.Graphics();
// filters applied to a graphic
// linksGraphics.filters = [new PIXI.filters.BloomFilter()]
app.stage.addChild(linksGraphics);

// mocking data.sprites
function makeSprites(numberOfItems) {
  const sprites = [];
  for (let i = 0; i < numberOfItems; i++) {
    const sprite = new PIXI.Sprite(texture);
    //  sprite.tint = Math.random() * 0xaa0000
    sprite.x = Math.random() * width;
    sprite.y = Math.random() * height;
    sprite.radius = 12; // for collision
    sprite.index = i;
    sprite.peers = d3
      .range(Math.floor(Math.random() * 10))
      .map(() => Math.floor(Math.random() * 100));
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    sprite.rotation = i * 10;
    sprite.interactive = true;
    sprite.buttonMode = true; // cursor change
    sprite.scale.set(Math.random() * 2 + 1);
    // sprite.data = {x: sprite.x, y: sprite.y}
    // sprite.data.x = sprite.x
    // sprite.data.y = sprite.y
    //  slow
    //  sprite.filters = [new PIXI.filters.VoidFilter()]
    //  sprite.blendMode = PIXI.BLEND_MODES.DIFFERENCE;
    usePIXIInteractionEvents(sprite);
    // useD3InteractionEvents(sprite);
    sprites.push(sprite);
    app.stage.addChild(sprite);
  }
  return sprites;
}

function makeLinks(nodes) {
  const links = d3.range(nodes.length - 1).map(i => ({
    source: Math.floor(Math.sqrt(i)),
    target: i + 1,
    value: Math.random() + 0.5
  }));
  return links;
}

function makeSimulation(data, manualLooping) {
  const simulation = d3
    .forceSimulation(data.sprites)
    .velocityDecay(0.8)
    // .drag(0)
    // .decay(0)
    //  .alphaMin(0.000001)
    //  .alphaDecay(0.1)
    .force(
      "charge",
      d3
        .forceManyBody()
        .strength(-100)
        .distanceMax(250)
        .distanceMin(80)
    )
    //  .force("center", d3.forceCenter().x(mouse[0]).y(mouse[1]))
    .force(
      "center",
      d3
        .forceCenter()
        .x(width * 0.5)
        .y(height * 0.5)
    )
    .force(
      "link",
      d3
        .forceLink(data.links)
        .id(d => d.index)
        .distance(80)
        .strength(d => d.value)
    )
    // .force('x', d3.forceX())
    // .force('y', d3.forceY())
    //  .force('x', d3.forceX().x((d,i) => (i % 5) * (width/5)).y((d,i) => (i % 5) * (height/5)))
    //  .force('x', d3.forceX().x((d,i) => (d.peers.length) * (width/10)))
    //  .force('y', d3.forceY().y((d,i) => (i % 5) * (height/5)).x((d,i) => (i % 5) * (width/5)))
    // .force("r", d3.forceRadial(1000).radius(100).strength(0.01))
    .force(
      "collision",
      d3
        .forceCollide()
        .radius(d => d.radius)
        .iterations(2)
    )

    .on("tick", function() {
      /* on simulation tick actions */
      //  tick += 1
      //  console.log(tick) // SIMULATION stops after 300 iterations
    });
  if (manualLooping) simulation.stop();
  return simulation;
}



data.sprites = makeSprites(numberOfItems);
data.links = makeLinks(data.sprites);

simulation = makeSimulation(data, true);

// // use pixi to loop to update links
app.ticker.add(function updateGraphLinks(delta) {
  simulation.tick();
  updateLinks(data, linksGraphics);
  //  glitchFilter.refresh()
  crtFilter.time += delta * 0.1
  // godrayFilter.time += delta * 0.0001
});

function onMouseOver() {
  // if (this.dragging) {
  //   return;
  // }
  this.isOver = true;
  this.texture = textureHover;
}

function onMouseOut() {
  if (this.dragging) {
    return;
  }
  this.isOver = false;
  this.texture = texture;
}

function onDragStart(event) {
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  simulation.restart();
  simulation.alpha(0.7);
  this.isDown = true;
  this.eventData = event.data;
  this.alpha = 0.5;
  this.dragging = true;
  globalDragging = true;
}

function onDragEnd(event) {
  simulation.alphaTarget(0.3);
  this.alpha = 1;
  this.dragging = false;
  this.isOver = false;
  // set the interaction data to null
  this.data = null;
  this.texture = texture;
  globalDragging = false;
}

function onDragMove(event) {
  if (this.dragging) {
    const newPosition = this.eventData.getLocalPosition(this.parent);
    this.x = newPosition.x;
    this.y = newPosition.y;
  }
  if (this.isOver) {
    this.texture = textureHover;
  }
}

function updateLinks(_data, _links) {
  _links.clear();
  _links.alpha = 0.4;

  _data.links.forEach(link => {
    let { source, target } = link;
    _links.lineStyle(link.value, 0xfeefef);
    _links.moveTo(source.x, source.y);
    _links.lineTo(target.x, target.y);
  });

  _links.endFill();
}
