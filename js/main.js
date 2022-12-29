const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const grid = new Image(vector(0, 0), window.innerWidth, window.innerHeight);

window.onresize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    grid.width = Math.ceil(canvas.width / grid.step);
    grid.height = Math.ceil(canvas.height / grid.step);
}
window.onresize();

// const child = new Image(vector(10, 10), 100, 100, layer = 2);
// child.path([
//     {position: vector(10, 10), radius: 1},
//     {position: vector(20, 20), radius: 2},
//     {position: vector(30, 40), radius: 3},
//     {position: vector(60, 60), radius: 5},
//     {position: vector(30, 40), radius: 3},
//     {position: vector(30, 20), radius: 2}
// ], color(138, 115, 98));
// child.updateEdges();
// grid.adopt(child);
// child.fur(0.1);
// child.distort(2);
// grid.path([
//     {
//         "position": {
//             "x": 50,
//             "y": 100
//         },
//         "radius": 4
//     },
//     {
//         "position": {
//             "x": 80,
//             "y": 90
//         },
//         "radius": 1
//     }
// ], color(138, 115, 98));
// const light = new NormalLightFilter(child, vector(0, 0), [10, 20, 30, 40], -2, -2);

// const bush = new Image(vector(10, 10), 100, 100, layer = 4);
// bush.stain(vector(20, 10), 20, 10, 1, color(58, 95, 11));
// bush.updateEdges();
// grid.adopt(bush);
// bush.fur(0.1);
// bush.distort(2);
// const bush_light = new NormalLightFilter(bush, vector(0, 0), [10, 20, 30, 40], -2, -2);

const tree = new Tree(vector(0, 0), grid.width, grid.height, {
    branches: {
        color: color(138, 115, 98), // base trunk color
        min_split_age: 5, // age of maturity
        split_probability: 0.9, // rate of splitting for mature plants
        mortality_rate: 0.9, // rate of branch death
        fertility_rate: 1, // rate of posthumous reproduction
        angle_diff: Math.PI/4, // half of max angle difference between splitting branches
        length_growth_rate: 5, // length increments per age
        radius_growth_rate: 0.3, // radius increments per age (0.5 is like bonsai)
        leaf_age: 30, // age before leaves grow
        spread: 1, // likelihood of split branches to be apart
        
        trunk_thickness: 2, // start radius
        branch_thickness: 1, // end radius
        length: 1, // initial length

        twist: 0, // branch relative twist from vertical
        target: vector(0, 0), // tree is aiming to go to target
        eagerness: 0.5, // desire to reach target

        fur: 0.1,
        color_variation: 2,
        droop_intensity: 0.1,
        droop_length: 10
    },
    leaves: {
        width: 1, // relative width to size
        height: 0.5, // relative height to size
        size: 3, // size of individual leaves
        size_variation: 0 // magnitude of random variation in size
    }
}, layer = 5);
tree.createBranch(vector(grid.width/2, grid.height), -Math.PI/2);
propagate(20, () => tree.growBranches());
tree.postProcess();
const tree_light = new NormalLightFilter(tree.image, vector(grid.width / 2, grid.height - 50), [10, 20, 30, 40], -2, -2);
animate();

grid.render();

function animate() {
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    //grid.render();
    requestAnimationFrame(animate);
}