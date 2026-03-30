from pydantic import BaseModel
from typing import Optional

class EmbedRequest(BaseModel):
    text: str

class ClientSummaryRequest(BaseModel):
    client_id: str

class FunderReportRequest(BaseModel):
    start_date: str   # YYYY-MM-DD
    end_date: str     # YYYY-MM-DD
    program_filter: Optional[str] = None  # service type name, or None for all