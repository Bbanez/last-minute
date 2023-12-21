precision mediump float;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;

void main(void) {
  vec4 color = texture2D(uSampler, vTextureCoord) * texture2D(uSampler2, vTextureCoord);
  gl_FragColor = color;
}