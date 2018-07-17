let width = window.innerWidth;
let height = window.innerHeight;
let transform = d3.zoomIdentity;
let numberOfItems = 1000;
let dragging = false;
let linkDistance = 100;
let chargeMax = 800;
// let chargeMin = 350;
// let chargeStrength = 1;

const data = {
  nodes: [],
  links: []
};

// set filters applied to whole scene
const dotFilter = new PIXI.filters.DotFilter();
const bloomFilter = new PIXI.filters.BloomFilter();

const advancedBloomFilter = new PIXI.filters.AdvancedBloomFilter({
  treshold: 0.2, // defines how bright a color needs to be to affect bloom. // default 0.5,
  brightness: 2.0, // default 1.0
  bloomScale: 2.2, // default 1.0
  quality: 8, // default 4
  blur: 4 // default 2
});

const shockwaveFilter = new PIXI.filters.ShockwaveFilter([width/2, height/2], {
  wavelength: 200,
  speed: 800,
  radius: 0,
  amplitude: 30
});

const glitchFilter = new PIXI.filters.GlitchFilter({
  offset: 20,
  fillMode: 4,
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
  gain: 0.6,
  lacunarity: 2.5,
  parallel: true,
  time: 0
});

const app = new PIXI.Application(width, height, { antialias: false });

const viewport = new PIXI.extras.Viewport({
  screenWidth: width,
  screenHeight: height,
  worldWidth: width,
  worldHeight: height
});

app.renderer.backgroundColor = 0x232323;

document.body.appendChild(app.view); // app.view = <canvas> object
app.stage.addChild(viewport);

viewport.wheel().drag().decelerate();
viewport.filterArea = app.renderer.screen;

viewport.filters = [
  // dotFilter,
  advancedBloomFilter,
  // zoomBlurFilter,
  godrayFilter,
  crtFilter,
  shockwaveFilter,
  // glitchFilter,
];

// particle texture generator - used for sprites
function makeParicleTexture(props) {
  const gfx = new PIXI.Graphics();
  const half = props.size  * 0.5;
  gfx.beginFill(props.fill);
  gfx.lineStyle(props.strokeWidth, props.stroke);
  gfx.drawRect(-half, -half, props.size, props.size);
  gfx.endFill();

  const texture = app.renderer.generateTexture(gfx, PIXI.SCALE_MODES.LINEAR, 2);

  return texture;
}

// make particle texture
const texture = makeParicleTexture({
  fill: 0xd30000,
  stroke: 0xffffff,
  strokeWidth: 4,
  size: 40,
  radius: 6
});

// make particle texture on hover
const textureHover = makeParicleTexture({
  fill: 0xffffff,
  stroke: 0xffffff,
  strokeWidth: 4,
  size: 48,
  radius: 6
});

// a graphic representing links network
const linksGraphics = new PIXI.Graphics();

viewport.addChild(linksGraphics);

// mocking data.sprites
function makeSprites(numberOfItems) {
  const sprites = [];
  for (let i = 0; i < numberOfItems; i++) {
    const sprite = new PIXI.Sprite(texture);
    sprite.x = Math.random() * width;
    sprite.y = Math.random() * height;
    sprite.radius = 12;
    sprite.index = i;
    sprite.peers = d3.range(Math.floor(Math.random() * 10))
      .map(() => Math.floor(Math.random() * 100));
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    sprite.rotation = i * 10;
    sprite.interactive = true;
    sprite.buttonMode = true;
    sprite.scale.set((Math.random() * 2 + 1) * 0.25)
    sprite
      .on('pointerover', onMouseOverPixi)
      .on('pointerout', onMouseOutPixi)
      .on('pointerdown', onDragStartPixi)
      .on('pointerup', onDragEndPixi)
      .on('pointerupoutside', onDragEndPixi)
      .on('pointermove', onDragMovePixi)

    sprites.push(sprite);
    viewport.addChild(sprite);
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

data.nodes = makeSprites(numberOfItems);
data.links = makeLinks(data.nodes);

const forceLink = d3
  .forceLink(data.links)
  .id(d => d.index)
  .distance(linkDistance)
  .strength(d => d.value);

const forceCharge = d3
  .forceManyBody()
  // .strength(chargeStrength)
  .distanceMax(chargeMax)
  // .distanceMin(chargeMin);

const forceCenter = d3.forceCenter(width * 0.5, height * 0.5);

const forceCollision = d3.forceCollide().radius(d => d.radius).iterations(2);

function makeSimulation(data, manualMode) {
  const simulation = d3
    .forceSimulation(data.nodes)
    .alpha(1) // default 1
    .alphaDecay(0.0228) // default ~0.0228
    .alphaMin(0.001) // default 0.001
    .alphaTarget(0) // default 0
    .velocityDecay(0.4) // default 0.4
    .force('charge', forceCharge)
    // .force('center', forceCenter)
    .force('link', forceLink)
    .force('collision', forceCollision)
    .on('tick', function() {
      // on timer tick
    })
    .on('end', function() {
      // when alpha < alphaMin
      // this === simulation
    });

  if (manualMode) simulation.stop();
  
  return simulation;
}

simulation = makeSimulation(data, false);

app.ticker.add(function update(delta) {
  linksGraphics.clear();
  linksGraphics.alpha = 0.2; // transparency
  data.links.forEach(link => {
    let { source, target } = link;
    linksGraphics.lineStyle(2, 0xfeefef);
    linksGraphics.moveTo(source.x, source.y);
    linksGraphics.lineTo(target.x, target.y);
  });
  linksGraphics.endFill();
  crtFilter.time += delta * 0.1
  godrayFilter.time += delta * 0.01,
  shockwaveFilter.time += 0.01
  // glitchFilter.refresh()
});

/** INTERACTION HANDLERS **/

function onMouseOverPixi() {
  this.isOver = true;
  this.texture = textureHover;
}

function onMouseOutPixi() {
  if (!this.dragging) {
    this.isOver = false;
    this.texture = texture;
  }
}

function onDragStartPixi(event) {
  viewport.pausePlugin('drag');
  simulation.alphaTarget(0.2).restart();
  this.eventData = event.data;
  this.fx = this.x;
  this.fy = this.y;
  this.isDown = true;
  dragging = true;
}
function onDragMovePixi(event) {
  if(this.isDown) {
    this.dragging = true;
  }
  if (this.dragging) {
    const newPosition = this.eventData.getLocalPosition(this.parent);
    this.x = newPosition.x;
    this.y = newPosition.y;
    this.fx = this.x;
    this.fy = this.y;
  }
}

function onDragEndPixi(event) {
  simulation.alphaTarget(0);
  this.alpha = 1;
  if(this.dragging) {
    this.dragging = false;
    this.isDown = false;
    this.isOver = false;
    this.texture = texture;
  }
  if(this.isDown && !this.dragging) {
    onMouseClickPixi(this, event)
  }
  this.isDown = false;
  this.fx = null;
  this.fy = null;
  dragging = false;
  viewport.resumePlugin('drag');
}

function onMouseClickPixi(subject, event) {
  subject.isOver = true;
  coords = event.data.getLocalPosition(viewport.parent)
  shockwaveFilter.center.x =  coords.x;
  shockwaveFilter.center.y = coords.y;
  shockwaveFilter.time = 0.0;
}
