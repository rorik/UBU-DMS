from sqlalchemy import Column, String, ForeignKey
from lib.data.db.schema.manager import Manager

class UserSession(Manager.declarative_base()):
    """ Entity class mapped to a persisted user session.
    ---
    This class is responsible of mapping a single user session database record 
    to the application model.
    """

    __tablename__ = 'user_sessions'

    token = Column(String(36), primary_key = True)
    username = Column(String(32), ForeignKey('users.username'), nullable = False)

    def __init__(self, username, token):
        """ Constructor method.
        ---
        Parameters:
            - username: The user username. A string of 32 characters at most.
            - token: The user token. Must be unique in the table. A string of 36 characters at most.
        """
        self.username = username
        self.token = token
