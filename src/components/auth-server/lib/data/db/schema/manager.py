from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

class Manager:
    """ Monostate class to manage the global schema operations and objects.
    ---
    This class serves as a global management point of the schema.
    """

    __DeclarativeBase = declarative_base()
    __CreateEngine = create_engine('sqlite:////tmp/data/database.db')
    __SessionMaker = sessionmaker(bind = __CreateEngine)

    @classmethod
    def declarative_base(self):
        """ Returns the declarative base class every entity must derive from.
        ---
        Returns:
            The declarative base class used to map the entities of the model. 
            See sqlalchemy.ext.declarative.declarative_base
        """

        return self.__DeclarativeBase

    @classmethod
    def create_schema(self):
        """ Creates the schema with the information gathered by the declarative base class.
        ---
        Returns:
            The result of the schema creation (nothing)
        """

        from lib.data.db.schema.records.user import User
        from lib.data.db.schema.records.usersession import UserSession
        from lib.data.db.schema.records.userscore import UserScore
        return self.__DeclarativeBase.metadata.create_all(self.__CreateEngine)

    @classmethod
    def session(self):
        """ Returns a new session.
        ---
        Returns:
            A new sqlalchemy.orm.session.Session instance.
        """

        return self.__SessionMaker()
