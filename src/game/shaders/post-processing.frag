precision mediump float;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;

void main(void) {
  vec4 screenColor = texture2D(uSampler, vTextureCoord);
  gl_FragColor = screenColor;
}