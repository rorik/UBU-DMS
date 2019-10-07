from flask import Flask, escape, request, abort

from lib.data.model.gameserver import GameServer
from lib.data.model.gameservers import GameServers
from lib.data.auth.restclient import RestClient

import json

class RestApi():
    """ REST API facade.
    ---
    This class is a facade with the operations provided through the REST API.
    """
    def __init__(self):
        pass

    def status(self, request):
        """ Status handler.
        ---
        Always returns a tuple with the 200 status code and an "OK" message.
        """
        return (200, 'OK')

    def list_servers(self, request):
        """ Game servers listing handler.
        ---
        Parameters:
            - request: The HTTP request received in the REST endpoint.
        Returns:
            A tuple with the following values:
                - (200, list of game servers) when the provided token is valid.
                - (401, 'Unauthorized') for an incorrect token.
        """
        token = request.form['token']

        rest_client = RestClient.instance()
        if (not rest_client.validate_token(token)):
            return (401, 'Unauthorized')

        game_servers = GameServers.instance().get_servers()
        out = []
        for game_server in game_servers.values():
            out.append({
                'name': game_server.get_name(),
                'host': game_server.get_host(),
                'port': game_server.get_port()
            })
        return (200, json.dumps(out))

    def register_server(self, request):
        """ Game server registering handler.
        ---
        Parameters:
            - name: The server name.
            - host: The server host.
            - port: The server port.
        Returns:
            A tuple with the following values:
                - (200, 'OK') when the server was successfully registered.
        """

        name = request.form['name']
        host = request.form['host']
        port = request.form['port']

        game_server = GameServer(name, host, port)
        GameServers.instance().register_server(game_server)
        return (200, 'OK')

    def unregister_server(self, request):
        """ Game server unregistering handler.
        ---
        Parameters:
            - name: The server name.
        Returns:
            A tuple with the following values:
                - (200, 'OK') when the server was successfully unregistered.
        """

        name = request.form['name']

        try:
            GameServers.instance().unregister_server(name)
        except:
            pass
        return (200, 'OK')
