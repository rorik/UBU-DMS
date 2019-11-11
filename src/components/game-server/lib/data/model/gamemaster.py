from lib.data.model.board import Board
from lib.data.model.cell import Cell
from lib.data.model.boat import Boat
from lib.data.model.player import Player
from random import choice
from string import ascii_lowercase, digits
from typing import Dict
from itertools import chain


valid_clientId_chars = ascii_lowercase + digits
board_size = 8
boat_sizes = [5, 4, 3, 2, 1]


class GameMaster(object):
    __instance: 'GameMaster' = None
    __players: Dict[str, Player] = {}
    __turn = None

    def __init__(self):
        """ Constructor method.
        ---
        Do NOT use this method. Use instance() instead.
        """
        if (GameMaster.__instance is not None):
            raise Exception('A singleton class cannot be initialized twice')
        self.started = False
        pass

    @staticmethod
    def instance() -> 'GameMaster':
        """ Singleton instance access method.
        ---
        Do NOT use the constructor. Use this method instead.

        Returns:
            The singleton instance of this class.
        """
        if (GameMaster.__instance is None):
            GameMaster.__instance = GameMaster()
        return GameMaster.__instance

    @staticmethod
    def __random_client_id():
        """Generate a random client id """
        return ''.join(choice(valid_clientId_chars) for i in range(10))

    def is_valid_cell(self, x, y):
        return x >= 0 and x < board_size and y >= 0 and y < board_size

    def start_game(self):
        boatOffset = 0
        for player in self.__players.values():
            player.board = Board.random_board(board_size, [Boat(
                length, boatOffset + i) for i, length in enumerate(boat_sizes)])
            boatOffset += len(boat_sizes)
        self.__turn = choice(self.__players.keys())
        self.started = True

    def join(self, username) -> str:
        if username in [player.username for player in self.__players.values()]:
            previous = [player for player in self.__players.values()
                        if player.username == username][0]
            return previous.clientId
        elif len(self.__players) >= 2:
            return None

        clientId = None
        while clientId is None or clientId in [clientId for clientId in self.__players.keys()]:
            clientId = GameMaster.__random_client_id()
        player = Player(username, clientId)
        self.__players[clientId] = player
        if len(self.__players) >= 2:
            self.start_game()

        return player.clientId

    def is_player(self, clientId):
        return clientId is not None and clientId in self.__players.keys()

    def has_turn(self, clientId):
        if self.__turn is not None:
            return clientId == self.__turn
        return False

    def get_oponent(self, clientId) -> Player:
        return [player for player, cid in self.__players.values() if not cid == clientId][0]

    def attack(self, x, y):
        if not self.started:
            return None

        oponent = self.get_oponent(self.__turn)

        oponent.board.get_cell(x, y).is_hit = True
        # TODO

        return 'TODO'

    def status(self, clientId):
        status = {
            'started': self.started,
        }

        if self.started:
            is_player = self.is_player(clientId)
            status['player'] = is_player
            status['gameover'] = self.is_gameover()
            boats = [[boat.serialize() for boat in player.board.boats] for player in self.__players.values()]
            status['boats'] = list(chain.from_iterable(boats))
            if is_player:
                player: Player = self.__players[clientId]
                oponent = self.get_oponent(clientId)
                status['turn'] = self.has_turn(clientId)
                status['board'] = player.board.serialize()
                status['boats'] = player.board.boats
                status['oponentBoard'] = oponent.board.serialize(True)
            else:
                player = choice(self.__players.values())
                oponent = self.get_oponent(player.clientId)
                status['turn'] = False
                status['board'] = player.board.serialize(True)
                status['oponentBoard'] = oponent.board.serialize(True)

        return status

    def is_gameover(self):
        for player in self.__players:
            for row in player.board.board:
                for cell in row:
                    if not cell.is_hit and not cell.is_empty():
                        return False
        return True
