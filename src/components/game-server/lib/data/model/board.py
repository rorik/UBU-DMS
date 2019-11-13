from lib.data.model.cell import Cell
from lib.data.model.boat import Boat

from random import randint, getrandbits
from typing import List


class Board:
    """ Entity class used to model value objects, containing the data of a single board.
    """

    def __init__(self, size, boats):
        """ Constructor method.
        ---
        Parameters:
            - size: The length of the sides of the board.
        """
        self.height = self.width = size
        self.board = [[Cell(j, i) for i in range(size)] for j in range(size)]
        self.boats = boats

    def get_cell(self, row: int, column: int) -> Cell:
        return self.board[row][column]

    def place(self, boat: Boat, origin: Cell, horizontally: bool):

        cells = None
        if horizontally:
            cells = [self.get_cell(origin.row, origin.column + i)
                     for i in range(0, boat.length)]
        else:
            cells = [self.get_cell(origin.row + i, origin.column)
                     for i in range(0, boat.length)]

        for cell in cells:
            cell.boat = boat
        boat.cells = cells

    def serialize(self, is_oponent=False):
        return [[cell.serialize(is_oponent) for cell in row] for row in self.board]

    @staticmethod
    def random_board(size: int, boats: List[Boat]) -> 'Board':
        board = Board(size, boats)

        tries_left = 10000
        for boat in boats:
            placed = False
            while not placed and tries_left > 0:
                tries_left -= 1
                x = randint(0, board.width - 1)
                y = randint(0, board.height - 1)
                horizontally = bool(getrandbits(1))
                if horizontally:
                    if x + boat.length <= board.width:
                        placed = True
                        for i in range(boat.length):
                            if not Board.__is_valid_position(board, x + i, y):
                                placed = False
                                break
                else:
                    if y + boat.length <= board.height:
                        placed = True
                        for i in range(boat.length):
                            if not Board.__is_valid_position(board, x, y + i):
                                placed = False
                                break
                if placed:
                    board.place(boat, board.get_cell(y, x), horizontally)
        if tries_left == 0:
            print('! - Random board couldn\'t place all boats')
        return board

    @staticmethod
    def __is_valid_position(board: 'Board', x, y) -> bool:
        return board.get_cell(y, x).is_empty() \
            and (y + 1 >= board.height or board.get_cell(y + 1, x).is_empty()) \
            and (y - 1 < 0 or board.get_cell(y - 1, x).is_empty()) \
            and (x + 1 >= board.width or board.get_cell(y, x + 1).is_empty()) \
            and (x - 1 < 0 or board.get_cell(y, x - 1).is_empty())
