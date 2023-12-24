precision mediump float;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uSamplerBlob;

void main(void) {
  vec4 blobColor = texture2D(uSamplerBlob, vTextureCoord);
  vec2 distUv = vTextureCoord + blobColor.r * 0.9;
  vec4 color = texture2D(uSampler, distUv);

  gl_FragColor = color;
}