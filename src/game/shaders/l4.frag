precision mediump float;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void) {
  vec4 color = texture2D(uSampler, vTextureCoord);
  gl_FragColor = color;
}