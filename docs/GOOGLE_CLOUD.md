# Google Cloud Integration Plan

## Required Services

- Firebase Authentication
- Firebase Firestore
- Firebase Cloud Messaging
- Firebase Hosting
- Google Cloud Run
- Google Cloud Storage
- Gemini API
- Vertex AI
- Google Maps Platform
- Google Cloud Vision API
- Google Analytics

## Setup Checklist

1. Create a Google Cloud project.
2. Create or link Firebase project.
3. Enable Authentication with Google provider and MFA.
4. Enable Firestore Native Mode.
5. Enable Cloud Storage for Firebase.
6. Enable Firebase Cloud Messaging and Analytics.
7. Enable Cloud Run, Artifact Registry, Cloud Build, Vision API, Maps Platform, and Vertex AI.
8. Add API keys and service credentials to Secret Manager.
9. Configure `.env` locally from `.env.example`.
10. Deploy with Cloud Build and Firebase CLI.

## Cloud Run Services

- `ecotrack-api`: Express API and Google Cloud orchestration.
- `carbon-core`: Rust calculation and scenario simulation service.

## Observability

- Cloud Logging for API and Rust service logs.
- Error Reporting for exceptions.
- Cloud Trace for request latency.
- Google Analytics for product funnels.
- Firestore audit logs for sensitive operations.
