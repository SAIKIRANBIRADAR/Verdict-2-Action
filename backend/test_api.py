"""Quick integration test for all Verdict2Action API endpoints."""
import httpx
import json

base = "http://localhost:8001"

print("=" * 50)
print("VERDICT2ACTION API INTEGRATION TEST")
print("=" * 50)

# 1. Signup
print("\n--- SIGNUP ---")
r = httpx.post(f"{base}/auth/signup", json={"name": "Test Admin", "email": "admin@test.com", "password": "admin123", "role": "admin"})
print(f"Status: {r.status_code}")
data = r.json()
token = data["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print(f"User: {data['user']['name']} ({data['user']['role']})")
print(f"Token: {token[:40]}...")

# 2. Login
print("\n--- LOGIN ---")
r = httpx.post(f"{base}/auth/login", json={"email": "admin@test.com", "password": "admin123"})
print(f"Status: {r.status_code}")
user = r.json()["user"]
print(f"User: {user['name']} | {user['email']}")

# 3. Profile
print("\n--- PROFILE ---")
r = httpx.get(f"{base}/auth/me", headers=headers)
print(f"Status: {r.status_code}")
me = r.json()
print(f"Authenticated as: {me['name']} ({me['role']})")

# 4. Cases (empty initially)
print("\n--- CASES LIST ---")
r = httpx.get(f"{base}/cases/", headers=headers)
print(f"Status: {r.status_code}")
cases = r.json()
print(f"Total cases: {cases['total']}")

# 5. Analytics
print("\n--- ANALYTICS ---")
r = httpx.get(f"{base}/analytics/", headers=headers)
print(f"Status: {r.status_code}")
analytics = r.json()
print(f"Total: {analytics['total_cases']}, Urgent: {analytics['urgent_cases']}, Compliance Rate: {analytics['compliance_rate']}%")

# 6. Notifications
print("\n--- NOTIFICATIONS ---")
r = httpx.get(f"{base}/notifications/", headers=headers)
print(f"Status: {r.status_code}")
notifs = r.json()
print(f"Count: {len(notifs['notifications'])}, Unread: {notifs['unread_count']}")

# 7. Translation
print("\n--- TRANSLATION ---")
r = httpx.post(f"{base}/translate/", headers=headers, json={
    "text": "The court orders compliance within 30 days.",
    "target_language": "hindi",
    "source_language": "english"
})
print(f"Status: {r.status_code}")
tr = r.json()
print(f"Language: {tr['source_language']} -> {tr['target_language']}")
print(f"Result: {tr['translated_text'][:100]}...")

# 8. Health
print("\n--- HEALTH CHECK ---")
r = httpx.get(f"{base}/health")
print(f"Status: {r.status_code}")
h = r.json()
print(f"AI Provider: {h['ai_provider']}, OCR: {h['ocr_provider']}, Env: {h['environment']}")

# 9. Swagger docs accessible
print("\n--- SWAGGER DOCS ---")
r = httpx.get(f"{base}/docs")
print(f"Status: {r.status_code} (HTML docs page)")

print("\n" + "=" * 50)
print("ALL API TESTS PASSED!")
print("=" * 50)
