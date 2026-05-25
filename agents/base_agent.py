"""
AASHA AI TEAS — Base agent
All agents extend BaseAgent and receive an AgentContext.
"""

from dataclasses import dataclass, field
from typing import Any, Dict


@dataclass
class AgentContext:
    task: str
    inputs: Dict[str, Any] = field(default_factory=dict)
    memory: Dict[str, Any] = field(default_factory=dict)
    language: str = "en"
    grade: str = None
    subject: str = None


class BaseAgent:
    name = "base-agent"
    description = "Base class for all AASHA AI agents."

    def run(self, ctx: AgentContext) -> Dict[str, Any]:
        raise NotImplementedError(f"{self.name} must implement run()")

    def __repr__(self):
        return f"<AashaAgent name={self.name}>"
