from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db import get_session
from app.models.listing_plot import PlotListing
from app.auth import require_admin
from app.models.admin import AdminUser

router = APIRouter(prefix="/api/listings/plots", tags=["Listings (Plots)"])

@router.post("", response_model=PlotListing)
def create_listing(listing: PlotListing, session: Session = Depends(get_session)):
    session.add(listing)
    session.commit()
    session.refresh(listing)
    return listing

@router.get("", response_model=List[PlotListing])
def list_listings(session: Session = Depends(get_session)):
    stmt = select(PlotListing).where(PlotListing.is_active == True).order_by(PlotListing.is_verified.desc(), PlotListing.created_at.desc())
    return session.exec(stmt).all()

@router.get("/{listing_id}", response_model=PlotListing)
def get_listing(listing_id: int, session: Session = Depends(get_session)):
    listing = session.get(PlotListing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.patch("/{listing_id}", response_model=PlotListing)
def update_listing(listing_id: int, data: PlotListing, admin: AdminUser = Depends(require_admin), session: Session = Depends(get_session)):
    listing = session.get(PlotListing, listing_id)
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
def delete_listing(listing_id: int, admin: AdminUser = Depends(require_admin), session: Session = Depends(get_session)):
    listing = session.get(PlotListing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing.is_active = False
    session.add(listing)
    session.commit()
    return {"status": "ok"}