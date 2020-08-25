import React from 'react';
import { Config } from './chart/config';
export interface TreeItem {
    [key: string]: TreeItem[] | any;
    id?: string | number;
    parentId?: string | number | null;
    children?: TreeItem[] | null;
    entity?: {
        [key: string]: any;
        avatar?: string;
        link?: string;
        name?: string;
        title?: string;
    };
}
declare type Props = Partial<Config> & {
    id?: string;
    disableCanvasMouseMove?: boolean;
    disableCanvasMouseWheelZoom?: boolean;
    tree: TreeItem[] | TreeItem;
};
export declare class OrgChart extends React.PureComponent<Props> {
    anchor: React.RefObject<unknown>;
    onDestroy: () => void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): React.ReactElement<{
        id: string;
        ref: React.RefObject<unknown>;
        style: {
            width: string;
            height: string;
        };
    }, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>;
}
export {};
