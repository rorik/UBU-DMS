class RecordSet:
    """ A base recordset class.
    ---
    This class serves as a base for the various recordsets of the model.

    Recordsets are actually facades masking several operations and queries on the 
    database related to sets of specific model entities.
    """

    def __init__(self, session):
        """ Constructor method.
        ---
        Parameters:
            - session: An sqlalchemy.orm.session.Session instance to be used for the operations of the recordset.
        """
        if (session is None):
            raise "A session is needed to create a RecordSet"
        self._session = session

    def __del__(self):
        """ Destructor method.
        ---
        This method will release (close) the session used internally by the recordset, 
        so it is important to not use any records returned by the recordset once the 
        recordset is deleted (most likely because it lost its scope), because, due to 
        the lazy initialization (proxy pattern) the session may be already closed by 
        the time the record data is attempted to be retrieved.
        """
        if (self._session is not None):
            self._session.close()
