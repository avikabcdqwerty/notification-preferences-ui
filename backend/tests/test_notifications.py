import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.main import app
from backend.models import Base, NotificationType
from backend.middleware.auth import JWT_SECRET, JWT_ALGORITHM
import jwt

# Setup test database (SQLite in-memory for speed)
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override get_db dependency for tests
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides = getattr(app, "dependency_overrides", {})
app.dependency_overrides["backend.routes.dependencies.get_db"] = override_get_db

client = TestClient(app)

def create_jwt_token(user_id: int = 1, username: str = "testuser") -> str:
    payload = {
        "sub": str(user_id),
        "username": username,
        "exp": 9999999999  # Far future for test
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    # Insert test notification types
    db = TestingSessionLocal()
    db.add_all([
        NotificationType(
            key="email_alert",
            descriptions={"en": "Email alerts", "fr": "Alertes par email"},
            available=True,
            deprecated=False
        ),
        NotificationType(
            key="sms_alert",
            descriptions={"en": "SMS alerts", "fr": "Alertes SMS"},
            available=True,
            deprecated=True,
            deprecated_reason="Replaced by push notifications"
        ),
        NotificationType(
            key="push_alert",
            descriptions={"en": "Push notifications", "fr": "Notifications push"},
            available=True,
            deprecated=False
        ),
        NotificationType(
            key="legacy_alert",
            descriptions={"en": "Legacy alerts", "fr": "Alertes héritées"},
            available=False,
            deprecated=True,
            deprecated_reason="Deprecated and unavailable"
        ),
    ])
    db.commit()
    db.close()
    yield
    # Drop tables after tests
    Base.metadata.drop_all(bind=engine)

def test_unauthenticated_access_denied():
    response = client.get("/api/notifications/")
    assert response.status_code == 401
    assert "Authentication required" in response.json()["detail"]

def test_authenticated_access_success():
    token = create_jwt_token()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/notifications/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "notification_types" in data
    # Only available types should be listed
    keys = [nt["key"] for nt in data["notification_types"]]
    assert "legacy_alert" not in keys
    assert set(keys) == {"email_alert", "sms_alert", "push_alert"}

def test_deprecated_type_marked():
    token = create_jwt_token()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/notifications/", headers=headers)
    data = response.json()
    sms_alert = next((nt for nt in data["notification_types"] if nt["key"] == "sms_alert"), None)
    assert sms_alert is not None
    assert sms_alert["deprecated"] is True
    assert sms_alert["deprecated_reason"] == "Replaced by push notifications"

def test_localization_descriptions():
    token = create_jwt_token()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/notifications/?lang=fr", headers=headers)
    data = response.json()
    for nt in data["notification_types"]:
        assert "fr" in nt["descriptions"]
        assert isinstance(nt["descriptions"]["fr"], str)

def test_error_handling_db_failure(monkeypatch):
    # Simulate DB error
    def broken_get_db():
        raise Exception("DB connection failed")
    app.dependency_overrides["backend.routes.dependencies.get_db"] = broken_get_db
    token = create_jwt_token()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/notifications/", headers=headers)
    assert response.status_code == 500
    assert "Failed to fetch notification types" in response.json()["detail"]
    # Restore dependency
    app.dependency_overrides["backend.routes.dependencies.get_db"] = override_get_db

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

# Exported: pytest tests for notification API endpoints