import GameObject from "../engine/gameObject.js";
import { effectPool } from "./main.js";
import { BULLET_ID, posMeeting, WALL_ID, ALIEN_ID, placeMeeting } from "../engine/collision.js";

export default class Bullet extends GameObject {
    constructor(x, y, xSpd, ySpd) {
        super(x, y, 1);
        this.xSpd = xSpd;
        this.ySpd = ySpd;

        this.muzzle = -1;
        this.collides = true;

        this.collisionID = BULLET_ID;
        this.bbHeight = 4;
        this.bbWidth = 4;

        this.reset();
    }
    
    reset() {
        this.muzzle = 1;
        this.imageIndex = 1;
    }

    retire() {
        /** @type Effect */
        let effect = effectPool.getInstance();
        effect.reset(this.x, this.y, 24, 3, 2/3);

        this.reset();
        this.isActive = false;
        this.xSpd = 0;
        this.ySpd = 0;

    }

    step() {
        super.step();

        if(placeMeeting(this.x, this.y, this, ALIEN_ID) || posMeeting(this.x, this.y, WALL_ID)) {
            this.retire();
        }

        this.x += this.xSpd;
        this.y += this.ySpd;
        
        if(this.muzzle == 0) {
            this.imageIndex++;
        }
        this.muzzle--;

    }
}