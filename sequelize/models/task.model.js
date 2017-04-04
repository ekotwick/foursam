'use strict';

var db = require('./database');
var Sequelize = require('sequelize');

// Make sure you have `postgres` running!

var Task = db.define('Task', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  complete: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  due: Sequelize.DATE
}, {
  //---------VVVV---------  your code below  ---------VVV----------
  getterMethods: {

    timeRemaining: function(){
      if (!this.due) return Infinity;
      else return this.due - Date.now();
    },

    overdue: function(){
      if (!this.complete && Date.now() - this.due > 0) return true;
      else return false;
    }
  },

  classMethods: {

    clearCompleted: function(){
      return Task.destroy({
        where: {
          complete: true
        }
      })
    },

    completeAll: function(){
      return Task.update(
        {complete: true},
        {where: {complete: false}}
      )
    }

  }, 

  instanceMethods: {
    // an instance method is called ON AN INSTANCE——there is a "this", and the this is a task.

    addChild: function(task){

      // 'should return a promise for a new child'
      // so we need to do two things:
      // 1) create a new task
      // 2) assign that task a parent
      // remember the thing about promises: if you don't return them, it's as if they didn't happen!
      // now, we set the parent as "this" because our instances methods are being called on something
      // arrow functoins are important because we need to keep track of 'this'!!
      return Task.create(task)
        .then(createdTask => {
          return createdTask.setParent(this);
        });
    },

    getChildren: function() {
      // we set up an association between the objects. this means that a foreign key will be placed in one of the tables for the other. 
      return Task.findAll({
        where: {
          parentId: this.id
        }
      });
    },

    getSiblings: function() {
  // the task here isn't to find children; it's to find other tasks that have the same parent
  // find association: 
      // or eagerly load all instances with the parent id given...
      // return Task.findAll({})
      //   .then(foundTasks => {console.log(foundTasks)})

      // look at all the tasks. we're interested in finding all the tasks that have the same parentId——they all belong to the same parent.
      // so we can do that search, but then we need to exclude one item from our search, namely this!
      // how do do that? with another condition! use one of the operators.
      return Task.findAll({
        where: {
          parentId: this.parentId,
          id: {
            $ne: this.id
          }
        }
      });

    }
  },

  hooks: {
    // here's something interesting:
    // "beforeCreate": causes all the instance methods to fail: there are no children tasks!
    // "aftercreate": fails this spec: the tasks are already created: "expected [ Array(4) ] to have a length of 2 but got 4"
    // "beforeDestroy": passes.
    // does not work for beforeUpdate
    beforeDestroy: function(task){
      return Task.destroy({
        where: {
          parentId: task.id
        }
      });
    }
  }





  //---------^^^---------  your code above  ---------^^^----------
});

Task.belongsTo(Task, {as: 'parent'});





module.exports = Task;

