from lib.data.db.schema.recordsets.recordset import RecordSet
from lib.data.db.schema.records.userscore import UserScore
from sqlalchemy.orm.exc import NoResultFound

class UserScores(RecordSet):
    """ A recordset of persisted user scores.
    ---
    This class facades several operations and queries on the user scores records.
    """

    def __init__(self, session):
        """ Constructor method.
        ---
        Parameters:
            - session: An sqlalchemy.orm.session.Session instance to be used for the operations of the recordset.
        """
        super().__init__(session)

    def create(self, username):
        """ Creates a new user scores record.
        ---
        Parameters:
            - username: The name of the user whose score is to be created. See lib.data.db.schema.records.user.User.__init__ for details on the restrictions.
        Returns:
            The instance of the newly created lib.data.db.schema.records.userscore.UserScore
        """
        try:
            new_user_score = UserScore(username)
            self._session.add(new_user_score)
            self._session.commit()
        except:
            self._session.rollback()
            raise
        return new_user_score

    def get_user_score(self, username):
        """ Gets the score record of a given user.

        The score record will be created automatically if none is found.
        ---
        Parameters:
            - username: The name of the user whose score is to be retrieved.
        Returns:
            The instance of lib.data.db.schema.records.userscore.UserScore corresponding to the given user.
        """
        user_score = None
        try:
            query = self._session.query(UserScore).filter(UserScore.username == username)
            user_score = query.one()
        except NoResultFound:
            user_score = self.create(username)
        except:
            raise

        return user_score

    def get_all_user_scores(self):
        """ Gets the score record of every user.
        ---
        Returns:
            A list of lib.data.db.schema.records.userscore.UserScore instances, sorted descending by score.
        """
        try:
            query = self._session.query(UserScore).order_by(UserScore.score.desc())
            return query.all()
        except:
            raise

    def set_user_score(self, username, games_won = None, games_lost = None, score = None):
        """ Sets one or many of the scores of a given user.
        ---
        Parameters:
            - username: The name of the user whose score is to be set.
            - games_won: (Optional) If passed, the new number of games this user has won.
            - games_lost: (Optional) If passed, the new number of games this user has lost.
            - score: (Optional) If passed, the new user score.
        Returns:
            The instance of lib.data.db.schema.records.userscore.UserScore corresponding to the given user.
        """
        user_score = None
        try:
            user_score = self.get_user_score(username)
            if (games_won is not None):
                user_score.games_won = games_won
            if (games_lost is not None):
                user_score.games_lost = games_lost
            if (score is not None):
                user_score.score = score
            self._session.commit()
        except:
            self._session.rollback()
            raise

        return user_score

    def add_user_score(self, username, games_won = None, games_lost = None, score = None):
        """ Increases one or many of the scores of a given user.
        ---
        Parameters:
            - username: The name of the user whose score is to be modified.
            - games_won: (Optional) If passed, the increment in the number of games this user has won. Use negative values to decrease the value.
            - games_lost: (Optional) If passed, the increment in the number of games this user has lost. Use negative values to decrease the value.
            - score: (Optional) If passed, the increment in the user score. Use negative values to decrease the value.
        Returns:
            The instance of lib.data.db.schema.records.userscore.UserScore corresponding to the given user.
        """
        user_score = None
        try:
            user_score = self.get_user_score(username)
            if (games_won is not None):
                user_score.games_won += games_won
            if (games_lost is not None):
                user_score.games_lost += games_lost
            if (score is not None):
                user_score.score += score
            self._session.commit()
        except:
            self._session.rollback()
            raise

        return user_score

