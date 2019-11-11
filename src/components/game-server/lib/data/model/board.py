from lib.data.model.cell import Cell
from lib.data.model.boat import Boat


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

    def __cells_between(self, origin: Cell, target: Cell):
        cells = []

        if target.row < origin.row and target.column == origin.column:  # North
            for i in range(origin.row, target.row, -1):
                cells.append(self.board[i][origin.row])
        elif target.row == origin.row and target.column > origin.column:  # South
            for i in range(origin.column, target.column + 1):
                cells.append(self.board[origin.row][i])
        elif target.row > origin.row and target.column == origin.column:  # East
            for i in range(origin.row, target.row + 1):
                cells.append(self.board[i][origin.column])
        else:  # West
            for i in range(origin.column, target.column - 1, -1):
                cells.append(self.board[origin.row][i])

        return cells

    def place(self, boat: Boat, origin: Cell, target: Cell):
        cells = self.__cells_between(origin, target)

        for cell in cells:
            cell.boat = boat
            boat.cells = cells
    
    def serialize(self, is_oponent = False):
        return [[cell.serialize(is_oponent) for cell in row] for row in self.board]

    @staticmethod
    def random_board(size, boats):
        board = Board(size, boats)
        # TODO
        return board
