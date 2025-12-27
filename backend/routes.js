import express from "express";
import { db } from "./db.js";
import { startMissionSimulator } from "./simulator.js";

const router = express.Router();

/**
 * GET all drones (fleet state)
 */
router.get("/drones", async (req, res) => {
  const drones = await db.all(`SELECT * FROM drones`);
  res.json(drones);
});

/**
 * GET all missions
 */
router.get("/missions", async (req, res) => {
  // 1. Get all running missions
  const runningMissions = await db.all(
    "SELECT * FROM missions WHERE status = 'RUNNING'"
  );

  for (const mission of runningMissions) {
    let newProgress = mission.progress + 5;

    if (newProgress >= 100) {
      // Mission completed
      await db.run(
        `UPDATE missions 
         SET progress = 100, status = 'COMPLETED', ended_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [mission.id]
      );

      // Free the drone
      await db.run(
        `UPDATE drones SET status = 'IDLE' WHERE id = ?`,
        [mission.drone_id]
      );
    } else {
      // Increment progress
      await db.run(
        `UPDATE missions SET progress = ? WHERE id = ?`,
        [newProgress, mission.id]
      );
    }
  }

  // 2. Return updated missions
  const missions = await db.all("SELECT * FROM missions");
  res.json(missions);
});


/**
 * CREATE mission (PLANNED)
 */
router.post("/missions", async (req, res) => {
  const result = await db.run(
    `INSERT INTO missions (status, progress) VALUES ('PLANNED', 0)`
  );
  res.json({ missionId: result.lastID });
});

/**
 * START mission
 */
router.post("/missions/:id/start", async (req, res) => {
  try {
     const missionId = req.params.id;

  // 1. Find idle drone
  const drone = await db.get(
    `SELECT * FROM drones WHERE status = 'IDLE' LIMIT 1`
  );

  if (!drone) {
    return res.status(400).json({ error: "No available drones" });
  }

  // 🔴 ADD THIS BLOCK HERE (EXACTLY HERE)
  const activeMission = await db.get(
    `SELECT * FROM missions WHERE drone_id = ? AND status = 'RUNNING'`,
    [drone.id]
  );

  if (activeMission) {
    return res.status(400).json({ error: "Drone already in mission" });
  }
  // 🔴 END OF ADDITION

  // 2. Assign drone + start mission
  await db.run(
    `UPDATE drones SET status='IN_MISSION' WHERE id=?`,
    [drone.id]
  );

  await db.run(
    `UPDATE missions 
     SET status='RUNNING', drone_id=?, started_at=CURRENT_TIMESTAMP 
     WHERE id=?`,
    [drone.id, missionId]
  );

  startMissionSimulator(missionId, req.app.get("io"));

  res.json({
    message: "Mission started",
    missionId,
    droneId: drone.id
  })
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.post("/reset", async (req, res) => {
  await db.run(`UPDATE missions SET status='PLANNED', progress=0, drone_id=NULL, started_at=NULL, ended_at=NULL`);
  await db.run(`UPDATE drones SET status='IDLE', battery=100`);

  res.json({ message: "System reset" });
});


export default router;
