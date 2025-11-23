from pydantic import BaseModel
from typing import List, Optional

class KeywordResponse(BaseModel):
    id: int
    keyword: str

    class Config:
        orm_mode = True
