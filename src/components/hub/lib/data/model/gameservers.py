from lib.data.model.gameserver import GameServer
from typing import Dict

class GameServers:
    """ Singleton collection of game servers.
    ---
    This class is responsible of keeping the collection of registered game servers.
    """

    __instance = None 

    def __init__(self):
        """ Constructor method.
        ---
        Do NOT use this method. Use instance() instead.
        """
        if (GameServers.__instance is not None):
            raise Exception('A singleton class cannot be initialized twice')
        self.__game_servers = {}
    
    @staticmethod
    def instance() -> 'GameServers':
        """ Singleton instance access method.
        ---
        Do NOT use the constructor. Use this method instead.

        Returns:
            The singleton instance of this class.
        """
        if (GameServers.__instance is None):
            GameServers.__instance = GameServers()
        return GameServers.__instance

    def register_server(self, game_server):
        """ Registers (or updates a registered) game server.
        ---
        Parameters:
            - game_server: The value object instance of lib.data.model.gameserver.GameServer with the game server data.
        """
        existing_game_server = self.__game_servers.get(game_server.get_name())
        if (existing_game_server is not None):
            if (not existing_game_server.get_owner() == game_server.get_owner()):
                return False
        
        self.__game_servers[game_server.get_name()] = game_server
        return True

    def unregister_server(self, game_server_name, username):
        """ Unregisters a game server.
        ---
        Parameters:
            - game_server_name: The name of the game server to unregister.
        """
        game_server = self.__game_servers.get(game_server_name)

        if (game_server is not None):
            if (game_server.get_owner() == username):
                self.__game_servers.pop(game_server_name)
                return True
            return False
        return True
        

    def get_servers(self) -> Dict[str, GameServer]:
        """ Gets the whole collection of registered game servers.
        ---
        Returns:
            A dictionary with the registered game servers, identified by their name.
        """
        return self.__game_servers
