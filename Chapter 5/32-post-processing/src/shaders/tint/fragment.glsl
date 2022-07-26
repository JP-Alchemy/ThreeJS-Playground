uniform sampler2D tDiffuse;
varying vec2 vUv;
uniform vec3 uTint;

void main()
{
    vec4 color = texture2D(tDiffuse, vUv);
    color.rgb += uTint;

    gl_FragColor = color;
}