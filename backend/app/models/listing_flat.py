from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class FlatListing(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    title: str
    description: str = ""
    price_offer: float
    phone_number: str = ""
    photos_url: str = ""

    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    is_verified: bool = False
    sold_price: Optional[float] = None
    area: float
    rooms: int
    floor: int
    totalFloors: int
    year: int

    buildType: str
    material: str
    heating: str
    market: str
    constructionStatus: str

    hasLift: int
    hasOutdoor: int
    hasParking: int

    city: str
    district: str = ""
    province: str
