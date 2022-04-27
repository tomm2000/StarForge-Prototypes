export default
/*glsl*/`
varying vec3 vNormal;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 2.0);
  vNormal = position;
  
}
`