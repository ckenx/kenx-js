import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Kenx",
  description: "Config-first framework for Node.js, Deno, and Bun",
  base: '/',
  
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Kenx - Config-First Framework' }],
    ['meta', { property: 'og:description', content: 'Build applications faster with YAML configuration instead of boilerplate code' }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs Overview', link: '/guide' },
      { text: 'Get Started', link: '/getting-started' },
      { 
        text: 'Reference', 
        items: [
          { text: 'Configuration', link: '/configuration/' },
          { text: 'CLI Reference', link: '/project/cli' },
          { text: 'Architecture', link: '/project/architecture' },
        ]
      },
      { 
        text: 'Resources',
        items: [
          { text: 'Plugins', link: '/plugins/' },
          { text: 'Adapters', link: '/adapters/' },
          { text: 'Services', link: '/services-and-resources/' },
        ]
      },
      { text: 'Examples', link: 'https://github.com/ckenx/kenx-js/tree/main/examples' },
    ],

    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/getting-started' },
            { text: 'Core Concepts', link: '/core-concepts' },
          ]
        },
        {
          text: 'The Project',
          collapsed: false,
          items: [
            { text: 'Architecture', link: '/project/architecture' },
            { text: 'CLI Commands', link: '/project/cli' },
            { text: 'Creating Projects', link: '/project/create' },
          ]
        },
        {
          text: 'Configuration',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/configuration/' },
            { text: 'Reference', link: '/configuration/reference' },
            { text: 'Examples', link: '/configuration/examples' },
          ]
        },
        {
          text: 'Core System',
          collapsed: false,
          items: [
            { text: 'Environment', link: '/environment/' },
            { text: 'Setup Manager', link: '/setup/' },
            { text: 'Core Runtime', link: '/core/' },
          ]
        },
        {
          text: 'Working with Resources',
          collapsed: false,
          items: [
            { text: 'Services & Resources', link: '/services-and-resources/' },
            { text: 'Plugin System', link: '/plugins/' },
            { text: 'Available Plugins', link: '/plugins/available' },
            { text: 'Creating Plugins', link: '/plugins/creating' },
            { text: 'Adapters', link: '/adapters/' },
          ]
        },
        {
          text: 'Development',
          collapsed: false,
          items: [
            { text: 'Testing', link: '/dev-kit/testing/' },
            { text: 'Deployment', link: '/dev-kit/deployment/' },
          ]
        },
        {
          text: 'Best Practices & Guides',
          collapsed: false,
          items: [
            { text: 'Best Practices', link: '/best-practices' },
            { text: 'Troubleshooting', link: '/troubleshooting' },
            { text: 'FAQ', link: '/faq' },
          ]
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ckenx/kenx-js' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Kenx Team'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/ckenx/kenx-js/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})
