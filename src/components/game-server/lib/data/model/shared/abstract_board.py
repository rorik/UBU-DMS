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

    def place(self, cell: Cell, player: Player) -> Cell:
        cell.player = player

    def serialize(self):
        return [[cell.serialize() for cell in row] for row in self.board]

    def is_valid_position(self, row: int, column: int) -> bool:
        return 0 <= row < height and 0 <= column < width
    
    def flatten(self) -> List[Cell]:
        return list(chain.from_iterable([row for row in self.board]))
