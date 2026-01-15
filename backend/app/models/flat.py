from pydantic import BaseModel
from pydantic.types import confloat, conint, constr
from typing import Literal
class FlatInput(BaseModel):
    area: confloat(gt=0)  # większe od 0
    rooms: conint(gt=0)
    floor: conint(ge=0)
    totalFloors: conint(ge=0)
    year: conint(ge=1800, le=2100)

    buildType: Literal['block', 'tenement', 'apartment', 'house']
    material: Literal['brick', 'concrete_plate', 'concrete', 'silikat', 'breezeblock']
    heating: Literal['district', 'gas', 'electric', 'boiler']
    market: Literal['primary', 'secondary']
    constructionStatus: Literal['ready_to_use', 'to_completion', 'to_renovation']

    hasLift: conint(ge=0, le=1)  # 0 lub 1
    hasOutdoor: conint(ge=0, le=1)
    hasParking: conint(ge=0, le=1)

    city: constr(min_length=1)
    district: constr(min_length=0) = ''
    province: constr(min_length=1)