import Phaser from "phaser";
import { destinations } from "../content";
import type { DestinationId, ThemeMode } from "../types";
import { gameEvents } from "./events";

const TILE = 16;
type Direction = "south" | "southwest" | "west" | "northwest" | "north" | "northeast" | "east" | "southeast";
type Point = { x: number; y: number };
type Interaction = { kind: "portal"; destination: DestinationId; x: number; y: number } | { kind: "rest"; x: number; y: number };
const directions: Direction[] = ["south", "southwest", "west", "northwest", "north", "northeast", "east", "southeast"];

export class WorldScene extends Phaser.Scene {
  private map?: Phaser.Tilemaps.Tilemap;
  private player!: Phaser.Physics.Arcade.Sprite;
  private collisionLayer?: Phaser.Tilemaps.TilemapLayer;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private blocked: boolean[][] = [];
  private interactions: Interaction[] = [];
  private nearby: Interaction | null = null;
  private path: Point[] = [];
  private facing: Direction = "south";
  private transitioning = false;
  private reducedEffects = false;
  private resting = false;
  private portalEffects: Phaser.GameObjects.GameObject[] = [];
  private nightOverlay?: Phaser.GameObjects.Rectangle;
  private readonly handleResize = (gameSize: Phaser.Structs.Size) => this.resizeCamera(gameSize.width, gameSize.height);

  constructor() { super("world"); }

