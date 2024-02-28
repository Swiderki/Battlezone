import { GameObject, Line3D, Vec3D, Vector } from "drake-engine";

export function checkVectorSimilarity(v1: Vec3D, v2: Vec3D) {
    const l = Vector.dotP(Vector.normalize({...v1, y: 0}), Vector.normalize({...v2, y: 0}));
    return l;   
}

//* Math stuff, don't bother to understand
export function rayCast(origin: Vec3D, direction: Vec3D, boxCollider: Line3D): boolean {
    const minPoint = boxCollider[0];
    const maxPoint = boxCollider[1];

    let tmin = (minPoint.x - origin.x) / direction.x;
    let tmax = (maxPoint.x - origin.x) / direction.x;

    if (tmin > tmax) {
        [tmin, tmax] = [tmax, tmin];
    }

    let tymin = (minPoint.y - origin.y) / direction.y;
    let tymax = (maxPoint.y - origin.y) / direction.y;

    if (tymin > tymax) {
        [tymin, tymax] = [tymax, tymin];
    }

    if (tmin > tymax || tymin > tmax) {
        return false;
    }

    if (tymin > tmin) {
        tmin = tymin;
    }

    if (tymax < tmax) {
        tmax = tymax;
    }

    let tzmin = (minPoint.z - origin.z) / direction.z;
    let tzmax = (maxPoint.z - origin.z) / direction.z;

    if (tzmin > tzmax) {
        [tzmin, tzmax] = [tzmax, tzmin];
    }

    if (tmin > tzmax || tzmin > tmax) {
        return false;
    }

    if (tzmin > tmin) {
        tmin = tzmin;
    }

    if (tzmax < tmax) {
        tmax = tzmax;
    }
    if(Vector.length(Vector.subtract(boxCollider[0], origin)) === 0) {
        return true
    }
    if(checkVectorSimilarity(Vector.subtract(boxCollider[0], origin), direction) < 0) {
        return false;
    }
    
    return true;
}

export function collideObjects(box1: Line3D, box2: Line3D) {

  
    const obj1AABB = [
      {
        x: Math.min(box1[0].x, box1[1].x),
        y: Math.min(box1[0].y, box1[1].y),
        z: Math.min(box1[0].z, box1[1].z),
      },
      {
        x: Math.max(box1[0].x, box1[1].x),
        y: Math.max(box1[0].y, box1[1].y),
        z: Math.max(box1[0].z, box1[1].z),
      },
    ];
  
    const obj2AABB = [
      {
        x: Math.min(box2[0].x, box2[1].x),
        y: Math.min(box2[0].y, box2[1].y),
        z: Math.min(box2[0].z, box2[1].z),
      },
      {
        x: Math.max(box2[0].x, box2[1].x),
        y: Math.max(box2[0].y, box2[1].y),
        z: Math.max(box2[0].z, box2[1].z),
      },
    ];
  
    const overlapX = obj1AABB[0].x < obj2AABB[1].x && obj1AABB[1].x > obj2AABB[0].x;
    const overlapY = obj1AABB[0].y < obj2AABB[1].y && obj1AABB[1].y > obj2AABB[0].y;
    const overlapZ = obj1AABB[0].z < obj2AABB[1].z && obj1AABB[1].z > obj2AABB[0].z;
    
    return overlapX && overlapY && overlapZ;
}