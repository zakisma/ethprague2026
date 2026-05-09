from enum import Enum
from typing import Type

class ProjectStatus(str, Enum):
    submitted = "submitted"
    approved_for_market = "approved_for_market"
    rejected = "rejected"
    in_progress = "in_progress"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"

def enum_values(enum_class: Type[Enum]) -> list[str]:
    return [str(item.value) for item in enum_class]
