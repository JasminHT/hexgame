/*
 Priority Queue implementation found on stack overflow
 https://stackoverflow.com/questions/42919469/efficient-way-to-implement-priority-queue-in-javascript
 Author: gyre @ stackoverflow


Example with default comparison semantics:
 
const queue = new PriorityQueue();
queue.push(10, 20, 30, 40, 50);
console.log('Top:', queue.peek()); //=> 50
console.log('Size:', queue.size()); //=> 5
console.log('Contents:');
while (!queue.isEmpty()) {
  console.log(queue.pop()); //=> 40, 30, 20, 10
}


Example using pairwise comparison constructor-supplied function

const pairwiseQueue = new PriorityQueue((a, b) => a[1] > b[1]);
pairwiseQueue.push(['low', 0], ['medium', 5], ['high', 10]);
console.log('\nContents:');
while (!pairwiseQueue.isEmpty()) {
  console.log(pairwiseQueue.pop()[0]); //=> 'high', 'medium', 'low'
}





*/






export default function PriorityQueue(comparator = (a, b) => a > b) {

  var top = 0;
  var parent = i => ((i + 1) >>> 1) - 1;
  var left = i => (i << 1) + 1;
  var right = i => (i + 1) << 1;

  this._heap = [];
  this._comparator = comparator;
  
  this.getArray = function() {
    return this._heap;
  }
  this.size = function() {
    return this._heap.length;
  }
  this.isEmpty = function() {
    return this.size() == 0;
  }
  this.peek = function() {
    return this._heap[top];
  }
  this.push = function(...values) {
    values.forEach(value => {
      this._heap.push(value);
      this._siftUp();
    });
    return this.size();
  }
  this.pop = function() {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > top) {
      this._swap(top, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }
  this.replace = function(value) {
    const replacedValue = this.peek();
    this._heap[top] = value;
    this._siftDown();
    return replacedValue;
  }
  this._greater = function(i, j) {
    return this._comparator(this._heap[i], this._heap[j]);
  }
  this._swap = function(i, j) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }
  this._siftUp = function() {
    let node = this.size() - 1;
    while (node > top && this._greater(node, parent(node))) {
      this._swap(node, parent(node));
      node = parent(node);
    }
  }
  this._siftDown = function() {
    let node = top;
    while (
      (left(node) < this.size() && this._greater(left(node), node)) ||
      (right(node) < this.size() && this._greater(right(node), node))
    ) {
      let maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
}

