function Callbacks() {

}
Callbacks.prototype.has = function (type,fn) {
    return !!this[type]&& this[type].includes(fn);
};
Callbacks.prototype.add = function (type,...arg) {
    if(!this[type]){
        this[type] = arg.filter((item)=>{
            return typeof item === 'function';
        });
    }else{
        arg.forEach((item)=>{
            if(typeof item === 'function' && !this[type].includes(item)){
                this[type].push(item);
            }
        });
    }
    return this;
};
Callbacks.prototype.remove = function (type,...arg) {
    if(this[type]){
        arg.forEach((item)=>{
            if(this.has(type,item)){
                this[type].splice(this[type].indexOf(item),1);
            }
        });
    }
    return this;
};
Callbacks.prototype.fire = function (type,...arg) {
    if(this[type]){
        this[type].forEach((item)=>{
            item.apply(this,arg);
        });
    }
    return this;
};

Object.assign(Drag.prototype,Callbacks.prototype);

function Drag(ele) {
    this.ele = ele;
    let down = (e)=>{
        this.x = e.clientX - this.ele.offsetLeft;
        this.y = e.clientY - this.ele.offsetTop;
        document.addEventListener("mousemove",move);
        document.addEventListener("mouseup",up);
        this.fire("down",e);
    };
    let move = (e)=>{
        this.ele.style.left = e.clientX - this.x + 'px';
        this.ele.style.top = e.clientY - this.y + 'px';
        e.preventDefault();
        this.fire("move",e);
    };
    let up = (e)=>{
        document.removeEventListener("mousemove",move);
        document.removeEventListener("mouseup",up);
        this.fire("up",e);
    };
    this.ele.addEventListener("mousedown",down);
}
Drag.prototype.zIndex = function () {
    this.add("down",this.addZIndex).add("up",this.removeZIndex);
    this.ZIndex = getComputedStyle(this.ele)['zIndex'];
    return this;
};
Drag.prototype.addZIndex = function () {
    this.ele.style.zIndex = '999';
};
Drag.prototype.removeZIndex = function () {
    this.ele.style.zIndex = this.ZIndex;
};
Drag.prototype.border = function () {
  this.add("down",this.addBorder).add("up",this.removeBorder);
  return this;
};
Drag.prototype.addBorder = function () {
    this.ele.style.border = "2px dashed black";
    this.ele.children[0].style.display = 'none';
};
Drag.prototype.removeBorder = function () {
    this.ele.style.border = "";
    this.ele.children[0].style.display = 'block';
};
Drag.prototype.range = function (rangeObj) {
    this.rangeObj = rangeObj;
    this.add("move",this.setRange);
    return this;
};
Drag.prototype.setRange = function (e) {
    let L = e.clientX - this.x;
    let T = e.clientY - this.y;
    if(this.rangeObj.minL !== 'undefined' && L <= this.rangeObj.minL){
        L = this.rangeObj.minL;
    }
    if(this.rangeObj.minT !== 'undefined' && T <= this.rangeObj.minT){
        T = this.rangeObj.minT;
    }
    if(this.rangeObj.maxT && T >= this.rangeObj.maxT){
       T = this.rangeObj.maxT;
    }
    if(this.rangeObj.maxL && L >= this.rangeObj.maxL){
        L = this.rangeObj.maxL;
    }
    this.ele.style.top = T + 'px';
    this.ele.style.left = L + 'px';
    e.preventDefault();
};
Drag.prototype.jump = function () {
    this.add("up",this.drop,this.fly).add("move",this.getSpeedX);
    this.speedY = 1;
    this.maxT = document.documentElement.clientHeight - this.ele.offsetHeight;
    this.maxL = document.documentElement.clientWidth - this.ele.offsetWidth;
    this.timer = null;
    this.timerFly = null;
    return this;
};
Drag.prototype.drop = function () {
    window.clearTimeout(this.timer);
    this.speedY += 9.8;
    this.speedY *= 0.93;
    let T = this.ele.offsetTop + this.speedY;
    if(T >= this.maxT){
        T = this.maxT;
        this.speedY *= -1;
        this.f++;
    }else{
        this.f = 0;
    }
    this.ele.style.top = T + 'px';
    if(this.f < 2){
        this.timer = window.setTimeout(()=>{
            this.drop();
        },20);
    }
};
Drag.prototype.getSpeedX = function (e) {
    if(!this.prevSpeedX){
        this.prevSpeedX = e.clientX;
    }else{
        this.speedX = e.clientX - this.prevSpeedX;
        this.prevSpeedX = e.clientX;
    }
};
Drag.prototype.fly = function () {
    window.clearTimeout(this.timerFly);
    this.speedX += 9.8;
    this.speedX *= 0.93;
    let L = this.ele.offsetLeft + this.speedX;
    if(L <= 0){
        L = 0;
        this.speedX *= -1;
    }
    if(L >= this.maxL){
        L = this.maxL;
        this.speedX *= -1;
    }
    this.ele.style.left = L + 'px';
    if(Math.abs(this.speedX) >= 0.5){
        this.timerFly = window.setTimeout(()=>{
            this.fly();
        },20);
    }
};