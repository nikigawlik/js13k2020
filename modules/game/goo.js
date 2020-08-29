import GameObject from "../engine/gameObject.js";
import { GOO_ID, WALL_ID } from "../engine/collision.js";

export default class Goo extends GameObject {
    constructor(x, y) {
        super(x, y, 27, true);
        this.bbWidth = 6;
        this.bbHeight = 6;
        this.rotation = ~~(Math.random() * 4) * 0.5 * Math.PI;
        this.collisionID = GOO_ID;
    }
}