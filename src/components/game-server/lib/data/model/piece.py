class Piece:
    '''
    The model of the piece
    '''

    def __init__(self, length, id):
        self.length: int = length
        self.id: int = id
        self.cells = []
    
    def serialize(self):
        return {
            'id': self.id,
            'length': self.length,
        }