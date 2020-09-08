import React from 'react';
import { select, event as event$1 } from 'd3-selection';
import { zoom, zoomIdentity } from 'd3-zoom';
import { hierarchy, tree } from 'd3-hierarchy';
import truncate from 'lodash.truncate';
import { line, curveLinear } from 'd3-shape';

function collapse(d) {
    // Check if this node has children
    if (d.children) {
        d._children = d.children;
        d.children = null;
        d.collapsed = true;
    }
}

let getTruncatedText = (text, maxWordLength) => truncate(text, { length: maxWordLength });
// One way of achieving text-wrapping capability in SVG
// Text is broken down to words, each word is added to a line and then the lines width is checked
// If the line width is less than the max we move to the next word, if more we add new line etc
// until the max number of lines is reached.
function wrapText(text, maxLineWidth, maxNumberOfLines = 3, maxWordLength = 17) {
    if (!text._groups || !text._groups[0] || !text._groups[0].length) {
        return '';
    }
    let editedClass = '';
    text._groups[0].forEach(textNode => {
        const text = select(textNode);
        const x = text.attr('x');
        const y = text.attr('y');
        const dy = parseFloat(text.attr('dy'));
        const lineHeight = 1.1;
        const words = text
            .text()
            .split(/\s+/)
            .reverse();
        let lineNumber = 0;
        let curLineWidth;
        let word;
        let line = [];
        let tspan = text
            .text(null)
            .append('tspan')
            .style('text-anchor', 'middle')
            .attr('x', x)
            .attr('y', y)
            .attr('dy', `${dy}em`);
        while (lineNumber < maxNumberOfLines && words.length) {
            word = words.pop();
            line.push(word);
            tspan.text(line.join(' '));
            curLineWidth = tspan.node().getComputedTextLength();
            if (curLineWidth > maxLineWidth) {
                if (lineNumber + 1 === maxNumberOfLines) {
                    tspan.text(getTruncatedText(line.join(' '), maxWordLength));
                    break;
                }
                else {
                    line.pop();
                    tspan.text(line.join(' '));
                    line = [word];
                    tspan = text
                        .append('tspan')
                        .style('text-anchor', 'middle')
                        .attr('x', x)
                        .attr('y', y)
                        .attr('dy', ++lineNumber * lineHeight + dy + 'em')
                        .text(getTruncatedText(word, maxWordLength));
                }
                if (word.length > maxWordLength) {
                    break;
                }
            }
        }
        if (!editedClass) {
            editedClass = text.attr('class').replace(' unedited', '');
        }
        text.attr('class', editedClass);
    });
}

const getName = data => data.data.entity && data.data.entity.name;
const getTitle = data => data.data.entity && data.data.entity.title;
const getCount = data => {
    let children = (data.children || []).length || (data._children || []).length;
    if (!children) {
        return '';
    }
    return `Team (${children})`;
};
const getCursorForNode = data => data.data.children || data.data._children ? 'pointer' : 'default';
const customOnClick = (fn, onClick, config) => data => {
    if (typeof fn === 'function') {
        // eslint-disable-next-line no-restricted-globals
        if (fn(data, event)) {
            onClick(config);
        }
        else {
            // eslint-disable-next-line no-restricted-globals
            event.stopPropagation();
        }
    }
};

const margin = 10;
function renderLines(config) {
    const { svg, links, nodeWidth, nodeHeight, borderColor, sourceNode, treeData, animationDuration, } = config;
    const parentNode = sourceNode || treeData;
    // Select all the links to render the lines
    const link = svg.selectAll('path.link')
        .data(links, ({ source, target }) => {
        return `${source.data.id}-${target.data.id}`;
    });
    // Define the angled line function
    const angle = line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(curveLinear);
    // Enter any new links at the parent's previous position.
    var linkEnter = link
        .enter()
        .insert('path', 'g')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', borderColor)
        .attr('stroke-opacity', 1)
        .attr('stroke-width', 1.25)
        .attr('d', d => {
        const linePoints = [
            {
                x: d.source.x + parseInt(nodeWidth / 2, 10),
                y: d.source.y + margin,
            },
            {
                x: d.source.x + parseInt(nodeWidth / 2, 10),
                y: d.source.y + margin,
            },
            {
                x: d.source.x + parseInt(nodeWidth / 2, 10),
                y: d.source.y + margin,
            },
            {
                x: d.source.x + parseInt(nodeWidth / 2, 10),
                y: d.source.y + margin,
            },
        ];
        return angle(linePoints);
    });
    var linkUpdate = linkEnter.merge(link);
    // Transition links to their new position.
    linkUpdate
        .transition()
        .duration(animationDuration)
        .attr('d', d => {
        const linePoints = [
            {
                x: d.source.x + parseInt(nodeWidth / 2, 10),
                y: d.source.y + nodeHeight,
            },
            {
                x: d.source.x + parseInt(nodeWidth / 2, 10),
                y: d.target.y - margin,
            },
            {
                x: d.target.x + parseInt(nodeWidth / 2, 10),
                y: d.target.y - margin,
            },
            {
                x: d.target.x + parseInt(nodeWidth / 2, 10),
                y: d.target.y,
            },
        ];
        return angle(linePoints);
    });
    // Animate the existing links to the parent's new position
    link
        .exit()
        .transition()
        .duration(animationDuration)
        .attr('d', () => {
        const lineNode = config.sourceNode ? config.sourceNode : parentNode;
        const linePoints = [
            {
                x: lineNode.x + parseInt(nodeWidth / 2, 10),
                y: lineNode.y + nodeHeight + 2,
            },
            {
                x: lineNode.x + parseInt(nodeWidth / 2, 10),
                y: lineNode.y + nodeHeight + 2,
            },
            {
                x: lineNode.x + parseInt(nodeWidth / 2, 10),
                y: lineNode.y + nodeHeight + 2,
            },
            {
                x: lineNode.x + parseInt(nodeWidth / 2, 10),
                y: lineNode.y + nodeHeight + 2,
            },
        ];
        return angle(linePoints);
    });
}

