from flask import Request
from lib.data.model.gamemaster import GameMaster
from lib.data.auth.restclient import RestClient


class RestApi():
    """ REST API facade.
    ---
    This class is a facade with the operations provided through the REST API.
    """

    def __init__(self):
        pass

    def status(self, request: Request):
        """ Status handler.
        ---
        Always returns a tuple with the 200 status code and an "OK" message.
        """
        return (200, 'OK')

    def join(self, request: Request):
        """ Game join handler.
        ---
        Join the game and get a clientId.
        """
        token = request.values.get('token')
        if token is None:
            if request.json is None or 'token' not in request.json:
                return (401, 'Unauthorized')

            token = request.json['token']
            if token is None:
                return (401, 'Unauthorized')

        user_info = RestClient.instance().user_info(token)

        if (user_info is None):
            return (401, 'Unauthorized')

        clientId = GameMaster.instance().join(user_info.get('username'))
        if clientId is None:
            return (404, 'The game is full, cannot add more users')
        return (200, clientId)

    def attack(self, request: Request):
        """ Attack handler.
        ---
        Attack (hit) an oponent's cell.
        """
        clientId = request.values.get('clientId')
        if clientId is None:
            if request.json is not None and 'clientId' in request.json:
                clientId = request.json['clientId']

        if not GameMaster.instance().is_player(clientId):
            return (401, 'Unauthorized')

        if not GameMaster.instance().started:
            return (403, 'The game hasn\'t started yet')

        if not GameMaster.instance().has_turn(clientId):
            return (403, 'It\'s not the player\'s turn')

        x = request.values.get('x')
        if x is None:
            if request.json is not None and 'x' in request.json:
                x = request.json['x']

        y = request.values.get('y')
        if y is None:
            if request.json is not None and 'y' in request.json:
                y = request.json['y']

        try:
            x = int(x)
            y = int(y)
        except ValueError as ex:
            return (404, 'The x and y parameters must be defined and be a valid positive integer')

        if (x is None or y is None or not GameMaster.instance().is_valid_cell(x, y)):
            return (404, 'The given coordinate does not exist')

        cell = GameMaster.instance().attack(x, y)

        return (200, cell)

    def play_status(self, request: Request, brief: bool):
        """ Status handler.
        ---
        Return current state of the game.
        """
        clientId = request.values.get('clientId')
        if clientId is None:
            if request.json is not None and 'clientId' in request.json:
                clientId = request.json['clientId']

        status = GameMaster.instance().status(clientId, brief)
        return (200, status)
