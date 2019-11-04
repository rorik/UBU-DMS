class Boat:
    '''
    Barcos que se situarán en el tablero
    '''
    def __init__(self, longitud):
        self.longitud = longitud
        self.hundido = False
    
    def obtener_longitud(self):
        return self.longitud

    def esta_hundido(self):
        return True if self.hundido else False

    def copiar(self):
        return Boat(self.longitud)
    
    def hundir():
        pass

    
