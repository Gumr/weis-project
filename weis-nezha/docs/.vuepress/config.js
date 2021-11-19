module.exports = {
  title: 'weis admin文档',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '项目杂项', link: '/pages/project-docs/index.md' },
      { text: '路由定义', link: '/pages/router-docs/index.md' },
      { text: '组件', link: '/pages/components-docs/index.md' }
    ],
    sidebar: {
      '/pages/project-docs/': [
        {
          title: '项目概况',
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ['index.md', '项目运行']
          ]
        }
      ],
      '/pages/router-docs/': [
        {
          title: '路由定义',
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ['index.md', '路由规范']
          ]
        }
      ],
      '/pages/components-docs/': [
        {
          title: '基础组件',
          collapsable: false,
          sidebarDepth: 1,
          children: [
            ['index.md', 'select组件']
          ]
        }
      ]
    }
  }
}
