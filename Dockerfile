FROM docker.io/node:22

COPY . .

# RUN apt update
RUN npm i -g pnpm@8.15
RUN pnpm i

CMD ["pnpm", "run", "start"]
