(window.webpackJsonp=window.webpackJsonp||[]).push([[24],{311:function(e,t,n){n(271)("Uint8",(function(e){return function(data,t,n){return e(this,data,t,n)}}))},336:function(e,t,n){var content=n(383);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,n(100).default)("e10c8594",content,!0,{sourceMap:!1})},382:function(e,t,n){"use strict";n(336)},383:function(e,t,n){var r=n(99)(!1);r.push([e.i,"#main_container[data-v-820d4c38]{background-color:#3a3a98;height:100vh;width:100vw;padding:1rem;box-sizing:border-box;display:grid;grid-template-rows:1fr 10fr}#home-link[data-v-820d4c38]{color:#fff;grid-row:1;width:-webkit-fit-content;width:-moz-fit-content;width:fit-content}#animation_container[data-v-820d4c38]{grid-row:2;display:flex;justify-content:center}canvas[data-v-820d4c38]{width:100%;max-width:90%;max-height:90%}",""]),e.exports=r},414:function(e,t,n){"use strict";n.r(t);var r=n(2),o=n(131),c=n(132),h=(n(66),n(239),n(19),n(311),n(240),n(241),n(242),n(243),n(244),n(245),n(246),n(247),n(248),n(249),n(250),n(251),n(252),n(253),n(254),n(255),n(256),n(257),n(258),n(259),n(260),n(261),n(262),n(45),n(228)),d=n(273),w=n(278);function v(e){if(1==e.x)return new h.v(0,1);if(-1==e.x)return new h.v(2,1);if(1==e.y)return new h.v(1,0);if(-1==e.y)return new h.v(2,0);if(1==e.z)return new h.v(1,1);if(-1==e.z)return new h.v(0,0);throw"normal is not a normal"}function l(e){if(1==e.x)return 0;if(-1==e.x)return 2;if(1==e.y)return 4;if(-1==e.y)return 5;if(1==e.z)return 1;if(-1==e.z)return 3;throw"normal is not a normal"}function f(e,t){var n=v(t),p=e.addScalar(1).divideScalar(2),r=new h.v;switch(l(t)){case 0:r=new h.v(p.z,p.y);break;case 1:r=new h.v(1-p.x,p.y);break;case 2:r=new h.v(1-p.z,p.y);break;case 3:r=new h.v(p.x,p.y);break;case 4:r=new h.v(p.z,1-p.x);break;case 5:r=new h.v(p.z,p.x)}return r.clone().divide(new h.v(3,2)).add(n.divide(new h.v(3,2)))}function m(e){if(e.y>=0&&e.y<.5){if(e.x>=0&&e.x<1/3)return 3;if(e.x>=1/3&&e.x<2/3)return 4;if(e.x>=2/3&&e.x<1)return 5}else if(e.y>=.5&&e.y<=1){if(e.x>=0&&e.x<1/3)return 0;if(e.x>=1/3&&e.x<2/3)return 1;if(e.x>=2/3&&e.x<1)return 2}throw"uv coords must be 0<=uv<=1"}function x(e){var t=function(e){switch(e){case 0:return new h.w(1,0,0);case 2:return new h.w(-1,0,0);case 1:return new h.w(0,0,1);case 3:return new h.w(0,0,-1);case 4:return new h.w(0,1,0);case 5:return new h.w(0,-1,0)}throw"face must be 0<=f<=5"}(m(e)),n=new h.v(e.x%(1/3)*3*2-1,e.y%.5*2*2-1),r=new h.w;switch(m(e)){case 0:r=new h.w(1,n.y,n.x);break;case 2:r=new h.w(-1,n.y,-n.x);break;case 1:r=new h.w(-n.x,n.y,1);break;case 3:r=new h.w(n.x,n.y,-1);break;case 4:r=new h.w(-n.y,1,n.x);break;case 5:r=new h.w(n.y,-1,n.x);break;default:throw"error in converting uv to face"}var o=r.clone(),c=o.x*o.x,d=o.y*o.y,w=o.z*o.z,v=o.x*Math.sqrt(1-(d+w)/2+d*w/3),l=o.y*Math.sqrt(1-(w+c)/2+w*c/3),f=o.z*Math.sqrt(1-(c+d)/2+c*d/3);return{normal:t,position:new h.w(v,l,f)}}var y=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:32,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:new h.m,r=arguments.length>2?arguments[2]:void 0,c=arguments.length>3?arguments[3]:void 0;Object(o.a)(this,e),this.mesh=new h.k,this.resolution=t,this.material=n,this.geometry=this.generateGeometry(r,c),this.mesh.material=this.material,this.mesh.geometry=this.geometry}return Object(c.a)(e,[{key:"generateGeometry",value:function(e,t){for(var n=new h.b(2,2,2,this.resolution,this.resolution,this.resolution),r=n.getAttribute("position"),o=n.getAttribute("uv"),c=n.getAttribute("normal"),d=Object(w.makeNoise3D)(999),i=0;i<r.count;i++){var v=new h.w(r.getX(i),r.getY(i),r.getZ(i)),l=new h.w(c.getX(i),c.getY(i),c.getZ(i)),m=v.x*v.x,x=v.y*v.y,y=v.z*v.z,z=v.x*Math.sqrt(1-(x+y)/2+x*y/3),k=v.y*Math.sqrt(1-(y+m)/2+y*m/3),_=v.z*Math.sqrt(1-(m+x)/2+m*x/3),M=f(v.clone(),l.clone());o.setXY(i,M.x,M.y);var S=1+(d(2*z,2*k,2*_)+1)/2;r.setXYZ(i,z*S,k*S,_*S)}return n.computeVertexNormals(),n}},{key:"addToScene",value:function(e){e.add(this.mesh)}}]),e}(),z=function(){function e(canvas){var t=this;Object(o.a)(this,e),this.lastFrame=0,this.fpsDisplay=document.getElementById("divFps"),this.frameStep=0,this.canvas=canvas,this.scene=new h.q;var n=new h.a(16777215,.5);n.position.set(4,-2,0),n.castShadow=!1,this.scene.add(n);var r=new h.h(10,10);this.scene.add(r),this.sizes={width:this.canvas.clientWidth,height:this.canvas.clientHeight},window.addEventListener("resize",(function(){t.sizes.width=t.canvas.clientWidth,t.sizes.height=t.canvas.clientHeight,t.camera.aspect=t.sizes.width/t.sizes.height,t.camera.updateProjectionMatrix(),t.renderer.setSize(t.sizes.width,t.sizes.height),t.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))})),this.camera=new h.n(75,this.sizes.width/this.sizes.height),this.camera.position.set(0,1,2),this.scene.add(this.camera),this.controls=new d.a(this.camera,this.canvas),this.controls.enableDamping=!0,this.renderer=new h.x({canvas:this.canvas}),this.renderer.setSize(this.sizes.width,this.sizes.height),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.setClearColor(13421772,1),this.testInit()}return Object(c.a)(e,[{key:"update",value:function(){this.controls.update(),this.renderer.render(this.scene,this.camera),this.frameStep++,this.fpsDisplay&&20==this.frameStep&&(this.fpsDisplay.innerText="fps: ".concat(Math.floor(1e3/(performance.now()-this.lastFrame)*20)),this.lastFrame=performance.now(),this.frameStep=0)}},{key:"initUpdate",value:function(){this.updateInterval=setInterval(this.update.bind(this),1e3/120)}},{key:"stopUpdate",value:function(){this.updateInterval&&clearInterval(this.updateInterval)}},{key:"dispose",value:function(){this.renderer.dispose()}},{key:"testInit",value:function(){for(var e=new h.v(1200,800),t=e.x*e.y,n=new Uint8Array(4*t),r=Object(w.makeNoise3D)(999),i=0;i<t;i++){var o=x(new h.v(i%e.x,Math.floor(i/e.x)).divide(e)),c=o.position,d=(o.normal,(r(2*c.x,2*c.y,2*c.z)+1)/2);n[4*i+0]=255*d,n[4*i+1]=255*d,n[4*i+2]=255*d,n[4*i+3]=255}var v=new h.d(n,e.x,e.y);v.needsUpdate=!0;var l=new h.m({wireframe:!1});l.map=v,new y(void 0,l,n,e).addToScene(this.scene)}}]),e}(),k=r.a.extend({name:"IndexPage",data:function(){var data={universe:void 0};return data},mounted:function(){var canvas=document.getElementById("animation_canvas");this.universe=new z(canvas),this.universe.initUpdate()},methods:{},destroyed:function(){var e;null===(e=this.universe)||void 0===e||e.dispose()}}),_=(n(382),n(41)),component=Object(_.a)(k,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"main_container"}},[n("router-link",{attrs:{id:"home-link",to:"/"}},[e._v("home")]),e._v(" "),n("div",{attrs:{id:"divFps"}},[e._v("fps: ")]),e._v(" "),e._m(0)],1)}),[function(){var e=this.$createElement,t=this._self._c||e;return t("div",{attrs:{id:"animation_container"}},[t("canvas",{staticClass:"webgl",attrs:{id:"animation_canvas"}})])}],!1,null,"820d4c38",null);t.default=component.exports}}]);