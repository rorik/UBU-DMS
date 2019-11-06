class Boat:
    '''
    Barcos que se situarán en el tablero
    '''
    def __init__(self, longitud):
        self.longitud = longitud
        self.vidas_restantes = longitud
        self.hundido = False
    
    def obtener_longitud(self):
        return self.longitud
    
    def get_vidas_restantes(self):
        return self.vidas_restantes

    def decrementar_vidas(self):
        '''
        Restará las "vidas" del barco de uno en uno
        '''
        self.vidas_restantes -= 1

    def copiar(self):
        '''
        Devuelve un barco de su misma longitud
        '''
        return Boat(self.longitud)
    
    def hundir(self, hundido):
        self.hundido = hundido

    def esta_hundido(self):
        return self.hundido

    
