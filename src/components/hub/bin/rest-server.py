#!/usr/bin/env python3

from flask import Flask, escape, request, abort
from lib.presentation.restapi import RestApi

rest_api = RestApi()

app = Flask(__name__)

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

@app.route('/server', methods = ['GET'])
def list_servers():
    """ Lists the registered game servers.
    ---
    get:
        summary: List the game servers.
        description: Lists all the currently registered game servers.
        parameters:
            - token: The authentication token of the user trying to retrieve the list of servers.
        responses:
            200:
                description: The list of servers, encoded as JSON in the response content.
            401:
                description: The user is not authorized to request the list.
    """
    (code, message) = rest_api.list_servers(request)
    if (code == 200):
        return message
    else:
        abort(code)

@app.route('/server/register', methods = ['POST'])
def register_server():
    """ Registers a game server.
    ---
    post:
        summary: Register a single game server.
        description: Registers a single game server in the hub.
        parameters:
            - name: The name of the game server.
            - host: The host of the game server.
            - port: The port of the game server.
        responses:
            200:
                description: The server was registered successfully.
    """
    (code, message) = rest_api.register_server(request)
    if (code == 200):
        return message
    else:
        abort(code)

@app.route('/server/unregister', methods = ['POST'])
def unregister_server():
    """ Unregisters a game server.
    ---
    post:
        summary: Unregister a single game server.
        description: Unregisters a single game server from the hub.
        parameters:
            - name: The name of the game server.
        responses:
            200:
                description: The server was unregistered successfully.
    """
    (code, message) = rest_api.unregister_server(request)
    if (code == 200):
        return message
    else:
        abort(code)
