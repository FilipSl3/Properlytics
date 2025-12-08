from pydantic import BaseModel, Field

class FlatInput(BaseModel):
    area: float = Field(..., gt=0)
    rooms: int = Field(..., ge=0)
    floor: int = Field(..., ge=0)
    building_floors: int = Field(..., ge=0)
    year_built: int = Field(..., ge=1800, le=2025)
    elevator: int = Field(..., ge=0, le=1)
    balcony: int = Field(..., ge=0, le=1)
    parking: int = Field(..., ge=0, le=1)