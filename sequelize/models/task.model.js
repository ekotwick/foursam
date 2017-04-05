'use strict';

var db = require('./database');
var Sequelize = require('sequelize');


// THIS LOOKS AWESOME! this is a really hard review checkpoint. I can tell you have been working on Sequelize a lot. I'm impressed

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
  getterMethods: {

    timeRemaining: function(){
      if (!this.due) return Infinity;
      else return this.due - Date.now();
    },

    // unnecessary else. that return true would end the function if the if statement hit, so you can just say return false
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

    addChild: function(task){
      //nice arrow function with 'this' context
      return Task.create(task)
        .then(createdTask => {
          return createdTask.setParent(this);
        });
    },

    getChildren: function() {
      return Task.findAll({
        where: {
          parentId: this.id
        }
      });
    },

    getSiblings: function() {
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
    beforeDestroy: function(task){
      return Task.destroy({
        where: {
          parentId: task.id
        }
      });
    }
  }


});

Task.belongsTo(Task, {as: 'parent'});





module.exports = Task;

