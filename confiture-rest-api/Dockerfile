FROM ghcr.io/disic/designgouv-confiture/base:3.16.2

ARG VERSION=1.0

COPY . /tmp/

USER root

RUN \
  \
  # version to avoid cache \
  echo "version $VERSION" && \
  \
  # install needed packages \
  apk add --update nodejs yarn && \
  \
  # create nginx user \
  adduser -D -u 2003 dinum_backend && \
  \
  # install application \
  cd /home/dinum_backend && \
  mv /tmp/* . && \
  yarn install --frozen-lockfile --non-interactive && \
  yarn build && \
  cat node_modules/.prisma/client/index.js && \
  \
  # set correct permissions \
  cp /root/.profile /home/dinum_backend/.profile && \
  chown -R dinum_backend:dinum_backend /home/dinum_backend &&  \
  chmod -R go= /home/dinum_backend && \
  \
  # cleanup \
  find /var/cache/apk /tmp /var/tmp /run /var/log -mindepth 1 -delete -print

# Entrypoint is tini, add command to execute
CMD [ "node", "dist/main" ]

# rootless
USER "dinum_backend"
WORKDIR "/home/dinum_backend"

# source /home/dinum_backend/.profile even if not login shell
ENV ENV="/home/dinum_backend/.profile"

# expose port
EXPOSE 4000