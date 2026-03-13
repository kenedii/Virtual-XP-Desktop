FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN npm install -g html-minifier-terser clean-css-cli terser

RUN find /app/dist -name "*.js" ! -name "*.min.js" | while read f; do \
      terser "$f" \
        --compress drop_console,drop_debugger,passes=2 \
        --mangle \
        --comments false \
        --output "$f"; \
    done

RUN find /app/dist -name "*.css" | while read f; do \
      cleancss --inline none -O2 -o "$f" "$f"; \
    done

RUN find /app/dist -name "*.html" | while read f; do \
      html-minifier-terser \
        --collapse-whitespace \
        --remove-comments \
        --remove-redundant-attributes \
        --remove-script-type-attributes \
        --remove-style-link-type-attributes \
        --minify-css true \
        --minify-js '{"compress":{"drop_console":true},"mangle":true}' \
        --use-short-doctype \
        --output "$f" "$f"; \
    done

FROM nginx:1.27-alpine AS runner

ENV PORT=8080

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["/bin/sh", "-c", "sed -i \"s/__PORT__/${PORT}/g\" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
