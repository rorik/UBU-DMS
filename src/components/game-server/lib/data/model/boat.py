class Boat:
    '''
    The model of the boat
    '''

    def __init__(self, length, id):
        self.length = length
        self.is_sunk = False
        self.id = id
    
    def serialize(self):
        return {
            'id': self.id,
            'length': self.length,
            'isSunk': self.is_sunk
        }
