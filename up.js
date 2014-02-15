// Generated by CoffeeScript 1.6.3
(function() {
  var CANVAS_FLASH_DURATION, DAMAGE_FACTOR, DAMAGE_THRESHOLD, FLASH_DURATION, FRAME_RATE, GRAVITY, HP_FLASH_DURATION, HUNGER_DEPLETION_RATE, HUNGER_RESTORE, JETPACK_ACCEL, JETPACK_FUEL_USAGE, REFUEL_RATE, SHIFT_DISTANCE, Sprite;

  FRAME_RATE = 2;

  JETPACK_ACCEL = 0.2 / FRAME_RATE;

  JETPACK_FUEL_USAGE = 1 / FRAME_RATE;

  DAMAGE_THRESHOLD = 5 / Math.sqrt(FRAME_RATE);

  DAMAGE_FACTOR = 3;

  REFUEL_RATE = 0.2 / FRAME_RATE;

  FLASH_DURATION = 200 * FRAME_RATE / 10;

  HP_FLASH_DURATION = 50 * FRAME_RATE / 10;

  CANVAS_FLASH_DURATION = 50 * FRAME_RATE / 10;

  SHIFT_DISTANCE = 5;

  GRAVITY = 0.1 / FRAME_RATE;

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
    ctx.fillRect((canvas.width / 2) - ctx.measureText('UP').width / 2, canvas.height / 2 - 45, ctx.measureText('UP').width, 50);
    writeText('#000', '50px Arial', 'UP', 0);
    writeText('#FFF', '20px Arial', 'A cautionary tale about jetpacks', 25);
    writeText('#FFF', '15px Arial', 'Arrow keys to move.', 45);
    writeText('#FFF', '15px Arial', 'Get the blue square.', 60);
    writeText('#FFF', '20px Arial', 'Any key to start', 100);
    document.body.addEventListener('keydown', function(event) {
      if (!gameStarted) {
        return startGame();
      }
    });
    return startGame = function() {
      var canvasShifted, clear, drawEndgame, food, gameObjects, keysdown, moveFood, player, redraw, remainingFuel, remainingHealth, remainingHunger, tick, timeHit, turnsPassed;
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
      remainingHealth = 100;
      remainingHunger = 100;
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
        ctx.fillStyle = turnsPassed - timeHit < HP_FLASH_DURATION ? '#F00' : '#0F0';
        ctx.fillRect(0, 10, remainingHealth, 10);
        ctx.fillStyle = remainingHunger < 25 ? '#F00' : '#00F';
        ctx.fillRect(0, 20, remainingHunger, 10);
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.fillText('Fuel', 0, 10);
        ctx.fillText('HP', 0, 20);
        return ctx.fillText('Hunger', 0, 30);
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
      player = new Sprite([(canvas.width - 10) / 2, canvas.height - 10], [10, 10]);
      food = new Sprite([0, 0], [10, 10], '#00F');
      gameObjects.push(player);
      gameObjects.push(food);
      moveFood = function() {
        food.position[0] = -100;
        food.position[1] = -100;
        redraw();
        return setTimeout((function() {
          food.position[0] = Math.random() * (canvas.width - 10);
          food.position[1] = Math.random() * (canvas.height - 30) + 30;
          return redraw();
        }), 500 + Math.random() * 500);
      };
      moveFood();
      turnsPassed = 0;
      timeHit = -Infinity;
      canvasShifted = false;
      tick = function() {
        var continueFrames;
        turnsPassed += 1;
        continueFrames = true;
        if (player.overlaps(food)) {
          remainingHunger = Math.min(100, remainingHunger + HUNGER_RESTORE);
          moveFood();
        }
        if (remainingFuel > 0) {
          if (keysdown[37]) {
            remainingFuel -= JETPACK_FUEL_USAGE;
            player.velocity[0] -= JETPACK_ACCEL;
          }
          if (keysdown[38]) {
            remainingFuel -= JETPACK_FUEL_USAGE;
            player.velocity[1] -= JETPACK_ACCEL;
          }
          if (keysdown[39]) {
            remainingFuel -= JETPACK_FUEL_USAGE;
            player.velocity[0] += JETPACK_ACCEL;
          }
          if (keysdown[40]) {
            remainingFuel -= JETPACK_FUEL_USAGE;
            player.velocity[1] += JETPACK_ACCEL;
          }
        }
        player.velocity[1] += GRAVITY;
        if (turnsPassed - timeHit > FLASH_DURATION && player.color === '#F00') {
          player.color = '#FFF';
        }
        if (turnsPassed - timeHit < CANVAS_FLASH_DURATION && canvasShifted) {
          ctx.translate(Math.random() * 2 * SHIFT_DISTANCE - SHIFT_DISTANCE, Math.random() * 2 * SHIFT_DISTANCE - SHIFT_DISTANCE);
        } else if (canvasShifted) {
          ctx.restore();
          canvasShifted = false;
        }
        if (player.position[1] > (canvas.height - 10)) {
          if (player.velocity[1] > DAMAGE_THRESHOLD) {
            ctx.save();
            ctx.translate(Math.random() * 2 * SHIFT_DISTANCE - SHIFT_DISTANCE, Math.random() * 2 * SHIFT_DISTANCE - SHIFT_DISTANCE);
            canvasShifted = true;
            player.color = '#F00';
            timeHit = turnsPassed;
            remainingHealth -= player.velocity[1] * DAMAGE_FACTOR;
          }
          player.position[1] = canvas.height - 10;
          player.velocity[1] *= -0.95;
        }
        if (player.position[1] < 0) {
          if (player.velocity[1] < -DAMAGE_THRESHOLD) {
            ctx.save();
            ctx.translate(Math.random() * 2 * SHIFT_DISTANCE - SHIFT_DISTANCE, Math.random() * 2 * SHIFT_DISTANCE - SHIFT_DISTANCE);
            canvasShifted = true;
            player.color = '#F00';
            timeHit = turnsPassed;
            remainingHealth += player.velocity[1] * DAMAGE_FACTOR;
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
        remainingHunger -= HUNGER_DEPLETION_RATE;
        if (remainingHealth <= 0) {
          drawEndgame('Splat! You died.');
          continueFrames = false;
        }
        if (remainingHunger <= 0) {
          drawEndgame('You died of hunger.');
          continueFrames = false;
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
//@ sourceMappingURL=up.map
*/
