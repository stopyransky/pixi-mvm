import * as PIXI from 'pixi.js';
import Viewport from 'pixi-viewport';
PIXI.extras.Viewport = Viewport;
import * as d3 from 'd3';

import forceAttract from './forces/forceAttract';
import { dotFilter, 
  shockwaveFilter as shockwaveFilterConfig, 
  crtFilter, 
  advancedBloomFilter, 
  godrayFilter,
  glitchFilter,
  zoomBlurFilter
} from './filters';

let width = window.innerWidth;
let height = window.innerHeight;
let transform = d3.zoomIdentity;
let numberOfItems = 500;
let dragging = false;
let linkDistance = 100;
let chargeMax = 800;
let simulation = null;
let mouse = [width/2, height/2]
const data = {
  nodes: [],
  links: []
};

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

const canvasSelection = d3.select(app.view)

canvasSelection.on('mousemove', () => {
  mouse = [d3.event.clientX, d3.event.clientY]
});

viewport.wheel().drag().decelerate();
viewport.filterArea = app.renderer.screen;

const shockwaveFilter = shockwaveFilterConfig(width, height);

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
const linkFns = [
  i => Math.floor(Math.random() * i), 
  i => Math.floor(Math.random() * Math.sqrt(i)), 
  i => Math.floor(Math.sqrt(i))
]

function makeLinks(nodes) {
  const randomIndex = Math.floor((Math.random() * linkFns.length));
  const links = d3.range(nodes.length - 1)
    .map(i => ({
      source: linkFns[randomIndex](i),
      target: i + 1,
      value: Math.random() + 0.5
    }));
  return links;
}

data.nodes = makeSprites(numberOfItems);
data.links = makeLinks(data.nodes);

let forceLink = d3
  .forceLink(data.links)
  .id(d => d.index)
  .distance(linkDistance)
  // .strength(1);

const forceCharge = d3
  .forceManyBody()
  .distanceMax(chargeMax)
  // .distanceMin(chargeMin);

const forceCenter = d3.forceCenter(width * 0.5, height * 0.5);

const forceCollision = d3.forceCollide()
  .radius(d => d.radius)
  // .iterations(2);

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
      if(mouseAttract) {
        simulation.force('attract').target(mouse)
        // forceAttract.target(mouse)
      }
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
  if(forceLinkActive) {
    data.links.forEach(link => {
      let { source, target } = link;
      linksGraphics.lineStyle(2, 0xfeefef);
      linksGraphics.moveTo(source.x, source.y);
      linksGraphics.lineTo(target.x, target.y);
    });
    linksGraphics.endFill();
  }
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
  this.eventData = event.data;
  this.fx = this.x;
  this.fy = this.y;
  this.isDown = true;
  dragging = true;
  simulation.alphaTarget(0.3).restart();
}
function onDragMovePixi() {
  if(this.isDown) {
    this.dragging = true;
  }
  if (this.dragging) {
    const newPosition = this.eventData.getLocalPosition(this.parent);
    this.fx = newPosition.x;
    this.fy = newPosition.y;
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
  const coords = event.data.getLocalPosition(viewport.parent)
  shockwaveFilter.center.x = coords.x;
  shockwaveFilter.center.y = coords.y;
  shockwaveFilter.time = 0.0;  
}

let forceLinkActive = true;
let mouseAttract = false;

function handleLinkForceControl(e) {
  if(forceLinkActive) {
    simulation.force('link', null);
    simulation.alphaTarget(0.3).restart();
    forceLinkActive = false
  } else {
    data.links = makeLinks(data.nodes);
    forceLink = d3
      .forceLink(data.links)
      .id(d => d.index)
      .distance(linkDistance)
      // .strength(1.5);
    simulation.force('link', forceLink);
    simulation.alphaTarget(0.3).restart();
    forceLinkActive = true;
  }
}

function toggleMouseAttract(e) {
  if(mouseAttract) {
    // disable attract force
    simulation
      .velocityDecay(0.3)
      .force('attract', null)
      .force('charge', forceCharge)
      .force('link', forceLink)
      .force('collision', forceCollision)
    if(forceLinkActive) simulation.force('link', forceLink)
    simulation.alphaTarget(0.3).restart();
    mouseAttract = false;
  } else {
    // enable attract force
    // console.log(mouse, mouseAttract)
    simulation
      .velocityDecay(0.0)
      .force('attract', forceAttract())
      .force('charge', null)
      .force('collision', null)
    if(forceLinkActive) simulation.force('link', null)
    simulation.alpha(0.4)
    simulation.alphaTarget(0.3).restart();
    mouseAttract = true;
  }
}

function toggleSpriteVisibility(e) {

}

function toggleLinksVisibility(e) {

}

const linksToggle = document.createElement('div');
linksToggle.setAttribute('class', 'control links');
linksToggle.onclick = e => handleLinkForceControl(e);
linksToggle.innerText = "Toggle Links";

const mouseToggle = document.createElement('div');
mouseToggle.setAttribute('class', 'control mouse-follow');
mouseToggle.onclick = e => toggleMouseAttract(e);
mouseToggle.innerText = "Follow Mouse";

document.body.appendChild(linksToggle);
// document.body.appendChild(mouseToggle);
