#!/bin/bash

SCRIPT_PATH=$(dirname $0)

export LC_ALL=C.UTF-8
export LANG=C.UTF-8
export FLASK_APP=${SCRIPT_PATH}/rest-server.py
export PYTHONPATH=${SCRIPT_PATH}/..
if [ -z ${HUB_SERVER_PORT} ]
then
    export HUB_SERVER_PORT=1234
fi
export FLASK_RUN_PORT=$HUB_SERVER_PORT

python3 $FLASK_APP 
