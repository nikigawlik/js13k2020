import GameObject from "../engine/gameObject.js";
import { keyIsDown, mouseX, mouseY, keyIsPressed } from "../engine/inputHandler.js";
import ObjectPool from "../engine/objectPool.js";
import Bullet from "./bullet.js";
import * as audio from "./audio.js";
import { effectPool } from "./main.js";
import { boxMeeting, placeMeeting, PLAYER_ID, WALL_ID, GOO_ID, ALIEN_ID } from "../engine/collision.js";

export default class Player extends GameObject {
    constructor(x = 0, y = 0) {
        super(x, y, 0);

        this.collides = true;
        this.collisionID = PLAYER_ID;
        this.bbWidth = 4;
        this.bbHeight = 4;

        this.bulletPool = new ObjectPool(() => (new Bullet(-123, -123, 0, 0)), 32);
        this.coolDown = 0;
        this.dashing = false;

        this.walkDirBuffer = 0;
    }

    step() {
        super.step();

        let xSpd = keyIsDown("right") * 1 - keyIsDown("left") * 1;
        let ySpd = keyIsDown("down") * 1 - keyIsDown("up") * 1;

        if(xSpd**2 + ySpd**2 > 0) {
            this.rotation = Math.atan2(ySpd, xSpd);
        }

        this.rotation = Math.atan2(mouseY - this.y, mouseX - this.x);

        if(xSpd != 0 || ySpd != 0) {
            this.walkDirBuffer = Math.atan2(ySpd, xSpd);
        }

        this.dashing = false;
        if(keyIsDown("dash") && this.coolDown <= 0) {
            this.dashing = true;

            ySpd = ~~(Math.sin(this.walkDirBuffer) * 20);
            xSpd = ~~(Math.cos(this.walkDirBuffer) * 20);
            // xSpd = Math.sign(xSpd) * 16;
            // ySpd = Math.sign(ySpd) * 16;

            this.coolDown = 12;
            
            audio.playSound(1);
        }
        
        if(keyIsDown("fire") && this.coolDown <= 0) {
            /** @type Bullet */
            let bullet = this.bulletPool.getInstance();
            bullet.reset();
            bullet.x = this.x;
            bullet.y = this.y;
            bullet.ySpd = Math.sin(this.rotation) * 4;
            bullet.xSpd = Math.cos(this.rotation) * 4;

            xSpd -= bullet.xSpd;
            ySpd -= bullet.ySpd;

            this.coolDown = 4;

            audio.playSound(0);
        }

        this.coolDown--;

        // just in case
        this.x = ~~this.x;
        this.y = ~~this.y;

        let pX = this.x;
        let pY = this.y;

        if(xSpd != 0 || ySpd != 0) {
            let dx = 0, dy = 0, i = 0; // moved here for visibility
            for(; i < 1000; i++) { // i < 1000 is safety
                let relX = dx / Math.max(Math.abs(xSpd), 0.01);
                let relY = dy / Math.max(Math.abs(ySpd), 0.01);
                // this.crtDebugEffect(this.x, this.y);
                
                // yes this is weird :p
                if(relY < relX && dy < Math.abs(ySpd) && !this.meetsWallAt(this.x, this.y + Math.sign(ySpd))) {
                    this.y += Math.sign(ySpd);
                    dy++;
                } 
                else
                if(dx < Math.abs(xSpd) && !this.meetsWallAt(this.x + Math.sign(xSpd), this.y)) {
                    this.x += Math.sign(xSpd);
                    dx++;
                }
                else
                if(dy < Math.abs(ySpd) && !this.meetsWallAt(this.x, this.y + Math.sign(ySpd))) {
                    this.y += Math.sign(ySpd);
                    dy++;
                }
                else {
                    break;
                }
                
                if(this.dashing && i % 6 == 0) {
                    /** @type Effect */
                    let effect = effectPool.getInstance();
                    let lerpFactor = i / (Math.abs(xSpd) + Math.abs(ySpd));
                    let frameAdv = ~~((1-lerpFactor) * 2);
                    effect.reset(
                        this.x, 
                        this.y, 
                        32 + frameAdv, 6 - frameAdv, 2/3);
                }
            }
        }
        // this.crtDebugEffect(this.x, this.y);

        //logic
        if(placeMeeting(this.x, this.y, this, ALIEN_ID)) {
            let eff1 = effectPool.getInstance();
            eff1.reset(this.x, this.y, 1, 1, 1/4);

            for(let i = 0; i < 3; i++) {
                let eff2 = effectPool.getInstance();
                let s = () => ~~(Math.random()*8-4);
                eff2.reset(this.x + s(), this.y + s(), 32, 6, 1/(7+s()));
            }
            this.isActive = false;

            audio.playSound(2);
            audio.playSound(3);
        }
    }

    meetsWallAt(x, y) {
        let bitMask = this.dashing? WALL_ID : (WALL_ID | GOO_ID); 
        return placeMeeting(x, y, this, bitMask);
    }

    // draw() {
    //     super.draw();
    //     drawText(0, 32, `${(colMaskAt(this.x, this.y) & WALL_ID).toString(2)}`)
    // }
    
    children() {
        return [this.bulletPool];
    }
    
    crtDebugEffect(x, y) {
        
        let effect = effectPool.getInstance();
        effect.reset(
            x, 
            y, 
            37, 1, 1/16);
        }
    }