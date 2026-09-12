from typing import Literal

from pydantic import BaseModel


class ExperimentConfig(BaseModel):
    task: Literal["classification", "regression"]
    target: str
    objective: str