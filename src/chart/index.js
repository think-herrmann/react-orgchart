import { select } from 'd3-selection';
import { zoom as zoomer, zoomIdentity } from 'd3-zoom';
import { tree, hierarchy } from 'd3-hierarchy';
import { event } from 'd3-selection';

import { collapse } from '../utils/index';
import { render } from './render';

export function init(options) {
  // Merge options with the default config
  const config = {
    ...options,
    treeData: options.data,
  };

  console.log({config})
  
  if (!config.id) {
    throw new Error('missing id for svg root');
  }

  const {
    elem,
    treeData,
    nodeWidth,
    nodeHeight,
    nodeSpacing,
    shouldResize,
    disableCanvasMouseWheelZoom,
    disableCanvasMouseMove,
  } = config;

  // Calculate how many pixel nodes to be spaced based on the
  // type of line that needs to be rendered

  config.lineDepthY = nodeHeight + 40;

  if (!elem) {
    throw new Error('No root elem');
  }

  // Reset in case there's any existing DOM
  elem.innerHTML = '';
  const elemWidth = elem.offsetWidth;
  const elemHeight = elem.offsetHeight;

  // Setup the d3 tree layout
  config.tree = hierarchy(treeData, function (d) {
    return d.children;
  });
  config.treeMap = tree(config.tree).nodeSize([nodeWidth + nodeSpacing, nodeHeight + nodeSpacing]);
  // Collapse tree on load
  config.treeMap(config.tree).descendants().slice(1).forEach(collapse);

  // Calculate width of a node with expanded children
  // const childrenWidth = parseInt((treeData.children.length * nodeWidth) / 2)

  // <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" xml:space="preserve" viewBox="0 0 193 260" enable-background=" new 0 0 193 260" height="260" width="193"
  // Add svg root for d3
  const svgroot = select(elem)
    .append('svg')
    .attr('id', 'svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg')
    .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
    .attr('x', '0px')
    .attr('y', '0px')
    .attr('xml:space', 'preserve')
    .attr('viewBox', `0 0 ${elemWidth} ${elemHeight}`)
    .attr('enable-background', ` new 0 0 ${elemWidth} ${elemHeight}`)
    .attr('width', elemWidth)
    .attr('height', elemHeight);

  // Graph center point
  const centerPoint = elemWidth / 2 - nodeWidth / 2 + 15;

  // Add our base svg group to transform when a user zooms/pans
  const svg = svgroot.append('g');

  // Connect core variables to config so that they can be
  // used in internal rendering functions
  config.svg = svg;
  config.svgroot = svgroot;
  config.elemWidth = elemWidth;
  config.elemHeight = elemHeight;
  config.render = render;

  // Defined zoom behavior
  const zoom = zoomer().scaleExtent([0.1, 1.5]).duration(50).on('zoom', () => {
    svg.attr('transform', () => {
      return event.transform;
    });
  });

  svgroot.call(zoom.transform, zoomIdentity.translate(centerPoint, 48).scale(0.8));

  const zoomedRoot = svgroot.call(zoom);

  // Disable the Mouse Wheel Zooming
  if (disableCanvasMouseWheelZoom) {
    zoomedRoot.on('wheel.zoom', null);
  }

  // Disable the Mouse Wheel Canvas Content Moving
  if (disableCanvasMouseMove) {
    zoomedRoot
      .on('mousedown.zoom', null)
      .on('touchstart.zoom', null)
      .on('touchmove.zoom', null)
      .on('touchend.zoom', null);
  }

  // Add avatar clip path
  const defs = svgroot.append('svg:defs');
  defs
    .append('clipPath')
    .attr('id', 'avatarClip')
    .append('circle')
    .attr('cx', 70)
    .attr('cy', 32)
    .attr('r', 24);

  // Add boxshadow
  const filter = svgroot
    .append('svg:defs')
    .append('svg:filter')
    .attr('id', 'boxShadow')
    .attr('height', '150%')
    .attr('width', '150%');

  filter
    .append('svg:feGaussianBlur')
    .attr('in', 'SourceAlpha')
    .attr('stdDeviation', 1) // blur amount
    .attr('result', 'blurOut');

  filter
    .append('svg:feOffset')
    .attr('in', 'blurOut')
    .attr('dx', 0)
    .attr('dy', 2)
    .attr('result', 'offsetOut');

  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'offsetOut');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  // Add Stack Shadow
  const stackFilter = svgroot
        .append('svg:defs')
        .append('svg:filter')
        .attr('id', 'stackShadow')
        .attr('height', '150%')
        .attr('width', '150%')
  stackFilter.html(`
<feOffset in="SourceAlpha" dy="4" dx="4" result="inner"></feOffset>
<feOffset in="SourceAlpha" dx="6" dy="6" result="outer"></feOffset>
<feOffset in="SourceAlpha" dy="2" dx="2" result="inner2"></feOffset>
<feOffset in="SourceAlpha" dx="3" dy="3" result="outer2"></feOffset>
<feComposite result="stack" in="outer" operator="out" in2="inner"></feComposite>
<feComposite result="stack2" in="outer2" operator="out" in2="inner2"></feComposite>
<feFlood result="COLOR-black" flood-color="#acaaad"></feFlood>
<feComposite in="COLOR-black" operator="in" result="finalstack" in2="stack"></feComposite>
<feComposite in="COLOR-black" operator="in" result="finalstack2" in2="stack2"></feComposite>
<feMerge>
  <feMergeNode in="finalstack"></feMergeNode>
  <feMergeNode in="finalstack2"></feMergeNode>
  <feMergeNode in="SourceGraphic"></feMergeNode>
</feMerge>
`)

  // Add listener for when the browser or parent node resizes
  const resize = () => {
    if (!elem) {
      window.removeEventListener('resize', resize);
      return;
    }

    svgroot.attr('width', elem.offsetWidth).attr('height', elem.offsetHeight);
  };

  if (shouldResize) {
    window.addEventListener('resize', resize);
  }

  // enable buttons for zooming in and out if control ids are provided
  if(config.controlIds){
    select(`#${config.controlIds.zoomIn}`).on("click", function() {
      zoom.scaleBy(zoomedRoot.transition().duration(500), 1.5);
    });
    select(`#${config.controlIds.zoomOut}`).on("click", function() {
      zoom.scaleBy(zoomedRoot.transition().duration(500), 0.7);
    });
  }

  // Start initial render
  render(config);

  // return OnDestroy fn
  return () => {
    svgroot.remove();
    if (shouldResize) {
      window.removeEventListener('resize', resize);
    }
  };
}
