import { offsetX, offsetY, setOffset } from "../game/main.js";

/** @type HTMLCanvasElement */
export var canvas;
/** @type CanvasRenderingContext2D */
export var ctx;

/** @type HTMLImageElement[] */
var images = [];
/** @type HTMLImageElement */
var spritesheet;

export const colorLookupResolution = 32;
export var colorLookup = [[[]]];

export function drawImage(x, y, imageIndex, rotation=0, round=true, flipX=false, flipY=false) {
    if(imageIndex < 0) return;
    if(round) {
        x = Math.round(x);
        y = Math.round(y);
    }
    imageIndex = imageIndex % images.length;
    if(imageIndex >= images.length) return;
    let transform = ctx.getTransform();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    if(flipY) ctx.scale(1,-1);
    if(flipX) ctx.scale(-1,1);
    ctx.translate(-4, -4);
    ctx.drawImage(images[imageIndex], 0, 0);
    ctx.setTransform(transform);
}

export function drawClear() {
    ctx.fillStyle = "#19191d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function drawBackground(imageIndex) {
    for(let y = 0; y < 8; y++)
    for(let x = 0; x < 9; x++)
        drawImage(x*8, y*8+4, imageIndex);
}

export function drawText(x, y, text, color="white", size=8, align="left", baseline="top") {
    ctx.font = `${7}px Altopixel`;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    // ctx.strokeStyle = "#19191d";
    ctx.fillStyle = color;
    // ctx.strokeText(text, x, y); 
    ctx.fillText(text, x, y); 
}

export async function init(width = 64, height = 64) {
    console.log("creating canvas");
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    let main = document.querySelector("main");
    main.append(canvas);
    main.onresize = resize;
    resize();
    
    console.log("loading images");
    // load sprites
    images = [];
    spritesheet = await loadImage("sprites");
    for(let y = 0; y < spritesheet.height; y += 8) {
        for(let x = 0; x < spritesheet.width; x += 8) {
            images.push(getImageFromSpritesheet(x, y, 8, 8));
            // document.body.append(images[images.length-1]);
            // console.log(`added image ${images.length - 1}`);
        }
    }

    console.log("prep palette");
    let tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = spritesheet.width;
    tmpCanvas.height = spritesheet.height;
    let tmpCtx = tmpCanvas.getContext("2d");
    tmpCtx.drawImage(spritesheet, 0, 0);
    let pixelData = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height).data;

    let colors = [];

    for(let i = 0; i < pixelData.length; i += 4) {
        if(pixelData[i+3] < 255) continue; // filter out transparent
        // convert pixel data to an RRGGBB int
        let col = pixelData[i] << 16 | pixelData[i+1] << 8 | pixelData[i+2];
        if(colors.indexOf(col) == -1) {
            colors.push(col);
        }
    }
    console.log(`colors: [${colors.join(", ")}]`);
    const wid = colorLookupResolution;
    colorLookup = (new Array(wid)).fill(0).map(() => (new Array(wid)).fill(0).map(() => (new Array(wid)).fill(0))); //lol
    for(let d1 = 0; d1 < wid; d1++)
    for(let d2 = 0; d2 < wid; d2++)
    for(let d3 = 0; d3 < wid; d3++) {
        let r1 = d1 / (wid - 1);
        let g1 = d2 / (wid - 1);
        let b1 = d3 / (wid - 1);
        let sqaredDist = (col) => {
            let r2 = ((col >> 16) & 0xff) / 255;
            let g2 = ((col >> 8) & 0xff) / 255;
            let b2 = ((col) & 0xff) / 255;
            // return (r1**2 - r2**2)**2 + (g1**2 + g2**2)**2 + (b1**2 - b2**2)**2;
            return (r1 - r2)**2 + (g1 - g2)**2 + (b1 - b2)**2;
        }
        let closest = colors.reduce((a, b) => (sqaredDist(a) < sqaredDist(b)? a : b));
        colorLookup[d1][d2][d3] = closest;
    }
    // console.log(colorLookup);

    // font stuff

    const processFont = false;
    if(processFont) {
        let font = await loadImage("fontSource");
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        canvas.width = 4;
        canvas.height = 5;
        let n = Math.min(~~(font.width/canvas.width), 32);
        ctx.fillStyle = "#00000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let resultPixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data.map(a => a); // lol

        for(let letter = 0; letter < n; letter++) {
            ctx.drawImage(font, -letter*canvas.width, 0);

            let pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            for(let i = 0; i < pixelData.length; i += 4) {
                const isFilled = pixelData[i] > 128;
                const byte = letter >> 3; // divide by 8
                const value = isFilled? 1 << (letter%8) : 0;
                resultPixelData[i+byte] = (resultPixelData[i+byte] | value);
            }
        }

        console.log(resultPixelData.join(" "));
        

        let resultImgDat = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for(let i = 0; i < resultPixelData.length; i++) {
            resultImgDat.data[i] = resultPixelData[i];
        }
        ctx.putImageData(resultImgDat, 0, 0);
        let url = canvas.toDataURL("image/png");
        let a = document.createElement("a");
        a.href = url;
        a.target = '_blank';
        a.click();
    }


    console.log("done");
}

function resize() {
    let scaleX = window.innerWidth / canvas.width;
    let scaleY = window.innerHeight / canvas.height;
    let scale = Math.floor(Math.min(scaleX, scaleY));

    canvas.style.width = `${scale * canvas.width}px`;
    canvas.style.height = `${scale * canvas.height}px`;
}

/** @returns Promise<HTMLImageElement> */
async function loadImage(name, format = "png") {
    let img = document.createElement("img");
    img.src = `images/${name}.${format}`;
    await new Promise(resolve => { img.onload = resolve });
    return img;
}

function getImageFromSpritesheet(x, y, w, h, flipX = false, flipY = false) {
    let canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    let ctx = canvas.getContext("2d");
    if(flipX) ctx.scale(-1,1);
    if(flipY) ctx.scale(1,-1);
    ctx.drawImage(spritesheet, -x - (flipX? w : 0), -y - (flipY? h : 0));
    return canvas;
}

export function* screenTransition(dx, dy) {
    let ogOffsetX = offsetX;
    let ogOffsetY = offsetY;
    let scale = 4;
    let steps = ~~(64/scale)+1;
    for(let i = 0; i < steps; i++) {
        setOffset(ogOffsetX + i * dx * scale, ogOffsetY + i * dy * scale);
        yield false;
    }
    setOffset(0, 0);
    yield false;
    yield true;
}