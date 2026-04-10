from sqlmodel import Session, SQLModel, create_engine
from typing import Generator
from urllib.parse import quote_plus

pasword_mentah =  "ksrtdsk##$"
passwors_matang = quote_plus(pasword_mentah)
URL_DATABASE= f"postgresql://postgres:{passwors_matang}@localhost:5432/my_marketplace"
engine = create_engine(URL_DATABASE , echo=True)

def create_dataBase_tables():
    SQLModel.metadata.create_all(engine)

def get_sesion() -> Generator[Session,None,None]:
    with Session(engine) as session:
        yield session




# from sqlmodel import create_engine, Session , SQLModel 
# from typing import Generator
# from urllib.parse import quote_plus

# raw_password = "ksrtdsk##$"
# kata_sandi = quote_plus(raw_password)

# DATABASE_URL = f"postgresql://postgres:{kata_sandi}@localhost:5432/my_marketplace"

# engine = create_engine(DATABASE_URL, echo=True)

# def creat_db_tables():
#     SQLModel.metadata.create_all(engine)


# def get_sesion() -> Generator[Session,None,None]:
#     with Session(engine) as session:
#         yield session
