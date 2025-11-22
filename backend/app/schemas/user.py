from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    password: str
    email: EmailStr
    course_id: int
    

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        # Define um JSON Schema de exemplo para a documentação (docs)
        json_schema_extra = {
            "example": {
                "name": "Jane Doe",
                "password": "uma_senha_forte",
                "email": "jane.doe@example.com",
                "course_id": 1
            }
        }
