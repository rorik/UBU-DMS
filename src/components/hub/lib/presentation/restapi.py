from flask import Flask, escape, request, abort

from lib.data.model.gameserver import GameServer
from lib.data.model.gameservers import GameServers
from lib.data.model.chatrooms import ChatRooms
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
        token = request.form.get('token')
        if token is None:
            token = request.args.get('token')

        rest_client = RestClient.instance()
        if (not rest_client.validate_token(token)):
            return (401, 'Unauthorized')

        game_servers = GameServers.instance().get_servers()
        out = []
        for game_server in game_servers.values():
            out.append({
                'name': game_server.get_name(),
                'host': game_server.get_host(),
                'port': game_server.get_port(),
                'owner': game_server.get_owner()
            })
        return (200, json.dumps(out))

    def register_server(self, request):
        """ Game server registering handler.
        ---
        Parameters:
            - name: The server name.
            - host: The server host.
            - port: The server port.
            - token: The token of the user registering the server.
        Returns:
            A tuple with the following values:
                - (200, 'OK') when the server was successfully registered.
                - (401, 'Unauthorized') for an incorrect token.
                - (403, 'Forbidden') A server already exist with the same name and the user is not the owner.
        """

        name = request.form['name']
        host = request.form['host']
        port = request.form['port']
        token = request.form['token']

        rest_client = RestClient.instance()
        user_info = rest_client.user_info(token)

        if (user_info is None):
            return (401, 'Unauthorized')

        game_server = GameServer(name, host, port, user_info.get('username'))
        created = GameServers.instance().register_server(game_server)
        if (not created):
            return (403, 'Forbidden')
        return (200, 'OK')

    def unregister_server(self, request):
        """ Game server unregistering handler.
        ---
        Parameters:
            - name: The server name.
            - token: The token of the user unregistering the server, must be the owner of the server.
        Returns:
            A tuple with the following values:
                - (200, 'OK') when the server was successfully unregistered.
                - (401, 'Unauthorized') for an incorrect token.
                - (403, 'Forbidden') the user is not the owner of the server.
        """

        name = request.form['name']
        token = request.form['token']
        
        rest_client = RestClient.instance()
        user_info = rest_client.user_info(token)

        if (user_info is None):
            return (401, 'Unauthorized')

        try:
            removed = GameServers.instance().unregister_server(name, user_info.get('username'))
            if (not removed):
                return (403, 'Forbidden')
        except:
            pass
        return (200, 'OK')

    def join_server(self, request):
        """ Game server unregistering handler.
        ---
        Parameters:
            - token: The token of the user unregistering the server, must be the owner of the server.
            - client: The user identifier corresponding to a socket client id.
            - server: The name of the game server.
        Returns:
            A tuple with the following values:
                - (200, 'OK') when the server was successfully unregistered.
                - (400, 'Bad Request') for an incorrect client or server.
                - (401, 'Unauthorized') for an incorrect token.
                - (404, 'Not Found') when the providedserver does not exist.
        """

        token = request.form['token']
        client = request.form['client']
        server = request.form['server']

        if len(client) == 0 or len(server) == 0:
            return (400, 'Bad Request')

        if not RestClient.instance().validate_token(token):
            return (401, 'Unauthorized')
        
        chat_rooms = ChatRooms.instance()
        if GameServers.instance().get_servers().get(server) is None:
            return (404, 'Not Found')

        chat_rooms.join_room(server)
        
        return (200, 'OK')
