from lib.data.model.shared.abstract_factory import AbstractFactory
from lib.data.model.tictactoe.tictactoe_gamemaster import TicTacToeGameMaster
from lib.data.model.tictactoe.tictactoe_board import TicTacToeBoard


class TicTacToeFactory(AbstractFactory):

    def __init__(self):
        super().__init__()

    def _build(self, size) -> TicTacToeGameMaster:
        board = TicTacToeBoard(int(size))
        return TicTacToeGameMaster(board)

    def _get_default_size(self):
        return 3