  preload() {
    const root = "./assets/pixel";
    this.load.image("outdoor-tiles", `${root}/Forchild/BasicVillageTileset/Outdoor_tileset.png`);
    this.load.image("house-tiles", `${root}/Forchild/BasicVillageTileset/House_tileset.png`);
    this.load.image("furniture-tiles", `${root}/Forchild/BasicVillageTileset/Furniture.png`);
    this.load.image("trees-tiles", `${root}/Forchild/BasicVillageTileset/Trees_and_bushes.png`);
    this.load.spritesheet("tree-sprites", `${root}/Forchild/BasicVillageTileset/Trees_and_bushes.png`, { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet("house-sprites", `${root}/Forchild/BasicVillageTileset/House_tileset.png`, { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("furniture-sprites", `${root}/Forchild/BasicVillageTileset/Furniture.png`, { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("outdoor-sprites", `${root}/Forchild/BasicVillageTileset/Outdoor_tileset.png`, { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("sandip", `${root}/sandip-eight-direction.png`, { frameWidth: 24, frameHeight: 32 });
    for (const destination of destinations) this.load.image(`building-${destination.id}`, `${root}/building-${destination.id}.png`);
    this.load.tilemapTiledJSON("map-village", `${root}/maps/village.tmj`);
  }

  create() {
    this.createAnimations();
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys("W,A,S,D,E,ENTER") as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.handlePointer(pointer));
    this.buildVillage();
    this.events.on("set-theme", (theme: ThemeMode, amount: number) => this.applyTheme(theme, amount));
    this.events.on("travel-to", (destination: DestinationId) => this.travelTo(destination));
    this.events.on("return-village", () => this.returnToCenter());
    this.events.on("activate-nearby", () => { if(this.nearby)this.activate(this.nearby); });
    this.events.on("reduced-effects", (value: boolean) => { this.reducedEffects = value; });
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize));
  }

  update() {
    if (!this.player?.body || this.transitioning) return;
    let dx = Number(this.cursors.right.isDown || this.keys.D.isDown) - Number(this.cursors.left.isDown || this.keys.A.isDown);
    let dy = Number(this.cursors.down.isDown || this.keys.S.isDown) - Number(this.cursors.up.isDown || this.keys.W.isDown);
    if (dx || dy) {
      if (this.resting) { this.resting=false; gameEvents.emit("rest-state",{active:false}); }
      this.path = [];
      const length = Math.hypot(dx, dy); dx /= length; dy /= length;
      this.move(dx * 96, dy * 96);
    } else if (this.path.length) {
      const node = this.path[0], tx = node.x * TILE + 8, ty = node.y * TILE + 8;
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, tx, ty) < 3) { this.path.shift(); this.player.setPosition(tx, ty); }
      if (this.path.length) { const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, tx, ty); this.move(Math.cos(angle) * 82, Math.sin(angle) * 82); } else this.stop();
    } else this.stop();
    this.updateInteraction();
    if ((Phaser.Input.Keyboard.JustDown(this.keys.E) || Phaser.Input.Keyboard.JustDown(this.keys.ENTER)) && this.nearby) this.activate(this.nearby);
    gameEvents.emit("player-state", { tile: this.worldToTile(this.player.x, this.player.y), facing: this.facing, moving: this.player.body.velocity.lengthSq() > 1 });
  }

  private createAnimations() {
    directions.forEach((direction, row) => {
      if (!this.anims.exists(`walk-${direction}`)) this.anims.create({ key: `walk-${direction}`, frames: this.anims.generateFrameNumbers("sandip", { start: row * 9 + 1, end: row * 9 + 8 }), frameRate: 11, repeat: -1 });
    });
    if (!this.anims.exists("wave-south")) this.anims.create({ key: "wave-south", frames: this.anims.generateFrameNumbers("sandip", { start: 72, end: 77 }), frameRate: 8, repeat: 1 });
  }

  private buildVillage() {
    this.children.removeAll(true);
    this.physics.world.colliders.destroy();
    this.path = []; this.nearby = null; this.interactions = [];
    this.map = this.make.tilemap({ key: "map-village" });
    const sets = [
      this.map.addTilesetImage("Outdoor", "outdoor-tiles"), this.map.addTilesetImage("House", "house-tiles"),
      this.map.addTilesetImage("Furniture", "furniture-tiles"), this.map.addTilesetImage("Trees", "trees-tiles"),
    ].filter(Boolean) as Phaser.Tilemaps.Tileset[];
    const ground = this.map.createLayer("ground", sets, 0, 0)?.setDepth(-30);
    this.map.createLayer("decoration", sets, 0, 0)?.setDepth(-20);
    this.collisionLayer = this.map.createLayer("collision", sets, 0, 0)?.setVisible(false).setCollisionByExclusion([-1]);
    this.map.createLayer("portal", sets, 0, 0)?.setDepth(-5);
    this.map.createLayer("spawn", sets, 0, 0)?.setVisible(false);
    this.map.createLayer("interaction", sets, 0, 0)?.setVisible(false);
    this.map.createLayer("above-player", sets, 0, 0)?.setDepth(1200);
    if (!ground || !this.collisionLayer) throw new Error("Required Tiled layers are missing in village");
    this.blocked = this.collisionLayer.layer.data.map((row) => row.map((tile) => tile.index !== -1));
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels).setRoundPixels(true);
    this.buildVillageObjects();
    const spawn = this.findMarkedTile("spawn") ?? { x: Math.floor(this.map.width / 2), y: Math.floor(this.map.height / 2) };
    this.createPlayer(spawn.x * TILE + 8, spawn.y * TILE + 8);
    gameEvents.emit("proximity", { interaction: null });
    gameEvents.emit("location-changed", { location: "village" });
    this.player.anims.play("wave-south");
    this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => this.stop());
  }

  private buildVillageObjects() {
    this.add.circle(32*TILE+8,24*TILE+8,118,0xffdc83,.035).setDepth(-7).setBlendMode(Phaser.BlendModes.ADD);
    this.addScenery();
    this.add.text(32*TILE+8,24*TILE-30,"CENTRAL WAYPOINT",this.textStyle(11,"#fff1b8","#17231fee")).setOrigin(.5).setDepth(900);
    const objects = this.map!.getObjectLayer("buildings")?.objects ?? [];
    objects.forEach((object) => {
      const destination = this.property(object,"destination") as DestinationId;
      const title = String(this.property(object,"title"));
      const doorX = Number(this.property(object,"doorX"));
      const doorY = Number(this.property(object,"doorY"));
      const doorAngle = Number(this.property(object,"doorAngle"));
      this.renderBuilding(object.x!,object.y!,destination,title,doorX,doorY,doorAngle);
      this.interactions.push({ kind:"portal", destination, x:doorX, y:doorY });
    });
  }

