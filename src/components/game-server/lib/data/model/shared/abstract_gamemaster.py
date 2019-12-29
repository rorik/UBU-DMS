from lib.data.model.shared.cell import Cell
from lib.data.model.shared.player import Player
from lib.data.model.shared.abstract_board import AbstractBoard
from lib.data.model.shared.player_manager import PlayerManager
from lib.data.model.shared.round_action import RoundAction
from lib.data.auth.restclient import RestClient
from typing import Tuple, List


class AbstractGameMaster(object):

    def __init__(self, board: AbstractBoard, min_players=2, max_players=2):
        self._board = board
        self.__started = False
        self._winner: Player = None
        self.__turn: Player = None
        self.__first_player: Player = None
        self._round = 0
        self._actions: List[RoundAction] = None
        self._players = PlayerManager(min_players, max_players)


    def start_game(self):
        if not self.__started and self._players.ready():
            self.__first_player = self.__turn = self._players.get_random_player()
            self._winner = None
            self.__started = True
            self._round = 0
            self._actions = []
            self.__calculate_gameover()

    def join(self, username: str) -> str:
        player = self._players.get_client_id(username)
        if player is not None:
            return player.client_id

        player = self._players.add_player(username)

        if self._players.ready():
            self.start_game()

        return player.client_id

    def place(self, client_id: str, x: int, y: int) -> Tuple[dict, int]:
        # Preconditions
        player = self._players.get_player(client_id)
        if player is None:
            return None, 0

        if not self.__started or self._winner is not None:
            return None, 1

        if not player == self.__turn:
            return None, 2

        cell = self._board.get_cell(y, x)
        if cell is None:
            return None, 3

        # Place
        self._board.place(cell, player)
        result = self.get_action_result(cell, player)
        if result is None:
            return None, 4

        self._actions.append(result)
        self._players.add_notification(result.serialize())
        player.round_actions = []

        self.__turn = self._players.get_oponent(self.__turn)
        if self.__turn == self.__first_player:
            self._round += 1
        self.__calculate_gameover()
        return result.serialize(), self._winner is not None

    def status(self, client_id: str, brief: bool) -> dict:
        status = {
            'started': self.__started,
        }

        if self.__started:
            player = self._players.get_player(client_id)
            status['gameover'] = self._winner is not None
            if player is not None:
                status['turn'] = self.__turn == player
                status['player'] = player.serialize()
                status['winner'] = player == self._winner
            else:
                player = self._players.get_first_player()
                status['turn'] = False
                status['winner'] = False

            status['round'] = player.round_actions

            if not brief:
                status['board'] = self._board.serialize()
                status['players'] = self._players.serialize()

        return status

    def __calculate_gameover(self):
        if self._winner is None:
            winner = self.get_winner()
            if winner is not None:
                self._winner = winner
                self.__add_scores()

    def __add_scores(self):
        rest = RestClient.instance()
        for player in self._players:
            score = self.get_score(player)
            try:
                rest.increment_score(
                    player.username, player.clientId == self._winner, score)
            except:
                pass

    # Game specific methods

    def get_action_result(self, cell: Cell, player: Player) -> RoundAction:
        return RoundAction(cell, player, self._round)

    def get_winner(self) -> Player:
        raise NotImplementedError()

    def get_score(self, player: Player) -> int:
        raise NotImplementedError()
