from sqlalchemy import Column, String, Integer, ForeignKey
from lib.data.db.schema.manager import Manager

class UserScore(Manager.declarative_base()):
    """ Entity class mapped to a persisted user score.
    ---
    This class is responsible of mapping a single user scores database record 
    to the application model.
    """

    __tablename__ = 'user_scores'

    username = Column(String(32), ForeignKey('users.username'), primary_key = True)
    games_won = Column(Integer, default = 0, nullable = False)
    games_lost = Column(Integer, default = 0, nullable = False)
    score = Column(Integer, default = 0, nullable = False)

    def __init__(self, username, games_won = None, games_lost = None, score = None):
        """ Constructor method.
        ---
        Parameters:
            - username: The user username. Must be unique in the database. A string of 32 characters at most.
            - games_won: The number of games this user has won. Optional. Defaults to 0
            - games_lost: The number of games this user has lost. Optional. Defaults to 0
            - score: The score of this user. Optional. Defaults to 0
        """
        self.username = username
        if (games_won is not None):
            self.games_won = games_won
        if (games_lost is not None):
            self.games_lost = games_lost
        if (score is not None):
            self.score = score
