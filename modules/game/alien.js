import GameObject from "../engine/gameObject.js";
import { GOO_ID, ALIEN_ID, placeMeeting, WALL_ID, BULLET_ID, OUTSIDE_ID } from "../engine/collision.js";
import { t, effectPool } from "./main.js";
import { playSound } from "./audio.js";

export default class Alien extends GameObject {
    constructor(x, y, type) {
        super(x, y, 21, true);
        this.collisionID = ALIEN_ID;
        this.bbHeight = 6;
        this.bbWidth = 6;
        
        let r = ~~(Math.random() * 4) * Math.PI * 0.5;
        this.spdX = Math.round(Math.cos(r));
        this.spdY = Math.round(Math.sin(r));

        this.type = type;
    }

    step() {
        if(placeMeeting(this.x, this.y, this, BULLET_ID)) {
            for(let i = 0; i < 3; i++) {
                let eff = effectPool.getInstance();
                let s = () => ~~(Math.random()*4-2);
                eff.reset(this.x+s(), this.y+s(), 5, 2, 1/(8+s()))

                this.isActive = false;

                playSound(4);
            }
        }

        if(placeMeeting(this.x + this.spdX, this.y + this.spdY, this, WALL_ID | OUTSIDE_ID)) {
            // let prevSpdX = this.spdX;
            if(this.type == 0) {
                // interleaved x,y speeds of three different ways to go
                let options = [
                    -this.spdY, // turn right
                    this.spdX,
                    this.spdY, // turn left
                    -this.spdX,
                    -this.spdX, // turn around
                    -this.spdY
                ];
                for(let i = 0; i < 6; i++) {
                    const delta = 4;
                    let pSX = this.spdX
                    this.spdX = -this.spdY; // turn right
                    this.spdY = pSX;
                    if(i != 1 && !placeMeeting(this.x + this.spdX * delta, this.y + this.spdY * delta, this, WALL_ID | OUTSIDE_ID)) {
                        break;
                    }
                }
            } else {
                let r = Math.random() * Math.PI * 2;
                this.spdX = Math.round(Math.cos(r));
                this.spdY = Math.round(Math.sin(r));
            }
        } else {
            this.x += this.spdX;
            this.y += this.spdY;
        }

        this.imageIndex = this.type * 8 + 21 + ~~(t / 8) % 2;
    }
}