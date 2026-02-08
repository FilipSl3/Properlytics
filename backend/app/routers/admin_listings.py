from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, delete

from app.db import get_session
from app.auth import require_admin
from app.models.admin import AdminUser

router = APIRouter(prefix="/admin/listings", tags=["Admin Listings"])

LISTING_MODELS = {
    "flat": "app.models.listing_flat.FlatListing",
    "house": "app.models.listing_house.HouseListing",
    "plot": "app.models.listing_plot.PlotListing",
}

def get_model_class(type_name: str):
    from importlib import import_module
    if type_name not in LISTING_MODELS:
        raise HTTPException(status_code=400, detail=f"Invalid listing type: {type_name}")
    module_path, class_name = LISTING_MODELS[type_name].rsplit(".", 1)
    module = import_module(module_path)
    return getattr(module, class_name)


@router.get("")
def list_listings(
    type: str = Query(default="all", description="Filter by type: flat, house, plot, or all"),
    status: Optional[str] = Query(default=None, description="Filter by status: active, inactive"),
    is_verified: Optional[bool] = Query(default=None, description="Filter by verification status"),
    admin: AdminUser = Depends(require_admin),
    session: Session = Depends(get_session),
):
    results = []

    types_to_query = ["flat", "house", "plot"] if type == "all" else [type]

    for t in types_to_query:
        model_class = get_model_class(t)
        stmt = select(model_class)

        if status == "active":
            stmt = stmt.where(model_class.is_active == True)
        elif status == "inactive":
            stmt = stmt.where(model_class.is_active == False)

        if is_verified is not None:
            stmt = stmt.where(model_class.is_verified == is_verified)

        items = session.exec(stmt).all()
        for item in items:
            results.append({
                "id": item.id,
                "type": t,
                "title": item.title,
                "price": item.price_offer,
                "city": item.city,
                "is_verified": item.is_verified,
                "is_active": item.is_active,
                "created_at": item.created_at.isoformat() if item.created_at else None,
            })

    return results


@router.get("/{type}/{listing_id}")
def get_listing(
    type: str,
    listing_id: int,
    admin: AdminUser = Depends(require_admin),
    session: Session = Depends(get_session),
):
    model_class = get_model_class(type)
    item = session.get(model_class, listing_id)
    if not item:
        raise HTTPException(status_code=404, detail="Listing not found")
    return item


@router.patch("/{type}/{listing_id}/verify")
def toggle_verify(
    type: str,
    listing_id: int,
    admin: AdminUser = Depends(require_admin),
    session: Session = Depends(get_session),
):
    model_class = get_model_class(type)
    item = session.get(model_class, listing_id)
    if not item:
        raise HTTPException(status_code=404, detail="Listing not found")

    item.is_verified = not item.is_verified
    session.add(item)
    session.commit()
    session.refresh(item)
    return {"status": "ok", "is_verified": item.is_verified}


@router.patch("/{type}/{listing_id}/deactivate")
def toggle_deactivate(
    type: str,
    listing_id: int,
    admin: AdminUser = Depends(require_admin),
    session: Session = Depends(get_session),
):
    model_class = get_model_class(type)
    item = session.get(model_class, listing_id)
    if not item:
        raise HTTPException(status_code=404, detail="Listing not found")

    item.is_active = not item.is_active
    session.add(item)
    session.commit()
    session.refresh(item)
    return {"status": "ok", "is_active": item.is_active}


@router.delete("/{type}/{listing_id}")
def delete_listing(
    type: str,
    listing_id: int,
    admin: AdminUser = Depends(require_admin),
    session: Session = Depends(get_session),
):
    model_class = get_model_class(type)
    item = session.get(model_class, listing_id)
    if not item:
        raise HTTPException(status_code=404, detail="Listing not found")

    session.delete(item)
    session.commit()
    return {"status": "deleted"}


@router.patch("/{type}/{listing_id}")
def update_listing(
    type: str,
    listing_id: int,
    data: dict,
    admin: AdminUser = Depends(require_admin),
    session: Session = Depends(get_session),
):
    model_class = get_model_class(type)
    item = session.get(model_class, listing_id)
    if not item:
        raise HTTPException(status_code=404, detail="Listing not found")

    allowed_fields = {"title", "description", "price_offer", "phone_number", "photos_url", "is_verified", "is_active"}
    update_data = {k: v for k, v in data.items() if k in allowed_fields}

    for k, v in update_data.items():
        setattr(item, k, v)

    session.add(item)
    session.commit()
    session.refresh(item)
    return item
