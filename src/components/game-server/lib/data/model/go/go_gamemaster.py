from lib.data.model.go.go_board import GoBoard
from lib.data.model.shared.cell import Cell
from lib.data.model.shared.player import Player
from lib.data.model.shared.abstract_gamemaster import AbstractGameMaster
from lib.data.model.shared.round_action import RoundAction
from operator import itemgetter


class GoGameMaster(AbstractGameMaster):
    _board: GoBoard

    def __init__(self, board_size=9):
        if board_size is None:
            board_size = 9
        super().__init__(GoBoard(board_size), min_players=2, max_players=2)

    def get_winner(self) -> Player:
        if self._round == 6:
            scores = [(player, self.get_score(player)) for player in self._players]
            return max(scores, key=itemgetter(1))[0]

    def get_score(self, player: Player) -> int:
        return len([cell for cell in self._board.flatten() if cell.player == player])

    def get_action_result(self, cell: Cell, player: Player) -> RoundAction:
        result = super().get_action_result(cell, player)
        neighbours = self._board.get_neighbours(cell)
        captures = []
        for neighbour in neighbours:
            n_neighbours = self._board.get_neighbours(neighbour)
            captured = len([n_cell for n_cell in n_neighbours if n_cell.player is not None and not n_cell.player == neighbour.player]) == len(n_neighbours)
            if captured:
                self._board.clear(neighbour)
                captures.append(neighbour)
        result.set_updates(captures)
        return result
