import random
import string

class GameMaster(object):
    __instance: 'GameMaster' = None
    __players = {}
    __turn = None
    
    def __init__(self):
        """ Constructor method.
        ---
        Do NOT use this method. Use instance() instead.
        """
        if (GameMaster.__instance is not None):
            raise Exception('A singleton class cannot be initialized twice')
        pass
    
    @staticmethod
    def instance() -> 'GameMaster':
        """ Singleton instance access method.
        ---
        Do NOT use the constructor. Use this method instead.

        Returns:
            The singleton instance of this class.
        """
        if (GameMaster.__instance is None):
            GameMaster.__instance = GameMaster()
        return GameMaster.__instance

    @staticmethod
    def __random_cid():
        """Generate a random client id """
        letters = string.ascii_lowercase
        return ''.join(random.choice(letters) for i in range(10))

    def is_valid_cell(self, x, y):
        # TODO
        return x >= 0 and y >= 0

    def join(self, username) -> str:
        if username in [player.username for player in self.__players.values()]:
            previous = [player for player in self.__players.values() if player.username == username][0]
            return previous.clientId
        elif len(self.__players) >= 2:
            return None

        clientId = None
        while clientId is None or clientId in [clientId for clientId in self.__players.keys()]:
            clientId = GameMaster.__random_cid()
        player = Player(username, clientId)
        self.__players[clientId] = player
        return player.clientId
    
    def is_player(self, clientId):
        return clientId is not None and clientId in self.__players.keys()
    
    def has_turn(self, clientId):
        if self.__turn is not None:
            return clientId == self.__turn
        return False
    
    def attack(self, x, y):
        # TODO
        return 'TODO'
    
    def status(self, clientId):
        status = {}
        is_player = self.is_player(clientId)
        status['player'] = is_player
        status['gameover'] = self.is_gameover()
        if is_player:
            status['turn'] = self.has_turn(clientId)
            status['board'] = 'TODO'
            status['oponentBoard'] = 'TODO'
        # TODO
        return status

    def is_gameover(self):
        # TODO
        return False

        



class Player(object):
    def __init__(self, username, clientId):
        self.username = username
        self.clientId = clientId