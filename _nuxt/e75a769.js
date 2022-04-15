(window.webpackJsonp=window.webpackJsonp||[]).push([[21],{235:function(e,t,n){var o=n(3);e.exports=o(1..valueOf)},238:function(e,t,n){"use strict";var o=n(6),r=n(1),l=n(3),v=n(44),c=n(235),d=n(179),h=n(4),m=r.RangeError,f=r.String,y=Math.floor,x=l(d),w=l("".slice),M=l(1..toFixed),z=function(e,t,n){return 0===t?n:t%2==1?z(e,t-1,n*e):z(e*e,t/2,n)},_=function(data,e,t){for(var n=-1,o=t;++n<6;)o+=e*data[n],data[n]=o%1e7,o=y(o/1e7)},k=function(data,e){for(var t=6,n=0;--t>=0;)n+=data[t],data[t]=y(n/e),n=n%e*1e7},F=function(data){for(var e=6,s="";--e>=0;)if(""!==s||0===e||0!==data[e]){var t=f(data[e]);s=""===s?t:s+x("0",7-t.length)+t}return s};o({target:"Number",proto:!0,forced:h((function(){return"0.000"!==M(8e-5,3)||"1"!==M(.9,0)||"1.25"!==M(1.255,2)||"1000000000000000128"!==M(0xde0b6b3a7640080,0)}))||!h((function(){M({})}))},{toFixed:function(e){var t,n,o,r,l=c(this),d=v(e),data=[0,0,0,0,0,0],h="",y="0";if(d<0||d>20)throw m("Incorrect fraction digits");if(l!=l)return"NaN";if(l<=-1e21||l>=1e21)return f(l);if(l<0&&(h="-",l=-l),l>1e-21)if(n=(t=function(e){for(var t=0,n=e;n>=4096;)t+=12,n/=4096;for(;n>=2;)t+=1,n/=2;return t}(l*z(2,69,1))-69)<0?l*z(2,-t,1):l/z(2,t,1),n*=4503599627370496,(t=52-t)>0){for(_(data,0,n),o=d;o>=7;)_(data,1e7,0),o-=7;for(_(data,z(10,o,1),0),o=t-1;o>=23;)k(data,1<<23),o-=23;k(data,1<<o),_(data,1,1),k(data,2),y=F(data)}else _(data,0,n),_(data,1<<-t,0),y=F(data)+x("0",d);return y=d>0?h+((r=y.length)<=d?"0."+x("0",d-r)+y:w(y,0,r-d)+"."+w(y,r-d)):h+y}})},310:function(e,t,n){"use strict";n.d(t,"a",(function(){return o}));var o="\nvec4 permute(vec4 i) {\n  vec4 im = mod(i, 289.0);\n  return mod(((im*34.0)+10.0)*im, 289.0);\n}\n\n// https://github.com/stegu/psrdnoise/\nfloat psrdnoise(vec3 x, vec3 period, float alpha, out vec3 gradient) {\n  const mat3 M = mat3(0.0, 1.0, 1.0, 1.0, 0.0, 1.0,  1.0, 1.0, 0.0);\n  const mat3 Mi = mat3(-0.5, 0.5, 0.5, 0.5,-0.5, 0.5, 0.5, 0.5,-0.5);\n  vec3 uvw = M * x;\n  vec3 i0 = floor(uvw), f0 = fract(uvw);\n  vec3 g_ = step(f0.xyx, f0.yzz), l_ = 1.0 - g_;\n  vec3 g = vec3(l_.z, g_.xy), l = vec3(l_.xy, g_.z);\n  vec3 o1 = min( g, l ), o2 = max( g, l );\n  vec3 i1 = i0 + o1, i2 = i0 + o2, i3 = i0 + vec3(1.0);\n  vec3 v0 = Mi * i0, v1 = Mi * i1, v2 = Mi * i2, v3 = Mi * i3;\n  vec3 x0 = x - v0, x1 = x - v1, x2 = x - v2, x3 = x - v3;\n  if(any(greaterThan(period, vec3(0.0)))) {\n    vec4 vx = vec4(v0.x, v1.x, v2.x, v3.x);\n    vec4 vy = vec4(v0.y, v1.y, v2.y, v3.y);\n    vec4 vz = vec4(v0.z, v1.z, v2.z, v3.z);\n    if(period.x > 0.0) vx = mod(vx, period.x);\n    if(period.y > 0.0) vy = mod(vy, period.y);\n    if(period.z > 0.0) vz = mod(vz, period.z);\n    i0 = floor(M * vec3(vx.x, vy.x, vz.x) + 0.5);\n    i1 = floor(M * vec3(vx.y, vy.y, vz.y) + 0.5);\n    i2 = floor(M * vec3(vx.z, vy.z, vz.z) + 0.5);\n    i3 = floor(M * vec3(vx.w, vy.w, vz.w) + 0.5);\n  }\n  vec4 hash = permute( permute( permute( \n              vec4(i0.z, i1.z, i2.z, i3.z ))\n            + vec4(i0.y, i1.y, i2.y, i3.y ))\n            + vec4(i0.x, i1.x, i2.x, i3.x ));\n  vec4 theta = hash * 3.883222077;\n  vec4 sz = hash * -0.006920415 + 0.996539792;\n  vec4 psi = hash * 0.108705628;\n  vec4 Ct = cos(theta), St = sin(theta);\n  vec4 sz_prime = sqrt( 1.0 - sz*sz );\n  vec4 gx, gy, gz;\n  if(alpha != 0.0) {\n    vec4 px = Ct * sz_prime, py = St * sz_prime, pz = sz;\n    vec4 Sp = sin(psi), Cp = cos(psi), Ctp = St*Sp - Ct*Cp;\n    vec4 qx = mix( Ctp*St, Sp, sz), qy = mix(-Ctp*Ct, Cp, sz);\n    vec4 qz = -(py*Cp + px*Sp);\n    vec4 Sa = vec4(sin(alpha)), Ca = vec4(cos(alpha));\n    gx = Ca*px + Sa*qx; gy = Ca*py + Sa*qy; gz = Ca*pz + Sa*qz;\n  } else {\n    gx = Ct * sz_prime; gy = St * sz_prime; gz = sz;  \n  }\n  vec3 g0 = vec3(gx.x, gy.x, gz.x), g1 = vec3(gx.y, gy.y, gz.y);\n  vec3 g2 = vec3(gx.z, gy.z, gz.z), g3 = vec3(gx.w, gy.w, gz.w);\n  vec4 w = 0.5-vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3));\n  w = max(w, 0.0); vec4 w2 = w * w, w3 = w2 * w;\n  vec4 gdotx = vec4(dot(g0,x0), dot(g1,x1), dot(g2,x2), dot(g3,x3));\n  float n = dot(w3, gdotx);\n  vec4 dw = -6.0 * w2 * gdotx;\n  vec3 dn0 = w3.x * g0 + dw.x * x0;\n  vec3 dn1 = w3.y * g1 + dw.y * x1;\n  vec3 dn2 = w3.z * g2 + dw.z * x2;\n  vec3 dn3 = w3.w * g3 + dw.w * x3;\n  gradient = 39.5 * (dn0 + dn1 + dn2 + dn3);\n  return 39.5 * n;\n}\n"},333:function(e,t,n){var content=n(377);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,n(100).default)("ce9cc306",content,!0,{sourceMap:!1})},376:function(e,t,n){"use strict";n(333)},377:function(e,t,n){var o=n(99)(!1);o.push([e.i,"#main_container[data-v-adce00ae]{background-color:#3a3a98;height:100vh;width:100vw;padding:1rem;box-sizing:border-box;display:grid;grid-template-rows:1fr 10fr}#home-link[data-v-adce00ae]{color:#fff;grid-row:1}#animation_container[data-v-adce00ae]{grid-row:2;display:flex;justify-content:center}canvas[data-v-adce00ae]{width:100%;max-width:90%;max-height:90%}",""]),e.exports=o},413:function(e,t,n){"use strict";n.r(t);var o=n(2),r=n(131),l=n(132),v=(n(238),n(19),n(33),n(230)),c=(n(66),n(45),n(177),n(278)),d=n(270);function h(e,t){var n=new d.a;n.add(t,"reload"),n.add(t,"autoUpdate");var o=n.addFolder("planet data");o.add(e,"radius",.1,2,.01),o.add(e,"globalMinHeight",-1,1,.001),o.add(e,"seed",0,9999),o.add(t,"addNoiseLayer");var r=n.addFolder("noise layers");return r.add(e,"debugNoise"),e.noiseLayers.forEach((function(e,t){var n=r.addFolder("layer [".concat(t,"]"));n.add(e,"amplitude",-1,1,.001),n.add(e,"detail",1,8),n.add(e,"minHeight",-1,1,.001),n.add(e,"maskOnly"),n.add(e,"usePrevLayerAsMask"),n.add(e,"useFirstLayerAsMask"),n.add(e,"removeSelf")})),n.close(),n}var m=function(){function e(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:4,o=arguments.length>2?arguments[2]:void 0;Object(r.a)(this,e),this.resolution=10,this.position=o,this.resolution=n,this.scene=t,this.generateNewMesh()}return Object(l.a)(e,[{key:"getResolution",value:function(){return this.resolution}},{key:"setResolution",value:function(e){this.resolution=e,this.generateNewMesh()}},{key:"getMaterial",value:function(){return this.material}},{key:"setMaterial",value:function(e){this.material=e,this.mesh&&(this.mesh.material=this.material)}},{key:"updateMesh",value:function(){}},{key:"generateNewMesh",value:function(){var e;null===(e=this.mesh)||void 0===e||e.dispose();var t=v.Mesh.CreateIcoSphere("icosphere",{subdivisions:this.resolution,updatable:!0},this.scene);return this.material&&(t.material=this.material),this.mesh=t,this.mesh.position=this.position,t}},{key:"getMesh",value:function(){return this.mesh?this.mesh:this.generateNewMesh()}},{key:"dispose",value:function(){var e,t;null===(e=this.mesh)||void 0===e||e.dispose(),null===(t=this.material)||void 0===t||t.dispose()}}]),e}(),f=n(310),y=function(){function e(t){var n=this,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1,l=arguments.length>2&&void 0!==arguments[2]?arguments[2]:v.Vector3.Zero();Object(r.a)(this,e),this.autoUpdate=!1;var c=Math.floor(9999*Math.random());this.scene=t,this.position=l,this.planetData={globalMinHeight:0,radius:o,seed:c,type:"terrestrial",noiseLayers:[],debugNoise:!1},this.gui=h(this.planetData,this),this.icoSphereMesh=new m(this.scene,32,this.position),this.generateMaterial(),this.material&&this.icoSphereMesh.setMaterial(this.material),this.updateInterval=setInterval((function(){n.autoUpdate&&n.reload()}),100)}return Object(l.a)(e,[{key:"reload",value:function(){var e,t,n,o,r,l,v,c,d,h,m;null===(e=this.material)||void 0===e||e.unfreeze(),null===(t=this.material)||void 0===t||t.setFloat("radius",this.planetData.radius),null===(n=this.material)||void 0===n||n.setFloat("debugNoise",this.planetData.debugNoise?1:0),null===(o=this.material)||void 0===o||o.setInt("layerAmount",this.planetData.noiseLayers.length),null===(r=this.material)||void 0===r||r.setFloats("layerAmplitude",this.planetData.noiseLayers.map((function(e){return e.amplitude}))),null===(l=this.material)||void 0===l||l.setFloats("layerUsePrev",this.planetData.noiseLayers.map((function(e){return e.usePrevLayerAsMask?1:0}))),null===(v=this.material)||void 0===v||v.setFloats("layerUseFirst",this.planetData.noiseLayers.map((function(e){return e.useFirstLayerAsMask?1:0}))),null===(c=this.material)||void 0===c||c.setFloats("layerMaskOnly",this.planetData.noiseLayers.map((function(e){return e.maskOnly?1:0}))),null===(d=this.material)||void 0===d||d.setFloats("layerDetail",this.planetData.noiseLayers.map((function(e){return e.detail}))),null===(h=this.material)||void 0===h||h.setFloats("layerMinHeight",this.planetData.noiseLayers.map((function(e){return e.minHeight}))),null===(m=this.material)||void 0===m||m.freeze(),this.icoSphereMesh.updateMesh()}},{key:"getMaterial",value:function(){return this.material||this.generateMaterial()}},{key:"generateMaterial",value:function(){var e="\n    // precision highp float;\n\n    attribute vec3 position;\n    attribute vec2 uv;\n    attribute vec3 normal;\n\n    uniform mat4 worldViewProjection;\n    uniform float radius;\n    uniform float debugNoise;\n\n    uniform int layerAmount;\n    uniform float layerAmplitude[32];\n    uniform float layerUsePrev[32];\n    uniform float layerUseFirst[32];\n    uniform float layerMaskOnly[32];\n    uniform float layerDetail[32];\n    uniform float layerMinHeight[32];\n\n    // Varying\n    varying vec3 vPosition;\n    varying vec3 vNormal;\n    varying vec2 vUV;\n\n    ".concat(f.a,"\n\n    void main() {\n      float elevation = 1.0;\n      float base_elevation = 1.0;\n      float prev_elevation = 1.0;\n\n      for(int i = 0; i < layerAmount; i++) {\n        vec3 v = layerDetail[i] * position.xyz;\n        vec3 p = vec3(0.0);\n        vec3 g;\n        float alpha = 1.0;\n        \n        float level_elevation = 0.5 + 0.5 * psrdnoise(v, p, alpha, g);\n\n        level_elevation = (level_elevation + 1.0) / 2.0 * layerAmplitude[i];\n        level_elevation = max(0.0, level_elevation - layerMinHeight[i]);\n\n        float mask = 1.0;\n\n        if(layerUseFirst[i] == 1.0) {\n          mask = base_elevation;\n        }\n\n        if(i == 0) {\n          base_elevation = level_elevation;\n        }\n\n        if(layerUsePrev[i] == 1.0 && i >= 1) {\n          mask = prev_elevation;\n        }\n\n        if(layerMaskOnly[i] == 0.0) {\n          prev_elevation = level_elevation * mask;\n          elevation += level_elevation * mask;\n        } else {\n          prev_elevation = (level_elevation * mask) == 0.0 ? 0.0 : 0.5;\n\n          if(debugNoise == 1.0){\n            elevation += (level_elevation * mask) == 0.0 ? 0.0 : 0.5; //* for debugging noise only!\n          }\n        }\n      }\n\n      vec4 pos = worldViewProjection * vec4(position * elevation * radius, 1.0);\n\n      gl_Position = pos;\n\n      vPosition = position;\n      vNormal = normal;\n    }\n    "),t=new v.ShaderMaterial("material",this.scene,{vertexSource:e,fragmentSource:"\n      precision highp float;\n\n      // Varying\n      varying vec3 vPosition;\n      varying vec3 vNormal;\n      // varying vec2 vUV;\n\n      // Uniforms\n      uniform mat4 world;\n\n      // Refs\n      uniform vec3 cameraPosition;\n\n      void main(void) {\n        vec3 vLightPosition = vec3(0,20,20);\n        \n        // World values\n        vec3 vPositionW = vec3(world * vec4(vPosition, 1.0));\n        vec3 vNormalW = normalize(vec3(world * vec4(vNormal, 0.0)));\n        vec3 viewDirectionW = normalize(cameraPosition - vPositionW);\n        \n        // Light\n        vec3 lightVectorW = normalize(vLightPosition - vPositionW);\n        vec3 color = vec4(1.0, 0.0, 1.0, 1.0).rgb;\n        \n        // diffuse\n        float ndl = max(0., dot(vNormalW, lightVectorW));\n        \n        // Specular\n        vec3 angleW = normalize(viewDirectionW + lightVectorW);\n        float specComp = max(0., dot(vNormalW, angleW));\n        specComp = pow(specComp, max(1., 64.)) * 2.;\n        \n        gl_FragColor = vec4(color * ndl + vec3(specComp), 1.);\n\n        // gl_FragColor = vec4(vNormal, 1.0);\n      }\n    "},{attributes:["position","normal","uv"],uniforms:["worldViewProjection","radius","layerAmplitude","layerAmount","cameraPosition","world"]});return t.setFloat("radius",this.planetData.radius),t.setFloat("debugNoise",this.planetData.debugNoise?1:0),t.setInt("layerAmount",this.planetData.noiseLayers.length),t.setFloats("layerAmplitude",this.planetData.noiseLayers.map((function(e){return e.amplitude}))),t.setFloats("layerUsePrev",this.planetData.noiseLayers.map((function(e){return e.usePrevLayerAsMask?1:0}))),t.setFloats("layerUseFirst",this.planetData.noiseLayers.map((function(e){return e.useFirstLayerAsMask?1:0}))),t.setFloats("layerMaskOnly",this.planetData.noiseLayers.map((function(e){return e.maskOnly?1:0}))),t.setFloats("layerDetail",this.planetData.noiseLayers.map((function(e){return e.detail}))),t.setFloats("layerMinHeight",this.planetData.noiseLayers.map((function(e){return e.minHeight}))),this.material=t,this.material.freeze(),t}},{key:"addNoiseLayer",value:function(){var e=this,t=this.planetData.noiseLayers.length;this.planetData.noiseLayers.push({noise:Object(c.makeNoise3D)(this.planetData.seed),removeSelf:function(){e.planetData.noiseLayers.splice(t,1),e.updateGUI()},amplitude:1,minHeight:0,useFirstLayerAsMask:!1,usePrevLayerAsMask:!1,maskOnly:!1,detail:1,index:t}),this.updateGUI()}},{key:"updateGUI",value:function(){this.gui.destroy(),this.gui=h(this.planetData,this)}},{key:"getMesh",value:function(){return this.icoSphereMesh.getMesh()}},{key:"dispose",value:function(){var e;this.updateInterval&&clearInterval(this.updateInterval),this.icoSphereMesh.dispose(),this.gui.destroy(),null===(e=this.material)||void 0===e||e.dispose()}}]),e}(),x=function(){function e(canvas){var t=this;Object(r.a)(this,e),this.planets=[],this.engine=new v.Engine(canvas),this.scene=this.getNewScene(this.engine,canvas),this.divFps=document.getElementById("divFps"),this.engine.runRenderLoop((function(){t.scene.render(),t.divFps&&(t.divFps.innerHTML=t.engine.getFps().toFixed()+" fps")}));for(var i=0;i<1;i++)this.planets.push(new y(this.scene,1,new v.Vector3(3*i,0,0)))}return Object(l.a)(e,[{key:"getNewScene",value:function(e,canvas){var t=new v.Scene(e),n=new v.ArcRotateCamera("Camera",Math.PI/4,Math.PI/4,4,v.Vector3.Zero(),t);n.setTarget(v.Vector3.Zero()),n.attachControl(canvas,!1);new v.HemisphericLight("light1",new v.Vector3(0,1,0),t);var o=v.MeshBuilder.CreateGround("ground1",{width:6,height:6,subdivisions:2,updatable:!1},t);return o.material=new v.StandardMaterial("texture",t),o.position.y=-2,t}},{key:"dispose",value:function(){this.planets.forEach((function(e){return e.dispose()}))}}]),e}(),w=o.a.extend({name:"IndexPage",data:function(){var data={universe:void 0};return data},mounted:function(){var canvas=document.getElementById("animation_canvas");this.universe=new x(canvas)},methods:{},destroyed:function(){var e;null===(e=this.universe)||void 0===e||e.dispose()}}),M=(n(376),n(41)),component=Object(M.a)(w,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"main_container"}},[n("router-link",{attrs:{id:"home-link",to:"/"}},[e._v("home")]),e._v(" "),n("div",{attrs:{id:"divFps"}},[e._v("fps: ")]),e._v(" "),e._m(0)],1)}),[function(){var e=this.$createElement,t=this._self._c||e;return t("div",{attrs:{id:"animation_container"}},[t("canvas",{staticClass:"webgl",attrs:{id:"animation_canvas"}})])}],!1,null,"adce00ae",null);t.default=component.exports}}]);