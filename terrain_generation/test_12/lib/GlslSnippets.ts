/**
 * **texture 0**: position \
 * **texture 1**: elevation (/,/,prev,tot) \
 * **texture 2**: mask
 */
export const texture_uniforms = /*glsl*/`
uniform sampler2D texture0; // position
uniform sampler2D texture1; // elevation (/,/,prev,tot)
uniform sampler2D texture2; // mask (/,/,prev,tot)
varying vec2 vTextureCoord;

#define position_texture texture0
#define elevation_texture texture1
#define mask_texture texture2
`