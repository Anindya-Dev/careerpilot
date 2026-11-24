# Minimal production Nginx reverse proxy gateway
FROM nginx:1.25-alpine

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=20s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/gateway-health || exit 1

CMD ["nginx", "-g", "daemon off;"]
