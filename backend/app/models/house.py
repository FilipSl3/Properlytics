from pydantic import BaseModel
from pydantic.types import confloat, conint, constr
from typing import Literal
class HouseInput(BaseModel):
    areaHouse: confloat(gt=0)
    areaPlot: confloat(gt=0)
    rooms: conint(gt=0)
    floors: conint(ge=0)
    year: conint(ge=1800, le=2100)

    buildType: Literal['detached', 'semi_detached', 'ribbon', 'manor']
    constructionStatus: Literal['ready_to_use', 'to_completion', 'to_renovation', 'unfinished_close']
    market: Literal['primary', 'secondary']
    material: Literal['brick', 'wood', 'breezeblock', 'concrete', 'silikat']
    roofType: Literal['diagonal', 'flat', 'undulating']

    hasGarage: conint(ge=0, le=1)
    hasBasement: conint(ge=0, le=1)
    hasGas: conint(ge=0, le=1)
    hasSewerage: conint(ge=0, le=1)
    isHardAccess: conint(ge=0, le=1)

    fenceType: Literal['wire', 'metal', 'brick', 'wood', 'concrete', 'mixed', 'hedge', ''] = ''
    heatingType: constr(min_length=0) = ''

    city: constr(min_length=1)
    province: constr(min_length=1)