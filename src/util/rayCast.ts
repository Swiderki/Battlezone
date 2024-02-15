import { Vec3D, Vector } from "drake-engine";

export function checkVectorSimilarity(v1: Vec3D, v2: Vec3D, threshold: number) {
    const l = Vector.dotP(Vector.normalize({...v1, y: 0}), Vector.normalize({...v2, y: 0}));
    return l >= threshold;   
}