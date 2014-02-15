// Generated by CoffeeScript 1.6.3
(function() {
  var CANVAS_FLASH_DURATION, DAMAGE_FACTOR, DAMAGE_THRESHOLD, FLASH_DURATION, FRAME_RATE, Food, GRAVITY, HP_FLASH_DURATION, HUNGER_DEPLETION_RATE, HUNGER_RESTORE, JETPACK_ACCEL, JETPACK_FUEL_USAGE, REFUEL_RATE, SHIFT_DISTANCE, Sprite,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  FRAME_RATE = 2;

  JETPACK_ACCEL = 0.15 / FRAME_RATE;

  JETPACK_FUEL_USAGE = 0.7 / FRAME_RATE;

  DAMAGE_THRESHOLD = 3 / Math.sqrt(FRAME_RATE);

  DAMAGE_FACTOR = 8;

  REFUEL_RATE = 0.15 / FRAME_RATE;

  FLASH_DURATION = 200 * FRAME_RATE / 10;

  HP_FLASH_DURATION = 50 * FRAME_RATE / 10;

  CANVAS_FLASH_DURATION = 50 * FRAME_RATE / 10;

  SHIFT_DISTANCE = 5;

  GRAVITY = 0.07 / FRAME_RATE;

  HUNGER_DEPLETION_RATE = 0.08 / FRAME_RATE;

  HUNGER_RESTORE = 40;

  Sprite = (function() {
    function Sprite(position, dimensions, color) {
      this.position = position;
      this.dimensions = dimensions;
      this.color = color != null ? color : '#FFF';
      this.velocity = [0, 0];
    }

    Sprite.prototype.draw = function(ctx) {
      ctx.fillStyle = this.color;
      return ctx.fillRect(this.position[0], this.position[1], this.dimensions[0], this.dimensions[1]);
    };

    Sprite.prototype.move = function() {
      this.position[0] += this.velocity[0];
      return this.position[1] += this.velocity[1];
    };

    Sprite.prototype.overlaps = function(other) {
      return !(other.position[0] > (this.position[0] + this.dimensions[0]) || other.position[1] > (this.position[1] + this.dimensions[1]) || (other.position[0] + other.dimensions[0]) < this.position[0] || (other.position[1] + other.dimensions[1]) < this.position[1]);
    };

    return Sprite;

  })();

  Food = (function(_super) {
    __extends(Food, _super);

    function Food(position, dimensions, color) {
      this.position = position;
      this.dimensions = dimensions;
      this.color = color != null ? color : '#FFF';
      Food.__super__.constructor.apply(this, arguments);
      this.velocity[0] = -1;
    }

    Food.prototype.replace = function(canvas) {
      var _this = this;
      console.log('replacing');
      this.position[0] = -100;
      this.position[1] = -100;
      return setTimeout((function() {
        _this.dimensions[0] = _this.dimensions[1] = 10 + Math.random() * 10;
        _this.position[0] = canvas.width;
        return _this.position[1] = Math.random() * (canvas.height - 30 - _this.dimensions[1]) + 30;
      }), 500 + Math.random() * 500);
    };

    return Food;

  })(Sprite);

  window.onload = function() {
    var canvas, ctx, gameStarted, startGame, writeText;
    gameStarted = false;
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    writeText = function(fill, font, text, location) {
      ctx.fillStyle = fill;
      ctx.font = font;
      return ctx.fillText(text, (canvas.width / 2) - ctx.measureText(text).width / 2, (canvas.height / 2) + location);
    };
    ctx.fillStyle = '#FFF';
    ctx.font = '50px Arial';
    ctx.fillRect((canvas.width / 2) - ctx.measureText('DOWN').width / 2, canvas.height / 2 - 45, ctx.measureText('DOWN').width, 50);
    writeText('#000', '50px Arial', 'DOWN', 0);
    writeText('#FFF', '20px Arial', 'A dystopian tale of jetpacks', 25);
    writeText('#FFF', '15px Arial', 'Arrow keys to move.', 45);
    writeText('#FFF', '15px Arial', 'Get the blue squares.', 60);
    writeText('#FFF', '15px Arial', 'Avoid the ground.', 75);
    writeText('#FFF', '20px Arial', 'Any key to start', 115);
    document.body.addEventListener('keydown', function(event) {
      if (!gameStarted) {
        return startGame();
      }
    });
    return startGame = function() {
      var canvasShifted, clear, drawEndgame, food, gameObjects, item, keysdown, player, redraw, remainingFuel, tick, timeHit, turnsPassed, _i, _j, _len, _len1;
      gameStarted = true;
      keysdown = {};
      document.body.addEventListener('keydown', function(event) {
        return keysdown[event.keyCode] = true;
      });
      document.body.addEventListener('keyup', function(event) {
        return keysdown[event.keyCode] = false;
      });
      gameObjects = [];
      remainingFuel = 100;
      clear = function() {
        return ctx.clearRect(0, 0, canvas.width, canvas.height);
      };
      redraw = function() {
        var object, _i, _len;
        clear();
        for (_i = 0, _len = gameObjects.length; _i < _len; _i++) {
          object = gameObjects[_i];
          object.draw(ctx);
        }
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, remainingFuel, 10);
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        return ctx.fillText('Fuel', 0, 10);
      };
      drawEndgame = function(text) {
        redraw();
        ctx.fillStyle = '#FFF';
        ctx.font = '20px Arial';
        ctx.fillText(text, (canvas.height / 2) - ctx.measureText(text).width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        text = 'Score: ' + turnsPassed;
        return ctx.fillText(text, (canvas.height / 2) - ctx.measureText(text).width / 2, (canvas.height / 2) + 30);
      };
      player = new Sprite([(canvas.width - 10) / 2, canvas.height / 2], [10, 10]);
      food = (function() {
        var _i, _results;
        _results = [];
        for (_i = 1; _i <= 5; _i++) {
          _results.push(new Food([0, 0], [20, 20], '#FA0'));
        }
        return _results;
      })();
      console.log(food);
      for (_i = 0, _len = food.length; _i < _len; _i++) {
        item = food[_i];
        console.log('replacing', item);
        item.replace(canvas);
      }
      gameObjects.push(player);
      for (_j = 0, _len1 = food.length; _j < _len1; _j++) {
        item = food[_j];
        gameObjects.push(item);
      }
      turnsPassed = 0;
      timeHit = -Infinity;
      canvasShifted = false;
      tick = function() {
        var continueFrames, _k, _len2;
        turnsPassed += 1;
        continueFrames = true;
        for (_k = 0, _len2 = food.length; _k < _len2; _k++) {
          item = food[_k];
          if (player.overlaps(item)) {
            remainingFuel = Math.min(100, remainingFuel + HUNGER_RESTORE);
            item.replace(canvas);
          }
          if (item.position[0] < -item.dimensions[0] && item.position[1] > 0) {
            item.replace(canvas);
          }
          item.move();
        }
        if (turnsPassed - timeHit > FLASH_DURATION) {
          player.color = '#FFF';
        }
        if (remainingFuel > 0) {
          if (keysdown[37]) {
            player.color = '#FA0';
            remainingFuel -= JETPACK_FUEL_USAGE;
            player.velocity[0] -= JETPACK_ACCEL;
          }
          if (keysdown[38]) {
            player.color = '#FA0';
            remainingFuel -= JETPACK_FUEL_USAGE;
            player.velocity[1] -= JETPACK_ACCEL;
          }
          if (keysdown[39]) {
            player.color = '#FA0';
            remainingFuel -= JETPACK_FUEL_USAGE;
            player.velocity[0] += JETPACK_ACCEL;
          }
          if (keysdown[40]) {
            player.color = '#FA0';
            remainingFuel -= JETPACK_FUEL_USAGE;
            player.velocity[1] += JETPACK_ACCEL;
          }
        }
        player.velocity[1] += GRAVITY;
        if (player.position[1] > (canvas.height - 10)) {
          ctx.save();
          player.color = '#F00';
          timeHit = turnsPassed;
          drawEndgame('Splat! You died.');
          continueFrames = false;
        }
        if (player.position[1] < 0) {
          if (player.velocity[1] < -DAMAGE_THRESHOLD) {
            ctx.save();
            player.color = '#F00';
            timeHit = turnsPassed;
          }
          player.position[1] = 0;
          player.velocity[1] *= -1;
        }
        if (player.position[0] > (canvas.width - 10)) {
          player.position[0] = canvas.width - 10;
          player.velocity[0] *= -1;
        }
        if (player.position[0] < 0) {
          player.position[0] = 0;
          player.velocity[0] *= -1;
        }
        if (remainingFuel < 100 && !keysdown[37] && !keysdown[38] && !keysdown[39] && !keysdown[40]) {
          remainingFuel += REFUEL_RATE;
        }
        player.velocity[1] *= 0.995;
        player.velocity[0] *= 0.995;
        if (continueFrames) {
          player.move();
          redraw();
          return setTimeout(tick, 10 / FRAME_RATE);
        }
      };
      return tick();
    };
  };

}).call(this);

/*
//@ sourceMappingURL=down.map
*/
