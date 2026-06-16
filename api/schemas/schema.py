from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

class User(BaseModel):
    id: Optional[str] = None
    business_id: Optional[str] = None
    first_name: str
    phone: str
    language: str = "pt"
class Audio(BaseModel):
    id: str
    mime_type: str

class Change(BaseModel):
    value: dict
    field: str

class Message(BaseModel):
    from_: str = Field(..., alias='from')
    id: str
    text: Optional[dict] = None
    type: str
    timestamp: str
    audio: Optional[Audio] = None

class Metadata(BaseModel):
    display_phone_number: str
    phone_number_id: str

class Value(BaseModel):
    messaging_product: str
    metadata: Metadata
    messages: Optional[List[Message]] = None

class Entry(BaseModel):
    id: str
    changes: List[Change]

class Payload(BaseModel):
    object: str
    entry: List[Entry]

class WebChatMessage(BaseModel):
    client_id: str
    chat_id: str
    message: str


class StatusOkResponse(BaseModel):
    status: str


class MessagesRequest(BaseModel):
    clientId: str


class MessagesResponse(BaseModel):
    messages: List[Dict[str, Any]]


class ChatResponse(BaseModel):
    response: str
