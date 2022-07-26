varying vec3 vColor;

void main()
{
    float strength = 1.0 - distance(gl_PointCoord, vec2(0.5));
    strength = pow(strength, 10.0);
    gl_FragColor = vec4(vec3(strength), 5.0);

    // Color
    vec3 color = mix(vec3(0.0), vColor, strength);
    gl_FragColor = vec4(color, 1.0);
}