#!/bin/bash

SCRIPT_PATH=$(dirname $0)

export LC_ALL=C.UTF-8
export LANG=C.UTF-8
export FLASK_APP=${SCRIPT_PATH}/rest-server.py
export PYTHONPATH=${SCRIPT_PATH}/..
if [ -z ${GAME_SERVER_PORT} ]
then
    export GAME_SERVER_PORT=2222
fi

python3 -m flask run --host=0.0.0.0 --port=${GAME_SERVER_PORT}
