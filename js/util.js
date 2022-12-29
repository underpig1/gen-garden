const propagate = (prop, fn) => {
    for (var i = 0; i < prop; i++) fn(i);
}
const vprop = (width, height, fn) => {
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            fn(vector(x, y));
        }
    }
};
const vector = (x, y) => new Vec(x, y);
const color = (r, g, b, a) => new Color(r, g, b, a);
const spare = (...args) => {
    if (Math.random() > 0.999) console.log(...args);
}
const round = (val, fac = 1) => Math.round(val * fac) / fac;
const werror = (val, error) => val >= -error && val <= error;
const interpolate = (start, end, step, steps) => (end - start) * step / steps + start;
const nrandom = () => (Math.random() - 0.5) * 2;
const vflip = (y) => window.innerHeight - y;
const randrange = (min, max) => Math.random() * (max - min) + min
const weightrand = (spec) => {
    var i, j, table = [];
    for (var i in spec) {
        for (j = 0; j < spec[i]*10; j++) {
            table.push(i);
        }
    }
    return () => table[Math.floor(Math.random() * table.length)];
}

function Color(r = 0, g = 0, b = 0, a = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.isClear = () => this.a == 0;
    this.toCSS = () => `rgba(${round(this.r)}, ${round(this.g)}, ${round(this.b)}, ${round(this.a)})`;
    this.from = (c) => {
        this.r = JSON.parse(JSON.stringify(c.r));
        this.g = JSON.parse(JSON.stringify(c.g));
        this.b = JSON.parse(JSON.stringify(c.b));
        this.a = JSON.parse(JSON.stringify(c.a));
        return this;
    }
}

function Vec(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.add = (vec) => {
        this.x += vec.x;
        this.y += vec.y;
        return this;
    }
    this.subtract = (vec) => {
        this.x -= vec.x;
        this.y -= vec.y;
        return this;
    }
    this.multiplyScalar = (scalar) => {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    this.multiplyVector = (vec) => {
        this.x *= vec.x;
        this.y *= vec.y;
        return this;
    }
    this.divideScalar = (scalar) => {
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }
    this.divideVector = (vec) => {
        this.x /= vec.x;
        this.y /= vec.y;
        return this;
    }
    this.unpack = () => [this.x, this.y];
    this.distanceTo = (vec) => Math.sqrt((vec.x - this.x) ** 2 + (vec.y - this.y) ** 2);
    this.is = (vec) => this.x == vec.x && this.y == vec.y;
    this.hasContact = (vec) => (vec.x - this.x) ** 2 <= 1 && (vec.y - this.y) ** 2 <= 1 && !this.is(vec);
    this.from = (vec) => {
        this.x = JSON.parse(JSON.stringify(vec.x));
        this.y = JSON.parse(JSON.stringify(vec.y));
        return this;
    }
    this.round = () => {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
}