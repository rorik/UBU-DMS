from lib.data.model.shared.player import Player


class Cell:
    '''
    The model of each element of the board grid
    '''

    def __init__(self, row: int, column: int):
        self.row: int = row
        self.column: int = column
        self.player: Player = None

    def is_empty(self) -> bool:
        return self.player is None

    def serialize(self):
        return {
            'x': self.column,
            'y': self.row,
            'player': self.player.serialize() if self.player else None
        }
