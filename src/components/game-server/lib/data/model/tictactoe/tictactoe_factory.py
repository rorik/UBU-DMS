from lib.data.model.shared.abstract_factory import AbstractFactory
from lib.data.model.tictactoe.tictactoe_gamemaster import TicTacToeGameMaster
from lib.data.model.tictactoe.tictactoe_board import TicTacToeBoard


class TicTacToeFactory(AbstractFactory):

    def __init__(self):
        super().__init__()

    def _build(self, size) -> TicTacToeGameMaster:
        if size is None:
            size = self._get_default_size()

        board_size = -1
        win_size = -1

        if isinstance(size, str):
            if size.isdecimal():
                board_size = int(size)
                win_size = 3
            elif ',' in size:
                groups = [value.strip() for value in size.split(',')]
                if len(groups) == 2 and len([group for group in groups if not group.isdecimal()]) == 0:
                    board_size = int(groups[0])
                    win_size = int(groups[1])
        elif isinstance(size, list) and len(size) > 0:
            board_size = size[0]
            win_size = size[1] if len(size) > 1 else 3

        if board_size <= 0 or win_size <= 0:
            raise AttributeError('size must be a list (board size and optional win_size) or a string' +
                                 '(board size or both attributes in csv format). Both values must be non-zero positive integers.')

        board = TicTacToeBoard(board_size)
        return TicTacToeGameMaster(board, win_size)

    def _get_default_size(self):
        return [3, 3]
