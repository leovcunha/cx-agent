from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class MessageEvaluation(BaseModel):
    id: str
    message_id: str
    tenant_id: str
    sop_adherence_score: int
    policy_violations: List[str]
    tone_pass: bool
    hallucination_flag: bool
    created_at: datetime

class EvaluationResult(BaseModel):
    sop_adherence_score: int = Field(..., ge=0, le=100, description="Score from 0 to 100 on how well the agent adhered to the retrieved SOPs.")
    policy_violations: List[str] = Field(..., description="List of specific policy violations, or an empty list if none.")
    tone_pass: bool = Field(..., description="True if the agent followed the tone guidelines for the brand, False otherwise.")
    hallucination_flag: bool = Field(..., description="True if the agent invented policies not in the SOP, False otherwise.")

class AggregateComplianceStats(BaseModel):
    tenant_id: str
    total_evaluations: int
    average_sop_adherence: float
    total_policy_violations: int
    total_tone_failures: int
    total_hallucinations: int
