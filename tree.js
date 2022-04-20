function Tree(startX, startY, len, angle, branchWidth, curve, color1, color2) {
    c.beginPath();
    c.save();
    c.strokeStyle = color1;
    c.fillStyle = color2;
    c.shadowBlur = 15;
    c.shadowOffsetY = 0;
    c.shadowOffsetX = 0;
    c.shadowColor = 'black'
    c.lineWidth = branchWidth;
    c.lineCap = 'round'
    c.translate(startX, startY);
    c.rotate(angle * Math.PI / 180);
    c.moveTo(0, 0);
    if (angle > 0) {
        c.bezierCurveTo(20, -len / 2, 10, -len / 2, 0, -len)
    }else {
        c.bezierCurveTo(-20, -len / 2, 10, -len / 2, 0, -len)
    }
    c.stroke();

    if (len < 10) {
        // leafs
        c.beginPath();
        c.arc(0, -len, 10, 0, Math.PI / 2);
        c.fill();
        c.restore();
        return;
    }

    Tree(0, -len, len * 0.75, angle + curve, branchWidth * 0.6, curve);
    Tree(0, -len, len * 0.75, angle - curve, branchWidth * 0.6, curve);
    c.restore();
}
function drawTree(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.curve = (Math.random() * 10) + 20;
    this.drawnTree = false;
    this.color1 = 'rgb(' + Math.random() * 255 + ',' + Math.random() * 255 + ',' + Math.random() * 255 + ')'; 
    this.color2 = 'rgb(' + Math.random() * 255 + ',' + Math.random() * 255 + ',' + Math.random() * 255 + ')';
    this.len = Math.floor((Math.random() * 10) + 23);
    this.angle = 0;
    this.branchWidth = (Math.random() * 7) + 5;
    this.rotateAngle = (Math.random() * -140 + 70) / 180 * Math.PI
}
drawTree.prototype.display = function() {
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.rotateAngle);
    Tree(0, -this.size, this.len, this.angle, this.branchWidth, this.curve, this.color1, this.color2)
    c.restore();
}

var trees = [];