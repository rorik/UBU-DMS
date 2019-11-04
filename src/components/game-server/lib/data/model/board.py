from lib.data.model.cell import Cell


class Board:
    """ Entity class used to model value objects, containing the data of a single board.
    """

    def __init__(self, size):
        """ Constructor method.
        ---
        Parameters:
            - size: The length of the sides of the board.
        """
        self.alto = self.ancho = size
        self.celdas = [[Cell(i, j) for i in range(size)]
                  for j in range(size)]  # Incicializamos el tablero

    def get_cell(self, row, column):
        return self.celdas[row][column]

    def get_altura(self):
        return self.alto

    def get_anchura(self):
        return self.ancho

    def get_direction(self, origin_cell, last_cell):
        """ Proporciona las celdas en las que se colocará el barco
        --- 
        Parameters:
            - origin_cell: Celda origen
            - last_cell: Última celda donde se colocará el barco
        """
        celdas_intermedias = []

        if last_cell.get_row() < origin_cell.get_row and last_cell.get_column() == origin_cell.get_column:  # norte
            for i in range(origin_cell.get_row, last_cell.get_row-1, -1):
                celdas_intermedias.append(
                    self.celdas[i][origin_cell.get_row()])

        elif last_cell.get_row() == origin_cell.get_row and last_cell.get_column() > origin_cell.get_column: # sur
            for i in range(origin_cell.get_column(), last_cell.get_column()+1):
                celdas_intermedias.append(
                    self.celdas[origin_cell.get_row()][i])

        elif last_cell.get_row() > origin_cell.get_row and last_cell.get_column() == origin_cell.get_column: #este
            for i in range(origin_cell.get_row(), last_cell.get_row()+1):
                celdas_intermedias.append(
                    self.celdas[i][origin_cell.get_column()])
        else:
            for i in range(origin_cell.get_column(), last_cell.get_column()-1, -1):
                celdas_intermedias.append(
                    self.celdas[origin_cell.get_row()][i])

        return celdas_intermedias
        

    def colocar(self, barco, origin_cell, last_cell):
        celdas_colocar = self.get_direction(origin_cell, last_cell)

        for celda in celdas_colocar:
            celda.establecer_barco(barco)
