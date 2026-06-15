import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { Award, MapPin, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { challenges, leaderboard } from "@/data/mock";

const mapCenter = { lat: 22.5726, lng: 88.3639 };
const places = [
  { name: "EV charging station", position: { lat: 22.585, lng: 88.36 } },
  { name: "Recycling center", position: { lat: 22.562, lng: 88.35 } },
  { name: "Tree plantation drive", position: { lat: 22.58, lng: 88.39 } }
];

export function Community() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "missing-key"
  });

  return (
    <section id="community" aria-labelledby="community-title" className="grid gap-6 lg:grid-cols-2">
      <Card>
        <Badge>Gamification</Badge>
        <CardTitle id="community-title" className="mt-4">
          Challenges that make progress social.
        </CardTitle>
        <div className="mt-5 grid gap-4">
          {challenges.map((challenge) => (
            <article key={challenge.title} className="rounded-3xl border border-soil/10 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-soil">{challenge.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-soil/70">{challenge.description}</p>
                </div>
                <Badge className="bg-sun/40 text-soil">{challenge.points} pts</Badge>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-soil/10">
                <div className="h-full rounded-full bg-leaf" style={{ width: `${challenge.progress}%` }} />
              </div>
            </article>
          ))}
        </div>
      </Card>

      <Card className="bg-soil text-paper">
        <Badge className="border-paper/20 bg-paper/10 text-sun">Leaderboards</Badge>
        <CardTitle className="mt-4 text-paper">Friends, college, city, global.</CardTitle>
        <ol className="mt-5 grid gap-3">
          {leaderboard.map((person, index) => (
            <li key={person.name} className="flex items-center justify-between rounded-2xl bg-paper/10 p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-sun text-soil">
                  {index === 0 ? <Trophy className="h-5 w-5" aria-hidden /> : index + 1}
                </span>
                <div>
                  <p className="font-bold">{person.name}</p>
                  <p className="text-xs text-paper/70">
                    {person.city} - {person.badge}
                  </p>
                </div>
              </div>
              <span className="font-display text-2xl font-extrabold">{person.score}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card className="lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge>Google Maps Platform</Badge>
            <CardTitle className="mt-4">Nearby green actions</CardTitle>
            <p className="mt-2 text-sm text-soil/70">
              Show recycling centers, EV charging stations, public transport routes, tree drives,
              and green community events.
            </p>
          </div>
          <Button variant="secondary">
            <MapPin className="mr-2 h-4 w-4" aria-hidden />
            Find green places
          </Button>
        </div>

        <div className="mt-5 h-80 overflow-hidden rounded-[2rem] border border-soil/10 bg-mint">
          {isLoaded && import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
            <GoogleMap center={mapCenter} zoom={12} mapContainerStyle={{ width: "100%", height: "100%" }}>
              {places.map((place) => (
                <MarkerF key={place.name} position={place.position} title={place.name} />
              ))}
            </GoogleMap>
          ) : (
            <div className="grid h-full place-items-center p-6 text-center">
              <div>
                <Award className="mx-auto h-12 w-12 text-tide" aria-hidden />
                <p className="mt-3 font-bold text-soil">Add `VITE_GOOGLE_MAPS_API_KEY` to render the live map.</p>
                <p className="mt-2 text-sm text-soil/70">
                  The backend Maps endpoint is ready for Places API searches and route insights.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
