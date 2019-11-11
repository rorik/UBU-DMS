from lib.data.model.board import Board

class Player(object):
    def __init__(self, username, clientId):
        self.username = username
        self.clientId = clientId
        self.board: Board = None