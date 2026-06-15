use axum::{extract::State, http::StatusCode, routing::get, routing::post, Json, Router};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, net::SocketAddr, sync::Arc};
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[derive(Clone)]
struct AppState {
    factors: Arc<EmissionFactors>,
}

#[derive(Clone)]
struct EmissionFactors {
    transport: HashMap<TransportMode, f64>,
    diet: HashMap<Diet, f64>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
enum TransportMode {
    Car,
    Bike,
    Bus,
    Train,
    Flight,
    Rideshare,
    Ev,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
enum Diet {
    Vegan,
    Vegetarian,
    Mixed,
    HighMeat,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct CarbonInput {
    transport_mode: TransportMode,
    distance_km: f64,
    electricity_kwh: f64,
    lpg_kg: f64,
    natural_gas_therms: f64,
    solar_kwh: f64,
    diet: Diet,
    shopping_spend: f64,
    online_orders: f64,
    clothing_items: f64,
    electronics_spend: f64,
}

#[derive(Debug, Clone, Deserialize)]
struct TwinRequest {
    profile: CarbonInput,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct CarbonResult {
    daily_kg: f64,
    weekly_kg: f64,
    monthly_kg: f64,
    annual_kg: f64,
    sustainability_score: i32,
    category_breakdown: Vec<CategoryBreakdown>,
    recommendations: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
struct CategoryBreakdown {
    name: String,
    kg: f64,
    color: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct TwinScenario {
    id: String,
    name: String,
    annual_kg: f64,
    savings_kg: f64,
    confidence: f64,
    actions: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
struct TwinResponse {
    scenarios: Vec<TwinScenario>,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let state = AppState {
        factors: Arc::new(EmissionFactors::default()),
    };

    let app = Router::new()
        .route("/health", get(health))
        .route("/calculate", post(calculate))
        .route("/simulate", post(simulate))
        .with_state(state)
        .layer(CorsLayer::permissive())
        .layer(TraceLayer::new_for_http());

    let address = SocketAddr::from(([0, 0, 0, 0], 8090));
    let listener = tokio::net::TcpListener::bind(address)
        .await
        .expect("bind carbon core listener");

    tracing::info!("EcoTrack carbon core listening on {address}");
    axum::serve(listener, app).await.expect("serve carbon core");
}

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "service": "ecotrack-carbon-core"
    }))
}

async fn calculate(
    State(state): State<AppState>,
    Json(input): Json<CarbonInput>,
) -> Result<Json<CarbonResult>, StatusCode> {
    if !input.is_valid() {
        return Err(StatusCode::BAD_REQUEST);
    }

    Ok(Json(calculate_profile(&input, &state.factors)))
}

async fn simulate(
    State(state): State<AppState>,
    Json(request): Json<TwinRequest>,
) -> Result<Json<TwinResponse>, StatusCode> {
    if !request.profile.is_valid() {
        return Err(StatusCode::BAD_REQUEST);
    }

    let baseline = calculate_profile(&request.profile, &state.factors).annual_kg;
    Ok(Json(TwinResponse {
        scenarios: vec![
            scenario("current", "Current habits", baseline, 0.0, 0.93, &["Continue daily tracking", "Upload bills to improve accuracy"]),
            scenario("public-transport", "Public transport 3x weekly", baseline * 0.82, baseline * 0.18, 0.88, &["Replace three private car commutes", "Use transit routing before rideshare"]),
            scenario("lower-meat", "Reducing meat consumption", baseline * 0.75, baseline * 0.25, 0.86, &["Plan four vegetarian dinners", "Prioritize local seasonal produce"]),
            scenario("renewable-energy", "Switching to renewable energy", baseline * 0.66, baseline * 0.34, 0.82, &["Adopt green tariff or community solar", "Run appliances during solar windows"]),
        ],
    }))
}

fn calculate_profile(input: &CarbonInput, factors: &EmissionFactors) -> CarbonResult {
    let transport = input.distance_km * factors.transport[&input.transport_mode];
    let energy = input.electricity_kwh * 0.708 + input.lpg_kg * 2.98 + input.natural_gas_therms * 5.3
        - input.solar_kwh * 0.708;
    let food = factors.diet[&input.diet];
    let lifestyle = input.shopping_spend * 0.38
        + input.online_orders * 0.9
        + input.clothing_items * 6.5
        + input.electronics_spend * 0.52;
    let daily_kg = f64::max(0.0, transport + energy + food + lifestyle);
    let annual_kg = daily_kg * 365.0;
    let sustainability_score = (100.0 - annual_kg / 120.0).round().clamp(1.0, 100.0) as i32;

    CarbonResult {
        daily_kg,
        weekly_kg: daily_kg * 7.0,
        monthly_kg: daily_kg * 30.42,
        annual_kg,
        sustainability_score,
        category_breakdown: vec![
            category("Transport", transport, "#1B6F78"),
            category("Energy", energy.max(0.0), "#F8B84E"),
            category("Food", food, "#4FA36C"),
            category("Lifestyle", lifestyle, "#D46A3A"),
        ],
        recommendations: recommendations(transport, energy, food, lifestyle, input),
    }
}

fn category(name: &str, kg: f64, color: &str) -> CategoryBreakdown {
    CategoryBreakdown {
        name: name.to_string(),
        kg,
        color: color.to_string(),
    }
}

fn scenario(
    id: &str,
    name: &str,
    annual_kg: f64,
    savings_kg: f64,
    confidence: f64,
    actions: &[&str],
) -> TwinScenario {
    TwinScenario {
        id: id.to_string(),
        name: name.to_string(),
        annual_kg,
        savings_kg,
        confidence,
        actions: actions.iter().map(|action| action.to_string()).collect(),
    }
}

fn recommendations(
    transport: f64,
    energy: f64,
    food: f64,
    lifestyle: f64,
    input: &CarbonInput,
) -> Vec<String> {
    let mut items = vec![
        "Set a weekly CO2 budget and review the highest category every Sunday.".to_string(),
        "Upload utility bills and receipts so EcoTrack AI can replace estimates with real data.".to_string(),
    ];

    if transport > 5.0 && input.transport_mode == TransportMode::Car {
        items.insert(0, "Use public transport or EV pooling for 3 commutes to cut travel emissions by roughly 18%.".to_string());
    }
    if food > 5.0 {
        items.insert(0, "Move two high-meat meals to vegetarian or vegan options this week.".to_string());
    }
    if energy > 4.0 {
        items.insert(0, "Shift laundry, charging, and cooling into solar or off-peak hours.".to_string());
    }
    if lifestyle > 8.0 {
        items.insert(0, "Bundle online orders and choose slower consolidated delivery.".to_string());
    }

    items.truncate(4);
    items
}

impl CarbonInput {
    fn is_valid(&self) -> bool {
        [
            self.distance_km,
            self.electricity_kwh,
            self.lpg_kg,
            self.natural_gas_therms,
            self.solar_kwh,
            self.shopping_spend,
            self.online_orders,
            self.clothing_items,
            self.electronics_spend,
        ]
        .iter()
        .all(|value| value.is_finite() && *value >= 0.0)
    }
}

impl Default for EmissionFactors {
    fn default() -> Self {
        Self {
            transport: HashMap::from([
                (TransportMode::Car, 0.192),
                (TransportMode::Bike, 0.021),
                (TransportMode::Bus, 0.089),
                (TransportMode::Train, 0.041),
                (TransportMode::Flight, 0.255),
                (TransportMode::Rideshare, 0.145),
                (TransportMode::Ev, 0.053),
            ]),
            diet: HashMap::from([
                (Diet::Vegan, 2.8),
                (Diet::Vegetarian, 3.8),
                (Diet::Mixed, 5.4),
                (Diet::HighMeat, 7.2),
            ]),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_input() -> CarbonInput {
        CarbonInput {
            transport_mode: TransportMode::Car,
            distance_km: 24.0,
            electricity_kwh: 7.5,
            lpg_kg: 0.4,
            natural_gas_therms: 0.2,
            solar_kwh: 1.5,
            diet: Diet::Mixed,
            shopping_spend: 18.0,
            online_orders: 1.0,
            clothing_items: 0.0,
            electronics_spend: 4.0,
        }
    }

    #[test]
    fn calculates_positive_annual_footprint() {
        let factors = EmissionFactors::default();
        let result = calculate_profile(&sample_input(), &factors);

        assert!(result.daily_kg > 0.0);
        assert!(result.annual_kg > result.monthly_kg);
        assert_eq!(result.category_breakdown.len(), 4);
    }

    #[test]
    fn rejects_negative_values() {
        let mut input = sample_input();
        input.distance_km = -1.0;

        assert!(!input.is_valid());
    }
}
