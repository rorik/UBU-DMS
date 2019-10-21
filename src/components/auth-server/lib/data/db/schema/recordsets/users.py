from lib.data.db.schema.recordsets.recordset import RecordSet
from lib.data.db.schema.records.user import User
from sqlalchemy.orm.exc import NoResultFound
import hashlib

class Users(RecordSet):
    """ A recordset of persisted users.
    ---
    This class facades several operations and queries on the user records.
    """

    def __init__(self, session):
        """ Constructor method.
        ---
        Parameters:
            - session: An sqlalchemy.orm.session.Session instance to be used for the operations of the recordset.
        """
        super().__init__(session)

    def create(self, username, password):
        """ Creates a new user.
        ---
        Parameters:
            - username: The name of the user to be created. See lib.data.db.schema.records.user.User.__init__ for details on the restrictions.
            - password: The password of the user to be created. Will be hashed internally.
        Returns:
            The instance of the newly created lib.data.db.schema.records.user.User
        """
        try:
            new_user = User(username, self._password_hash(password))
            self._session.add(new_user)
            self._session.commit()
        except:
            self._session.rollback()
            raise
        return new_user

    def user_is_valid(self, username, password):
        """ Tests the validity of a set of user credentials.
        ---
        Parameters:
            - username: The name of the user.
            - password: The user password.
        Returns:
            True if the credentials are correct. False when the given credentials are not in the database.
        """
        try:
            query = self._session.query(User).filter(User.username == username).filter(User.password == self._password_hash(password))
            query.one()
        except NoResultFound:
            return False
        except:
            raise

        return True

    def list_all_users(self):
        """ Retrieves all the users in the registry.
        ---
        Returns:
            A list of lib.data.db.schema.records.user.User entities in the database.
        """
        try:
            query = self._session.query(User)
            return query.all()
        except:
            raise
    
    def username_exists(self, username):
        """ Retrieves all the users in the registry.
        ---
        Returns:
            A list of lib.data.db.schema.records.user.User entities in the database.
        """
        try:
            query = self._session.query(User).filter(User.username == username).count()
            return query == 1
        except:
            return False

    @classmethod
    def _password_hash(cls, password):
        """ The password hashing method.
        ---
        Parameters:
            - password: The password to hash.
        Returns:
            A 64 hex characters string with the password hash.
        """
        return hashlib.sha256(bytes(password, 'utf-8')).hexdigest()
