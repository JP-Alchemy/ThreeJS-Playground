uniform sampler2D tDiffuse;
uniform float uTime;
uniform sampler2D uNormalMap;
uniform vec3 uLight;

varying vec2 vUv;

void main()
{
    vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
    vec2 newUv = vUv + normalColor.xy * 0.1;
    vec4 color = texture2D(tDiffuse, newUv);

    vec3 lightDirection = normalize(uLight);
    float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);
    color.rgb += lightness * 0.25;

    gl_FragColor = color;
}