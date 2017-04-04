'use strict';
/*
Fill in your own code where you see "your code here".
You can insert new lines at those locations, but you
will not need to edit the lines above and below them.
*/

//-----------------------------------------
// Stacks

function Stack () {
  // your code here
  this.stackArr = [],
  this.first = 0,
  this.last = 0
}

Stack.prototype.add = function (item) {
  this.stackArr = this.stackArr.slice(0,this.first).concat([item]).concat(this.stackArr.slice(this.first));
  this.last++;
  // your code here

  return this; // for chaining, do not edit
};

Stack.prototype.remove = function () {
  // your code here
  if (this.last === this.first) return undefined;
  let removedItem = this.stackArr[this.first];
  
  this.first++;
  
  return removedItem;
};

//-----------------------------------------
// Queues

// EXTRA CREDIT: remove the `pending` line in the spec to attempt.

function Queue () {
  // your code here
  this.queueArr = [];
  this.first = 0;
  this.last = 0;
}

Queue.prototype.add = function (item) {
  // your code here
  if (this.first === 0 && this.last === 0) {
    this.queueArr[this.first] = item;
    this.last++;
  } else {
    this.queueArr[this.last] = item;
    this.last++;
  }
  return this; // for chaining, do not edit
};

Queue.prototype.remove = function () {
  // your code here
  if (this.first === this.last) return undefined;
  let removedItem = this.queueArr[this.first];
  this.first++;
  return removedItem;
};

//-----------------------------------------
// Linked lists

// EXTRA CREDIT: remove the `pending` line in the spec to attempt.

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

  return this; // for chaining, do not edit
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

//-----------------------------------------
// Association lists

function Alist () {
  // your code here
  this.head = null;
}

function AlistNode (key, value, next=null) {
  this.key = key;
  this.value = value;
  this.next = next;
}

Alist.prototype.set = function (key, value) {
  // your code here
  let newNode = new AlistNode(key, value);

  if (!this.head) {
    this.head = newNode;
  } else {
    newNode.next = this.head;
    this.head = newNode;
  }

  return this; // for chaining; do not edit
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


//-----------------------------------------
// Hash tables

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
  // your code here
}

HashTable.prototype.set = function (key, value) {
  // your code here. DO NOT simply set a prop. on an obj., that is cheating.
  let hashedKey = hash(key); 
  let bucketAListNode = this.buckets[hashedKey]

  bucketAListNode.set(key, value);

  return this; // for chaining, do not edit
};

HashTable.prototype.get = function (key) {
  // your code here. DO NOT simply get a prop. from an obj., that is cheating.
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

//-----------------------------------------
// Binary search trees

function BinarySearchTree (val) {
  // your code here
  this.value = val;
  this.left = this.right = null;
}

BinarySearchTree.prototype.insert = function (val) {
  // your code here  
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

  return this; // for chaining, do not edit
};

BinarySearchTree.prototype.min = function () {
  // your code here
  if (!this.left) return this.value;
  else return this.left.min();
};

BinarySearchTree.prototype.max = function () {
  // your code here
  if (!this.right) return this.value;
  else return this.right.max();
};

BinarySearchTree.prototype.contains = function (val) {
  // your code here
  if (this.value === val){
    return true;
  } else if (val > this.value) {
    if (!this.right) {
      return false;
    } else {
      return this.right.contains(val);
    }
  } else {
    if (!this.left){
      return false;
    } else {
      return this.left.contains(val);
    }
  }
};

BinarySearchTree.prototype.traverse = function (iterator) {
  // your code here
  if (this.left) this.left.traverse(iterator);
  iterator(this.value);
  if (this.right) this.right.traverse(iterator);
};
