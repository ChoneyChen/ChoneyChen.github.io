# 陈天一 · Choney Chen

个人主页的源代码。以可探索的物件呈现研究、软件与软硬件项目，让像素、玻璃、形变和文字在同一次交互中相互转换。

访问：[Vercel](https://choney-between-states.vercel.app) · [GitHub Pages](https://choneychen.github.io/)

网站使用 Vite、React、Three.js 与 Motion 免费核心构建。Three.js 负责原创场景及材质，Motion 负责界面转换；图标和字体的完整许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。同一份许可随静态网站分发到 `/project-assets/third-party-notices.txt`。

## 本地开发

推荐 Node.js 24 与 npm。

```sh
npm install
npm run dev
```

生成并检查静态网站：

```sh
npm run build
npm run preview
```

构建结果位于 `dist/`。生产和 CI 使用已提交的 `package-lock.json`，可通过 `npm ci` 重现依赖。

## 内容与项目素材

经历和项目介绍来自本人提供的资料及可核查的公开项目。进行中的研究、工程原型和已完成工作分别按实际状态描述。

网站中的交互物件、粒子、数据结构和实验场景属于视觉示意，不是设备实拍、实验结果图或产品运行截图。面罩原型 PNG 直接从团队项目公开的 [真实 shell STL](https://github.com/ChoneyChen/XJTLU_MEC202_25-26_IND3G2_Vision-Model-Based-Intelligent-Phototherapy-Mask-System/blob/main/3d_model/Mask/phototherapy_mask_shell_v4_0_thin.stl) 生成；正面、斜面和内侧是同一机械设计原型的不同视角，来源记录位于 [public/project-assets/render-provenance.json](public/project-assets/render-provenance.json)。

更新项目介绍时保留本人角色、团队背景、工作状态和可公开来源。公开资源目录只放已选用的展示素材。

## Vercel 部署

当前项目已通过 Vercel CLI 发布。更新时执行 `vercel deploy --prod`；生产主域名公开，预览部署保留身份验证。Vercel 账户的 GitHub 登录连接尚未完成，因此当前 main 推送不会自动触发 Vercel 部署。

在 Vercel 导入 [ChoneyChen/ChoneyChen.github.io](https://github.com/ChoneyChen/ChoneyChen.github.io)，使用以下设置：

| 设置 | 值 |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | 仓库根目录 |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js | 24.x |

Vercel 可自动识别 Vite。连接仓库后，预览与生产部署按 Vercel 项目所选分支配置运行。参考 [Vercel 的 Vite 文档](https://vercel.com/docs/frameworks/frontend/vite)。

## GitHub Pages 部署

当前将 `dist/` 构建产物发布到 `gh-pages` 分支，由 GitHub Pages 托管；`main` 保存网站源码。

仓库 **Settings → Pages → Build and deployment** 使用 **Deploy from a branch → gh-pages → / (root)**。本仓库是用户主页仓库，地址为 `https://choneychen.github.io/`，使用根路径；如果以后改为其他仓库名下的项目页面，需要同步调整 Vite `base`。

已准备可选的 [GitHub Actions 工作流模板](deployment/github-actions/deploy-pages.yml)。GitHub 授权允许管理工作流后，将模板放入 `.github/workflows/deploy-pages.yml` 并将 Pages Source 改为 GitHub Actions，即可在 main 更新时自动构建。当前授权缺少 workflow 权限，模板尚未启用。参考 [Vite 静态部署指南](https://vite.dev/guide/static-deploy.html)。
