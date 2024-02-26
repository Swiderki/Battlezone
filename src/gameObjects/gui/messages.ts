import { GUIText } from "drake-engine";

type EnemyInRange = {
  text: "" | "ENEMY IN RANGE";
};
export const enemyInRangeMsg: GUIText & EnemyInRange = new GUIText("", 20, "monospace", "#f0f", 700, {
  x: 40,
  y: 100,
}) as GUIText & EnemyInRange;

type EnemyLocation = {
  text: "" | "ENEMY TO RIGHT" | "ENEMY TO LEFT" | "ENEMY TO REAR";
};
export const enemyLocationMsg: GUIText & EnemyLocation = new GUIText("", 20, "monospace", "#f0f", 700, {
  x: 40,
  y: 140,
}) as GUIText & EnemyLocation;

type MotionBlockedByObstacle = {
  text: "" | "MOTION BLOCKED BY OBSTACLE";
};
export const motionBlockedMsg: GUIText & MotionBlockedByObstacle = new GUIText(
  "",
  20,
  "monospace",
  "#f0f",
  700,
  {
    x: 40,
    y: 180,
  }
) as GUIText & MotionBlockedByObstacle;
