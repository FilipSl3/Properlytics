from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field

class PlotListing(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    
    title: str
    description: str = ""
    price_offer: float
    phone_number: str = ""
    photos_url: str = ""
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    is_verified: bool = False
    
    city: str
    district: str = ""
    province: str

    
    area: float            
    plot_type: str          
    
    
    has_electricity: int = 0
    has_water: int = 0
    has_gas: int = 0
    has_sewage: int = 0
    
    access_road: str = ""   
    is_fenced: int = 0     