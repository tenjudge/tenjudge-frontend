# TenJudge 前端

TenJudge 前端是 TenJudge Online Judge 平台的用户端前端项目，基于 Vue 3 和 TypeScript 构建。

## 技术栈

- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Axios
- markdown-it
- DOMPurify

## Docker 镜像

前端镜像使用 `nginx:1.30.0-alpine` 托管本地已构建完成的 `dist` 目录。镜像构建前需要先手动执行前端生产构建。

先生成前端构建产物：

```bash
npm run build
```

再构建 Docker 镜像：

```bash
docker build -t tenjudge-frontend:latest .
```

Dockerfile 会将当前仓库中的 `dist` 目录复制到 Nginx 官方镜像的默认静态资源目录：`/usr/share/nginx/html`。

本仓库不维护生产环境 Nginx 配置。生产环境 Nginx 配置应放在部署仓库中，并在 Docker Compose 启动容器时挂载覆盖。

Compose 服务示例：

```yaml
services:
  frontend:
    image: tenjudge-frontend:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx/frontend.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - backend
```

挂载的 Nginx 配置需要包含：

- Vue Router history 模式回退：`try_files $uri $uri/ /index.html;`
- `/api/` 反向代理到后端服务。
- 转发到 Spring Boot 后端前去掉 `/api` 前缀。

API 代理示例：

```nginx
location /api/ {
    proxy_pass http://backend:8080/;
}
```

生产环境中前端默认使用 `VITE_API_BASE_URL=/api`，因此接口请求应由 Nginx 转发到后端。

