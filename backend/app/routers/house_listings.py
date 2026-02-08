from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db import get_session
from app.models.listing_house import HouseListing

router = APIRouter(prefix="/api/listings/houses", tags=["Listings (Houses)"])

@router.post("", response_model=HouseListing)
def create_listing(listing: HouseListing, session: Session = Depends(get_session)):
    session.add(listing)
    session.commit()
    session.refresh(listing)
    return listing

@router.get("", response_model=List[HouseListing])
def list_listings(session: Session = Depends(get_session)):
    stmt = select(HouseListing).where(HouseListing.is_active == True)
    return session.exec(stmt).all()

@router.get("/{listing_id}", response_model=HouseListing)
def get_listing(listing_id: int, session: Session = Depends(get_session)):
    listing = session.get(HouseListing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.patch("/{listing_id}", response_model=HouseListing)
def update_listing(listing_id: int, data: HouseListing, session: Session = Depends(get_session)):
    listing = session.get(HouseListing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    
    update_data = data.dict(exclude_unset=True) 
    for k, v in update_data.items():
        setattr(listing, k, v)

    session.add(listing)
    session.commit()
    session.refresh(listing)
    return listing

@router.delete("/{listing_id}")
def delete_listing(listing_id: int, session: Session = Depends(get_session)):
    listing = session.get(HouseListing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing.is_active = False 
    session.add(listing)
    session.commit()
    return {"status": "ok"}