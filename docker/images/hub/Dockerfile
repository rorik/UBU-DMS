FROM dms1920-base:latest

VOLUME /tmp
VOLUME /tmp/src

ADD scripts /tmp/scripts
RUN chmod a+x /tmp/scripts/*

ENTRYPOINT [ "/tmp/scripts/bootstrap.sh" ]