  private renderBuilding(x:number,y:number,id:DestinationId,title:string,doorX:number,doorY:number,doorAngle:number) {
    const destination = destinations.find((item)=>item.id===id)!;
    const accent = Phaser.Display.Color.HexStringToColor(destination.accent).color;
    const doorRotation=doorAngle-90;
    const awayX=(x-32*TILE-8)/TILE,awayY=(y-24*TILE-8)/TILE,awayLength=Math.hypot(awayX,awayY)||1;
    this.add.image(x+(awayX/awayLength)*6,y+(awayY/awayLength)*6,`building-${id}`).setAngle(doorRotation).setTint(0x14202a).setAlpha(.4).setDepth(y+43);
    this.add.image(x,y,`building-${id}`).setAngle(doorRotation).setTint(0xfff1c7).setDepth(y+45);
    const portal=this.add.ellipse(doorX,doorY,32,18,0x8129c7,.76).setAngle(doorRotation).setStrokeStyle(3,accent).setDepth(y+71);
    this.tweens.add({targets:portal,alpha:.36,scaleX:.78,scaleY:.72,duration:700,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
    const dx=doorX-x,dy=doorY-y,length=Math.hypot(dx,dy),ux=dx/length,uy=dy/length;
    const signX=doorX-ux*10,signY=doorY-uy*10;
    this.add.rectangle(signX,signY,50,15,0x241b19,.92).setStrokeStyle(1,0xf4d69a).setDepth(y+72);
    this.add.text(signX,signY,title.toUpperCase(),this.textStyle(7,"#fff4cc")).setOrigin(.5).setDepth(y+73);
  }

  private addScenery() {
    const trees=this.map!.getObjectLayer("scenery")?.objects??[];
    trees.forEach((tree) => {
      const frame=Number(this.property(tree,"frame")??0),x=tree.x!,y=tree.y!;
      const image = this.add.image(x,y,"tree-sprites",frame).setOrigin(.5,.82).setDepth(y+36);
      image.setData("scenery",true);
    });
    this.addBorderForest();
    [[28,27],[37,22]].forEach(([x,y])=>this.add.image(x*TILE+8,y*TILE+8,"furniture-sprites",69).setScale(1.25).setDepth(y*TILE+8));
    this.add.image(36*TILE+8,27*TILE+8,"furniture-sprites",69).setScale(1.65).setDepth(27*TILE+12);
    this.interactions.push({kind:"rest",x:35*TILE+8,y:27*TILE+8});
  }

  private addBorderForest(){
    const vertices=[{x:32,y:3},{x:53,y:17},{x:45,y:42},{x:19,y:42},{x:11,y:17}],buildings=[{x:32,y:6},{x:50,y:18},{x:43,y:39},{x:21,y:39},{x:14,y:18}];
    let count=0;
    for(let i=0;i<vertices.length;i++){
      const a=vertices[i],b=vertices[(i+1)%vertices.length],steps=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y));
      for(let s=0;s<=steps;s+=2){const x=Math.round(a.x+(b.x-a.x)*s/steps),y=Math.round(a.y+(b.y-a.y)*s/steps);if(buildings.some((p)=>Math.hypot(p.x-x,p.y-y)<4.4))continue;
        this.add.image(x*TILE+8,y*TILE+8,"tree-sprites",count++%3).setOrigin(.5,.82).setDepth(y*TILE+45);
      }
    }
  }

