from pydantic import BaseModel
from typing import List, Optional

class KeywordResponse(BaseModel):
    id: int
    keyword: str
    
    # Alias para compatibilidade com frontend que pode usar "name"
    @property
    def name(self):
        return self.keyword

    class Config:
        orm_mode = True
