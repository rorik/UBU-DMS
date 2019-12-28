
class Player(object):
    def __init__(self, username, client_id):
        self.username: str = username
        self.client_id: str = client_id
        self.last_action: dict = None

    def serialize(self) -> dict:
        return {
            'username': self.username,
            'lastAction': self.last_action
        }
