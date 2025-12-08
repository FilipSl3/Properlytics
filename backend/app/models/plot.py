from pydantic import BaseModel, Field

class PlotInput(BaseModel):
    area: float = Field(..., gt=0)
    fence: int = Field(..., ge=0, le=1)
    sewage: int = Field(..., ge=0, le=1)
    electricity: int = Field(..., ge=0, le=1)
    water: int = Field(..., ge=0, le=1)
    gas: int = Field(..., ge=0, le=1)