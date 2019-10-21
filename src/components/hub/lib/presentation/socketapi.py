from time import time
from json import dumps, loads
from flask_socketio import send, emit, join_room, leave_room
from typing import Dict
from lib.data.auth.restclient import RestClient
from lib.data.model.gameservers import GameServers


class SocketApi():
    """ Socket API facade.
    ---
    This class is a facade with the operations provided through the Socket API.
    """
    def __init__(self):
        self.__users: Dict[str, str] = dict()
        pass

    def login(self, request, token):
        rest_client = RestClient.instance()
        userInfo = rest_client.user_info(token)

        res = {'ok': userInfo is not None}

        if userInfo is None:
            del self.__users[request.sid]
        else:
            username = userInfo.get('username')
            self.__users[request.sid] = username
            res['username'] = username
            join_room(f'__user:{username}')


        send('login_res', dumps(res))

    def join_chat(self, request, server):
        res = {'ok': False}

        username = self.__users.get(request.sid)
        if username is not None:
            if server.startswith('__'):
                game_server = GameServers.instance().get_servers().get(server)
                if game_server is not None:
                    join_room(f'__server:{server}')
                    res['ok'] = True
                else:
                    res['error'] = 'server_not_exists'
            else:
                res['error'] = 'server_reserved'
        else:
            res['error'] = 'not_authenticated'

        send('join_chat_res', dumps(res))

    def send_chat(self, request, chat_json):
        res = {'ok': False}

        chat = loads(chat_json)
        server = chat.get('server')
        message = chat.get('message')

        if server is None or len(server) == 0:
            res['error'] = 'empty_arg_server'
        elif message is None or len(message) == 0:
            res['error'] = 'empty_arg_message'
        else:
            username = self.__users.get(request.sid)
            if username is not None:
                data = {
                    'user': username,
                    'time': int(time()),
                    'message': message
                }
                emit('chat_message', data, room=f'__server:{server}')

        send('send_chat_res', dumps(res))
        

    def __get_sids(self, username):
        return [k for k,v in self.__users.items() if v == username]
