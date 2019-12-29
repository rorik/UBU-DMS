from lib.data.model.shared.cell import Cell
from lib.data.model.shared.player import Player
from typing import List


class RoundAction(object):
    updates: List[dict] = []
    def __init__(self, cell: Cell, player: Player, round: int, updates: List[Cell] = None):
        self.cell = cell.serialize()
        self.player = player
        self.round = round
        self.set_updates(updates if updates is not None else [])
    
    def set_updates(self, updates: List[Cell]):
        self.updates = [cell.serialize() for cell in updates]
        self.updates.append(self.cell)
    
    def serialize(self):
        return {
            'cell': self.cell,
            'player': self.player.username,
            'round': self.round,
            'updates': self.updates
        }