from lib.data.model.go.go_board import GoBoard
from lib.data.model.shared.cell import Cell
from lib.data.model.shared.player import Player
from lib.data.model.shared.abstract_gamemaster import AbstractGameMaster
from lib.data.model.shared.round_action import RoundAction
from operator import itemgetter


class GoGameMaster(AbstractGameMaster):

    def __init__(self, board):
        self._board: GoBoard
        super().__init__(board, min_players=2, max_players=2)

    def get_winner(self) -> Player:
        if self._round == 1:
            scores = [(player, self.get_score(player)) for player in self._players]
            return max(scores, key=itemgetter(1))[0]

    def get_score(self, player: Player) -> int:
        return len([cell for cell in self._board.flatten() if cell.player == player])

    def get_action_result(self, cell: Cell, player: Player) -> RoundAction:
        result = super().get_action_result(cell, player)
        neighbours = self._board.get_neighbours(cell)
        captures = []
        if self.__is_captured(cell):
                captures.append(cell)
        for neighbour in neighbours:
            captured = self.__is_captured(neighbour)
            if captured:
                captures.append(neighbour)
        for capture in captures:
            self._board.clear(capture)
        result.set_updates(captures)
        return result
    
    def __is_captured(self, cell: Cell):
        neighbours = self._board.get_neighbours(cell)
        return len([n_cell for n_cell in neighbours if n_cell.player is not None and not n_cell.player == cell.player]) == len(neighbours)
