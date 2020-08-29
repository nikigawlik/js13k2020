import { drawImage } from "./render.js";
import { DEFAULT_ID } from "./collision.js";

export default class GameObject {
    constructor(x = 0, y = 0, imageIndex = -1, collides = false) {
        this.x = x;
        this.y = y; 
        this.imageIndex = imageIndex;
        this.rotation = 0;
        this.flipX = false;
        this.flipY = false;

        this.isActive = true;
        this.drawWhenInactive = false;

        this.collides = collides;
        this.collisionID = DEFAULT_ID;
        this.bbWidth = 8;
        this.bbHeight = 8;
    }

    step() {

    }

    draw() {
        let rot = Math.round(this.rotation / Math.PI * 4) * Math.PI / 4;
        drawImage(this.x, this.y, this.imageIndex, rot, true, this.flipX, this.flipY); // TODO rotation
    }

    lateDraw() {

    }

    children() {
        return null;
    }

    static iterateChildren(predicate, instances) {
        if(instances)
            for(let instance of instances) {
                predicate(instance);
                if(instance.children)
                    GameObject.iterateChildren(predicate, instance.children());
            }
    }
}