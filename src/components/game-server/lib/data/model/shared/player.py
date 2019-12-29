
class Player(object):
    color: int = 0
    round_actions = []
    def __init__(self, username, client_id):
        self.username: str = username
        self.client_id: str = client_id

    def serialize(self) -> dict:
        return {
            'username': self.username,
            'color': self.color
        }
