class Vec3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static get zero(): Vec3 {
        return new Vec3();
    }
}

export default Vec3;