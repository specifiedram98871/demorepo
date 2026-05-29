import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_signup_and_login():
    client = APIClient()

    signup_payload = {
        "username": "demo",
        "email": "demo@example.com",
        "password": "StrongPass123!",
        "role": "developer",
    }
    signup_response = client.post("/api/v1/auth/signup/", signup_payload, format="json")
    assert signup_response.status_code == 201
    assert "tokens" in signup_response.data

    login_response = client.post(
        "/api/v1/auth/login/",
        {"username": "demo", "password": "StrongPass123!"},
        format="json",
    )
    assert login_response.status_code == 200
    assert "access" in login_response.data["tokens"]
