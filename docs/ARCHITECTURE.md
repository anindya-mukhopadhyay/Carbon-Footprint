# Architecture

EcoTrack AI uses a polyglot, cloud-native architecture optimized for demo velocity and production readiness.

## System Architecture

```mermaid
flowchart TD
  Browser["Accessible React/Vite Client"] --> FirebaseAuth["Firebase Authentication"]
  Browser --> API["Express API"]
  Browser --> Analytics["Google Analytics"]
  Browser --> FCM["Firebase Cloud Messaging"]
  API --> Firestore["Firestore"]
  API --> Storage["Cloud Storage"]
  API --> Gemini["Gemini API"]
  API --> Vertex["Vertex AI"]
  API --> Vision["Vision API"]
  API --> Maps["Google Maps Platform"]
  API --> Core["Rust Carbon Core"]
  Core --> Model["Emission Factors + Scenarios"]
```

## Deployment Architecture

```mermaid
flowchart LR
  Developer["Developer Push"] --> Actions["GitHub Actions"]
  Actions --> Tests["Lint + Typecheck + Tests + Audit"]
  Developer --> CloudBuild["Cloud Build"]
  CloudBuild --> Artifact["Artifact Registry"]
  Artifact --> ApiRun["Cloud Run API"]
  Artifact --> CoreRun["Cloud Run Carbon Core"]
  CloudBuild --> Hosting["Firebase Hosting"]
  Hosting --> Client["Global CDN Client"]
```

## Clean Architecture Boundaries

- `apps/web`: presentation, accessibility, client state, Firebase web SDK integration.
- `services/api/src/routes`: HTTP adapters.
- `services/api/src/middleware`: security, auth, validation.
- `services/api/src/services`: business services and Google Cloud adapters.
- `services/carbon-core`: deterministic Rust calculation domain.
- `docs`: architecture and evaluation evidence.

## Efficiency Choices

- Vite code splitting separates charts, Firebase, and Maps.
- Rust service is stateless and horizontally scalable on Cloud Run.
- Express API performs credential-bound orchestration and falls back gracefully for demos.
- Firestore schema keeps user-specific data under user subcollections for efficient security rules.
- Firebase Hosting CDN serves static assets globally.
