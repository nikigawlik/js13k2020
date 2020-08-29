import { DEBUG } from "../game/main.js";

var keys = {};
var keysPressed = {};
export var mouseX = 0;
export var mouseY = 0;

/**
 * @param {HTMLCanvasElement} canvas 
 */
export function init(canvas) {
    canvas.onmousemove = (ev) => {
        mouseX = (ev.clientX - canvas.offsetLeft) * canvas.width / canvas.clientWidth;
        mouseY = (ev.clientY - canvas.offsetTop) * canvas.height / canvas.clientHeight;
    }

    document.body.oncontextmenu = (e) => {
        if(!DEBUG) e.preventDefault();
    };
    
    registerKey("left", [65, 37]);
    registerKey("right", [68, 39]);
    registerKey("up", [87, 38]);
    registerKey("down",[83, 40]);
    registerKey("exit",[27]);
    registerKey("fire",[16, 88, "mouse1"]);
    registerKey("dash",[32, 90]);
    registerKey("delete", ["mouse2"]);
    registerKey("place", ["mouse1"]);
    for(let i = 0; i < 9; i++) registerKey(`${i}`, [48 + i]);
}

function registerKey(key, keyCodes) {
    keys[key] = false;
    document.addEventListener("keydown", ev => { 
        if(keyCodes.includes(ev.keyCode)) {
            if(!DEBUG) ev.preventDefault();
            keys[key] = true;
            keysPressed[key] = true;
        }
    });
    document.addEventListener("keyup", ev => {
        if(keyCodes.includes(ev.keyCode)) {
            if(!DEBUG) ev.preventDefault();
            keys[key] = false;
        }
    });
    if(keyCodes.includes("mouse1")) {
        document.addEventListener("mousedown", ev => {
            if(ev.button == 0) {
                // if(!DEBUG) ev.preventDefault();
                keys[key] = true; 
                keysPressed[key] = true; 
            }
        });
        document.addEventListener("mouseup", ev => {
            if(ev.button == 0) {
                // if(!DEBUG) ev.preventDefault();
                keys[key] = false; 
            }
        });
    }
    if(keyCodes.includes("mouse2")) {
        document.addEventListener("mousedown", ev => {
            if(ev.button == 2) {
                // if(!DEBUG) ev.preventDefault();
                keys[key] = true; 
                keysPressed[key] = true; 
            }
        });
        document.addEventListener("mouseup", ev => {
            if(ev.button == 2) {
                // if(!DEBUG) ev.preventDefault();
                keys[key] = false; 
            }
        });
    }
}

export function keyIsDown(key) {
    return !!keys[key];
}

export function clearPresses() {
    keysPressed = {};
}

export function keyIsPressed(key) {
    return !!keysPressed[key];
}