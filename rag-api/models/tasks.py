from pydantic import BaseModel

class Tasks(BaseModel):
    userId: str
    id: str
    title: str
    completed: str