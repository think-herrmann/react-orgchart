"use strict";
exports.__esModule = true;
exports.config = void 0;
var animationDuration = 350;
var shouldResize = true;
// Nodes
var nodeWidth = 140;
var nodeHeight = 190;
var nodeSpacing = 12;
var nodePaddingX = 16;
var nodePaddingY = 16;
var avatarWidth = 48;
var nodeBorderRadius = 4;
// Lines
/* Height of the line for child nodes */
var lineDepthY = 120;
// Colors
var backgroundColor = '#fff';
// Theme.borderlight
var borderColor = '#E7E1EC';
// Theme.gray800
var nameColor = '#302839';
// Theme.gray600
var titleColor = '#645574';
var reportsColor = '#92A0AD';
exports.config = {
    animationDuration: animationDuration,
    nodeWidth: nodeWidth,
    nodeHeight: nodeHeight,
    nodeSpacing: nodeSpacing,
    nodePaddingX: nodePaddingX,
    nodePaddingY: nodePaddingY,
    nodeBorderRadius: nodeBorderRadius,
    avatarWidth: avatarWidth,
    lineDepthY: lineDepthY,
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    nameColor: nameColor,
    titleColor: titleColor,
    reportsColor: reportsColor,
    shouldResize: shouldResize,
    nameFontSize: 14,
    titleFontSize: 13,
    titleYTopDistance: 25,
    countFontSize: 14,
    countYTopDistance: 72,
    maxNameWordLength: 16,
    maxTitleWordLength: 17,
    maxCountWordLength: 17
};
