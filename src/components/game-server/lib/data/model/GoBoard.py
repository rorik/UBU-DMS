from lib.data.model.cell import Cell

class GoBoard:

    def __init__(self, size):
        self.height = self.width = size
        self.board = [[Cell(j, i) for i in range(size)] for j in range(size)]

    def get_cell(self, row: int, column: int) -> Cell:
        return self.board[row][column]

    def place(self, origin: Cell, horizontally: bool):
        cells = None
        if horizontally:
            cells = [self.get_cell(origin.row, origin.column + i)  
        else:
            cells = [self.get_cell(origin.row + i, origin.column)

    def serialize(self, is_oponent=False):
        return [[cell.serialize(is_oponent) for cell in row] for row in self.board]

    @staticmethod
    def __is_valid_position(board: 'Board', x, y) -> bool:
        return board.get_cell(y, x).is_empty() \
            and (y + 1 >= board.height or board.get_cell(y + 1, x).is_empty()) \
            and (y - 1 < 0 or board.get_cell(y - 1, x).is_empty()) \
            and (x + 1 >= board.width or board.get_cell(y, x + 1).is_empty()) \
            and (x - 1 < 0 or board.get_cell(y, x - 1).is_empty())
