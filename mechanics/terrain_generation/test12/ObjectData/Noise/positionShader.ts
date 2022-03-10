import { GPGPUuniform } from "../../lib/GPGPU"

export type positionShader = { vertexSource: string, fragmentSource: string, uniforms: positionUniform[] }
export type positionUniform = GPGPUuniform

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

      uniform sampler2D texture;
      varying vec2 vTextureCoord;

      void main() {
        gl_FragColor = texture2D(texture, vTextureCoord);
        // gl_FragColor = vec4(vTextureCoord, 0.3, 0.3);
        // gl_FragColor = vec4(vPosition, 2.0);
      }
    `,
    uniforms: []
  }

  return shader
}