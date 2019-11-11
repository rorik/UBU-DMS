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

    def serialize(self, isOponent=False):
        visible = not isOponent or self.is_hit
        return {
            'x': self.column,
            'y': self.row,
            'isVisible': visible,
            'isHit': self.is_hit,
            'boat': self.boat.id if self.boat is not None and visible else None
        }
