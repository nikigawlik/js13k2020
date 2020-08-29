// TODO replace this all

let random = Math.random;
// let sign = Math.sign;
let sin = Math.sin;
// let max = Math.max;
let atan = Math.atan;
const PI = Math.PI;

var ctx;
var master;

var buffers = [];

var settings = {
    dash: { "attack": 3, "hold": 3, "decay": 279, "freq": 178, "freqSlide": 414, "srate": 8000, "shape": 45, "slopes": -16, "crunch": 7, "subcrunch": 10 },    
    uuaaagh: { "attack": 15, "hold": 82, "decay": 254, "freq": 436, "freqSlide": -273, "srate": 8000, "shape": 4, "slopes": 35, "crunch": 8, "subcrunch": 3 },    
    death: { "attack": 3, "hold": 20, "decay": 487, "freq": 220, "freqSlide": -40, "srate": 8000, "shape": 48, "slopes": 6, "crunch": 10, "subcrunch": 16 },    
    bingBangBong: { "attack": 42, "hold": 193, "decay": 342, "freq": 170, "freqSlide": -485, "srate": 8000, "shape": 98, "slopes": 30, "crunch": 11, "subcrunch": 15 },
    purr: { "attack": 46, "hold": 156, "decay": 182, "freq": 258, "freqSlide": 134, "srate": 8000, "shape": 7, "slopes": -48, "crunch": 8, "subcrunch": 7 },
    robot: { "attack": 19, "hold": 180, "decay": 487, "freq": 188, "freqSlide": 295, "srate": 8000, "shape": 7, "slopes": 27, "crunch": 10, "subcrunch": 4 },
    robotShort: { "attack": 44, "hold": 176, "decay": 199, "freq": 282, "freqSlide": -421, "srate": 8000, "shape": 35, "slopes": -46, "crunch": 2, "subcrunch": 9 },
    ouch: { "attack": 8, "hold": 30, "decay": 154, "freq": 74, "freqSlide": 375, "srate": 8000, "shape": 10, "slopes": -24, "crunch": 3, "subcrunch": 6 },
    beam: { "attack": 40, "hold": 183, "decay": 330, "freq": 119, "freqSlide": 106, "srate": 8000, "shape": 0, "slopes": 40, "crunch": 14, "subcrunch": 7 },
    angryMan: { "attack": 26, "hold": 82, "decay": 72, "freq": 419, "freqSlide": 483, "srate": 8000, "shape": 75, "slopes": 48, "crunch": 6, "subcrunch": 2 },
    shot: { "attack": 1, "hold": 1, "decay": 110, "freq": 167, "freqSlide": -127, "srate": 8000, "shape": 15, "slopes": -3, "crunch": 0, "subcrunch": 0 },
}
    
export function init () {
    // Create an audio context
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.setValueAtTime(0.5, ctx.currentTime); // keep it civil!
    master.connect(ctx.destination);

    // buffers[0] = crashFX(1, 3);
    buffers[0] = flexFX(settings.shot);
    buffers[1] = flexFX(settings.dash);
    buffers[2] = flexFX(settings.uuaaagh);
    buffers[3] = flexFX(settings.death);
    buffers[4] = flexFX(settings.ouch);
}

export function playSound(id) {
    let buffer = buffers[id];
    let source = ctx.createBufferSource();
    source.buffer = buffer;
    // source.loop = true;

    source.connect(master);
    source.start();
}

export function crashFX(volume = 1, crunchyness = 1) {
    const srate = 8000;
    const length = srate*1;
    let buffer = ctx.createBuffer(1, length, srate);
    let data = buffer.getChannelData(0);
    let p1 = 120 * crunchyness;

    for(let t = 0; t < length; t++) {
        let tt = t;
        t = t & ~(1 << ~~(t/p1));
        let env = (1- t / length);
        let env2 = (1- t / 4000);
        // const env = 1-(t % (1<<12) / (1<<12));
        let kick = sin(env**32*0x5f);
        data[tt] = atan(
            kick * env2**5
        ) / (PI/2) * volume
        ;
        t = tt;
    }

    return buffer;
}

export function flexFX(settings) {
    let srate = settings.srate;
    let samples = (settings.attack + settings.decay + settings.hold) / 1000 * srate;
    let atk = Math.max(settings.attack, 0);
    let hold = Math.max(settings.hold, 0);
    let dec = Math.max(settings.decay, 0);
    let freq1 = settings.freq;
    let freq2 = settings.freq + settings.freqSlide;

    let buffer = ctx.createBuffer(1, samples, srate);
    let data = buffer.getChannelData(0);
    let env = 0;
    let preDistortion = settings.shape / 40;
    let slopesShape = settings.slopes / 40;
    
    for(let i = 0; i < samples; i++) {
        let t = i & ~(1<<settings.crunch>>1 | 1<<settings.subcrunch>>1);
        const prog = t/samples;
        const freq = freq1 * (1 - prog) + freq2 * (prog);
        const ms = t / (srate / 1000);
        env = ms <= atk? ms / atk : ms <= (atk+hold)? 1 : 1-(ms-hold-atk)/dec;
        env = Math.max(0, env);
        // env = 1
        let val = Math.sin(t / srate * 2 * Math.PI * freq);
        // distortion
        val = Math.sign(val) * Math.abs(val)**(1/(10**preDistortion));
        env = Math.sign(env) * Math.abs(env)**(1/(10**slopesShape));
        val *= env;
        data[t] = val;
    }

    return buffer;
}

