export type positionShader = { vertexSource: string, fragmentSource: string, uniforms: positionUniform[] }
export type positionUniform = { name: string, value: any } // "uniform1f"

export function getDefaultPositionShaderVertex(fragmentSource: string): positionShader {
  const shader: positionShader = {
    fragmentSource,
    vertexSource: /*glsl*/`
    attribute vec3 position;
    attribute vec2 textureCoord;

    varying highp vec2 vTextureCoord;

    void main() {
        gl_Position = vec4(position, 1.0);
        vTextureCoord = textureCoord;
    }
    `,
    uniforms: []
  }
  return shader
}

export function getDefaultPositionShader(): positionShader {
  const shader: positionShader = {
    vertexSource: /*glsl*/`
      attribute vec3 position;
      attribute vec2 textureCoord;

      varying highp vec2 vTextureCoord;

      void main() {
          // NON TOCCARE
          gl_Position = vec4(position, 1.0);
          vTextureCoord = textureCoord;
          // ===========
      }
    `,
    fragmentSource: /*glsl*/`
      precision highp float;

      uniform sampler2D texture0;
      uniform sampler2D texture1;
      varying vec2 vTextureCoord;
      uniform float math_pi;

      void main() {
        // vec3 position = texture2D(texture1, vTextureCoord).xyz;
        vec3 position = (texture2D(texture1, vTextureCoord).xyz * 2.0) - 1.0;

        // const latitude = Math.asin(pointOnUnitSphere.y)
        // const longitude = Math.atan2(pointOnUnitSphere.x, -pointOnUnitSphere.z)
        float latitude = asin(position.y) + math_pi/2.0;
        float longitude = atan(position.x, -position.z) + math_pi;

        vec2 texturepos = vec2(longitude / (math_pi * 2.0), latitude / math_pi);

        float elevation = texture2D(texture0, texturepos).r;
        elevation = max(0.0, elevation - 0.6);

        vec3 pos = (position + 1.0) / 2.0;

        gl_FragColor = vec4(pos, 1.0/elevation);

        // gl_FragColor = vec4(latitude, longitude, 1.0, 1.0);
      }
    `,
    uniforms: []
  }

  return shader
}