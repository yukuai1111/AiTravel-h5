# 使用轻量nginx
FROM nginx:alpine

# 把你打包后的dist复制到nginx网页目录
COPY dist/ /usr/share/nginx/html/

# 复制nginx配置进去（内置到镜像，不再依赖宿主机conf文件）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
 