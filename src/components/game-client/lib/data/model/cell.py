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
        if not self.is_empty(): # Solo se puede tocar si hay barco en esa casilla
            self.get_boat().decrementar_vidas()
            self.tocado = True
            if self.get_boat().get_vidas_restantes() == 0:
                self.get_boat().hundir(True) # Con 0 vidas hundimos el barco

        return self.tocado
    
    def esta_tocado(self):
        return self.tocado