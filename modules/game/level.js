import GameObject from "../engine/gameObject.js";
import Wall from "./wall.js";
import { drawText, ctx, drawImage } from "../engine/render.js";
import Goo from "./goo.js";
import Alien from "./alien.js";
import Player from "./player.js";
import { DEBUG, t } from "./main.js";
import { keyIsPressed, mouseX, mouseY, keyIsDown } from "../engine/inputHandler.js";
import { mod } from "../engine/utils.js";

const defaultLevelData = [
       /* default */ [
        "w w w w w w w w",
        "w . . . . w a w",
        "w . . . . w w w",
        "w . . . p . . w",
        "w w w . . . . w",
        "w a w . . . . w",
        "w w w w w w w w",
        "place ui here.."
    ],
];

const STORAGE_ADDRESS = "nilsgawlik.alienShootyGame.levelData";

export default class Level extends GameObject {
    constructor(levelID) {
        super();

        this.levelID = levelID;
        this.instances = [];
        this.levelEndCounter = 0;
        this.levelData = null;

        // editor stuff
        this.editMode = false;
        this.palette = {
            "w": 8,
            "p": 0,
            "w.": [8, 62],
            "ar": [21, 29],
            "a": 21,
            "r": 29,
            "e": 19,
            "g": 27,
            "d": "d",
        };
        this.selectedCode = "w";

        this.loadLevelData();
        this.reset();
    }

    reset() {
        this.instances = [];
        this.levelEndCounter = 0;

        this.buildLevel();
    }

    step() {
        if(keyIsPressed("1")) {
            this.editMode = !this.editMode;
            if(this.editMode) {
                this.instances = [];
            } else {
                this.buildLevel();
            //     for(let inst of this.instances) {
            //         inst.isActive = true;
            //         inst.drawWhenInactive = false;
            //     }
            }
        }

        if(this.editMode) {
            // edit mode
            if(keyIsDown("delete")) {
                this.setLevelData((mouseX-4)>>3, (mouseY>>3) - 1, ".");
            } else if(keyIsDown("place")) {
                this.setLevelData((mouseX-4)>>3, (mouseY>>3) - 1, this.selectedCode);
            }
            if(keyIsPressed("2")) {
                // hacky stuff :p
                let prevChar = null;
                for(let char in this.palette) {
                    if(char == this.selectedCode && prevChar) {
                        this.selectedCode = prevChar;
                    }
                    prevChar = char;
                }
            }
            else if(keyIsPressed("3")) {
                // hacky stuff :p
                let flag = false;
                for(let char in this.palette) {
                    if(flag) {
                        this.selectedCode = char;
                        break;
                    }
                    else if(char == this.selectedCode) {
                        flag = true;
                    }
                }
            }
            else if(keyIsPressed("4")) {
                // prev level
                this.levelID = (this.levelID - 1 + this.levelData.length) % this.levelData.length;
            }
            else if(keyIsPressed("5")) {
                // next level
                this.levelID = (this.levelID + 1) % this.levelData.length;
            }
            else if(keyIsPressed("6")) {
                // new level
                this.levelData.push(JSON.parse(JSON.stringify(defaultLevelData[0])));
                this.levelID = this.levelData.length - 1;
            }
            else if(keyIsPressed("0")) {
                if(window.prompt("clear level data?")) {
                    localStorage.setItem(STORAGE_ADDRESS, null);
                    // this.loadLevelData();
                    // this.buildLevel();
                }
            }
        } else {
            // normal game play
            // this.checkWinConditions();
        }
    }

    // checkWinConditions() {
    //     let alienCount = this.instances.filter(a => (a instanceof Alien && a.isActive)).length;
    //     let playerCount = this.instances.filter(a => (a instanceof Player && a.isActive)).length;

    //     if(alienCount == 0 || playerCount == 0) {
    //         this.levelEndCounter++;
    //     }
    //     if(this.levelEndCounter > 50) {
    //         if(playerCount > 0) {
    //             this.nextLevel();
    //         } else {
    //             this.levelID = 0;
    //             this.reset();
    //         }
    //     }
    // }
    

    buildLevel() {        
        this.instances = [];

        let hasPlayer = false;
        let exits = [];

        for (let y = 0; y < 7; y++)
            for (let x = 0; x < 7; x++) {
                let xx = 4 + x * 8 + 4;
                let yy = 8 + y * 8 + 4;
                let chars = this.sampleLevelData(x, y);
                let char = chars.charAt(~~(Math.random()*chars.length));
                let inst = null;
                
                if (char == "w" || (char == "?" && Math.random() < 0.5)) {
                    inst = new Wall(xx, yy);
                }
                else if (char == "g") {
                    inst = new Goo(xx, yy);
                    // if (this.sampleLevelData(x + 1, y) == "g") {
                    //     inst = new Goo(xx + 4, yy);
                    // }
                    // if (this.sampleLevelData(x, y + 1) == "g") {
                    //     inst = new Goo(xx, yy + 4);
                    // }
                }
                else if (char == "a") {
                    inst = new Alien(xx, yy, 0);
                }
                else if (char == "r") {
                    inst = new Alien(xx, yy, 1);
                }
                else if (char == "p") {
                    inst = new Player(xx, yy);
                    hasPlayer = true;
                }
                else if (char == "d") {
                    exits.push({ xx: xx, yy: yy});
                }

                if(inst) {
                    // if(this.editMode) {
                    //     inst.isActive = false;
                    //     inst.drawWhenInactive = true;
                    // }
                    this.instances.push(inst);
                }
            }

        if(!hasPlayer) {
            // let exit = exits[~~(Math.random() * exits.length)];
            let exit = exits[0];
            let inst = new Player(exit.xx, exit.yy);
            this.instances.push(inst);
        }
    }

