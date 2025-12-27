import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function DroneMap({ drones }) {
  return (
    <div className="card">
      <h2>Drone Map</h2>

      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={13}
        style={{ height: "320px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {drones.map(d => (
          <Marker key={d.id} position={[d.lat, d.lng]}>
            <Popup>
              Drone {d.id}<br />
              Status: {d.status}<br />
              Battery: {d.battery}%
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
