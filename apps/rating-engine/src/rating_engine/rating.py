"""
OpenSkill rating configuration and calculations.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class RatingConfig:
    """Configuration for rating calculations."""

    mu: float = 25.0
    sigma: float = 8.333
    beta: float = 4.167
    tau: float = 0.0833
    confidence_factor: float = 2.0

    # Mahjong-specific settings
    oka: int = 20000
    uma: Optional[list[int]] = None
    weight_divisor: int = 40
    weight_min: float = 0.5
    weight_max: float = 1.5

    def __post_init__(self) -> None:
        if self.uma is None:
            self.uma = [15000, 5000, -5000, -15000]


# Phase 0 fixed configuration
PHASE_0_CONFIG = RatingConfig()


def calculate_display_rating(mu: float, sigma: float, config: RatingConfig) -> float:
    """Calculate conservative display rating: μ - 2σ"""
    return mu - config.confidence_factor * sigma


def calculate_weight_scale(plus_minus: int, config: RatingConfig) -> float:
    """Calculate margin-of-victory weight scaling."""
    weight = 1 + plus_minus / config.weight_divisor
    return max(config.weight_min, min(config.weight_max, weight))


def calculate_plus_minus(
    final_score: int, finish_position: int, config: RatingConfig
) -> int:
    """Calculate plus-minus from final score and position."""
    if config.uma is None:
        raise ValueError("Uma configuration is required for plus-minus calculation")
    uma_bonus = config.uma[finish_position - 1]  # 1st=0, 2nd=1, etc.
    return final_score - config.oka + uma_bonus
