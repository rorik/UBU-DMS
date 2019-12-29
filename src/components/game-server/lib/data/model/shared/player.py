
class Player(object):
    def __init__(self, username, client_id):
        self.color: int = 0
        self.round_actions = []
        self.username: str = username
        self.client_id: str = client_id

    def serialize(self) -> dict:
        return {
            'username': self.username,
            'color': self.color
        }
