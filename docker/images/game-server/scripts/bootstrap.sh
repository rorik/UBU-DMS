#!/bin/bash

cp -rf /tmp/{src,instance}

ls -lR /tmp/instance 

/tmp/instance/bin/rest-server.sh
