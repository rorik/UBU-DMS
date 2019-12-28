from lib.data.model.shared.player import Player
from typing import Dict
from random import choice
from string import ascii_lowercase, digits

valid_clientId_chars = ascii_lowercase + digits


class PlayerManager(object):
    __players: Dict[str, Player] = {}

    def __init__(self, min, max):
        self.min = min
        self.max = max

    @staticmethod
    def __random_client_id():
        """Generate a random client id """
        return ''.join(choice(valid_clientId_chars) for i in range(10))

    def add_player(self, username: str) -> Player:
        if len(self) < self.maximum:
            client_id = None
            while client_id is None or client_id in [clientId for clientId in self.__players.keys()]:
                client_id = PlayerManager.__random_client_id()
            player = Player(username, client_id)
            self.__players[client_id] = player
            return player
        return None

    def get_player(self, client_id: str) -> Player:
        if client_id is not None and client_id in self.__players.keys():
            return self.__players[client_id]
        return None

    def get_client_id(self, username: str) -> Player:
        for cid, player in self.__players.items():
            if player.username == username:
                return player
        return None

    def get_random_player(self) -> Player:
        return choice(list(self.__players.keys()))

    def get_first_player(self) -> Player:
        return list(self.__players.keys())[0]

    def get_oponent(self, player: Player) -> Player:
        if player is None:
            raise AttributeError("player attribute cannot be None")
        for cid, oponent in self.__players.items():
            if not cid == player.client_id:
                return oponent
        return None

    def ready(self) -> bool:
        return self.min <= len(self) <= self.max

    def __len__(self):
        return len(self.__players)