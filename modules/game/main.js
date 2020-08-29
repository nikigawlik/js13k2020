import * as render from "../engine/render.js";
import * as inputHandler from "../engine/inputHandler.js";
import * as audio from "./audio.js";
import * as collision from "../engine/collision.js";
import GameObject from "../engine/gameObject.js";
import ObjectPool from "../engine/objectPool.js";
import Player from "./player.js";
import Effect from "./effect.js";
import { mouseX, mouseY } from "../engine/inputHandler.js";
import Level from "./level.js";
import { mod } from "../engine/utils.js";

window.onload = init;

/** @type GameObject[] */
var instances = [];
let screenTransitionIterator = null;

export const DEBUG = false;

/** @type Level */
export var level;
/**@type ObjectPool */
export var effectPool;
export var t = 0;
export var offsetX = 0;
export var offsetY = 0;

async function init() {
    await render.init();
    inputHandler.init(render.canvas);
    collision.init();

    audio.init();

    instances = [];

    // instances.push(new Player(32, 12));
    
    level = new Level(0);
    effectPool = new ObjectPool(() => (new Effect(-123, -123, 0, 0, 0)), 64);

    instances.push(level);
    instances.push(effectPool);

    setInterval(step, 1000/30);
};

function step() {
    collision.drawColMap(instances);

    if(inputHandler.keyIsPressed("7")) {
        level.setLevel(1, true);
        // screenTransitionIterator = render.screenTransition(1, 0);
    }
    // if(screenTransitionIterator) {
    //     if(screenTransitionIterator.next().done) {
    //         screenTransitionIterator = null;
    //     }
    // } else {   
        GameObject.iterateChildren(inst => inst.isActive? inst.step() : null, instances);
    // }

    draw();
    inputHandler.clearPresses();

    t++;
}

export function setOffset(x, y) {
    offsetX = x;
    offsetY = y;
}


function draw() {
    render.drawClear();
    render.drawBackground(18);

    render.ctx.resetTransform();
    render.ctx.translate(-offsetX, -offsetY);
    GameObject.iterateChildren(inst => inst.isActive || inst.drawWhenInactive? inst.draw() : null, instances);
    GameObject.iterateChildren(inst => inst.isActive || inst.drawWhenInactive? inst.lateDraw() : null, instances);

    render.drawImage(mouseX, mouseY, 17);
}