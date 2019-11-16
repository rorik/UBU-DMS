from lib.data.model.board import Board
from lib.data.model.cell import Cell

class Player(object):
    def __init__(self, username, clientId):
        self.username = username
        self.clientId = clientId
        self.board: Board = None
        self.last_move: Cell = None