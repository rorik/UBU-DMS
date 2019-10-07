class GameServer:
    """ Entity class used to model value objects, containing the data of a single game server.
    """

    def __init__(self, name, host, port):
        """ Constructor method.
        ---
        Parameters:
            - name: The server name.
            - host: The server host.
            - port: The server port.
        """
        self.__name = name
        self.__host = host
        self.__port = port

    def get_name(self):
        """ Accessor method to get the value of the name property.
        ---
        Returns:
            A string with the value of the name property.
        """
        return self.__name

    def get_host(self):
        """ Accessor method to get the value of the host property.
        ---
        Returns:
            A string with the value of the host property.
        """
        return self.__host

    def get_port(self):
        """ Accessor method to get the value of the port property.
        ---
        Returns:
            A string with the value of the port property.
        """
        return self.__port
