class PlotInput(BaseModel):
    area: confloat(gt=0)

    type: Literal['building', 'agricultural', 'recreational', 'investment', 'forest', 'habitat']
    locationType: Literal['city', 'suburban', 'country']

    hasElectricity: conint(ge=0, le=1)
    hasWater: conint(ge=0, le=1)
    hasGas: conint(ge=0, le=1)
    hasSewerage: conint(ge=0, le=1)
    isHardAccess: conint(ge=0, le=1)
    hasFence: conint(ge=0, le=1)

    city: constr(min_length=1)
    province: constr(min_length=1)