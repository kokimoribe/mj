"""
Riichi Mahjong Rating Engine Package

OpenSkill-based rating calculations for mahjong games.
"""

__version__ = "0.1.0"

from .materialization import MaterializationEngine, materialize_data_for_config

__all__ = ["MaterializationEngine", "materialize_data_for_config"]
