from lib.data.model.shared.abstract_gamemaster import AbstractGameMaster
from lib.data.model.tictactoe.tictactoe_board import TicTacToeBoard
from lib.data.model.shared.player import Player


class TicTacToeGameMaster(AbstractGameMaster):

    def __init__(self, board: TicTacToeBoard, win_size: int):
        if win_size > max(board.width, board.height):
            raise AttributeError(
                'win_size is bigger than the largest dimension in the board')
        self._board: TicTacToeBoard
        self.__win_size = win_size
        super().__init__(board, min_players=2, max_players=2)

    def get_winner(self):
        winner = self.__horizontal_check()
        if winner is None:
            winner = self.__vertical_check()
            if winner is None:
                winner = self.__negative_diagonal_check()
                if winner is None:
                    winner = self.__positive_diagonal_check()
                    if winner is None and len([cell for cell in self._board.flatten() if cell.is_empty()]) == 0:
                        winner = Player('', '') # Tie
        return winner

    def get_score(self, player: Player) -> int:
        return self.__win_size if self._winner == player else 0

    def __delta_check(self, x_range, y_range, delta_f):
        for y in y_range:
            for x in x_range:
                cell = self._board.get_cell(y, x)
                if not cell.is_empty():
                    winner = True
                    for delta in range(1, self.__win_size):
                        delta_cell = self._board.get_cell(*delta_f(x, y, delta))
                        if not delta_cell.player == cell.player:
                            winner = False
                            break
                    if winner:
                        return cell.player
        return None

    def __horizontal_check(self):
        def delta_f(x, y, delta): return [y, x + delta]
        return self.__delta_check(range(self._board.width - self.__win_size + 1), range(self._board.height), delta_f)

    def __vertical_check(self):
        def delta_f(x, y, delta): return [y + delta, x]
        return self.__delta_check(range(self._board.width), range(self._board.height - self.__win_size + 1), delta_f)

    def __negative_diagonal_check(self):
        def delta_f(x, y, delta): return [y + delta, x + delta]
        return self.__delta_check(range(self._board.width - self.__win_size + 1), range(self._board.height - self.__win_size + 1), delta_f)

    def __positive_diagonal_check(self):
        def delta_f(x, y, delta): return [y - delta, x + delta]
        return self.__delta_check(range(self._board.width - self.__win_size + 1), range(self.__win_size - 1, self._board.height), delta_f)
