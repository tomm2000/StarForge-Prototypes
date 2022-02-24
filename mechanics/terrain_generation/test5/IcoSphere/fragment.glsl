//void main() {
//	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
//}

varying mediump vec3 vNormal;

void main() {
	vec3 light = vec3(0.5, 0.2, 1.0);

	// ensure it's normalized
	light = normalize(light);

	// calculate the dot product of
	// the light to the vertex normal
	float dProd = max(0.0, dot(vNormal, light));

	// feed into our frag colour
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}