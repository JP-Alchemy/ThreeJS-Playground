uniform vec2 uFrequency;    
uniform float uTime;    

varying vec2 vUv;
varying float vElevation;

void main() {
    vec4 modelPos = modelMatrix * vec4(position, 1.0);

    float elevation = sin(modelPos.x * uFrequency.x - uTime) * 0.1;
    elevation += sin(modelPos.y * uFrequency.y - uTime) * 0.1;
    modelPos.z += elevation;
    
    vec4 viewPos = viewMatrix * modelPos;
    vec4 projectedPos = projectionMatrix * viewPos;

    gl_Position = projectedPos;
    vUv = uv;
    vElevation = elevation;
}