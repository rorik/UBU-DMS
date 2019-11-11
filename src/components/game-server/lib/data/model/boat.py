class Boat:
    '''
    The model of the boat
    '''

    def __init__(self, longitud):
        self.length = longitud
        self.is_sunk = False

    def copy(self):
        '''
        Returns a boat of the same length as this one
        '''
        return Boat(self.length)
