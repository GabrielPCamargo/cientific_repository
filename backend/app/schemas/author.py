from pydantic import BaseModel
from typing import List, Optional

class AuthorResponse(BaseModel):
    id: int
    name: str
    email: Optional[str]

    class Config:
        orm_mode = True
