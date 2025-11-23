from pydantic import BaseModel

class EventCreate(BaseModel):
    name: str
    code: str


class EventResponse(BaseModel):
    id: int
    name: str
    code: str

    class Config:
        orm_mode = True
