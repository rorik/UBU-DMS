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


@app.route('/join', methods=['post'])
def join():
    """ Join the game
    ---
    put:
        summary: Join the game and get a clientId.
        description: Join the game.
        parameters:
            - token: A valid user token used in the auth server.
        responses:
            200:
                description: The used joined successfully, return the clientId.
            401:
                description: The token is not valid.
            404:
                description: The game is full, cannot add more users.
    """
    (code, message) = rest_api.join(request)
    if (code == 200):
        return message
    else:
        abort(code)


@app.route('/play/attack', methods=['PUT'])
def attack():
    """ Attack a given oponent's cell
    ---
    put:
        summary: Attack (hit) an oponent's cell.
        description: Mark an oponent's cell as hit.
        parameters:
            - x: The horizontal coordinate of the cell, 0-indexed.
            - y: The vertical coordinate of the cell, 0-indexed.
            - clientId: The client identifier, must be valid.
        responses:
            200:
                description: The cell was attacked correctly, return the state of the cell.
            401:
                description: The clientId is not valid.
            403:
                description: The clientId is valid but it's not the player's turn.
            404:
                description: The given coordinate does not exist.
    """
    (code, message) = rest_api.attack(request)
    if (code == 200):
        return message
    else:
        abort(code)


@app.route('/play/status', methods=['PUT'])
def play_status():
    """ Return current state of the game
    ---
    put:
        summary: Status of the game.
        description: Returns the player's board and the oponent's, the turn, and if the game is over.
        parameters:
            - clientId: The client identifier, optional.
        responses:
            200:
                description: Return the state of the game.
            404:
                description: The game hasn't started yet.
    """
    (code, message) = rest_api.play_status(request)
    if (code == 200):
        return message
    else:
        abort(code)
