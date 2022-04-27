float basicNoiseLayer(
  float minHeight,
  float amplitude,
  float scale,
  float lacunarity,
  float persistence,
  float exponent,
  int octaves,
  float mask,
  vec3 position,
) {
  const int MAX_OCTAVES = 32;

  vec3 start_pos = scale * position.xyz;
  float total_elevation = 0.0;
  float normalization = 0.0;
  float frequency = 1.0;
  float G = pow(2.0, -persistence);

  for(int i = 0; i < MAX_OCTAVES; i++) {
    if(i >= octaves) { break; }

    vec3 v = start_pos * frequency;
    vec3 p = vec3(0.0);
    vec3 g;
    float alpha = 1.0;

    float noise_value = 0.5 + 0.5 * psrdnoise(v, p, alpha, g);
    total += noise_value * amplitude;
    normalization += amplitude;
    amplitude *= G;
    frequency *= lacunarity;
  }

  total /= normalization;
    
  // elevation = (elevation + 1.0) / 2.0 * amplitude;
  elevation = max(0.0, elevation - minHeight);
  elevation = pow(elevation, exponent);

  return elevation * mask;
}