function onClick(config) {
    const { render } = config;
    return datum => {
        // eslint-disable-next-line no-restricted-globals
        if (event.defaultPrevented) {
            return;
        }
        // eslint-disable-next-line no-restricted-globals
        const link = event && event.target && event.target.closest('a');
        if (link && link.href) {
            return;
        }
        if (!datum.children && !datum._children) {
            return;
        }
        if (datum.children) {
            // Collapse the children
            config.callerNode = datum;
            datum._children = datum.children;
            datum.children = null;
            datum.collapsed = true;
        }
        else {
            // Expand the children
            config.callerNode = null;
            datum.children = datum._children;
            datum._children = null;
            datum.collapsed = false;
        }
        // Pass in the clicked datum as the sourceNode which
        // tells the child nodes where to animate in from
        render({
            ...config,
            sourceNode: datum,
        });
    };
}

const iconLink = ({ svg, x = 5, y = 5 }) => {
    const container = svg
        .append('g')
        .attr('stroke', 'none')
        .attr('fill', 'none')
        .style('cursor', 'pointer')
        .append('g');
    const icon = container
        .append('g')
        .attr('id', 'icon')
        .attr('fill', '#9585A3')
        .attr('transform', `translate(${x}, ${y})`);
    const arrow = icon
        .append('g')
        .attr('id', 'arrow')
        .attr('transform', 'translate(7.000000, 7.000000) scale(-1, 1) translate(-7.000000, -7.000000)');
    arrow
        .append('path')
        .attr('d', 'M3.41421356,2 L8.70710678,7.29289322 C9.09763107,7.68341751 9.09763107,8.31658249 8.70710678,8.70710678 C8.31658249,9.09763107 7.68341751,9.09763107 7.29289322,8.70710678 L2,3.41421356 L2,7 C2,7.55228475 1.55228475,8 1,8 C0.44771525,8 0,7.55228475 0,7 L0,1.49100518 C0,0.675320548 0.667758414,0 1.49100518,0 L7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 L3.41421356,2 Z');
    arrow
        .append('path')
        // .attr('opacity', 0.7)
        .attr('d', 'M12,2 L12,12 L2,12 L2,11 C2,10.4477153 1.55228475,10 1,10 C0.44771525,10 0,10.4477153 0,11 L0,12.4953156 C0,13.3242086 0.674596865,14 1.50034732,14 L12.4996527,14 C13.3281027,14 14,13.3234765 14,12.4996527 L14,1.50034732 C14,0.669321781 13.3358906,0 12.4953156,0 L11,0 C10.4477153,0 10,0.44771525 10,1 C10,1.55228475 10.4477153,2 11,2 L12,2 Z');
    icon
        .append('rect')
        .attr('id', 'bounds')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 24)
        .attr('height', 24)
        .attr('fill', 'transparent');
};

