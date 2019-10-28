#!/bin/bash

SCRIPT_PATH=$(dirname $0)

export LC_ALL=C.UTF-8
export LANG=C.UTF-8
export PYTHONPATH=${SCRIPT_PATH}/..

python3 ${SCRIPT_PATH}/client.py
