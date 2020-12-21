FROM node:lts-buster

RUN set -x && \
    apt update && \
    DEBIAN_FRONTEND=noninteractive apt install -y texlive texlive-extra-utils pdf2svg

WORKDIR /app
COPY . ./

RUN yarn install

CMD ["yarn", "run", "start"]