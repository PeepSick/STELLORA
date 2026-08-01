uniform float uTime;
varying vec3 vColor;
varying float vDistance;

void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    
    // Soft radial glow for points
    float strength = 1.0 - (dist * 2.0);
    strength = pow(strength, 2.0);
    
    // Subtle twinkling effect
    float twinkle = sin(uTime * 2.5 + vDistance * 0.4) * 0.3 + 0.7;
    strength *= twinkle;

    // Space Opera Color Palette:
    // Core White -> Golden Amber -> Cosmic Magenta -> Deep Royal Purple -> Void Violet
    vec3 cWhite     = vec3(1.00, 0.98, 0.92);
    vec3 cGold      = vec3(1.00, 0.78, 0.35);
    vec3 cAmber     = vec3(0.95, 0.45, 0.15);
    vec3 cMagenta   = vec3(0.75, 0.25, 0.85);
    vec3 cPurple    = vec3(0.45, 0.15, 0.75);
    vec3 cDeepSpace = vec3(0.20, 0.10, 0.45);

    vec3 baseColor = vColor;
    float normDist = clamp(vDistance / 140.0, 0.0, 1.0);

    if (normDist < 0.12) {
        baseColor = mix(cWhite, cGold, normDist / 0.12);
    } else if (normDist < 0.35) {
        baseColor = mix(cGold, cAmber, (normDist - 0.12) / 0.23);
    } else if (normDist < 0.60) {
        baseColor = mix(cAmber, cMagenta, (normDist - 0.35) / 0.25);
    } else if (normDist < 0.85) {
        baseColor = mix(cMagenta, cPurple, (normDist - 0.60) / 0.25);
    } else {
        baseColor = mix(cPurple, cDeepSpace, (normDist - 0.85) / 0.15);
    }

    // Boost brightness for center stars
    float coreBoost = 1.0 + clamp((1.0 - normDist * 2.5), 0.0, 2.5);

    gl_FragColor = vec4(baseColor * strength * coreBoost, strength * 0.95);
}
