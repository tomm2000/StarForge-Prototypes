export default
/*glsl*/`
varying vec3 vNormal;

void main() {
  float d = (length(vNormal)-200.0)/20.0;

  if(d <= 0.05) {
    gl_FragColor = vec4(0.0, 0.0, 0.9, 1.0);
  } else {
    gl_FragColor = vec4(0.0, d, 0.0, 1.0);
  }
}
`