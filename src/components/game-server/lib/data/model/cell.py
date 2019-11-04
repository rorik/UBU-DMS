<<<<<<< HEAD
from lib.data.model.boat import Boat

class Cell:
    '''
    Celdas que conformarán el tablero
    '''
    def __init__(self, row, column):
        self.row = row
        self.column = column
        self.tocado = False
        self.boat = None

    def is_empty(self):
        return self.boat == None # Si no hay barco, celda vacía

    def get_row(self):
        return self.row

    def get_column(self):
        return self.column
    
    def establecer_barco(self, boat):
        self.boat = boat

    def get_boat(self):
        return self.boat
    
    def tocar(self):
        self.tocado = True
    
    def esta_tocado(self):
        return True if self.tocado else False
=======
class Cell:
    pass
>>>>>>> ba9b865bf8ceb67ecb50155bed5a0d66896903ac
