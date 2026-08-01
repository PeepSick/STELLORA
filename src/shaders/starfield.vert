uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandomness;
attribute vec3 aColor;

varying vec3 vColor;
varying float vDistance;
varying vec3 vWorldPosition;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Orbital rotation (Keplerian dynamics: inner stars spin faster)
    float distanceToCenter = length(modelPosition.xz);
    float angle = atan(modelPosition.x, modelPosition.z);
    float speed = (20.0 / (distanceToCenter + 5.0)) * uTime * 0.15;
    angle += speed;
    
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;
    
    modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    // Distance-based size attenuation with depth enhancement
    gl_PointSize = uSize * aScale * (120.0 / -viewPosition.z);

    vColor = aColor;
    vDistance = distanceToCenter;
    vWorldPosition = modelPosition.xyz;
}
