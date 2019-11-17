import http.client
import os
import json

class RestClient:
    """ Singleton REST client to interact with the authentication server.
    ---
    This class is responsible of interfacing the authentication server as another 
    data source, via a REST API presentation layer in the authentication server.

    Note: Uses the AUTH_SERVER_HOST and AUTH_SERVER_PORT environment variables to 
    open the connection.
    """

    __instance = None

    def __init__(self):
        """ Constructor method.
        ---
        Do NOT use this method. Use instance() instead.
        """
        if RestClient.__instance is not None:
            raise Exception('A singleton class cannot be initialized twice')
        self.__connection = http.client.HTTPConnection(os.getenv('AUTH_SERVER_HOST', '127.0.0.1'), os.getenv('AUTH_SERVER_PORT', 1234))
    
    @staticmethod
    def instance() -> 'RestClient':
        """ Singleton instance access method.
        ---
        Do NOT use the constructor. Use this method instead.

        Returns:
            The singleton instance of this class.
        """
        if RestClient.__instance is None:
            RestClient.__instance = RestClient()
        return RestClient.__instance

    def validate_token(self, token):
        """ Performs the token validation against the authentication server.
        ---
        Parameters:
            - token: The authentication token to validate.
        Returns:
            True if the token given is a valid session token in the authentication server. False otherwise.
        """
        if token is None:
            return False
        self.__connection.request('GET', '/token/check', headers = {'Content-Type': 'application/x-www-form-urlencoded'}, body = 'token=' + token)
        response = self.__connection.getresponse()
        return response.status == 200

    def user_info(self, token) -> dict:
        """ Performs the token validation against the authentication server.
        ---
        Parameters:
            - token: The authentication token to validate.
        Returns:
            True if the token given is a valid session token in the authentication server. False otherwise.
        """
        if token is None:
            return None
        self.__connection.request('GET', '/user/info', headers = {'Content-Type': 'application/x-www-form-urlencoded'}, body = 'token=' + token)
        response = self.__connection.getresponse()
        content = response.read().decode('utf-8')

        if not response.status == 200 or content is None or len(content) == 0:
            return None

        userInfo = json.loads(content)
        if 'username' not in userInfo:
            return None
        
        return userInfo

    def increment_score(self, username, won, score):
        """ Performs the score increment against the authentication server.
        ---
        Parameters:
            - username: The username of the user.
            - won: Whether the player has won (true) or lost (false).
            - score: The number of points that the user gets.
        Returns:
            True if the operation was successful. False otherwise.
        """
        if username is None or won is None or score is None:
            return False
        secret_code = '_super_secret_code_that_cant_be_intercepted_with_wireshark_or_reading_the_source_code_'
        self.__connection.request('POST', '/score/add', headers={'Content-Type': 'application/x-www-form-urlencoded'},
                                  body='username=' + username + '&secret_code=' + secret_code + '&won=' + str(won) + '&score=' + str(score))
        return self.__connection.getresponse().status == 200
