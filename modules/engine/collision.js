// axis aligned bounding box collision

import GameObject from "./gameObject.js";
import { DEBUG } from "../game/main.js";

/** @type HTMLCanvasElement */
var canvas;
/** @type CanvasRenderingContext2D */
var ctx;

export const GOO_ID     = 0x800000//1 << 19;
export const BULLET_ID  = 0x400000//1 << 23;
export const PLAYER_ID  = 0x008000//1 << 21;
export const DEFAULT_ID = 0x004000//1 << 20;
export const WALL_ID    = 0x000080//1 << 22;
export const ALIEN_ID   = 0x000040//1 << 22;
export const OUTSIDE_ID = 0x000004;

export function init() {
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = 64;
    canvas.height = 64;
    if(DEBUG) {
        document.body.append(canvas);
    }
}

export function drawColMap(instances) {
    ctx.fillStyle = "black";
    ctx.globalCompositeOperation = "source-over";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighten";

    GameObject.iterateChildren(inst => {
        if(inst.collides && inst.isActive) {
            ctx.fillStyle = "#" +("000000" + inst.collisionID.toString(16)).substr(-6, 6);
            ctx.fillRect(inst.x - ~~(inst.bbWidth/2), inst.y - ~~(inst.bbHeight/2), inst.bbHeight, inst.bbWidth);
        }
    }, instances);
}

export function placeMeeting(x, y, gameObject, colID) {
    return boxMeeting(x - ~~(gameObject.bbWidth/2), y - ~~(gameObject.bbHeight/2), gameObject.bbWidth, gameObject.bbHeight, colID);
}

export function posMeeting(x, y, colID) {
    let sampledID = colMaskAt(x, y);
    return (sampledID & colID) > 0;
}

export function colMaskAt(x, y) {
    x = ~~x;
    y = ~~y;
    let pixelData = ctx.getImageData(x, y, 1, 1).data;
    return pixelData[0] << 16 | pixelData[1] << 8 | pixelData[2];
}

export function boxMeeting(x, y, w, h, colID) {
    let sampledID = colMaskInBox(x, y, w, h);
    return (sampledID & colID) > 0;
}

export function colMaskInBox(x, y, w, h) {
    x = ~~x;
    y = ~~y;
    w = ~~w;
    h = ~~h;
    let pixelData = ctx.getImageData(x, y, w, h).data;
    let output = 0;
    if(x < 0 || y < 0 || x+w >= 64 || y+h >= 64) {
        output = OUTSIDE_ID; 
    }
    for(let i = 0; i < pixelData.length; i += 4) {
        output = output | pixelData[i] << 16 | pixelData[i+1] << 8 | pixelData[i+2];
    }
    return output;
}