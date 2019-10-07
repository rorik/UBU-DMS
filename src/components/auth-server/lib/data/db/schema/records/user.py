from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from lib.data.db.schema.manager import Manager

class User(Manager.declarative_base()):
    """ Entity class mapped to a persisted user.
    ---
    This class is responsible of mapping a single user database record to the 
    application model.
    """

    __tablename__ = 'users'

    username = Column(String(32), primary_key = True)
    password = Column(String(64), nullable = False)

    def __init__(self, username, password):
        """ Constructor method.
        ---
        Parameters:
            - username: The user username. Must be unique in the database. A string of 32 characters at most.
            - password: The user password. This string will be stored as-is (it is expected to be already hashed or encrypted). A string of 64 characters at most.
        """
        self.username = username
        self.password = password
