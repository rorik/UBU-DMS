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

@app.route('/user/create', methods = ['POST'])
def create_user():
    """ User creation endpoint.
    ---
    post:
        summary: Creates a new user.
        description: This endpoint is used to create new users.
        parameters:
            - username: The username of the new user.
            - password: The new user password.
        responses:
            200:
                description: The user was created successfully.
            500:
                description: The user could not be created.
    """
    (code, message) = rest_api.create_user(request)
    if (code == 200):
        return message
    else:
        abort(code)

@app.route('/user/login', methods = ['POST'])
def login_user():
    """ User login endpoint.
    ---
    post:
        summary: Logs a user in.
        description: This endpoint is used to log users in.
        parameters:
            - username: The username of the user attempting to log in.
            - password: The user password.
        responses:
            200:
                description: The user logged in successfully. The response is the authentication token.
            401:
                description: The credentials are incorrect.
    """
    (code, message) = rest_api.login_user(request)
    if (code == 200):
        return message # token
    else:
        abort(code)


@app.route('/user/info', methods = ['GET'])
def user_info():
    """ User info handler.
    ---
    get:
        summary: Get information about a user.
        description: Retrieves information about the current user or the user with a given username.
        parameters:
            - username: (Optional) The username of the user, if given token is not required.
            - token: (Optional) The token of the current user, won't be used if username is provided.
        responses:
            200:
                description: Information about the user in JSON format.
            401:
                description: The token that identifies a session is not valid.
            404:
                description: The username does not match any existing users.
    """
    (code, message) = rest_api.user_info(request)
    if (code == 200):
        return message
    else:
        abort(code)

@app.route('/token/check', methods = ['GET'])
def check_token():
    """ Token checking endpoint.
    ---
    get:
        summary: Check the validity of a token.
        description: This endpoint checks for the validity of a given authentication token.
        parameters:
            - token: The token to check.
        responses:
            200:
                description: The given token is an actual validation token.
            401:
                description: The given token is incorrect.
    """
    (code, message) = rest_api.check_token(request)
    if (code == 200):
        return message
    else:
        abort(code)

@app.route('/score', methods = ['GET'])
def list_scores():
    """ List user scores endpoint.
    ---
    get:
        summary: Gets a listing of user scores.
        description: This endpoint retrieves a listing of all user scores.
        responses:
            200:
                description: The contents are a list of user scores in JSON format.
    """
    (code, message) = rest_api.list_scores(request)
    if (code == 200):
        return message
    else:
        abort(code)

@app.route('/score/add', methods = ['POST'])
def add_score():
    """ Increment user scores endpoint.
    ---
    get:
        summary: Increments the scores of a user
        description: This endpoint updates the scores of a given user.
        parameters:
            - token: The token that identifies a user/session
            - games_won: (Optional) If given, the increment in the number of games won.
            - games_lost: (Optional) If given, the increment in the number of games lost.
            - score: (Optional) If given, the increment in the user score.
        responses:
            200:
                description: The scores were successfully updated.
            401:
                description: No user is identified by the given token.
    """
    (code, message) = rest_api.add_score(request)
    if (code == 200):
        return message
    else:
        abort(code)

