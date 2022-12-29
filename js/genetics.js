function TreeGenetics () {
    return {
        branches: {
            color: color(58, 95, 11),
            split_modifier: 0.5,
            split_probability: 0.5,
            max_angle_diff: Math.PI/4,

            brightness: 0,
            saturation: 0,
            color_variation: 0,
            branchlets: 0,
            fur: 0,
            split: 0,
            droopiness: 0,
            spread: 0,
        },
        leaves: {
            color: color(138, 115, 98),
            brightness: 0,
            saturation: 0,
            color_variation: 0,
            spread: 0,
            fur: 0,
            leaflets: {
                density: 0,
                size: 0,
                distance_from_leaves: 0
            },
            droopiness: 0,
            width: 0,
            height: 0,
            density: 0
        },
        flowers: {
            color: color(240, 240, 240),
            brightness: 0,
            saturation: 0,
            color_variation: 0,
            petals: {
                length: 0,
                curvature: 0
            },
            density: 0
        }
    }
}

function Branch(parent, position, angle = 0, length = 0, start_radius = 0, end_radius = 0, genetics = null) {
    this.parent = parent;
    this.image = parent.image;
    this.position = position;
    this.angle = angle;
    this.length = length;
    this.start_radius = start_radius;
    this.end_radius = end_radius;
    this.genetics = genetics;
    this.children = [];

    this.age = 0;
    this.ended = false;
    this.leaf_bearing = false;

    this.draw = () => {
        this.image.path(this.path, this.genetics.color);
        for (var child of this.children) {
            if (child.age > 0) child.draw();
        }
    }

    this.grow = () => {
        propagate(this.children.length, (i) => this.children[i].grow());

        this.start_position = this.position;
        this.end_position = vector(this.length*Math.cos(this.angle), this.length*Math.sin(this.angle)).add(this.position).round();

        this.age++;
        this.start_radius += this.genetics.radius_growth_rate;

        if (this.ended || this.leaf_bearing) this.end_radius += this.genetics.radius_growth_rate;
        else this.length += this.genetics.length_growth_rate;

        this.path = [
            {position: this.start_position, radius: this.start_radius},
            {position: this.end_position, radius: this.end_radius}
        ];

        if (this.age > this.genetics.min_split_age && !this.ended && !this.leaf_bearing) {
            if (Math.random() > 1 - this.genetics.split_probability) {
                var child = this.reproduce();
                if (Math.random() > 1 - this.genetics.mortality_rate) {
                    this.ended = true;
                    if (Math.random() > 1 - this.genetics.fertility_rate) this.reproduce(-(child.angle - this.angle)*this.genetics.spread);
                }
            }
        }

        if (this.age > this.genetics.leaf_age && !this.ended) {
            this.leaf_bearing = true;
            this.parent.leaf_points.push(this);
        }
    }

    this.reproduce = (angle = false) => {
        if (!angle) var new_angle = this.angle + nrandom()*this.genetics.angle_diff;
        else var new_angle = this.angle + angle
        new_angle += this.genetics.twist;

        if (this.genetics.target) {
            var target = vector().from(this.genetics.target).subtract(this.end_position);
            var target_angle = Math.atan(target.y / target.x);
            new_angle = -(target_angle + Math.PI/2)*this.genetics.eagerness + new_angle*(1-this.genetics.eagerness);
        }

        var child = new Branch(this.parent, this.end_position, new_angle, this.genetics.length, this.end_radius, this.genetics.branch_thickness, this.genetics);
        this.children.push(child);
        return child;
    }
}

function Leaf(parent, position, width, height, genetics, layer = 0) {
    this.parent = parent;
    this.position = position;
    this.width = width;
    this.height = height;
    this.genetics = genetics;
    this.image = new Image(vector().from(this.position).subtract(vector(width, height).divideScalar(2)), width, height, layer = this.layer);
    
    this.draw = () => {
        this.image.stain(vector(width/2, height/2), width, height, this.genetics)
    }
}

function Tree(position, width, height, genetics, layer = 0) {
    this.position = position;
    this.genetics = genetics;
    this.layer = layer;
    this.age = 0;
    this.image = new Image(this.position, width, height, layer = this.layer);
    this.branches = [];
    this.leaf_points = [];
    this.leaves = [];

    grid.adopt(this.image);

    this.createBranch = (position, rotation) => this.branches.push(new Branch(this, position, rotation, this.genetics.length, this.genetics.trunk_thickness, this.genetics.branch_thickness, this.genetics.branches));
    this.createLeaf = (position, width, height) => this.leaves.push(new Leaf(this, position, width, height, this.genetics.leaves, this.layer + 1));

    this.growBranches = () => {
        this.image.fill();
        for (var branch of this.branches) branch.grow();
        this.age++;
    }

    this.update = () => {
        for (var branch of this.branches) branch.draw();
        for (var leaf of this.leaves) leaf.draw();
        this.image.updateEdges();
    }

    this.postProcess = () => {
        this.update();
        this.image.droop(this.genetics.branches.droop_intensity, this.genetics.branches.droop_length);
        this.image.fur(this.genetics.branches.fur);
        this.image.distort(this.genetics.branches.color_variation);
    }
}