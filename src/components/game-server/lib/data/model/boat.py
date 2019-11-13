class Boat:
    '''
    The model of the boat
    '''

    def __init__(self, length, id):
        self.length: int = length
        self.is_sunk: bool = False
        self.id: int = id
        self.cells = []
    
    def serialize(self):
        return {
            'id': self.id,
            'length': self.length,
            'isSunk': self.is_sunk
        }
