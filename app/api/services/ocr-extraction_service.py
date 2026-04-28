# from fastapi import HTTPException
# from sqlalchemy.orm import Session

# from db.base import Base
# from db.session import SessionLocal, engine
# from models.assets import Contact
# from schemas.schema import CreateContact, FullContact


# def _add_tables():
#     return Base.metadata.create_all(bind=engine)


# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# async def create_contact_service(contact: CreateContact, db: Session):
#     db_contact = Contact(**contact.model_dump())
#     db.add(db_contact)
#     db.commit()
#     db.refresh(db_contact)
#     return db_contact


# async def get__all_contacts_service(db: Session):
#     contacts = db.query(Contact).all()
#     return list(map(FullContact.model_validate, contacts))


# async def get_contact_service(contact_id: int, db: Session):
#     contact = db.query(Contact).filter(Contact.id == contact_id).first()
#     if contact is None:
#         raise HTTPException(status_code=404, detail="Contact not found")
#     return contact  # or FullContact.model_validate(contact) if you want to return a Pydantic model


# async def delete_contact_service(contact_id: int, db: Session):
#     contact = await get_contact_service(contact_id, db)
#     db.delete(contact)
#     db.commit()


# async def update_contact_service(
#     contact_id: int, contact_data: CreateContact, db: Session
# ) -> FullContact:
#     contact: Contact = await get_contact_service(contact_id, db)
#     for key, value in contact_data.model_dump().items():
#         setattr(contact, key, value)
#     db.commit()
#     db.refresh(contact)
#     return FullContact.model_validate(contact)