// function playCollect(volume = 1) {
//     const srate = 8000;
//     const length = 8000;
//     let buffer = ctx.createBuffer(1, length, srate);
//     let data = buffer.getChannelData(0);
//     let p1 = 1 + random();

//     for(let t = 0; t < length; t++) {
//         let tt = t;
//         // t = t & ~(1 << ~~(t/p1));
//         let env = (1- t / 8000);
//         data[tt] = atan(
//             sin(t * .02 * p1 * (t>>9) * (t>>10))
//         ) / (PI/2) * 2 * volume * env**2
//         ;
//         t = tt;
//     }

//     let source = ctx.createBufferSource();
//     source.buffer = buffer;
//     // source.loop = true;

//     source.connect(master);
//     source.start();
// }


// function playLevelFinish(volume = 1) {
//     const srate = 8000;
//     const length = srate*2;
//     let buffer = ctx.createBuffer(1, length, srate);
//     let data = buffer.getChannelData(0);
//     let p1 = 1 + random();

//     for(let t = 0; t < length; t++) {
//         let tt = t;
//         // t = t & ~(1 << ~~(t/p1));
//         let env = (1 - t / length);
//         const env2 = 1-(t % (1<<10) / (1<<10));
//         data[tt] = atan(
//             sin(t * .05 * p1 * 2**((t>>10)%3)) * sin(env2)**3 * env**3
//             +
//             sin(t * .05 * p1) * env**5
//         ) / (PI/2) * 2 * volume
//         +
//         data[max(tt-1000, 0)] * 0.4
//         ;
//         t = tt;
//     }

//     let source = ctx.createBufferSource();
//     source.buffer = buffer;
//     // source.loop = true;

//     source.connect(master);
//     source.start();
// }

// function start() {

//     const srate = 12000;
//     const length = 1 << 20;
//     let musicBuffer = ctx.createBuffer(1, length, srate);
//     let data = musicBuffer.getChannelData(0);

//     let flavor;
    
//     let b = 0;
//     for(let i = 0; i < 5; i++) {
//         b = b | ~~(random() * 4);
//         b = b << 2;
//     }
//     // look at those magic numbers!
//     let bs = [
//         773752, // very fast upbeat
//         773752, // very fast upbeat
//         773752|0x7f, // very fast upbeat
//         957758312, // fast ish

//         773752, // very fast upbeat
//         773752, // very fast upbeat
//         773752|0x7f, // very fast upbeat
//         957758312, // fast ish

//         792323628, // noisy? slow
//         792323628, // noisy? slow
//         957758312, // fast ish
//         957758312, // fast ish

//         1008437436, // fast ish synth
//         1008437436, // fast ish synth
//         773752|0x7f, // very fast upbeat
//         957758312, // fast ish

//         // -409420504, // interesting medium
//         // 792323628,// noisy? slow
//         // 345849296, // continuus subbase
//         // 1962361744, // fast tension
//     ];
//     // let bs = [345849296,1962361744,957758312,792323628,773752,1008437436,773752,792323628,773752,792323628];

//     for(let t = 0; t < length; t++) {
//         const env = 1-(t % (1<<12) / (1<<12));
//         const env2 = 1-(t % (1<<15) / (1<<15));
//         const env3 = 1-(t % (1<<10) / (1<<10));
//         let hihat1 = (random()*2-1)*env**32 * 0.5;
//         let hihat2 = (random()*2-1)*env3**32 * 1.9;
//         let kick = sin(env**6*0x6f)*env;
//         let snare = (random()*2-1)*env**4;
//         if(t % (1<<15) == 0) flavor = ~~(random() * 2048);
//         if(t % (1<<16) == 0) {
//             // this is how magic numbers are originally made!
//             // for(let i = 0; i < 5; i++) {
//             //     b = b | ~~(random() * 4);
//             //     b = b << 2;
//             // }
//             // bs.push(b);
//             b = bs.shift();
//         };
//         let tt = t;
//         t = t & b;
//         data[tt] = 
//             [[kick,hihat1,snare,hihat1][(t>>12)%4] * 0.4, [kick,snare,hihat1,hihat2][(t>>12)%4] * 0.4][max((t>>14)%4-2, 0)]
//             + sign(sin((t&((1<<(5-(t>>14)%3+(t>>12)%6))-1))*(1/64)*PI*(1+env2*.25))) * 0.05
//             + sign(sin((t&(flavor << 4))*(1/64)*PI)) * 0.05
//             // + sign(sin((t&([32,2,3,111][(t>>15)%4] << 4))*(1/64)*PI)) * 0.1
//             + data[max(0, t - 2100)] * 0.4
//             + data[max(0, t - 2000)] * 0.4
//         ;
//         t = tt;
//     }
    
//     console.log(bs.toString());

//     let musicSource = ctx.createBufferSource();
//     musicSource.buffer = musicBuffer;
//     musicSource.loop = true;

//     musicSource.connect(master);
//     musicSource.start();
// }