# @ctrl/react-orgchart [![npm](https://badgen.net/npm/v/@ctrl/react-orgchart)](https://www.npmjs.com/package/@ctrl/react-orgchart) [![CircleCI](https://badgen.net/github/status/scttcper/react-orgchart)](https://circleci.com/gh/scttcper/react-orgchart)

Small react wrapper around a [d3](https://d3js.org/) based org chart.

The latest fork by Herrmann Intl. is to add support for arbitrary svg so we could use font awesome

### Use

```tsx
import { OrgChart } from '@ctrl/react-orgchart';

<OrgChart tree={tree} />;
```

#### Sample tree data

```js
import { icon } from '@fortawesome/fontawesome-svg-core'
import { faBuilding, faUser } from '@fortawesome/free-solid-svg-icons'

{
  id: 1,
  entity: {
    id: 1,
    // base 64 image
    avatar: 'data:image/jpeg;base64,/9j....',
    name: 'Jane Doe',
    title: 'IT',
  },
  children: [
    {
      id: 2,
      entity: {
        id: 2,
        // svg example
        avatar: icon(faUser).html,
        name: 'John Foo',
        title: 'CTO',
      },
      children: [],
    },
  ],
}
```

### Building

`yarn install`

After making changes in this repo, run `yarn run build`.  Be sure to add the built files with the commit.
