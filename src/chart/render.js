import { wrapText, getCursorForNode } from '../utils/index';
import * as helpers from '../utils/index';
import { renderLines } from './renderLines';
import { onClick } from './onClick';
import { iconLink } from './components/iconLink';

const CHART_NODE_CLASS = 'org-chart-node';
const ENTITY_LINK_CLASS = 'org-chart-entity-link';
const ENTITY_NAME_CLASS = 'org-chart-entity-name';
const ENTITY_TITLE_CLASS = 'org-chart-entity-title';
const COUNTS_CLASS = 'org-chart-counts';

export function render(config) {
  const {
    svg,
    tree,
    animationDuration,
    nodeWidth,
    nodeHeight,
    nodePaddingY,
    nodeBorderRadius,
    backgroundColor,
    nameColor,
    titleColor,
    reportsColor,
    borderColor,
    lineDepthY,
    sourceNode,
    onEntityLinkClick,
    nameFontSize = 14,
    titleFontSize = 13,
    titleYTopDistance = 25,
    countFontSize = 14,
    countYTopDistance = 72,
    maxNameWordLength = 16,
    maxTitleWordLength = 17,
    maxCountWordLength = 17,
    getName,
    getTitle,
    getCount,
    onNameClick,
    onCountClick,
    treeMap,
  } = config;

  // Compute the new tree layout.
  const data = treeMap(tree);
  const nodes = data.descendants();
  const links = data.links();

  // Collapse all of the children on initial load
  // nodes.forEach(collapse);

  config.links = links;
  config.nodes = nodes;

  // Normalize for fixed-depth.
  nodes.forEach(function (d) {
    d.y = d.depth * lineDepthY;
  });

  // Update the nodes
  let node = svg.selectAll('g.' + CHART_NODE_CLASS).data(nodes, n => n.data.id);
  let parentNode = sourceNode || nodes[0];
  let shadows = svg.selectAll(`rect.${CHART_NODE_CLASS}-shadow`).data(nodes, n=> n.data.id);

  // Update the shadows for any parents that have been expanded
  shadows
    .attr('fill-opacity', (d) => d.collapsed ? 1 : 0.05)
    .attr('stroke-opacity', (d) => d.collapsed ? 1 : 0.025)
    .attr('filter', (d) => d.collapsed ? 'url(#stackShadow)' : 'url(#boxShadow)');



  // Enter any new nodes at the parent's previous position.
  const nodeEnter = node
    .enter()
    .append('g')
    .attr('class', CHART_NODE_CLASS)
    .attr('transform', () => {
      return `translate(${parentNode.x0 || parentNode.x}, ${parentNode.y0 || parentNode.y})`;
    })
    .on('click', onClick(config));

  // Entity Card Shadow
  nodeEnter
    .append('rect')
    .attr('class', `${CHART_NODE_CLASS}-shadow`)
    .attr('width', nodeWidth)
    .attr('height', nodeHeight)
    .attr('fill', backgroundColor)
    .attr('stroke', borderColor)
    .attr('rx', nodeBorderRadius)
    .attr('ry', nodeBorderRadius)
    .attr('fill-opacity', (d) => d.collapsed ? 1 : 0.05)
    .attr('stroke-opacity', (d) => d.collapsed ? 1 : 0.025)
    .attr('filter', (d) => d.collapsed ? 'url(#stackShadow)' : 'url(#boxShadow)');

  // Entity Card Container
  nodeEnter
    .append('rect')
    .attr('width', nodeWidth)
    .attr('height', nodeHeight)
    .attr('id', d => d.data.id)
    .attr('fill', backgroundColor)
    .attr('stroke', borderColor)
    .attr('rx', nodeBorderRadius)
    .attr('ry', nodeBorderRadius)
    .style('cursor', getCursorForNode);

  let namePos = {
    x: nodeWidth / 2,
    y: nodePaddingY * 1.8,
  };

  // Entity's Name
  nodeEnter
    .append('text')
    .attr('class', `${ENTITY_NAME_CLASS} unedited`)
    .attr('x', namePos.x)
    .attr('y', namePos.y)
    .attr('dy', '.3em')
    .style('cursor', 'pointer')
    .style('fill', nameColor)
    .style('font-size', nameFontSize)
    .text(d => (typeof getName === 'function' ? getName(d) : helpers.getName(d)))
    .on('click', helpers.customOnClick(onNameClick, onClick, config));

  // Title
  nodeEnter
    .append('text')
    .attr('class', `${ENTITY_TITLE_CLASS} unedited`)
    .attr('x', nodeWidth / 2)
    .attr('y', namePos.y + nodePaddingY + titleYTopDistance)
    .attr('dy', '0.1em')
    .style('font-size', titleFontSize)
    .style('cursor', 'pointer')
    .style('fill', titleColor)
    .text(d => (typeof getTitle === 'function' ? getTitle(d) : helpers.getTitle(d)));

  // Count
  nodeEnter
    .append('text')
    .attr('class', `${COUNTS_CLASS} unedited`)
    .attr('x', nodeWidth / 2)
    .attr('y', namePos.y + nodePaddingY + countYTopDistance)
    .attr('dy', '.9em')
    .style('font-size', countFontSize)
    .style('font-weight', 400)
    .style('cursor', 'pointer')
    .style('fill', reportsColor)
    .text(d => (typeof getCount === 'function' ? getCount(d) : helpers.getCount(d)))
    .on('click', helpers.customOnClick(onCountClick, onClick, config));

  // Entity's Link
  let nodeLink = nodeEnter
    .append('a')
    .attr('class', ENTITY_LINK_CLASS)
    .attr('display', d => (d.data.entity.link ? '' : 'none'))
    .attr('xlink:href', d => d.data.entity.link)
    .on('click', helpers.customOnClick(onEntityLinkClick, onClick, config));

  iconLink({
    svg: nodeLink,
    x: nodeWidth - 20,
    y: 8,
  });

  var nodeUpdate = nodeEnter.merge(node);

  // Transition nodes to their new position.
  nodeUpdate
    .transition()
    .duration(animationDuration)
    .attr('transform', d => {
      return `translate(${d.x},${d.y})`;
    });

  nodeUpdate.select('rect.box').attr('fill', backgroundColor).attr('stroke', borderColor);

  // Transition exiting nodes to the parent's new position.
  node
    .exit()
    .transition()
    .duration(animationDuration)
    .attr('transform', () => `translate(${parentNode.x},${parentNode.y})`)
    .remove();

  // Update the links
  svg.selectAll('path.link').data(links, function (d) {
    return d.id;
  });

  [
    { cls: ENTITY_NAME_CLASS, max: maxNameWordLength },
    { cls: ENTITY_TITLE_CLASS, max: maxTitleWordLength },
    { cls: COUNTS_CLASS, max: maxCountWordLength },
  ].forEach(({ cls, max }) => {
    // Svg.selectAll(`text.unedited.${cls}`).call(wrapText);
    svg.selectAll(`text.unedited.${cls}`).call(
      wrapText,
      nodeWidth - 12, // Adjust with some padding
      // name should wrap at 3 lines max
      cls === ENTITY_NAME_CLASS ? 3 : 2,
      max,
    );
  });

  // Add Tooltips
  svg
    .selectAll(`text.${ENTITY_NAME_CLASS}`)
    .append('svg:title')
    .text(d => (getName ? getName(d) : helpers.getName(d)));
  svg
    .selectAll(`text.${ENTITY_TITLE_CLASS}`)
    .append('svg:title')
    .text(d => (getTitle ? getTitle(d) : helpers.getTitle(d)));
  svg
    .selectAll(`text.${COUNTS_CLASS}`)
    .append('svg:title')
    .text(d => (getCount ? getCount(d) : helpers.getCount(d)));

  // Render lines connecting nodes
  renderLines(config);

  // Stash the old positions for transition.
  nodes.forEach(d => {
    d.x0 = d.x;
    d.y0 = d.y;
  });

  var nodeLeftX = -70;
  var nodeRightX = 70;
  var nodeY = 200;
  nodes.forEach(d => {
    nodeLeftX = d.x < nodeLeftX ? d.x : nodeLeftX;
    nodeRightX = d.x > nodeRightX ? d.x : nodeRightX;
    nodeY = d.y > nodeY ? d.y : nodeY;
  });

  config.nodeRightX = nodeRightX;
  config.nodeY = nodeY;
  config.nodeLeftX = nodeLeftX * -1;
}
