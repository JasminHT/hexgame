//code.stephenmorley.org
function Queue() {
	this.a=[];
	this.b=0;
}
	Queue.prototype.getLength=function(){
		return this.a.length-this.b;
	};
	Queue.prototype.isEmpty=function(){
		return 0==this.a.length;
	};
	Queue.prototype.put=function(b){
		this.a.push(b);
	};
	Queue.prototype.pop=function(){
		if(0!=this.a.length){
			var c=this.a[this.b];
			this.b++;
			if (2*this.b >= this.a.length) {
				this.a = this.a.slice(this.b);
				this.b=0;
			}
			return c;
		}
	};
	Queue.prototype.peek=function(){
		return 0<this.a.length?this.a[this.b]:void 0;
	};
