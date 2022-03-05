export const noise3D = /*glsl*/`
vec4 permute(vec4 i) {
  vec4 im = mod(i, 289.0);
  return mod(((im*34.0)+10.0)*im, 289.0);
}

// https://github.com/stegu/psrdnoise/
float psrdnoise(vec3 x, vec3 period, float alpha, out vec3 gradient) {
  const mat3 M = mat3(0.0, 1.0, 1.0, 1.0, 0.0, 1.0,  1.0, 1.0, 0.0);
  const mat3 Mi = mat3(-0.5, 0.5, 0.5, 0.5,-0.5, 0.5, 0.5, 0.5,-0.5);
  vec3 uvw = M * x;
  vec3 i0 = floor(uvw), f0 = fract(uvw);
  vec3 g_ = step(f0.xyx, f0.yzz), l_ = 1.0 - g_;
  vec3 g = vec3(l_.z, g_.xy), l = vec3(l_.xy, g_.z);
  vec3 o1 = min( g, l ), o2 = max( g, l );
  vec3 i1 = i0 + o1, i2 = i0 + o2, i3 = i0 + vec3(1.0);
  vec3 v0 = Mi * i0, v1 = Mi * i1, v2 = Mi * i2, v3 = Mi * i3;
  vec3 x0 = x - v0, x1 = x - v1, x2 = x - v2, x3 = x - v3;
  if(any(greaterThan(period, vec3(0.0)))) {
    vec4 vx = vec4(v0.x, v1.x, v2.x, v3.x);
    vec4 vy = vec4(v0.y, v1.y, v2.y, v3.y);
    vec4 vz = vec4(v0.z, v1.z, v2.z, v3.z);
    if(period.x > 0.0) vx = mod(vx, period.x);
    if(period.y > 0.0) vy = mod(vy, period.y);
    if(period.z > 0.0) vz = mod(vz, period.z);
    i0 = floor(M * vec3(vx.x, vy.x, vz.x) + 0.5);
    i1 = floor(M * vec3(vx.y, vy.y, vz.y) + 0.5);
    i2 = floor(M * vec3(vx.z, vy.z, vz.z) + 0.5);
    i3 = floor(M * vec3(vx.w, vy.w, vz.w) + 0.5);
  }
  vec4 hash = permute( permute( permute( 
              vec4(i0.z, i1.z, i2.z, i3.z ))
            + vec4(i0.y, i1.y, i2.y, i3.y ))
            + vec4(i0.x, i1.x, i2.x, i3.x ));
  vec4 theta = hash * 3.883222077;
  vec4 sz = hash * -0.006920415 + 0.996539792;
  vec4 psi = hash * 0.108705628;
  vec4 Ct = cos(theta), St = sin(theta);
  vec4 sz_prime = sqrt( 1.0 - sz*sz );
  vec4 gx, gy, gz;
  if(alpha != 0.0) {
    vec4 px = Ct * sz_prime, py = St * sz_prime, pz = sz;
    vec4 Sp = sin(psi), Cp = cos(psi), Ctp = St*Sp - Ct*Cp;
    vec4 qx = mix( Ctp*St, Sp, sz), qy = mix(-Ctp*Ct, Cp, sz);
    vec4 qz = -(py*Cp + px*Sp);
    vec4 Sa = vec4(sin(alpha)), Ca = vec4(cos(alpha));
    gx = Ca*px + Sa*qx; gy = Ca*py + Sa*qy; gz = Ca*pz + Sa*qz;
  } else {
    gx = Ct * sz_prime; gy = St * sz_prime; gz = sz;  
  }
  vec3 g0 = vec3(gx.x, gy.x, gz.x), g1 = vec3(gx.y, gy.y, gz.y);
  vec3 g2 = vec3(gx.z, gy.z, gz.z), g3 = vec3(gx.w, gy.w, gz.w);
  vec4 w = 0.5-vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3));
  w = max(w, 0.0); vec4 w2 = w * w, w3 = w2 * w;
  vec4 gdotx = vec4(dot(g0,x0), dot(g1,x1), dot(g2,x2), dot(g3,x3));
  float n = dot(w3, gdotx);
  vec4 dw = -6.0 * w2 * gdotx;
  vec3 dn0 = w3.x * g0 + dw.x * x0;
  vec3 dn1 = w3.y * g1 + dw.y * x1;
  vec3 dn2 = w3.z * g2 + dw.z * x2;
  vec3 dn3 = w3.w * g3 + dw.w * x3;
  gradient = 39.5 * (dn0 + dn1 + dn2 + dn3);
  return 39.5 * n;
}
`

export const basicNoiseLayer = /*glsl*/`
float basicNoiseLayer(
  float minHeight,
  float amplitude,
  float scale,
  float lacunarity,
  float persistance,
  int exponent,
  int octaves,
  float mask,
  vec3 position
) {
  const int MAX_OCTAVES = 32;

  vec3 start_pos = scale * position.xyz;
  float total_elevation = 0.0;
  float normalization = 0.0;
  float frequency = 1.0;
  float G = pow(2.0, -persistance);
  float ampl = 1.0;

  for(int i = 0; i < MAX_OCTAVES; i++) {
    if(i >= octaves) { break; }

    vec3 v = start_pos * frequency;
    vec3 p = vec3(0.0);
    vec3 g;
    float alpha = 1.0;

    float noise_value = 0.5 + 0.5 * psrdnoise(v, p, alpha, g);
    total_elevation += noise_value * ampl;
    normalization += ampl;
    ampl *= G;
    frequency *= lacunarity;
  }

  total_elevation /= normalization;
  total_elevation *= amplitude;
    
  // elevation = (elevation + 1.0) / 2.0 * amplitude;
  total_elevation = max(0.0, total_elevation - minHeight);
  total_elevation = pow(total_elevation, float(exponent));

  return total_elevation * mask;
}
`

export const erosionNoiseLayer = /*glsl*/`
float erosionNoiseLayer(
  float minHeight,
  float amplitude,
  float scale,
  float mask,
  vec3 position
) {
  vec3 v = scale * position.xyz;
  vec3 p = vec3(0.0);
  vec3 g;
  float alpha = 1.0;
  
  float elevation = 0.5 + 0.5 * psrdnoise(v, p, alpha, g);

  elevation = (elevation + 1.0) / 2.0 * amplitude;

  elevation = 1.0 - abs(elevation);
  elevation *= elevation;
  
  elevation = max(0.0, elevation - minHeight);

  return elevation * mask;
}
`