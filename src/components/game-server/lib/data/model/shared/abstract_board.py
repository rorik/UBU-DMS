from lib.data.model.shared.cell import Cell
from lib.data.model.shared.player import Player
from itertools import chain
from typing import List


class AbstractBoard(object):
    board = []
    height = 0
    width = 0

    def get_cell(self, row: int, column: int) -> Cell:
        if self.is_valid_position(row, column):
            return self.board[row][column]
        return None

    def place(self, cell: Cell, player: Player):
        cell.player = player

    def serialize(self):
        return [[cell.serialize() for cell in row] for row in self.board]

    def is_valid_position(self, row: int, column: int) -> bool:
        return 0 <= row < self.height and 0 <= column < self.width

    def flatten(self) -> List[Cell]:
        return list(chain.from_iterable([row for row in self.board]))

    def get_neighbours(self, cell: Cell) -> List[Cell]:
        options = list(chain.from_iterable([(self.get_cell(cell.row + i, cell.column), self.get_cell(cell.row, cell.column + i)) for i in [-1, 1]]))
        return [cell for cell in options if cell is not None]
