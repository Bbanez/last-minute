varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main(void) {
  vec4 c = texture2D(uSampler, vTextureCoord);
  float a = float(0.2);
  gl_FragColor = vec4(c.rgb * a, c.a);
}