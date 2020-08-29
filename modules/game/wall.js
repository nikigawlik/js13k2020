import GameObject from "../engine/gameObject.js";
import { WALL_ID } from "../engine/collision.js";

export default class Wall extends GameObject{
    constructor(x, y) {
        super(x, y, ~~(8 + Math.random() * 4));
        this.collides = true;
        this.collisionID = WALL_ID;
    }
}