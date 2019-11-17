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
    __winner = None

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
        self.__turn = choice(list(self.__players.keys()))
        self.started = True
        self.calculate_gameover()

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
        return [player for cid, player in self.__players.items() if not cid == clientId][0]

    def attack(self, x, y):
        if not self.started:
            return None

        oponent = self.get_oponent(self.__turn)

        oponent.board.get_cell(y, x).is_hit = True
        if oponent.board.get_cell(y, x).boat is not None:
            sunk = True
            for cell in oponent.board.get_cell(y, x).boat.cells:
                if not cell.is_hit:
                    sunk = False
                    break
            oponent.board.get_cell(y, x).boat.is_sunk = sunk

        ids = list(self.__players.keys())

        result = self.__players[self.__turn].last_move = {
            'cell': oponent.board.get_cell(y, x).serialize(),
            'boat': oponent.board.get_cell(y, x).boat.serialize() if oponent.board.get_cell(y, x).boat is not None else None
        }

        self.__turn = ids[(ids.index(self.__turn) + 1) % len(ids)]
        self.calculate_gameover()

        return result

    def status(self, clientId, brief: bool):
        status = {
            'started': self.started,
        }

        if self.started:
            is_player = self.is_player(clientId)
            status['player'] = is_player
            status['gameover'] = self.__winner is not None
            player: Player = None
            if is_player:
                player = self.__players[clientId]
                status['turn'] = self.has_turn(clientId)
            else:
                player = list(self.__players.values())[0]
                status['turn'] = False

            oponent: Player = self.get_oponent(player.clientId)

            if status['gameover']:
                status['winner'] = clientId == self.__winner
            status['self'] = {
                'username': player.username,
                'lastMove': player.last_move
            }
            status['oponent'] = {
                'username': oponent.username,
                'lastMove': oponent.last_move
            }
            if not brief:
                status['self']['board'] = {
                    'cells': player.board.serialize(not is_player)}
                status['oponent']['board'] = {
                    'cells': oponent.board.serialize(True)
                }
                boats = [[boat.serialize() for boat in player.board.boats]
                         for player in self.__players.values()]
                status['boats'] = list(chain.from_iterable(boats))

        return status

    def calculate_gameover(self):
        for player in self.__players.values():
            if GameMaster.player_lost(player):
                self.__winner = self.get_oponent(player.clientId).clientId
                self.__turn = None

    @staticmethod
    def player_lost(player: Player):
        for boat in player.board.boats:
            for cell in boat.cells:
                if not cell.is_hit:
                    return False
        return True
