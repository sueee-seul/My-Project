frontend/
├── src/
│   ├── lib/
│   │   ├── api/              # 封装 API 请求函数（如 login, register, articles, comments）
│   │   ├── components/       # 通用组件（按钮、输入框、弹窗等）
│   │   ├── stores/           # Svelte store 状态管理（用户信息、通知等）
│   │   ├── utils/            # 工具函数（格式化日期、表单校验）
│   │   └── styles/           # 全局样式文件（CSS/SCSS），如 Tailwind 配置
│   ├── routes/
│   │   ├── +layout.svelte    # 全局布局，导航栏、footer等
│   │   ├── +page.svelte      # 首页（文章列表）
│   │   ├── login/            # 登录页面
│   │   │   └── +page.svelte
│   │   ├── register/         # 注册页面
│   │   │   └── +page.svelte
│   │   ├── dashboard/        # 用户个人中心
│   │   │   └── +page.svelte
│   │   ├── articles/         # 文章相关
│   │   │   ├── +page.svelte  # 文章总览列表
│   │   │   ├── [id]/         # 文章详情页（动态路由）
│   │   │   │   └── +page.svelte
│   │   │   ├── new/          # 新建文章
│   │   │   │   └── +page.svelte
│   │   │   ├── [id]/edit/    # 编辑文章
│   │   │   │   └── +page.svelte
│   │   ├── notifications/    # 通知中心
│   │   │   └── +page.svelte
│   │   ├── tags/             # 标签页
│   │   │   └── +page.svelte
│   │   └── users/            # 用户资料页
│   │       ├── [id]/         # 动态路由，访问他人用户资料
│   │       │   └── +page.svelte
│   ├── app.d.ts              # SvelteKit app类型定义
│   └── hooks.server.ts       # 中间件，JWT token 校验等
├── static/                   # 静态资源（头像、上传图片等）
├── package.json
├── svelte.config.js
└── vite.config.js
