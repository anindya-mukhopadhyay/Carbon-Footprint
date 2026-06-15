import { BatteryCharging, Bus, Recycle, Trees } from "lucide-react";

const places = [
  { label: "EV chargers", count: 18, icon: BatteryCharging },
  { label: "Recycling centers", count: 9, icon: Recycle },
  { label: "Transit stops", count: 42, icon: Bus },
  { label: "Green events", count: 7, icon: Trees }
];

export function ImpactMap() {
  return (
    <section className="map-card" id="nearby" aria-labelledby="map-title">
      <div className="card-heading">
        <div>
          <span className="eyebrow">Google Maps</span>
          <h3 id="map-title">Sustainable choices, nearby</h3>
        </div>
        <button type="button">Open map</button>
      </div>
      <div className="map-illustration" role="img" aria-label="Map of nearby sustainable places">
        <div className="road road-one" />
        <div className="road road-two" />
        <div className="road road-three" />
        {places.map((place, index) => {
          const Icon = place.icon;
          return (
            <div className={`map-pin pin-${index + 1}`} key={place.label}>
              <Icon size={17} aria-hidden="true" />
              <span>{place.count}</span>
            </div>
          );
        })}
      </div>
      <div className="place-list">
        {places.map((place) => {
          const Icon = place.icon;
          return (
            <div key={place.label}>
              <Icon size={18} aria-hidden="true" />
              <span>{place.label}</span>
              <strong>{place.count}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
