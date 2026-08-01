uniform float uTime;
uniform float uStrength;
uniform vec3 uColor;

varying vec2 vUv;

void main() {
    float dash = sin(vUv.x * 20.0 - uTime * 5.0) * 0.5 + 0.5;
    float alpha = dash * smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
    alpha *= uStrength;
    
    gl_FragColor = vec4(uColor, alpha);
}
