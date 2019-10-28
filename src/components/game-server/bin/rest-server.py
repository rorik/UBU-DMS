#!/usr/bin/env python3

from flask import Flask, escape, request, abort
from flask_cors import CORS
from lib.presentation.restapi import RestApi

rest_api = RestApi()

app = Flask(__name__)
CORS(app)


@app.route('/')
def status():
    """ Status handler. Useful to test whether the server is running or not.
    ---
    get:
        summary: Status handler.
        description: Status testing endpoing.
        responses:
            200:
                description: The server is running correctly.
    """
    (code, message) = rest_api.status(request)
    if (code == 200):
        return 'Running'
    else:
        abort(code)
