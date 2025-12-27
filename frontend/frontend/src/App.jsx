import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";


function App() {
  const [drones, setDrones] = useState([]);
  const [missions, setMissions] = useState([]);

  const loadData = () => {
    fetch("http://localhost:4000/api/drones", { cache: "no-store" })
      .then(res => res.json())
      .then(setDrones);

    fetch("http://localhost:4000/api/missions", { cache: "no-store" })
      .then(res => res.json())
      .then(setMissions);
  };

 useEffect(() => {
  loadData(); // initial fetch

  const socket = io("http://localhost:4000");

  socket.on("mission_update", () => {
    loadData();
  });

  socket.on("drone_update", () => {
    loadData();
  });

  return () => socket.disconnect();
}, []);



  const createMission = async () => {
    await fetch("http://localhost:4000/api/missions", {
      method: "POST"
    });
    loadData();
  };

  const startMission = async (id) => {
    await fetch(`http://localhost:4000/api/missions/${id}/start`, {
      method: "POST"
    });
    loadData();
  };

  return (
    <div style={{
      maxWidth: "1200px",
      margin: "20px auto",
      fontFamily: "Inter, Arial, sans-serif"
    }}>
      <h1>FlytBase Drone Dashboard</h1>

      {/* ACTIONS */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={createMission}>Create Mission</button>
      </div>

      {/* DRONES + MAP */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.2fr",
        gap: "20px",
        marginBottom: "30px"
      }}>
        {/* DRONE TABLE */}
        <div style={{
          padding: "16px",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          background: "#fafafa"
        }}>
          <h2>Drones</h2>
          <table width="100%" cellPadding="8">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Battery</th>
              </tr>
            </thead>
            <tbody>
              {drones.map(d => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td style={{
                    color:
                      d.status === "IN_MISSION" ? "green" : "black"
                  }}>
                    {d.status}
                  </td>
                  <td>{d.battery}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MAP */}
        <div style={{
          padding: "16px",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          background: "#fafafa"
        }}>
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
      </div>

      {/* MISSIONS */}
      <div style={{
        padding: "16px",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        background: "#fafafa"
      }}>
        <h2>Missions</h2>
        <table width="100%" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Drone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {missions.map(m => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td style={{
                  color:
                    m.status === "RUNNING" ? "green" :
                    m.status === "COMPLETED" ? "blue" :
                    m.status === "ABORTED" ? "red" : "black"
                }}>
                  {m.status}
                </td>
                <td>{m.progress}%</td>
                <td>{m.drone_id ?? "—"}</td>
                <td>
                  {m.status === "PLANNED" && (
                    <button onClick={() => startMission(m.id)}>
                      Start
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
