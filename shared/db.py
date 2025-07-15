from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from shared.models import Base


def get_engine(nombre_db: str):
    return create_engine(f"sqlite:///{nombre_db}", connect_args={"check_same_thread": False})


def get_session(engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db(engine):
    Base.metadata.create_all(bind=engine)
