precision mediump float;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;

void main(void) {
  vec2 filterUv = vec2(1);
  vec4 filterColor = texture2D(uSampler2, vTextureCoord * filterUv);
  vec4 color = texture2D(uSampler, vTextureCoord);
  gl_FragColor = color + filterColor / 4.0;
}