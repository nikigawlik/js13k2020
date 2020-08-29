import GameObject from "./gameObject.js"

export default class ObjectPool extends GameObject {
    constructor(instanciator, size) {
        super();
        this.instanciator = instanciator;
        this.size = size;

        this.instances = [];
        this.pointer = 0;

        for(let i = 0; i < size; i++) {
            this.instances.push(instanciator());
        }
    }

    getInstance() {
        let inst = this.instances[this.pointer] = this.instances[this.pointer] || this.instanciator();
        inst.isActive = true;

        this.pointer = (this.pointer + 1) % this.size;
        // console.log(this.pointer);
        return inst;
    }

    children() {
        return this.instances;
    }
}