    sampleLevelData(x, y) {
        let data = this.levelData[this.levelID];
        if(x < 0 || x >= 7 || y < 0 || y >= 7)
            return " ";
        return data[y].substr(x*2, 2).trim();
    }

    setLevelData(x, y, char) {
        let data = this.levelData[this.levelID];
        if(x < 0 || x >= 7 || y < 0 || y >= 7)
            return;
        char = char.padEnd(2, " ");
        data[y] = data[y].slice(0, x*2) + char + data[y].slice(x*2 + char.length);
        
        this.saveLevelData();
    }

    loadLevelData() {
        this.levelData = JSON.parse(localStorage.getItem(STORAGE_ADDRESS)) || defaultLevelData;
    }
    
    saveLevelData() {
        localStorage.setItem(STORAGE_ADDRESS, JSON.stringify(this.levelData))
    }

    setLevel(newID, isRelative) {
        this.levelID = newID + (isRelative? this.levelID : 0);
        this.levelID = mod(this.levelID, this.levelData.length);
        this.reset();
    }

    children() {
        return this.instances;
    }

    draw() {
        if(this.editMode) {
            for (let y = 0; y < 7; y++)
            for (let x = 0; x < 7; x++) {
                let xx = 4 + x * 8;
                let yy = 8 + y * 8;
                let char = this.sampleLevelData(x, y);
                this.drawDataTile(xx, yy, char);
            }
        }
    }

    lateDraw() {
        let data = this.levelData[this.levelID];
        let tagLine = this.editMode? `edit mode lvl ${this.levelID}` : "\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\";
        drawText(1, 2, tagLine, "#eaeef1");

        if(this.editMode) {
            ctx.strokeStyle = "gray";
            let xx = (mouseX - 4)>>3;
            let yy = (mouseY - 8)>>3;
            if(xx >= 0 && yy >= 0 && xx < 7 && yy < 7) {
                xx = (xx<<3) + 4;
                yy = (yy<<3) + 8;
                ctx.strokeRect(xx, yy, 8, 8)
                
                if(!keyIsDown("delete")) {
                    this.drawDataTile(xx, yy, this.selectedCode);
                }
            }
        }
    }

    drawDataTile(xx, yy, code) {
        const imageData = this.palette[code];
        if (imageData != undefined) {
            if (!imageData.length) {
                drawImage(xx + 4, yy + 4, imageData);
            }
            else if(typeof imageData == "string") {
                drawText(xx+4, yy+3, code, undefined, undefined, "center", "center");
            }
            else {
                let char = imageData[(t >> 4) % imageData.length];
                drawImage(xx + 4, yy + 4, char);
            }
        }
    }
}


// old level data
// /* level 0 */ [
//     "w w w w w w w w",
//     "w ? . . . . ? w",
//     "e . . . p . . w",
//     "w . w w w w w w",
//     "w . . . . a . e",
//     "w ? . . . . ? w",
//     "w w w w w w w w",
//     "Use WASD, Mouse"
// ],
// [
//     "w w w w w w w w",
//     "w p . . . . . w",
//     "w w w w w w . w",
//     "w . . a . a . w",
//     "w . w ? w ? w w",
//     "w . . . . . a w",
//     "w w w w w w w w",
//     "Kill to progess"
// ],
// /* level 0 */ [
//     "w w w w w w w w",
//     "w ? . . p . ? w",
//     "w ? . w w . ? w",
//     "w a . . . . a w",
//     "w . w . . w . w",
//     "w . . . . . . w",
//     "w w w w w w w w",
//     "SPACE to dash"
// ],
// /* level 0 */ [
//     "w w w w w w w w",
//     "w ? . p . . ? w",
//     "w a . . . . a w",
//     "w . . ? ? . . w",
//     "w . a . . a . w",
//     "w ? . . . . ? w",
//     "w w w w w w w w",
//     ""
// ],
// /* level 0 */ [
//     "w w w w w w w w",
//     "w w a a a a w w",
//     "w . . w w . . w",
//     "w . . ? . ? . w",
//     "w . ? . ? . . w",
//     "w w . p . . w w",
//     "w w w w w w w w",
//     ""
// ],
// /* level 0 */ [
//     "w w w w w w w w",
//     "w . . . . w a w",
//     "w . . . . w w w",
//     "w . . . p . . w",
//     "w w w . . . . w",
//     "w a w . . . . w",
//     "w w w w w w w w",
//     "YOU WIN Congrats!"
// ],