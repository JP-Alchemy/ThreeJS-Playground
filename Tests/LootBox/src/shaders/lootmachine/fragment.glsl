varying vec3 vPosition;
varying vec3 vLootlid;

void main()
{
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float strength = 0.05 / distanceToCenter - 0.1;
    float visible = max(0.0, vLootlid.y - vPosition.y - 0.22);
    gl_FragColor = vec4(1.0, 0.72, 0.0, strength * visible );
}