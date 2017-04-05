'use strict';


function Stack () {
  // your code here
  this.stackArr = [],
  this.first = 0,
  this.last = 0
}


Stack.prototype.add = function (item) {
  // this is NUTS, but some impressive chaining. there is a much much easier way to do this, try:
  // this.stackArr[this.last++] = item;
  this.stackArr = this.stackArr.slice(0,this.first).concat([item]).concat(this.stackArr.slice(this.first));
  this.last++;

  return this;
};

Stack.prototype.remove = function () {
  if (this.last === this.first) return undefined;
  let removedItem = this.stackArr[this.first];

  this.first++;

  return removedItem;
};


function Queue () {
  this.queueArr = [];
  this.first = 0;
  this.last = 0;
}

Queue.prototype.add = function (item) {
  // making things a bit more complex than they need to be here, you will always be adding something at the position of this.last, doesn't matter if its empty or not

  // what about this
  // this.queueArr[this.last++] = item;
  // return this;


  if (this.first === 0 && this.last === 0) {
    this.queueArr[this.first] = item;
    this.last++;
  } else {
    this.queueArr[this.last] = item;
    this.last++;
  }
  return this;
};

Queue.prototype.remove = function () {
  if (this.first === this.last) return undefined;

  // looks good, but can shorten this code by saying:
  // return this.queueArr[this.first++]
  let removedItem = this.queueArr[this.first];
  this.first++;
  return removedItem;
};



// your LinkedList looks great
// one small thing: rather than saying if(x === null), use if(!x). this is cleaner & shorter.
function LinkedList () {
  this.head = this.tail = null;
}

function ListNode (item, prev, next) {
  this.item = item;
  this.next = next || null;
  this.prev = prev || null;
}

LinkedList.prototype.addToTail = function (item) {

  let newNode = new ListNode(item);

  if (this.head === null) {
    this.head = this.tail = newNode;
  } else if (this.head.next === null) {
    this.head.next = newNode;
    this.tail = newNode;
    newNode.prev = this.head
  } else {
    this.tail.next = newNode;
    newNode.prev = this.tail;
    this.tail = newNode;
  }

  return this;
};

LinkedList.prototype.removeFromTail = function () {

  if (this.head === null) {
    return undefined;
  } else {
    let toRemove = this.tail;
    if (this.head.next === null && this.tail.prev === null) {
      this.head = this.tail = null;
    } else {
      this.tail = this.tail.prev;
      this.tail.next = null;
    }
    return toRemove.item;
  }

};

LinkedList.prototype.forEach = function (iterator) {

  let toProcess = this.head;

  while (toProcess.next !== null) {
    iterator(toProcess.item);
    toProcess = toProcess.next;
  }
  iterator(toProcess.item);

};



function Alist () {
  this.head = null;
}

function AlistNode (key, value, next=null) {
  this.key = key;
  this.value = value;
  this.next = next;
}

Alist.prototype.set = function (key, value) {
  let newNode = new AlistNode(key, value);

  if (!this.head) {
    this.head = newNode;
  } else {
    newNode.next = this.head;
    this.head = newNode;
  }

  return this;
};

Alist.prototype.get = function (key) {
  let toProcess = this.head;

  while (toProcess) {
    if (toProcess.key === key) {
      return toProcess.value;
    } else {
      toProcess = toProcess.next;
    }
  }
};



function hash (key) {
  var hashedKey = 0;
  for (var i = 0; i < key.length; i++) {
    hashedKey += key.charCodeAt(i);
  }
  return hashedKey % 20;
}

function HashTable () {
  this.buckets = Array(20);
  for (var i = 0; i < this.buckets.length; i++){
    this.buckets[i] = new Alist();
  }
}

HashTable.prototype.set = function (key, value) {
  let hashedKey = hash(key);
  let bucketAListNode = this.buckets[hashedKey]

  bucketAListNode.set(key, value);

  return this;
};

HashTable.prototype.get = function (key) {
  let hashedKey = hash(key);
  let toProcess = this.buckets[hashedKey].head;

  while (toProcess) {
    if (toProcess.key === key) {
      return toProcess.value;
    } else {
      toProcess = toProcess.next;
    }

  }

};



function BinarySearchTree (val) {
  this.value = val;
  this.left = this.right = null;
}

BinarySearchTree.prototype.insert = function (val) {
  let toInsert = new BinarySearchTree(val);
  if (val > this.value) {
    if (this.right) {
      this.right.insert(val);
    } else {
      this.right = toInsert;
    }
  } else {
    if (this.left) {
      this.left.insert(val);
    } else {
      this.left = toInsert;
    }
  }

  return this;
};

BinarySearchTree.prototype.min = function () {
  if (!this.left) return this.value;
  else return this.left.min();
};

BinarySearchTree.prototype.max = function () {
  if (!this.right) return this.value;
  else return this.right.max();
};

// could probably shorten this a bit rather than returning false multiple times. what if you just checked if this.right or this.left existed (and then did the recursive call off that), and then at the very end of your function you return false once. so if you don't hit those true conditionals, you just hit this one catch-all return false at the end of your function.
BinarySearchTree.prototype.contains = function (val) {
  // your code here
  if (this.value === val){
    return true;
  } else if (val > this.value) {
    // if (this.right) this.right.contains(val);
    if (!this.right) {
      return false;
    } else {
      return
    }
  } else {
    // if (this.left) this.left.contains(val);
    if (!this.left){
      return false;
    } else {
      return this.left.contains(val);
    }
  }
  // return false;
};

BinarySearchTree.prototype.traverse = function (iterator) {
  if (this.left) this.left.traverse(iterator);
  iterator(this.value);
  if (this.right) this.right.traverse(iterator);
};
