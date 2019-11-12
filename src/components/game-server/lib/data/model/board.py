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

    def get_target_cell(self, board: Board, boat_size: int, index_row: int, index_column: int):
        """
        Return the target cell
        ---
        Parameters:
            - board: Board where the boats are placed
            - boat_size: Length of the boat
            - index_row: Index of the row
            - index_column: Index of the column
        """
        targets = []  # List containing the 4 cells that could be chosen as the target cell

        north_cell = board.get_cell(index_row - boat_size, index_column)
        south_cell = board.get_cell(index_row + boat_size, index_column)
        east_cell = board.get_cell(index_row, index_column + boat_size)
        west_cell = board.get_cell(index_row, index_column - boat_size)
        targets.append(north_cell)
        targets.append(south_cell)
        targets.append(east_cell)
        targets.append(west_cell)
        return random.choice(targets)

    def where_is_origin_cell(self, origin_cell: Cell):
        """
        Returns the position that cell occupies on the board
        ---
        Parameters:
            - origin_cell: Origin cell
        """
        row = origin_cell.row
        column = origin_cell.column
        if row == 0 :
            return "above"
        elif row == self.height - 1:
            return "down"
        elif column = 0:
            return "left"
        elif column = self.width - 1:
            return "right"
        else:
            return "middle"

    @staticmethod
    def random_board(size, boats):
        """
        Place a list of boats randomly at a sizexsize board
        ----
        Parameters:
            - size: Size of the board
            - boats: Boats to be placed ramdomly
        """
        board = Board(size, boats)

        for boat in boats:
            boat_size = boat.length
            index_row = random.randint(0, size)
            index_column = random.randint(0, size)
            origin_cell = board.get_cell(index_row, index_column)
            flag = True
            while not flag:
                index_row = random.randint(0, size)
                index_column = random.randint(0, size)
                origin_cell = board.get_cell(index_row, index_column)
                if board.where_is_origin_cell(origin_cell) == "above":
                    if not origin_cell.is_empty() or
                        index_row + boat_size > board.height or # South
                        index_column + boat_size > board.width or # East
                        index_column - boat_size < 0: # West
                        flag = False
                elif board.where_is_origin_cell(origin_cell) == "down":
                    if not origin_cell.is_empty() or
                        index_row - boat_size < 0 or # North
                        index_column + boat_size > board.width or # East
                        index_column - boat_size < 0: # West
                        flag = False
                elif board.where_is_origin_cell(origin_cell) == "right":
                    if not origin_cell.is_empty() or
                        index_row - boat_size < 0 or # North
                        index_row + boat_size > board.height or # South
                        index_column - boat_size < 0: # West
                        flag = False
                elif board.where_is_origin_cell() == "left":
                    if not origin_cell.is_empty(origin_cell) or
                        index_row - boat_size < 0 or # North
                        index_row + boat_size > board.height or # South
                        index_column + boat_size > board.width:# East
                        flag = False
                 elif board.where_is_origin_cell(origin_cell) == "middle":
                    if not origin_cell.is_empty() or
                        index_row - boat_size < 0 or # North
                        index_row + boat_size > board.height or # South
                        index_column + boat_size > board.width or # East
                        index_column - boat_size < 0: # West
                        flag = False

            target_cell = board.get_target_cell(boat, boat_size, index_row, index_column)
            board.place(boat, origin_cell, target_cell)

        return board
