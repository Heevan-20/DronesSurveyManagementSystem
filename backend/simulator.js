import { db } from "./db.js";

const activeSimulators = new Map();

export function startMissionSimulator(missionId, io) {
  if (activeSimulators.has(missionId)) return;

  let lat = 12.9716;
  let lng = 77.5946;

  const interval = setInterval(async () => {
    // 1. Fetch mission
    const mission = await db.get(
      `SELECT * FROM missions WHERE id = ?`,
      [missionId]
    );

    if (!mission || mission.status !== "RUNNING") {
      clearInterval(interval);
      activeSimulators.delete(missionId);
      return;
    }

    // 2. Fetch drone
    const drone = await db.get(
      `SELECT * FROM drones WHERE id = ?`,
      [mission.drone_id]
    );

    if (drone.battery <= 0) {
  await db.run(
    `UPDATE missions 
     SET status='ABORTED', ended_at=CURRENT_TIMESTAMP 
     WHERE id=?`,
    [missionId]
  );

  await db.run(
    `UPDATE drones SET status='IDLE', battery=0 WHERE id=?`,
    [drone.id]
  );

  clearInterval(interval);
  activeSimulators.delete(missionId);
  return;
}


    // 3. Update progress
    const newProgress = Math.min(mission.progress + 5, 100);

    // 4. Update position
    lat += 0.001;
    lng += 0.001;

    // 5. Battery calculation
    const newBattery = drone.battery - 1;

    // 🔴 BATTERY GUARD — EXACT LOCATION
    if (newBattery <= 0) {
      await db.run(
        `UPDATE missions 
         SET status='ABORTED', ended_at=CURRENT_TIMESTAMP 
         WHERE id=?`,
        [missionId]
      );

      await db.run(
        `UPDATE drones 
         SET status='IDLE', battery=0 
         WHERE id=?`,
        [drone.id]
      );

      io.emit("mission_update", {
        missionId,
        status: "ABORTED",
        progress: mission.progress
      });

      clearInterval(interval);
      activeSimulators.delete(missionId);
      return;
    }
    // 🔴 END BATTERY GUARD

    // 6. Persist updates
    await db.run(
      `UPDATE missions SET progress=? WHERE id=?`,
      [newProgress, missionId]
    );

    await db.run(
  `UPDATE drones 
   SET 
     battery = CASE 
       WHEN ? < 0 THEN 0 
       ELSE ? 
     END,
     lat = ?, 
     lng = ?
   WHERE id = ?`,
  [newBattery, newBattery, lat, lng, drone.id]
);


    // 7. Emit updates (FIXED)
    io.emit("mission_update", {
      missionId,
      progress: newProgress,
      status: "RUNNING"
    });

    io.emit("drone_update", {
      droneId: drone.id,
      battery: newBattery,
      status: "IN_MISSION",
      lat,
      lng
    });

    // 8. Completion case
    if (newProgress === 100) {
      await db.run(
        `UPDATE missions 
         SET status='COMPLETED', ended_at=CURRENT_TIMESTAMP 
         WHERE id=?`,
        [missionId]
      );

      await db.run(
        `UPDATE drones SET status='IDLE' WHERE id=?`,
        [drone.id]
      );

      io.emit("mission_complete", { missionId });

      clearInterval(interval);
      activeSimulators.delete(missionId);
    }

  }, 1000);

  activeSimulators.set(missionId, interval);
}
