from time import time
from flask_socketio import send, emit, join_room, leave_room
from lib.data.auth.restclient import RestClient
from lib.data.model.gameservers import GameServers
from lib.data.model.chatrooms import ChatRooms


class SocketApi():
    """ Socket API facade.
    ---
    This class is a facade with the operations provided through the Socket API.
    """

    def __init__(self):
        pass

    def login(self, request, token):
        rest_client = RestClient.instance()
        chat_rooms = ChatRooms.instance()
        user_info = rest_client.user_info(token)

        res = {'ok': user_info is not None}

        if user_info is not None:
            username = user_info.get('username')
            chat_rooms.authenticate_client(request.sid, username)
            res['username'] = username

        emit('login_res', res)

    def join_server(self, request, server):
        chat_rooms = ChatRooms.instance()

        res = {'ok': False}

        username = chat_rooms.get_username(request.sid)
        if username is not None:
            game_server = GameServers.instance().get_servers().get(server)
            if game_server is not None:
                chat_rooms.join_room(server, request.sid)
                res['ok'] = True
            else:
                res['error'] = 'server_not_exists'
        else:
            res['error'] = 'not_authenticated'

        emit('join_server_res', res)

    def leave_server(self, request, server):
        ChatRooms.instance().leave_room(server, request.sid)
        emit('leave_server_res', {'ok': True})
    
    def disconnect(self, request):
        ChatRooms.instance().leave_all_rooms(request.sid)


    def send_chat(self, request, chat_json):
        res = {'ok': False}

        server = chat_json.get('server')
        message = chat_json.get('message')

        if server is None or len(server) == 0:
            res['error'] = 'empty_arg_server'
        elif message is None or len(message) == 0:
            res['error'] = 'empty_arg_message'
        elif ChatRooms.instance().room_exists(server):
            res['error'] = 'unknown_server'
        else:
            username = ChatRooms.instance().get_username(request.sid)
            if username is not None:
                data = {
                    'user': username,
                    'time': int(time()),
                    'message': message,
                    'server': server
                }
                emit('chat_message', data, room=server)
                res['ok'] = True
            else:
                res['error'] = 'not_authenticated'

        emit('send_chat_res', res)
