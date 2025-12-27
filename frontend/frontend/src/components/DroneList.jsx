export default function DroneList({ drones }) {
  return (
    <div className="card">
      <h2>Drones</h2>

      <table>
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
              <td>
                <span className={`badge ${d.status}`}>
                  {d.status}
                </span>
              </td>
              <td className={d.battery < 20 ? "low-battery" : ""}>
                {d.battery}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
