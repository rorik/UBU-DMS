from lib.data.model.shared.player import Player
from typing import Dict
from random import choice, randint
from string import ascii_lowercase, digits

valid_clientId_chars = ascii_lowercase + digits
colors = [0x0, 0xffffff]


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
        if len(self) < self.max:
            client_id = None
            while client_id is None or client_id in [clientId for clientId in self.__players.keys()]:
                client_id = PlayerManager.__random_client_id()
            player = Player(username, client_id)
            if len(self.__players) < len(colors):
                player.color = colors[len(self.__players)]
            else:
                player.color = randint(0, 0xffffff)
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
        return choice(list(self.__players.values()))

    def get_first_player(self) -> Player:
        return list(self.__players.values())[0]

    def get_oponent(self, player: Player) -> Player:
        if player is None:
            raise AttributeError('player attribute cannot be None')
        for cid, oponent in self.__players.items():
            if not cid == player.client_id:
                return oponent
        return None

    def ready(self) -> bool:
        return self.min <= len(self) <= self.max
    
    def serialize(self) -> list:
        return [player.serialize() for player in self.__players.values()]
    
    def add_notification(self, action):
        for player in self.__players.values():
            player.round_actions.append(action)

    def __len__(self):
        return len(self.__players)

    def __iter__(self):
        return iter(self.__players.values())