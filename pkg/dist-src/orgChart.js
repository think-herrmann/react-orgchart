import React from 'react';
import { init } from './chart/index';
import { config as defaultConfig } from './chart/config';
const defaultId = 'react-org-chart';
export class OrgChart extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.anchor = React.createRef();
    }
    componentDidMount() {
        const { id = defaultId, disableCanvasMouseMove = false, disableCanvasMouseWheelZoom = false, tree, ...options } = this.props;
        this.onDestroy = init({
            ...defaultConfig,
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
        const { id = defaultId, className } = this.props;
        return React.createElement('div', {
            id,
            ref: this.anchor,
            className: className,
            style: { width: '100%', height: '100%' },
        });
    }
}
