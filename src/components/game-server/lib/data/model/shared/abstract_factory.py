from lib.data.model.shared.abstract_gamemaster import AbstractGameMaster


class AbstractFactory(object):

    def __init__(self):
        self.board_size = self._get_default_size()

    def build(self) -> AbstractGameMaster:
        if self.board_size is None:
            self.board_size = self._get_default_size()
        return self._build(self.board_size)

    def _build(self, size) -> AbstractGameMaster:
        raise NotImplementedError()

    def _get_default_size(self):
        raise NotImplementedError()
