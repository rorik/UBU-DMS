
from flask_socketio import join_room as io_join_room, leave_room as io_leave_room


class ChatRooms:
    """ Singleton collection of chat rooms.
    ---
    This class is responsible for keeping a correpondence between socket clients and their usernames.
    """

    __instance = None

    def __init__(self):
        """ Constructor method.
        ---
        Do NOT use this method. Use instance() instead.
        """
        if (ChatRooms.__instance is not None):
            raise Exception('A singleton class cannot be initialized twice')
        self.__clients = {}
        self.__rooms = {}

    @staticmethod
    def instance() -> 'ChatRooms':
        """ Singleton instance access method.
        ---
        Do NOT use the constructor. Use this method instead.

        Returns:
            The singleton instance of this class.
        """
        if (ChatRooms.__instance is None):
            ChatRooms.__instance = ChatRooms()
        return ChatRooms.__instance

    def authenticate_client(self, client_id, username):
        self.__clients[client_id] = username

    def remove_client(self, client_id):
        del self.__clients[client_id]

    def get_username(self, client_id):
        if client_id not in self.__clients:
            return None
        return self.__clients[client_id]

    def join_room(self, room, client_id):
        io_join_room(room, client_id, '/')
        if not room in self.__rooms or self.__rooms[room] is None:
            self.__rooms[room] = []
        self.__rooms[room].append(client_id)

    def leave_room(self, room, client_id):
        io_leave_room(room, client_id, '/')
        if room in self.__rooms and self.__rooms[room] is not None:
            try:
                self.__rooms[room].remove(client_id)
                if len(self.__rooms[room]) == 0:
                    del self.__rooms[room]
            except ValueError:
                pass

    def leave_all_rooms(self, client_id):
        for room, clients in self.__rooms.items():
            if client_id in clients:
                self.leave_room(room, client_id)

    def get_room_users(self, room):
        if room in self.__rooms and self.__rooms[room] is None:
            return None
        return [self.get_username(user) for user in self.__rooms[room]]

    def room_exists(self, room):
        return room in self.__rooms and self.__rooms[room] is None and len(self.__rooms[room]) > 0
