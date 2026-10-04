import * as THREE from './vendor/three.module.js';

// Geometric shopping bag. Change the colors or dimensions here.
export function createShoppingBag(labelTexture) {
  const bag = new THREE.Group();
  const black = new THREE.MeshPhysicalMaterial({color:0x101010,roughness:.47,metalness:.12,clearcoat:.25});
  const sideBlack = new THREE.MeshStandardMaterial({color:0x080808,roughness:.66,side:THREE.DoubleSide});
  const lining = new THREE.MeshStandardMaterial({color:0x111111,roughness:.9,side:THREE.BackSide});
  const gold = new THREE.MeshStandardMaterial({color:0xd0a653,metalness:.87,roughness:.28});
  const lightGold = new THREE.MeshStandardMaterial({color:0xe3c47f,metalness:.8,roughness:.32});
  const width=2.6, bottomWidth=2.34, bottom=-1.45, top=1.12;
  const frontTop=.49, frontBottom=.38;
  function polygon(vertices, material, indices=[0,1,2,0,2,3]) {
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices.flat(),3));
    geometry.setIndex(indices);geometry.computeVertexNormals();
    const mesh=new THREE.Mesh(geometry,material);bag.add(mesh);return mesh;
  }
  const front=[[-bottomWidth/2,bottom,frontBottom],[bottomWidth/2,bottom,frontBottom],[width/2,top,frontTop],[-width/2,top,frontTop]];
  const back=[[bottomWidth/2,bottom,-frontBottom],[-bottomWidth/2,bottom,-frontBottom],[-width/2,top,-frontTop],[width/2,top,-frontTop]];
  for (const vertices of [front,back]) {const mesh=polygon(vertices,black);const inner=new THREE.Mesh(mesh.geometry,lining);bag.add(inner);}
  // Folded gussets on each side, with an inward centre crease.
  for(const sign of [-1,1]) {
    polygon([[sign*bottomWidth/2,bottom,frontBottom],[sign*bottomWidth/2,bottom,-frontBottom],[sign*width/2,top,-frontTop],[sign*(width/2-.18),top,.0],[sign*width/2,top,frontTop]],sideBlack,[0,1,3,1,2,3,0,3,4]);
    polygon([[sign*bottomWidth/2,bottom,frontBottom],[sign*bottomWidth/2,bottom,-frontBottom],[sign*(bottomWidth/2-.1),bottom+.28,0]],black,[0,1,2]);
  }
  polygon([[-bottomWidth/2,bottom,frontBottom],[-bottomWidth/2,bottom,-frontBottom],[bottomWidth/2,bottom,-frontBottom],[bottomWidth/2,bottom,frontBottom]],sideBlack);
  function tube(points,radius,material,segments=64){
    const curve=new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v)));
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,segments,radius,8,false),material);bag.add(mesh);return curve;
  }
  // Fine gold foil edge, front and back.
  tube([[-width/2,top,frontTop],[0,top+.004,frontTop],[width/2,top,frontTop]],.008,gold);
  tube([[-width/2,top,-frontTop],[0,top+.004,-frontTop],[width/2,top,-frontTop]],.008,gold);
  // Rope handles: three intertwined strands around each arch.
  for(const z of [.515,-.515]){
    const curve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(-.62,.91,z),new THREE.Vector3(-.66,1.76,z),
      new THREE.Vector3(-.43,2.36,z),new THREE.Vector3(0,2.55,z),
      new THREE.Vector3(.43,2.36,z),new THREE.Vector3(.66,1.76,z),new THREE.Vector3(.62,.91,z)
    ]);
    const frames=curve.computeFrenetFrames(128,false);
    for(let strand=0;strand<3;strand++){
      const points=[];
      for(let i=0;i<=128;i++){
        const t=i/128,angle=t*Math.PI*2*25+strand*Math.PI*2/3;
        points.push(curve.getPoint(t).addScaledVector(frames.normals[i],Math.cos(angle)*.012).addScaledVector(frames.binormals[i],Math.sin(angle)*.012));
      }
      const strandCurve=new THREE.CatmullRomCurve3(points);
      const rope=new THREE.Mesh(new THREE.TubeGeometry(strandCurve,256,.014,6,false),strand===1?lightGold:gold);bag.add(rope);
    }
    for(const x of [-.62,.62]){
      const eyelet=new THREE.Mesh(new THREE.TorusGeometry(.05,.009,8,24),gold);
      eyelet.position.set(x,.91,z);bag.add(eyelet);
    }
  }
  // Thin folded tissue paper, positioned behind the front print.
  function tissue(w,h,x,y,z,color,rotation,phase){
    const g=new THREE.PlaneGeometry(w,h,12,14),a=g.attributes.position;
    for(let i=0;i<a.count;i++){
      const px=a.getX(i),py=a.getY(i);
      a.setZ(i,Math.sin(px*9+phase)*.085+Math.cos(py*8-px*5)*.06);
      a.setY(i,py+Math.sin(px*6+phase)*.08*(py/h+.5));
    }
    g.computeVertexNormals();
    const m=new THREE.MeshStandardMaterial({color,roughness:.65,metalness:color===0x151515?.05:.3,side:THREE.DoubleSide});
    const sheet=new THREE.Mesh(g,m);sheet.position.set(x,y,z);sheet.rotation.set(-.13,phase*.1,rotation);bag.add(sheet);
  }
  tissue(1.0,1.24,-.72,1.32,-.15,0x151515,.35,1);
  tissue(.95,1.3,.49,1.41,-.21,0xd5b56e,-.35,3);
  tissue(.85,1.06,-.1,1.34,-.1,0xb99853,.4,5);
  tissue(.76,.92,.76,1.27,.04,0x1c1c1c,-.25,7);
  // Gold artwork and type sit directly on the paper, not on a white label.
  const labelMaterial=new THREE.MeshStandardMaterial({map:labelTexture,transparent:true,metalness:.7,roughness:.36,depthWrite:false});
  const label=new THREE.Mesh(new THREE.PlaneGeometry(2.09,1.85),labelMaterial);
  label.position.set(0,-.31,.437);label.rotation.x=Math.atan((frontTop-frontBottom)/(top-bottom));
  label.renderOrder=1;bag.add(label);
  bag.userData.materials=[black,sideBlack,lining,gold,lightGold,labelMaterial];
  return bag;
}
