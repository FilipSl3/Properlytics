from pydantic import BaseModel
from pydantic.types import confloat, conint, constr
from typing import Literal
class PlotInput(BaseModel):
    area: confloat(gt=0)

    type: Literal['building', 'agricultural', 'agricultural_building', 'recreational', 'commercial', 'woodland', 'habitat']
    locationType: Literal['city', 'suburban', 'country']

    hasElectricity: conint(ge=0, le=1)
    hasWater: conint(ge=0, le=1)
    hasGas: conint(ge=0, le=1)
    hasSewerage: conint(ge=0, le=1)
    isHardAccess: conint(ge=0, le=1)
    hasFence: conint(ge=0, le=1)

    city: constr(min_length=1)
    province: constr(min_length=1)