#!/usr/bin/env python3

from os import getenv
from flask import Flask, escape, request, abort
from flask_cors import CORS
from flask_socketio import SocketIO
from lib.presentation.restapi import RestApi
from lib.presentation.socketapi import SocketApi

rest_api = RestApi()
socket_api = SocketApi()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dmssercret'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")


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
    if code == 200:
        return 'Running'
    else:
        abort(code)


@app.route('/server', methods=['GET'])
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
    if code == 200:
        return message
    else:
        abort(code)


@app.route('/server/register', methods=['POST'])
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
            - token: The token of the user registering the server.
        responses:
            200:
                description: The server was registered successfully.
            401:
                description: The token is not valid.
            403:
                description: A server already exist with the same name and the user is not the owner.
    """
    (code, message) = rest_api.register_server(request)
    if code == 200:
        return message
    else:
        abort(code)


@app.route('/server/unregister', methods=['POST'])
def unregister_server():
    """ Unregisters a game server.
    ---
    post:
        summary: Unregister a single game server.
        description: Unregisters a single game server from the hub.
        parameters:
            - name: The name of the game server.
            - token: The token of the user unregistering the server, must be the owner of the server.
        responses:
            200:
                description: The server was unregistered successfully.
            401:
                description: The token is not valid.
            403:
                description: The user is not the owner of the server.
    """
    (code, message) = rest_api.unregister_server(request)
    if code == 200:
        return message
    else:
        abort(code)


@app.route('/server/join', methods=['POST'])
def join_server():
    """ Joins a game server.
    ---
    post:
        summary: Unregister a single game server. Alternative to socket io endpoint.
        description: Unregisters a single game server from the hub.
        parameters:
            - token: The token of the user unregistering the server, must be the owner of the server.
            - client: The user identifier corresponding to a socket client id.
            - server: The name of the game server.
        responses:
            200:
                description: The has successfully joined the server.
            400:
                description: The user identifier or the server is not valid.
            401:
                description: The token is not valid.
            404:
                description: The server does not exist.
    """
    (code, message) = rest_api.join_server(request)
    if code == 200:
        return message
    else:
        abort(code)


@socketio.on('login')
def login(token):
    socket_api.login(request, token)


@socketio.on('join')
def on_join_server(server):
    socket_api.join_server(request, server)


@socketio.on('leave')
def on_leave_server(server):
    socket_api.leave_server(request, server)


@socketio.on('chat')
def on_send_chat(chat_json):
    socket_api.send_chat(request, chat_json)


@socketio.on('disconnect')
def disconnect():
    socket_api.disconnect(request)


if __name__ == '__main__':
    socketio.run(app, host=getenv('FLASK_RUN_HOST', '0.0.0.0'), port=getenv(
        'FLASK_RUN_PORT', '4444'), debug=bool(getenv('FLASK_DEBUG', False)))
