from pydantic import BaseModel, Field

class HouseInput(BaseModel):
    area_house: float = Field(..., gt=0)    # m2 domu
    area_plot: float = Field(..., gt=0)     # m2 działki
    rooms: int = Field(..., ge=0)
    floors: int = Field(..., ge=0)
    year_built: int = Field(..., ge=1800, le=2025)
    garage: int = Field(..., ge=0, le=1)
    basement: int = Field(..., ge=0, le=1)
    sewage: int = Field(..., ge=0, le=1)
