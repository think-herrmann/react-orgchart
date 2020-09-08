import React from 'react';
import { arrayToTree } from 'performant-array-to-tree';

import { OrgChart } from '../src';
import { data } from './testdata';
import { icon } from '@fortawesome/fontawesome-svg-core'
import { faBuilding } from '@fortawesome/free-solid-svg-icons'

// @ts-expect-error
import avatarPersonnel from './assets/avatar-personnel.svg';

const tree = arrayToTree(
    data.map(x => ({ ...x, entity: { ...x, avatar: icon(faBuilding).html }, parentId: x.reportsTo?.id })),
  { dataField: null },
);

export default class App extends React.Component {
  render() {
    // For downloading org chart as image or pdf based on id
    return (
        <>
          <div>
            <button id="zoom_in">+</button>
            <button id="zoom_out">-</button>
          </div>
          <OrgChart tree={tree[0]}
                    controlIds={{zoomIn: "zoom_in", zoomOut: "zoom_out"}}
          >
        </>
    );
  }
}
