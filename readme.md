pixi-mvm
========

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Language Grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/stopyransky/pixi-mvm.svg?label=code%20quality)](https://lgtm.com/projects/g/stopyransky/pixi-mvm/)

# About

Repo contains a demo of interactive data visualization on WebGL Canvas - force directed graph generated in Pixi and D3.

### [Github pages demo](https://stopyransky.github.io/pixi-mvm/) (better quality)
### [Codepen Demo](https://codepen.io/stopyransky/full/vrMxKQ/)

# Goals

## Interactivity

### Pointer interactivity on container level
  - zooming (on scroll) (/)
  - panning (on canvas drag)

### Pointer interactivity on particle level
  - mouse hover
  - clicking
  - dragging

## Visual appeal and data representation

- represents underlying data with hierarchy of nodes
- each data item can be represented by simple primitive (rect, ellipse, etc.) or with more complex graphics with PIXI.Sprite (texture, image)
- enables one or multiple shader passes - pixi filters as well as custom shaders

## Performance

- able to smoothly render 1000+ items without drop in FPS

## Animation and transitions

- motion based on physics, user interaction and individual particle behavior (agents simulation, d3.simulation)

# Usage

```
git clone https://github.com/stopyransky/pixi-mvm.git
cd pixi-mvm
npm install
npm start
```
