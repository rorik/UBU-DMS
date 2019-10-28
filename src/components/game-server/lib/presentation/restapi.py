from flask import Flask, escape, request, abort

import json


class RestApi():
    """ REST API facade.
    ---
    This class is a facade with the operations provided through the REST API.
    """

    def __init__(self):
        pass

    def status(self, request):
        """ Status handler.
        ---
        Always returns a tuple with the 200 status code and an "OK" message.
        """
        return (200, 'OK')
