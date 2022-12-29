// function LightFilter(image, position = vector(0, 0), cutoffs = [1, 2], intensity = 1) {
//     this.position = position;
//     this.cutoffs = cutoffs;
//     this.intensity = intensity;

//     this.image = image;
//     image.filters.push(this);

//     this.copyImage = () => this.original = JSON.parse(JSON.stringify(this.image.data));
//     this.modifier = (vec) => {
//         var modified = color().from(this.original[vec.x][vec.y]);
//         var dist = vec.distanceTo(vector().from(this.position).add(this.image.position));
//         var fac = this.cutoffs.reduce((prev, curr) => Math.abs(curr - dist) < Math.abs(prev - dist) ? curr : prev) * this.intensity;
//         modified.r += fac;
//         modified.g += fac;
//         modified.b += fac;
//         return modified;
//     }
//     this.modify = () => this.image.forEach((vec) => this.image.set(vec, this.modifier(vec)));

//     this.copyImage();
// }

// function NormalFilter(image, intensity = 1) {
//     this.intensity = intensity;

//     this.image = image;
//     image.filters.push(this);

//     this.copyImage = () => this.original = JSON.parse(JSON.stringify(this.image.data));
//     this.modifier = (vec) => {
//         var modified = color().from(this.original[vec.x][vec.y]);
//         var fac = Math.sqrt(this.image.distanceToEdge(vec)) * this.intensity;
//         modified.r += fac;
//         modified.g += fac;
//         modified.b += fac;
//         return modified;
//     }
//     this.modify = () => this.image.forEach((vec) => this.image.set(vec, this.modifier(vec)));

//     this.copyImage();
// }

function NormalLightFilter(image, position = vector(0, 0), cutoffs = [1, 2], intensity = 1, bump = 1) {
    this.position = position;
    this.cutoffs = cutoffs;
    this.intensity = intensity;
    this.bump = bump;

    this.image = image;
    image.filters.push(this);

    this.copyImage = () => this.original = JSON.parse(JSON.stringify(this.image.data));
    this.modifier = (vec) => {
        var modified = color().from(this.original[vec.x][vec.y]);
        if (!modified.isClear()) {
            var edge = this.image.distanceToEdge(vec) * this.bump;
            var dist = vec.distanceTo(vector().from(this.position).add(this.image.position)) + edge;
            var fac = this.cutoffs.reduce((prev, curr) => Math.abs(curr - dist) < Math.abs(prev - dist) ? curr : prev) * this.intensity;
            modified.r += fac;
            modified.g += fac;
            modified.b += fac;
        }
        return modified;
    }
    this.modify = () => this.image.forEach((vec) => this.image.set(vec, this.modifier(vec)));

    this.copyImage();
}