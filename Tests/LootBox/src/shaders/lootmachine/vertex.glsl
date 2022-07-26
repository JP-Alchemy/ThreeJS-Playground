uniform float uPixelRatio;
uniform float uSize;
uniform float uTime;
uniform vec3 uLootLid;

varying vec3 vPosition;
varying vec3 vLootlid;

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    gl_PointSize = uSize * uPixelRatio;
    gl_PointSize *= (1.0 / - viewPosition.z);

    vPosition = position;
    vLootlid = uLootLid;
}