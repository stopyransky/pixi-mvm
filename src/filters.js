import * as PIXI from 'pixi.js';
import * as filters from 'pixi-filters';
PIXI.filters = filters;

// set filters applied to whole scene
export const dotFilter = new PIXI.filters.DotFilter();
export const bloomFilter = new PIXI.filters.BloomFilter();

export const advancedBloomFilter = new PIXI.filters.AdvancedBloomFilter({
  treshold: 0.2, // defines how bright a color needs to be to affect bloom. // default 0.5,
  brightness: 2.0, // default 1.0
  bloomScale: 2.2, // default 1.0
  quality: 8, // default 4
  blur: 4 // default 2
});

export const shockwaveFilter = (width, height) => new PIXI.filters.ShockwaveFilter([width/2, height/2], {
  wavelength: 200,
  speed: 800,
  radius: 0,
  amplitude: 30
});

export const glitchFilter = new PIXI.filters.GlitchFilter({
  offset: 20,
  fillMode: 4,
});

export const crtFilter = new PIXI.filters.CRTFilter({
  curvature: 0,
  lineWidth: 1.0, // default 1.0
  lineContrast: 0.3,
  vignetting: 0.0, // 0.3
  noise: 0.2,
  noiseSize: 2
});

export const zoomBlurFilter = new PIXI.filters.ZoomBlurFilter({
  strength: 0.1,
  center: [0.5, 0.5],
  innerRadius: 0,
  radius: -1
});

export const godrayFilter = new PIXI.filters.GodrayFilter({
  angle: 30,
  gain: 0.6,
  lacunarity: 2.5,
  parallel: true,
  time: 0
});