  private createPlayer(x:number,y:number){
    this.player=this.physics.add.sprite(x,y,"sandip",0).setOrigin(.5,.86).setDepth(1000);
    this.player.setAlpha(1).setCollideWorldBounds(true).setBodySize(12,8).setOffset(6,23);
    this.physics.add.collider(this.player,this.collisionLayer!);
    this.cameras.main.startFollow(this.player,true,.14,.14);
    // Integer zoom preserves crisp pixels while keeping at least one pentagon vertex
    // visible from the central spawn on a typical desktop viewport.
    this.resizeCamera(this.scale.width,this.scale.height);
    this.nightOverlay=this.add.rectangle(0,0,this.map!.widthInPixels,this.map!.heightInPixels,0x10295c,0).setOrigin(0).setDepth(40).setBlendMode(Phaser.BlendModes.MULTIPLY);
  }

  private move(x:number,y:number){ this.player.setVelocity(x,y); this.facing=this.directionFor(x,y); this.player.anims.play(`walk-${this.facing}`,true); }
  private stop(faceVisitor=true){ this.player.setVelocity(0,0).anims.stop(); if(faceVisitor)this.facing="south"; this.player.setFrame(directions.indexOf(this.facing)*9); }

  private resizeCamera(width:number,height:number){
    const zoom = width >= 1500 && height >= 900 ? 2 : 1;
    this.cameras.main.setZoom(zoom);
    gameEvents.emit("viewport-state",{width,height,zoom});
  }
  private directionFor(x:number,y:number):Direction{
    const angle=(Math.atan2(y,x)*180/Math.PI+360)%360;
    if(angle<22.5||angle>=337.5)return "east"; if(angle<67.5)return "southeast"; if(angle<112.5)return "south"; if(angle<157.5)return "southwest";
    if(angle<202.5)return "west"; if(angle<247.5)return "northwest"; if(angle<292.5)return "north"; return "northeast";
  }

  private handlePointer(pointer:Phaser.Input.Pointer){
    if(this.transitioning)return; const world=pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
    if(this.nearby&&Phaser.Math.Distance.Between(world.x,world.y,this.nearby.x,this.nearby.y)<64){this.activate(this.nearby);return;}
    const target=this.worldToTile(world.x,world.y); this.path=this.findPath(this.worldToTile(this.player.x,this.player.y),target); gameEvents.emit("path-result",{found:this.path.length>0,target});
  }
  private worldToTile(x:number,y:number):Point{return{x:Math.floor(x/TILE),y:Math.floor(y/TILE)};}
  private walkable(x:number,y:number){return y>=0&&y<this.blocked.length&&x>=0&&x<this.blocked[0].length&&!this.blocked[y][x];}
  private findPath(start:Point,goal:Point):Point[]{
    if(!this.walkable(goal.x,goal.y))return[]; const key=(p:Point)=>`${p.x},${p.y}`,open:Point[]=[start],came=new Map<string,Point>(),cost=new Map<string,number>([[key(start),0]]);
    const steps=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
    while(open.length){open.sort((a,b)=>cost.get(key(a))!+Math.hypot(goal.x-a.x,goal.y-a.y)-cost.get(key(b))!-Math.hypot(goal.x-b.x,goal.y-b.y));const current=open.shift()!;
      if(current.x===goal.x&&current.y===goal.y){const path:Point[]=[];let cursor=current;while(key(cursor)!==key(start)){path.unshift(cursor);cursor=came.get(key(cursor))!;}return path;}
      for(const [dx,dy] of steps){const next={x:current.x+dx,y:current.y+dy};if(!this.walkable(next.x,next.y))continue;if(dx&&dy&&(!this.walkable(current.x+dx,current.y)||!this.walkable(current.x,current.y+dy)))continue;
        const nextCost=cost.get(key(current))!+(dx&&dy?Math.SQRT2:1);if(!cost.has(key(next))||nextCost<cost.get(key(next))!){cost.set(key(next),nextCost);came.set(key(next),current);open.push(next);}}
    }return[];
  }

