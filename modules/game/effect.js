import GameObject from "../engine/gameObject.js"

export default class Effect extends GameObject {
    constructor(x, y, startIndex, length, animSpeed) {
        super(x, y, startIndex);
        this.startIndex = startIndex;
        this.length = length;
        this.animSpeed = animSpeed;

        this.ind = 0;
    }

    retire() {
        this.isActive = false;
    }

    reset(x, y, startIndex, length, animSpeed) {
        this.x = x;
        this.y = y;
        this.startIndex = startIndex;
        this.length = length;
        this.animSpeed = animSpeed;
        
        this.ind = 0;
    }

    step() {
        this.ind += this.animSpeed;
        if(this.ind >= this.length) {
           this.retire();
        }

        this.imageIndex = ~~(this.startIndex + this.ind);
    }
}