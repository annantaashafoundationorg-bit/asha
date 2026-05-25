import os
import uuid
import logging
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, String, Integer, Boolean, DateTime, JSON, ForeignKey, Table
)
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

logger = logging.getLogger("database")

POSTGRES_URL = os.getenv("POSTGRES_URL", "postgresql://postgres:postgres@localhost:5432/aasha")

# Fallback to local SQLite if Postgres is unavailable
try:
    # Set a short timeout for Postgres connection check
    engine = create_engine(POSTGRES_URL, connect_args={"connect_timeout": 3} if "postgresql" in POSTGRES_URL else {})
    # Test connection
    with engine.connect() as conn:
        pass
    logger.info("Successfully connected to PostgreSQL database.")
except Exception as e:
    db_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), "data"))
    os.makedirs(db_dir, exist_ok=True)
    sqlite_path = os.path.join(db_dir, "aasha.db")
    sqlite_url_path = sqlite_path.replace("\\", "/")
    POSTGRES_URL = f"sqlite:///{sqlite_url_path}"
    engine = create_engine(POSTGRES_URL)
    logger.warning(f"PostgreSQL connection failed. Falling back to local SQLite at {sqlite_path}. Error: {e}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Helper for compatible array types in SQLite vs PostgreSQL
def get_array_type():
    if "postgresql" in POSTGRES_URL:
        return ARRAY(String)
    else:
        # SQLite fallback: serialize array as JSON
        return JSON

# ORM Models

class Book(Base):
    __tablename__ = "books"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    grade = Column(String)
    subject = Column(String)
    language = Column(String, default="en")
    centre_id = Column(String, default="aasha-centre-01")
    created_at = Column(DateTime, default=datetime.utcnow)

    nodes = relationship("TLNNodeModel", back_populates="book", cascade="all, delete-orphan")


class TLNNodeModel(Base):
    __tablename__ = "tln_nodes"

    node_id = Column(String, primary_key=True)
    book_id = Column(String, ForeignKey("books.id"))
    title = Column(String, nullable=False)
    concept = Column(String, nullable=False)
    grade = Column(String)
    subject = Column(String)
    language = Column(String)
    asset_ids = Column(get_array_type(), default=list)
    memory_tags = Column(get_array_type(), default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    book = relationship("Book", back_populates="nodes")
    vocabulary = relationship("VocabularyTermModel", back_populates="node", cascade="all, delete-orphan")


class LearningSessionModel(Base):
    __tablename__ = "learning_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, nullable=False)
    node_id = Column(String, ForeignKey("tln_nodes.node_id"))
    level = Column(String, default="standard")
    sequence = Column(get_array_type(), default=list)
    completed_at = Column(DateTime, default=datetime.utcnow)


class AssessmentResultModel(Base):
    __tablename__ = "assessment_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, nullable=False)
    node_id = Column(String, ForeignKey("tln_nodes.node_id"))
    score = Column(Integer, nullable=False)
    passed = Column(Boolean, nullable=False)
    weakness_tags = Column(get_array_type(), default=list)
    coins_awarded = Column(Integer, default=0)
    xp_awarded = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class AssetModel(Base):
    __tablename__ = "asset_registry"

    asset_id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    asset_type = Column(String, nullable=False) # svg | lottie | simulation | image | video
    tags = Column(get_array_type(), default=list)
    subject = Column(String)
    source = Column(String, default="reusable") # reusable | generated
    url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


class VerificationRecordModel(Base):
    __tablename__ = "verification_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, nullable=False)
    node_id = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    verified_by = Column(String, default="aasha-assessment-engine")
    verified_at = Column(DateTime, default=datetime.utcnow)


class VocabularyTermModel(Base):
    __tablename__ = "vocabulary_terms"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    node_id = Column(String, ForeignKey("tln_nodes.node_id"))
    term = Column(String, nullable=False)
    definition = Column(String, nullable=False)
    context_sentence = Column(String)
    category = Column(String, default="vocabulary")  # vocabulary | formula | scientific_term
    created_at = Column(DateTime, default=datetime.utcnow)

    node = relationship("TLNNodeModel", back_populates="vocabulary")


# Init database tables helper
def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
