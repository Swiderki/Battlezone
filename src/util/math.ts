import { Vec3DTuple } from "drake-engine";

export function randomFromRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomTupleFromRange(min: number, max: number): Vec3DTuple {
  return [...Array(3)].map(() => randomFromRange(min, max)) as Vec3DTuple;
}
