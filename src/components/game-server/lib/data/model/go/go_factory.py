from lib.data.model.shared.abstract_factory import AbstractFactory
from lib.data.model.go.go_gamemaster import GoGameMaster
from lib.data.model.go.go_board import GoBoard


class GoFactory(AbstractFactory):

    def __init__(self):
        super().__init__()

    def _build(self, size) -> GoGameMaster:
        board = GoBoard(int(size))
        return GoGameMaster(board)

    def _get_default_size(self):
        return 9
