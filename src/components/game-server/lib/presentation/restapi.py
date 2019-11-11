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
        token = request.form.get('token')
        if (token is None):
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
        clientId = request.form.get('clientId')
        if (not GameMaster.instance().is_player(clientId)):
            return (401, 'Unauthorized')

        if not GameMaster.instance().has_turn(clientId):
            return (403, 'It\'s not the player\'s turn')

        x = request.form.get('x')
        y = request.form.get('y')

        if (x is None or y is None or not GameMaster.instance().is_valid_cell(x, y)):
            return (404, 'The given coordinate does not exist')

        cell = GameMaster.instance().attack(x, y)

        return (200, cell)

    def play_status(self, request: Request):
        """ Status handler.
        ---
        Return current state of the game.
        """
        clientId = request.form.get('clientId')

        status = GameMaster.instance().status(clientId)
        return (200, status)
