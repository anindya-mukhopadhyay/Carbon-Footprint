# API Design

Base URL:

```text
/api/v1
```

Swagger UI:

```text
/api/docs
```

## Authentication

Protected routes expect:

```http
Authorization: Bearer <Firebase ID token>
```

Admin-only operations should use Firebase custom claims:

```json
{
  "role": "admin"
}
```

## Carbon Calculation

`POST /carbon/calculate`

```json
{
  "transportMode": "car",
  "distanceKm": 24,
  "electricityKwh": 7.5,
  "lpgKg": 0.4,
  "naturalGasTherms": 0.2,
  "solarKwh": 1.5,
  "diet": "mixed",
  "shoppingSpend": 18,
  "onlineOrders": 1,
  "clothingItems": 0,
  "electronicsSpend": 4
}
```

Returns daily, weekly, monthly, and annual kg CO2e, category breakdown, score, and recommendations.

## Gemini Coach

`POST /coach/chat`

```json
{
  "message": "How can I reduce my travel footprint?",
  "profile": {}
}
```

Returns a personalized answer and measurable actions.

## AI Carbon Twin

`POST /twin/simulate`

Returns current, public transport, lower meat, and renewable energy scenarios with projected annual savings.

## Prediction Engine

`POST /predictions/forecast`

Returns monthly forecast points and confidence score. Vertex AI is used when configured, deterministic fallback otherwise.

## OCR Analysis

`POST /ocr/analyze`

Accepts multipart field `receipt` or body field `text`. Returns extracted text, inferred values, estimated kg CO2e, and confidence.

## Maps

`GET /maps/places?lat=22.5726&lng=88.3639&type=recycling`

Returns nearby green places from Google Maps Platform when configured, demo places otherwise.
