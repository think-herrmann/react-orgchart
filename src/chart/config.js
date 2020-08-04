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
const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};

// Lines
const lineType = 'angle';
const lineDepthY = 120; /* Height of the line for child nodes */

// Colors
const backgroundColor = '#fff';
// theme.borderlight
const borderColor = '#E7E1EC';
// theme.gray800
const nameColor = '#302839';
// theme.gray600
const titleColor = '#645574';
const reportsColor = '#92A0AD';

const config = {
  margin,
  animationDuration,
  nodeWidth,
  nodeHeight,
  nodeSpacing,
  nodePaddingX,
  nodePaddingY,
  nodeBorderRadius,
  avatarWidth,
  lineType,
  lineDepthY,
  backgroundColor,
  borderColor,
  nameColor,
  titleColor,
  reportsColor,
  shouldResize,
};

module.exports = config;