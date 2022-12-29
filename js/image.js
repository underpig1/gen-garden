function Image(position = vector(0, 0), width = 0, height = 0, layer = 0) {
    this.position = position;
    this.width = width;
    this.height = height;
    this.layer = layer;
    this.data = [];
    this.children = [];
    this.light = null;
    this.parent = null;
    this.step = 4;
    this.filters = [];
    this.get = (vec) => this.data[vec.x][vec.y];
    this.set = (vec, value) => this.data[vec.x][vec.y] = value;
    this.adopt = (img) => {
        this.children.push(img);
        img.parent = this;
    }
    this.edges = [];
    this.fill = (value = color(0, 0, 0, 0)) => this.data = [...Array(this.width)].map((_e) => Array(this.height).fill(value));
    this.rect = (position, width, height, color) => vprop(width, height, (vec) => this.set(vec.add(position), color));
    this.circle = (position, radius, color) => {
        this.forEach((vec) => {
            if (werror((vec.x - position.x)**2 + (vec.y - position.y)**2, radius**2)) this.set(vec, color);
        });
    }
    this.line = (start, end, start_radius, end_radius, color) => { // takes very long to compute
        const steps = Math.max(Math.abs(start.x - end.x), Math.abs(start.y - end.y));
        for (var step = 1; step <= steps; step++) {
            var x = Math.floor(interpolate(start.x, end.x, step, steps));
            var y = Math.floor(interpolate(start.y, end.y, step, steps));
            var r = Math.floor(interpolate(start_radius, end_radius, step, steps));
            this.circle(vector(x, y), r, color);
        }
    }
    this.path = (queue, color) => propagate(queue.length - 1, (i) => {
        var start = queue[i].position;
        var end = queue[i + 1].position;
        var start_radius = queue[i].radius;
        var end_radius = queue[i + 1].radius;
        this.line(start, end, start_radius, end_radius, color);
    });
    this.interchange = (first, second) => {
        var sto = color().from(this.get(first));
        this.set(first, this.get(second));
        this.set(second, sto);
    }
    this.clone = (first, second) => {
        this.set(first, this.get(second));
    }
    this.fur = (intensity = 1) => {
        const dir = () => Math.random() > 0.5 ? 1 : -1;
        for (var edge of this.edges) {
            if (Math.random() > 1 - intensity) {
                var d = dir();
                var t = vector(d, d == 0 ? dir() : 0).add(edge);
                if (this.vectorExists(t)) this.clone(edge, t);
            }
        }
    }
    this.distort = (intensity = 1) => {
        this.forEach((vec) => {
            var c = color().from(this.get(vec));
            if (!c.isClear()) {
                var fac = nrandom() * intensity;
                c.r += fac;
                c.g += fac;
                c.b += fac;
            }
            this.set(vec, c);
        })
    }
    this.outline = (points, color) => {
        var results = [];
        propagate(points.length - 1, (i) => {
            var start = points[i];
            var end = points[i + 1];
            const steps = Math.max(Math.abs(start.x - end.x), Math.abs(start.y - end.y));
            for (var step = 1; step <= steps; step++) {
                var x = Math.floor(interpolate(start.x, end.x, step, steps));
                var y = Math.floor(interpolate(start.y, end.y, step, steps));
                var vec = vector(x, y);
                results.push(vector(x, y));
                this.set(vec, color);
            }
        });
        return results;
    }
    this.fillPath = (points, color) => {
        var results = this.outline(points, color);
        const ready = { y: 0, x: [] };
        var template = [];
        for (var p of results) {
            var place = template.findIndex((e) => e.y == p.y);
            if (place != -1) template[place].x.push(p.x);
            else {
                var next = JSON.parse(JSON.stringify(ready));
                next.y = p.y;
                next.x = [p.x];
                template.push(next);
            }
        }
        for (var r of template) {
            var start = Math.min(...r.x);
            var width = Math.abs(Math.max(...r.x) - start);
            propagate(width, (x) => {
                var vec = vector(x + start, r.y);
                if (this.vectorExists(vec)) this.set(vec, color)
            });
        }
    }
    this.subdivide = (points, fac = 1) => {
        var results = points;
        propagate(results.length - 1, (i) => {
            var p = results[i];
            var n = results[i + 1];
            const steps = Math.round(Math.max(Math.abs(p.x - n.x), Math.abs(p.y - n.y)) / fac);
            propagate(steps, (step) => {
                var x = interpolate(p.x, n.x, step, steps);
                var y = interpolate(p.y, n.y, step, steps);
                var vec = vector(x, y);
                results.splice(i + step, 0, vec);
            });
            p.x = Math.round(p.x);
            p.y = Math.round(p.y);
        });
        return results;
    }
    this.curvePath = (points, fac = 4, mag = 1) => {
        var results = this.subdivide(points);
        var d = 0;
        for (var p of results) {
            p.x += Math.cos(d * Math.PI / fac) * mag;
            p.y += Math.sin(d * Math.PI / fac) * mag;
            p.x = Math.ceil(p.x);
            p.y = Math.ceil(p.y);
            d++;
        }
        console.log(results);
        return results;
    }
    this.ellipse = (position, width, height, color) => {
        this.forEach((vec) => {
            if (werror((vec.x - position.x) ** 2 / width ** 2 + (vec.y - position.y) ** 2 / height ** 2, 1)) this.set(vec, color);
        });
    }
    this.stain = (position, width, height, mag = 1, color) => {
        this.forEach((vec) => {
            if (werror((vec.x - position.x + nrandom() * mag) ** 2 / width ** 2 + (vec.y - position.y + nrandom() * mag) ** 2 / height ** 2, 1)) this.set(vec, color);
        });
    }
    this.droop = (intensity = 0.5, length = 3) => {
        for (var edge of this.edges) {
            var c = this.get(edge)
            if (!c.isClear()) {
                if (Math.random() > 1 - intensity) {
                    for (var y = 0; y < length - nrandom(); y++) {
                        this.set(vector(edge.x, edge.y + y), c);
                    }
                }
            }
        }
    }

    this.forEach = (fn) => vprop(this.width, this.height, fn);
    this.render = () => {
        propagate(this.filters.length, (i) => {
            var filter = this.filters[i];
            if (i > 0) filter.copyImage();
            filter.modify();
        });
        this.forEach((vec) => {
            var style = this.get(vec);
            if (!style.isClear()) {
                ctx.fillStyle = this.get(vec).toCSS();
                vec.add(this.position);
                if (this.parent) vec.add(this.parent.position);
                vec.multiplyScalar(this.step);
                ctx.fillRect(vec.x, vec.y, this.step, this.step);
            }
        });
        this.children.sort((a, b) => a.layer - b.layer);
        for (var child of this.children) child.render();
    }
    this.vectorExists = (vec) => vec.x > 0 && vec.x < this.width && vec.y > 0 && vec.y < this.height;
    this.searchContacts = (vec, fn) => {
        for (var diff of [vector(-1, -1), vector(-1, 0), vector(-1, 1), vector(0, -1), vector(0, 1), vector(1, -1), vector(1, 0), vector(1, 1)]) {
            var contact = vector().from(vec).add(diff);
            if (this.vectorExists(contact)) fn(contact);
        };
    }
    this.isEdge = (vec) => {
        var result = false;
        if (!image.get(vec).isClear) {
            this.searchContacts(vec, (contact) => {
                if (image.get(contact).isClear) result = true;
            });
        }
        return result;
    }
    this.updateEdges = () => {
        this.edges = [];
        const push_solid = (vec) => {
            if (!this.get(vec).isClear()) this.edges.push(vec)
        }
        propagate(width, (x) => push_solid(vector(x, 0)));
        propagate(width, (x) => push_solid(vector(x, height - 1)));
        propagate(height, (y) => push_solid(vector(0, y)));
        propagate(height, (y) => push_solid(vector(width - 1, y)));
        this.forEach((vec) => {
            if (this.get(vec).isClear()) {
                this.searchContacts(vec, (contact) => {
                    if (!this.get(contact).isClear()) this.edges.push(contact);
                });
            }
        });
    }
    this.distanceToEdge = (vec) => Math.min(...this.edges.map((edge) => edge.distanceTo(vec)));

    this.fill();
}