  private updateInteraction(){let next:Interaction|null=null,min=54;for(const item of this.interactions){const distance=Phaser.Math.Distance.Between(this.player.x,this.player.y,item.x,item.y);if(distance<min){min=distance;next=item;}}if(JSON.stringify(next)!==JSON.stringify(this.nearby)){this.nearby=next;gameEvents.emit("proximity",{interaction:next});}}
  private activate(item:Interaction){if(item.kind==="rest"){this.path=[];this.resting=true;this.player.setPosition(item.x,item.y+5);this.stop();gameEvents.emit("rest-state",{active:true});return;}this.travelTo(item.destination);}
  private travelTo(destination:DestinationId){
    if(this.transitioning)return;this.clearPortalEffects();this.transitioning=true;this.path=[];this.stop();
    const portal=this.interactions.find((item):item is Extract<Interaction,{kind:"portal"}>=>item.kind==="portal"&&item.destination===destination);
    if(portal){const angle=Phaser.Math.Angle.Between(32*TILE+8,24*TILE+8,portal.x,portal.y);this.player.setPosition(portal.x-Math.cos(angle)*34,portal.y-Math.sin(angle)*34);this.facing=this.directionFor(Math.cos(angle),Math.sin(angle));this.stop(false);}
    gameEvents.emit("portal-state",{active:true,destination});
    const open=()=>gameEvents.emit("open-content",{destination});const done=()=>{this.clearPortalEffects();this.transitioning=false;gameEvents.emit("portal-state",{active:false,destination});};
    if(this.reducedEffects){this.cameras.main.fadeOut(90,55,16,86,(_c:Phaser.Cameras.Scene2D.Camera,p:number)=>{if(p===1){open();this.cameras.main.fadeIn(100,116,48,180);done();}});return;}
    const veil=this.add.rectangle(0,0,this.scale.width,this.scale.height,0x52108a,.12).setOrigin(0).setScrollFactor(0).setDepth(2000),pixels:Phaser.GameObjects.Rectangle[]=[];
    for(let i=0;i<72;i++)pixels.push(this.add.rectangle(Phaser.Math.Between(0,this.scale.width),Phaser.Math.Between(0,this.scale.height),Phaser.Math.Between(4,14),Phaser.Math.Between(10,42),i%2?0xb05cff:0x5720a6,.22).setScrollFactor(0).setDepth(2001));
    this.portalEffects=[veil,...pixels];
    this.tweens.add({targets:[...pixels,veil],alpha:1,duration:560});
    window.setTimeout(()=>{open();this.cameras.main.fadeIn(420,116,48,180);done();},1180);
  }

  private clearPortalEffects(){this.portalEffects.forEach((item)=>item.destroy());this.portalEffects=[];}
  private returnToCenter(){this.clearPortalEffects();this.transitioning=false;this.path=[];this.resting=false;this.player.setPosition(32*TILE+8,24*TILE+8);this.facing="south";this.stop();gameEvents.emit("portal-state",{active:false});gameEvents.emit("rest-state",{active:false});gameEvents.emit("location-changed",{location:"village"});}

  private findMarkedTile(layerName:string){const layer=this.map!.getLayer(layerName);if(!layer)return null;for(let y=0;y<layer.data.length;y++)for(let x=0;x<layer.data[y].length;x++)if(layer.data[y][x].index!==-1)return{x,y};return null;}
  private property(object:Phaser.Types.Tilemaps.TiledObject,name:string){return object.properties?.find((item:{name:string;value:unknown})=>item.name===name)?.value;}
  private applyTheme(theme:ThemeMode,amount:number){if(!this.nightOverlay)return;const alpha=theme === "day" ? 0 : theme === "night" ? .32 : .32 * amount;this.tweens.add({targets:this.nightOverlay,alpha,duration:this.reducedEffects?80:700});}
  private textStyle(size:number,color="#fff",backgroundColor?:string):Phaser.Types.GameObjects.Text.TextStyle{return{fontFamily:"Pixelify Sans, monospace",fontSize:`${size}px`,fontStyle:"bold",color,backgroundColor,padding:backgroundColor?{x:5,y:3}:undefined,resolution:2,stroke:"#160f16",strokeThickness:size>=12?2:1};}
}
