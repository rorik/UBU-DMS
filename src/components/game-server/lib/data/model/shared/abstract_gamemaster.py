from lib.data.model.shared.cell import Cell
from lib.data.model.shared.player import Player
from lib.data.model.shared.abstract_board import AbstractBoard
from lib.data.model.shared.player_manager import PlayerManager
from lib.data.auth.restclient import RestClient
from typing import Tuple


class AbstractGameMaster(object):
    __started = False
    __winner: Player = None
    __turn: Player = None
    _current_turn = 0

    def __init__(self, board: AbstractBoard, min_players=2, max_players=2):
        self._board = board
        self._players = PlayerManager(min_players, max_players)

    def start_game(self):
        if not self.started and self.__players.ready():
            self.__turn = self._players.get_random_player()
            self.__winner = None
            self.started = True
            self._current_turn = 1
            self.__calculate_gameover()

    def join(self, username: str) -> str:
        player = self._players.get_client_id(username)
        if player is not None:
            return player.client_id

        player = self._players.add_player(username)

        if self.__players.ready():
            self.start_game()

        return player.client_id

    def place(self, client_id: str, x: int, y: int) -> Tuple[dict, int]:
        # Preconditions
        player = self.__players.get_player(client_id)
        if player is None:
            return None, 0

        if not self.started or self.__winner is not None:
            return None, 1

        if not player == self.__turn:
            return None, 2

        cell = self._board.get_cell(y, x)
        if cell is None:
            return None, 3

        # Place
        cell = self._board.place(cell, self.__turn)
        result = self.get_action_result()
        if result is None:
            return None, 4

        player.last_action = result
        self.__turn = self._players.get_oponent(self.__turn)
        if self.__turn == self._players.get_first_player():
            self._current_turn += 1
        self.__calculate_gameover()
        return result,

    def status(self, client_id: str, brief: bool) -> dict:
        status = {
            'started': self.started,
        }

        if self.started:
            is_player = self._players.get_player(client_id) is None
            status['player'] = is_player
            status['gameover'] = self.__winner is not None
            player: Player = None
            if is_player:
                player = self._players.get_player(client_id)
                status['turn'] = self.__turn == player
                status['winner'] = player == self.__winner
            else:
                player = self._players.get_first_player()
                status['turn'] = False
                status['winner'] = False

            oponent: Player = self._players.get_oponent(player)

            status['self'] = player.serialize()
            status['oponent'] = oponent.serialize()

            if not brief:
                status['board'] = self._board.serialize()

        return status

    def __calculate_gameover(self):
        if self.__winner is None:
            winner = self.get_winner()
            if winner is not None:
                self.__winner = winner
                self.__add_scores()

    def __add_scores(self):
        rest = RestClient.instance()
        for player in self._players.values():
            score = self.get_score(player)
            try:
                rest.increment_score(
                    player.username, player.clientId == self.__winner, score)

    # Game specific methods

    def get_action_result(self, cell: Cell, player: Player) -> dict:
        return cell.serialize()

    def get_winner(self) -> Player:
        raise NotImplementedError()

    def get_score(self, player: Player) -> int:
        raise NotImplementedError()
