import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Concepts',
      items: ['fsm', 'hateoas'],
    },
    {
      type: 'category',
      label: 'API',
      items: ['api/overview', 'api/endpoints', 'api/examples'],
    },
    {
      type: 'category',
      label: 'Development',
      items: ['dev/setup', 'dev/testing'],
    },
  ],
};

export default sidebars;
