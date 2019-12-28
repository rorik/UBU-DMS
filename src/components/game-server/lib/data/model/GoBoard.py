from lib.data.model.cell import Cell

class GoBoard:

    def __init__(self, size):
        self.height = self.width = size
        self.GoBoard = [[Cell(j, i) for i in range(size)] for j in range(size)]

    def get_cell(self, row: int, column: int) -> Cell:
        return self.GoBoard[row][column]

    def place(self, origin: Cell, horizontally: bool):
        cells = None
        if horizontally:
            cells = [self.get_cell(origin.row, origin.column + i)  
        else:
            cells = [self.get_cell(origin.row + i, origin.column)

    def serialize(self, is_oponent=False):
        return [[cell.serialize(is_oponent) for cell in row] for row in self.GoBoard]

    @staticmethod
    def __is_valid_position(board: 'Board', x, y) -> bool:
        return GoBoard.get_cell(y, x).is_empty() \
            and (y + 1 >= GoBoard.height or GoBoard.get_cell(y + 1, x).is_empty()) \
            and (y - 1 < 0 or GoBoard.get_cell(y - 1, x).is_empty()) \
            and (x + 1 >= GoBoard.width or GoBoard.get_cell(y, x + 1).is_empty()) \
            and (x - 1 < 0 or GoBoard.get_cell(y, x - 1).is_empty())
