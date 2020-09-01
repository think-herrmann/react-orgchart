"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.OrgChart = void 0;
var react_1 = require("react");
var index_1 = require("./chart/index");
var config_1 = require("./chart/config");
var defaultId = 'react-org-chart';
var OrgChart = /** @class */ (function (_super) {
    __extends(OrgChart, _super);
    function OrgChart() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.anchor = react_1["default"].createRef();
        return _this;
    }
    OrgChart.prototype.componentDidMount = function () {
        var _a = this.props, _b = _a.id, id = _b === void 0 ? defaultId : _b, _c = _a.disableCanvasMouseMove, disableCanvasMouseMove = _c === void 0 ? false : _c, _d = _a.disableCanvasMouseWheelZoom, disableCanvasMouseWheelZoom = _d === void 0 ? false : _d, tree = _a.tree, options = __rest(_a, ["id", "disableCanvasMouseMove", "disableCanvasMouseWheelZoom", "tree"]);
        this.onDestroy = index_1.init(__assign(__assign(__assign({}, config_1.config), { id: "#" + id, elem: this.anchor.current, data: tree, disableCanvasMouseMove: disableCanvasMouseMove,
            disableCanvasMouseWheelZoom: disableCanvasMouseWheelZoom }), options));
    };
    OrgChart.prototype.componentWillUnmount = function () {
        this.onDestroy();
    };
    OrgChart.prototype.render = function () {
        var _a = this.props.id, id = _a === void 0 ? defaultId : _a;
        return react_1["default"].createElement('div', {
            id: id,
            ref: this.anchor,
            style: { width: '100%', height: '100%' }
        });
    };
    return OrgChart;
}(react_1["default"].PureComponent));
exports.OrgChart = OrgChart;