const CHART_NODE_CLASS = 'org-chart-node';
const ENTITY_LINK_CLASS = 'org-chart-entity-link';
const ENTITY_NAME_CLASS = 'org-chart-entity-name';
const ENTITY_TITLE_CLASS = 'org-chart-entity-title';
const COUNTS_CLASS = 'org-chart-counts';
function render(config) {
    const { svg, tree, animationDuration, nodeWidth, nodeHeight, nodePaddingY, nodeBorderRadius, backgroundColor, nameColor, titleColor, reportsColor, borderColor, avatarWidth, lineDepthY, sourceNode, onEntityLinkClick, nameFontSize = 14, titleFontSize = 13, titleYTopDistance = 25, countFontSize = 14, countYTopDistance = 72, maxNameWordLength = 16, maxTitleWordLength = 17, maxCountWordLength = 17, getName: getName$1, getTitle: getTitle$1, getCount: getCount$1, onNameClick, onCountClick, treeMap, } = config;
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
    let shadows = svg.selectAll(`rect.${CHART_NODE_CLASS}-shadow`).data(nodes, n => n.data.id);
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
        y: nodePaddingY * 1.8 + avatarWidth,
    };
    let avatarPos = {
        x: nodeWidth / 2 - avatarWidth / 2,
        y: nodePaddingY / 2,
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
        .text(d => (typeof getName$1 === 'function' ? getName$1(d) : getName(d)))
        .on('click', customOnClick(onNameClick, onClick, config));
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
        .text(d => (typeof getTitle$1 === 'function' ? getTitle$1(d) : getTitle(d)));
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
        .text(d => (typeof getCount$1 === 'function' ? getCount$1(d) : getCount(d)))
        .on('click', customOnClick(onCountClick, onClick, config));
    // Entity's Avatar
    nodeEnter
        .append('svg')
        .attr('id', d => `image-${d.data.id}`)
        .attr('width', avatarWidth)
        .attr('height', avatarWidth)
        .attr('x', avatarPos.x)
        .attr('y', avatarPos.y)
        .html(d => d.data.entity.avatar);
    // Entity's Link
    let nodeLink = nodeEnter
        .append('a')
        .attr('class', ENTITY_LINK_CLASS)
        .attr('display', d => (d.data.entity.link ? '' : 'none'))
        .attr('xlink:href', d => d.data.entity.link)
        .on('click', customOnClick(onEntityLinkClick, onClick, config));
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
        svg.selectAll(`text.unedited.${cls}`).call(wrapText, nodeWidth - 12, // Adjust with some padding
        // name should wrap at 3 lines max
        cls === ENTITY_NAME_CLASS ? 3 : 2, max);
    });
    // Add Tooltips
    svg
        .selectAll(`text.${ENTITY_NAME_CLASS}`)
        .append('svg:title')
        .text(d => (getName$1 ? getName$1(d) : getName(d)));
    svg
        .selectAll(`text.${ENTITY_TITLE_CLASS}`)
        .append('svg:title')
        .text(d => (getTitle$1 ? getTitle$1(d) : getTitle(d)));
    svg
        .selectAll(`text.${COUNTS_CLASS}`)
        .append('svg:title')
        .text(d => (getCount$1 ? getCount$1(d) : getCount(d)));
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

function init(options) {
    // Merge options with the default config
    const config = {
        ...options,
        treeData: options.data,
    };
    console.log({ config });
    if (!config.id) {
        throw new Error('missing id for svg root');
    }
    const { elem, treeData, nodeWidth, nodeHeight, nodeSpacing, shouldResize, disableCanvasMouseWheelZoom, disableCanvasMouseMove, } = config;
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
    const zoom$1 = zoom().scaleExtent([0.1, 1.5]).duration(50).on('zoom', () => {
        svg.attr('transform', () => {
            return event$1.transform;
        });
    });
    svgroot.call(zoom$1.transform, zoomIdentity.translate(centerPoint, 48).scale(0.8));
    const zoomedRoot = svgroot.call(zoom$1);
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
        .attr('width', '150%');
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
`);
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
    if (config.controlIds) {
        select(`#${config.controlIds.zoomIn}`).on("click", function () {
            zoom$1.scaleBy(zoomedRoot.transition().duration(500), 1.5);
        });
        select(`#${config.controlIds.zoomOut}`).on("click", function () {
            zoom$1.scaleBy(zoomedRoot.transition().duration(500), 0.7);
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

const animationDuration = 350;
const shouldResize = true;
// Nodes
const nodeWidth = 140;
const nodeHeight = 190;
const nodeSpacing = 12;
const nodePaddingX = 16;
const nodePaddingY = 16;
const avatarWidth = 48;
const nodeBorderRadius = 4;
// Lines
/* Height of the line for child nodes */
const lineDepthY = 120;
// Colors
const backgroundColor = '#fff';
// Theme.borderlight
const borderColor = '#E7E1EC';
// Theme.gray800
const nameColor = '#302839';
// Theme.gray600
const titleColor = '#645574';
const reportsColor = '#92A0AD';
const config = {
    animationDuration,
    nodeWidth,
    nodeHeight,
    nodeSpacing,
    nodePaddingX,
    nodePaddingY,
    nodeBorderRadius,
    avatarWidth,
    lineDepthY,
    backgroundColor,
    borderColor,
    nameColor,
    titleColor,
    reportsColor,
    shouldResize,
    nameFontSize: 14,
    titleFontSize: 13,
    titleYTopDistance: 25,
    countFontSize: 14,
    countYTopDistance: 72,
    maxNameWordLength: 16,
    maxTitleWordLength: 17,
    maxCountWordLength: 17,
};

const defaultId = 'react-org-chart';
class OrgChart extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.anchor = React.createRef();
    }
    componentDidMount() {
        const { id = defaultId, disableCanvasMouseMove = false, disableCanvasMouseWheelZoom = false, tree, ...options } = this.props;
        this.onDestroy = init({
            ...config,
            id: `#${id}`,
            elem: this.anchor.current,
            data: tree,
            disableCanvasMouseMove,
            disableCanvasMouseWheelZoom,
            ...options,
        });
    }
    componentWillUnmount() {
        this.onDestroy();
    }
    render() {
        const { id = defaultId } = this.props;
        return React.createElement('div', {
            id,
            ref: this.anchor,
            style: { width: '100%', height: '100%' },
        });
    }
}

export { OrgChart };
//# sourceMappingURL=index.js.map
