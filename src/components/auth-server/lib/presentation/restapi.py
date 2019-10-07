from flask import Flask, escape, request, abort

from lib.data.db.schema.manager import Manager as SchemaManager
from lib.data.db.schema.recordsets.users import Users
from lib.data.db.schema.recordsets.userscores import UserScores
from lib.data.db.schema.recordsets.usersessions import UserSessions

import json

class RestApi():
    """ REST API facade.
    ---
    This class is a facade with the operations provided through the REST API.
    """
    def __init__(self):
        SchemaManager.create_schema()

    def status(self, request):
        """ Status handler.
        ---
        Always returns a tuple with the 200 status code and an "OK" message.
        """
        return (200, 'OK')

    def create_user(self, request):
        """ User creation handler.
        ---
        Performs the user creation operation, generating a new user in the database.

        Parameters:
            - request: The HTTP request received in the REST endpoint.
        Returns:
            A tuple with the following values:
                - (200, 'OK') on a successful creation.
                - (500, 'Server error') on a failed creation.
        """
        username = request.form['username']
        password = request.form['password']

        db_session = SchemaManager.session()
        users_rs = Users(db_session)
        try:
            new_user = users_rs.create(username, password)
            if (new_user is None):
                raise
        except:
            return (500, 'Server error')

        return (200, 'OK')

    def login_user(self, request):
        """ User login handler.
        ---
        Performs the user login operation, generating a new token to be used in future operations.

        Parameters:
            - request: The HTTP request received in the REST endpoint.
        Returns:
            A tuple with the following values:
                - (200, authentication token) on a successful login.
                - (401, 'Unauthorized') on a failed login.
        """
        username = request.form['username']
        password = request.form['password']

        db_session = SchemaManager.session()
        users_rs = Users(db_session)
        if (not users_rs.user_is_valid(username, password)):
            return (401, 'Unauthorized')

        user_sessions_rs = UserSessions(db_session)
        user_session = user_sessions_rs.create(username)

        return (200, user_session.token)

    def check_token(self, request):
        """ Token checking handler.
        ---
        Checks the validity of an authentication token.

        Parameters:
            - request: The HTTP request received in the REST endpoint.
        Returns:
            A tuple with the following values:
                - (200, 'OK') when the provided token is valid.
                - (401, 'Unauthorized') for an incorrect token.
        """
        token = request.form['token']

        db_session = SchemaManager.session()
        user_sessions_rs = UserSessions(db_session)
        if (not user_sessions_rs.token_is_valid(token)):
            return (401, 'Unauthorized')

        return (200, 'OK')

    def list_scores(self, request):
        """ Scores listing handler.
        ---
        Retrieves a list of scores.

        Parameters:
            - request: The HTTP request received in the REST endpoint.
        Returns:
            A tuple with the following values:
                - (200, list of score records) when the list was successfully retrieved.
        """
        db_session = SchemaManager.session()
        user_scores_rs = UserScores(db_session)
        user_score_records = user_scores_rs.get_all_user_scores()
        out = []
        for user_score_record in user_score_records:
            out.append({
                'username': user_score_record.username,
                'games_won': user_score_record.games_won,
                'games_lost': user_score_record.games_lost,
                'score': user_score_record.score
            })

        return (200, json.dumps(out))

    def add_score(self, request):
        """ Scores increasing handler.
        ---
        Increments (or decrements) the score of a user

        Parameters:
            - request: The HTTP request received in the REST endpoint.
        Returns:
            A tuple with the following values:
                - (200, 'OK') when the score was successfully updated.
                - (401, 'Unauthorized') when the user cannot update the scores.
        """
        token = request.form['token']
        games_won_delta = int(request.form['games_won']) if 'games_won' in request.form else None
        games_lost_delta = int(request.form['games_lost']) if 'games_lost' in request.form else None
        score_delta = int(request.form['score']) if 'score' in request.form else None

        db_session = SchemaManager.session()
        user_sessions_rs = UserSessions(db_session)
        if (not user_sessions_rs.token_is_valid(token)):
            return (401, 'Unauthorized')
        user_session = user_sessions_rs.get_session(token)
        
        user_scores_rs = UserScores(db_session)
        user_scores_rs.add_user_score(user_session.username, games_won_delta, games_lost_delta, score_delta)

        return (200, 'OK')
