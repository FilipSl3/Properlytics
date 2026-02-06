from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db import get_session
from app.models.listing_flat import FlatListing

router = APIRouter(prefix="/api/listings/flats", tags=["Listings (Flats)"])

@router.post("", response_model=FlatListing)
def create_listing(listing: FlatListing, session: Session = Depends(get_session)):
    session.add(listing)
    session.commit()
    session.refresh(listing)
    return listing

@router.get("", response_model=List[FlatListing])
def list_listings(session: Session = Depends(get_session)):
    stmt = select(FlatListing).where(FlatListing.is_active == True)
    return session.exec(stmt).all()

@router.get("/{listing_id}", response_model=FlatListing)
def get_listing(listing_id: int, session: Session = Depends(get_session)):
    listing = session.get(FlatListing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.patch("/{listing_id}", response_model=FlatListing)
def update_listing(listing_id: int, data: FlatListing, session: Session = Depends(get_session)):
    listing = session.get(FlatListing, listing_id)
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
    listing = session.get(FlatListing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing.is_active = False
    session.add(listing)
    session.commit()
    return {"status": "ok"}
