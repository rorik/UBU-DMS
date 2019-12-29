from lib.data.model.go.go_board import GoBoard
from lib.data.model.shared.cell import Cell
from lib.data.model.shared.player import Player
from lib.data.model.shared.abstract_gamemaster import AbstractGameMaster
from lib.data.model.shared.round_action import RoundAction


class GoGameMaster(AbstractGameMaster):

    def __init__(self, board_size=9):
        if board_size is None:
            board_size = 9
        super().__init__(GoBoard(board_size), min_players=2, max_players=2)

    def get_winner(self) -> Player:
        if self._round == 6:
            return self._players.get_random_player()

    def get_score(self, player: Player) -> int:
        return len([cell for cell in self._board.flatten() if cell.player == player])

    def get_action_result(self, cell: Cell, player: Player) -> RoundAction:
        result = super().get_action_result(cell, player)
        # TODO: Capture
        # result.set_updates([...])
        return result
