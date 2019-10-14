from lib.data.db.schema.recordsets.recordset import RecordSet
from lib.data.db.schema.records.usersession import UserSession
from sqlalchemy.orm.exc import NoResultFound
import uuid

class UserSessions(RecordSet):
    """ A recordset of persisted user sessions.
    ---
    This class facades several operations and queries on the user session records.
    """

    def __init__(self, session):
        """ Constructor method.
        ---
        Parameters:
            - session: An sqlalchemy.orm.session.Session instance to be used for the operations of the recordset.
        """
        super().__init__(session)

    def create(self, username, token = None):
        """ Creates a new user session.
        ---
        Parameters:
            - username: The name of the user session to be created. See lib.data.db.schema.records.user.User.__init__ for details on the restrictions.
            - token: (Optional) The token for the session to be created. If none is passed, a new token will be generated internally. A string of 36 characters at most.
        Returns:
            The instance of the newly created lib.data.db.schema.records.usersession.UserSession
        """
        try:
            if (token is None):
                token = str(uuid.uuid4())
            new_user_session = UserSession(username, token)
            self._session.add(new_user_session)
            self._session.commit()
        except:
            self._session.rollback()
            raise
        return new_user_session

    def get_session(self, token) -> UserSession:
        """ Gets a session given its token.
        ---
        Parameters:
            - token: The token to identify the session.
        Returns:
            The instance of lib.data.db.schema.records.usersession.UserSession if given session exists.
        """
        try:
            query = self._session.query(UserSession).filter(UserSession.token == token)
            return query.one()
        except:
            raise

        return None

    def token_is_valid(self, token, username = None):
        """ Tests the validity of a token.
        ---
        Parameters:
            - token: The token to check.
            - username: (Optional) The name of the user. If passed, both the token and the username must match.
        Returns:
            True if the token is correct. False when the given token is not in the database.
        """
        try:
            query = self._session.query(UserSession).filter(UserSession.token == token)
            if (username is not None):
                query = query.filter(UserSession.username == username)
            query.one()
        except NoResultFound:
            return False
        except:
            raise

        return True
