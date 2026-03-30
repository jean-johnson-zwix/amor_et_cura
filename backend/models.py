from pydantic import BaseModel

class EmbedRequest(BaseModel):
    text: str

class ClientSummaryRequest(BaseModel):
    client_id: str