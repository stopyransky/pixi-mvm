# About

Repo contains a example of interactive data visualization on WebGL Canvas - force directed graph generated in Pixi and D3. 

### [Codepen Demo](https://codepen.io/stopyransky/full/vrMxKQ/)

<p align="center">
  <img src="img/thumbnail.gif" width="320" title="demo thumbnail">
</p>

# Features

## Interactivity

### Pointer interactivity on container level
  - zooming (on scroll)
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

## Dependencies
 - pixi
 - pixi-filters
 - pixi-viewport
 - d3

## Dev Dependencies
 - browser-sync


