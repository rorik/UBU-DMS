from lib.data.model.shared.abstract_gamemaster import AbstractGameMaster
from lib.data.model.tictactoe.tictactoe_board import TicTacToeBoard


class TicTacToeGameMaster(AbstractGameMaster):

    def __init__(self, board):
        self._board: TicTacToeBoard
        super().__init__(board, min_players=2, max_players=2)
