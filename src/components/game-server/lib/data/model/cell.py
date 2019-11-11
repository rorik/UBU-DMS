from lib.data.model.boat import Boat


class Cell:
    '''
    The model of each element of the board grid
    '''

    def __init__(self, row, column):
        self.row = row
        self.column = column
        self.is_hit = False
        self.boat: Boat = None

    def is_empty(self):
        return self.boat is None
