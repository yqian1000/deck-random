# DeckRandom

会话级转盘抽奖：在当前标签页添加图片和/或文字，随机抽取且不放回。刷新或关闭页面会清空全部对象。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

产物在 `dist/`。

## 部署到 Cloudflare Pages

1. 把仓库推到 GitHub / GitLab 等。
2. 在 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Create → Pages → 连接该仓库。
3. 构建设置：
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** 20 或更高
4. 保存并部署。

也可以在本机登录 Wrangler 后执行：

```bash
npm run deploy
```
