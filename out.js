// Generated by CoffeeScript 1.6.3
(function() {
  var CANVAS_FLASH_DURATION, DAMAGE_FACTOR, DAMAGE_THRESHOLD, FLASH_DURATION, FRAME_RATE, GRAVITY, HP_FLASH_DURATION, HUNGER_DEPLETION_RATE, HUNGER_RESTORE, JETPACK_ACCEL, JETPACK_FUEL_USAGE, JUMP_SPEED, Platform, REFUEL_RATE, SHIFT_DISTANCE, Sprite, WALK_SPEED,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  FRAME_RATE = 2;

  JETPACK_ACCEL = 0.15 / FRAME_RATE;

  WALK_SPEED = 2 / FRAME_RATE;

  JUMP_SPEED = 6 / FRAME_RATE;

  JETPACK_FUEL_USAGE = 0.7 / FRAME_RATE;

  DAMAGE_THRESHOLD = 5 / Math.sqrt(FRAME_RATE);

  DAMAGE_FACTOR = 8;

  REFUEL_RATE = 4 / FRAME_RATE;

  FLASH_DURATION = 200 * FRAME_RATE / 10;

  HP_FLASH_DURATION = 50 * FRAME_RATE / 10;

  CANVAS_FLASH_DURATION = 50 * FRAME_RATE / 10;

  SHIFT_DISTANCE = 20;

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

  Platform = (function(_super) {
    __extends(Platform, _super);

    function Platform(position, dimensions, color) {
      this.position = position;
      this.dimensions = dimensions;
      this.color = color != null ? color : '#FFF';
      Platform.__super__.constructor.apply(this, arguments);
      this.canRefuel = false;
    }

    Platform.prototype.replace = function(canvas) {
      this.position[0] = canvas.width;
      return this.position[1] = Math.random() * (canvas.height - 30 - this.dimensions[1]) + 30;
    };

    return Platform;

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
    ctx.fillRect((canvas.width / 2) - ctx.measureText('OUT').width / 2, canvas.height / 2 - 45, ctx.measureText('OUT').width, 50);
    writeText('#000', '50px Arial', 'OUT', 0);
    writeText('#FFF', '20px Arial', 'An enthusiastic future of jetpacks', 25);
    writeText('#FFF', '15px Arial', 'Arrow keys to move.', 45);
    writeText('#FFF', '20px Arial', 'Any key to start', 100);
    document.body.addEventListener('keydown', function(event) {
      if (!gameStarted) {
        return startGame();
      }
    });
    return startGame = function() {
      var clear, coord, drawEndgame, gameObjects, keysdown, packageCoordinates, packageSprite, packages, packagesPickedUp, platform, platformCoordinates, platforms, player, redraw, remainingFuel, remainingHealth, texts, tick, timeHit, turnsPassed, _i, _j, _k, _l, _len, _len1, _len2, _len3;
      gameStarted = true;
      drawEndgame = function(text) {
        redraw();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#FFF';
        ctx.font = '20px Arial';
        return ctx.fillText(text, (canvas.height / 2) - ctx.measureText(text).width / 2, canvas.height / 2);
      };
      keysdown = {};
      document.body.addEventListener('keydown', function(event) {
        return keysdown[event.keyCode] = true;
      });
      document.body.addEventListener('keyup', function(event) {
        return keysdown[event.keyCode] = false;
      });
      gameObjects = [];
      clear = function() {
        return ctx.clearRect(player.position[0] - (canvas.width - 10) / 2, player.position[1] - (canvas.height - 10) / 2, canvas.width, canvas.height);
      };
      remainingFuel = 100;
      remainingHealth = 100;
      redraw = function() {
        var object, text, _i, _j, _len, _len1;
        clear();
        for (_i = 0, _len = gameObjects.length; _i < _len; _i++) {
          object = gameObjects[_i];
          object.draw(ctx);
        }
        for (_j = 0, _len1 = texts.length; _j < _len1; _j++) {
          text = texts[_j];
          ctx.fillStyle = '#FFF';
          ctx.font = '20px Arial';
          ctx.fillText(text[2], text[0], text[1]);
        }
        ctx.font = '10px Arial';
        ctx.fillText(Math.round(player.position[0]) + ", " + Math.round(player.position[1]), player.position[0] - (canvas.width - 10) / 2, player.position[1] - (canvas.height - 10) / 2 + 30);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(player.position[0] - (canvas.width - 10) / 2, player.position[1] - (canvas.height - 10) / 2, remainingFuel, 10);
        ctx.fillStyle = turnsPassed - timeHit < HP_FLASH_DURATION ? '#F00' : '#0F0';
        return ctx.fillRect(player.position[0] - (canvas.width - 10) / 2, player.position[1] - (canvas.height - 10) / 2 + 10, remainingHealth, 10);
      };
      player = new Sprite([(canvas.width - 10) / 2, (canvas.height - 10) / 2], [10, 10]);
      platforms = [];
      platformCoordinates = [[150, -1500], [150, -1600], [300, -1600], [0, -1600], [150, -1700], [0, -600], [150, -600], [300, -600], [450, -600], [600, -600], [0, 0], [100, 100], [200, 200], [300, 300], [200, 400, true], [1000, 500, true], [1100, 600], [1200, 700], [1300, 800], [900, 600], [800, 700], [700, 800], [50, 900], [200, 900, true], [350, 900], [50, 1000], [200, 1000], [350, 1000], [-500, 2120, 2000, 10], [5000, 2120, 2000, 10]];
      /*
      [500, 2000, 10, 10]
      [550, 2030, 10, 10]
      [570, 2080, 10, 10]
      [570, 2060, 10, 10]
      [590, 2050, 10, 10]
      [510, 2100, 10, 10]
      [520, 2020, 10, 10]
      */

      packages = [];
      packageCoordinates = [[240, 980], [5000, 2000], [6000, 2000], [6990, 2000]];
      texts = [[150, -1505, 'Luna'], [0, -605, 'Caelica'], [300, 295, 'Tutoria'], [1000, 495, 'Aphasia'], [200, 895, 'Verdanica'], [500, 2115, 'Luciferion'], [5000, 2120, 'Aldaran']];
      for (_i = 0, _len = platformCoordinates.length; _i < _len; _i++) {
        coord = platformCoordinates[_i];
        if (coord.length === 4) {
          platforms.push(new Platform([coord[0], coord[1]], [coord[2], coord[3]], '#F0F'));
        } else {
          platforms.push(new Platform(coord, [100, 10], '#F0F'));
        }
        if (coord.length === 3) {
          platforms[platforms.length - 1].canRefuel = true;
          platforms[platforms.length - 1].color = '#FA0';
        }
      }
      for (_j = 0, _len1 = packageCoordinates.length; _j < _len1; _j++) {
        coord = packageCoordinates[_j];
        packages.push(new Sprite(coord, [20, 20], '#FA0'));
      }
      gameObjects.push(player);
      for (_k = 0, _len2 = platforms.length; _k < _len2; _k++) {
        platform = platforms[_k];
        gameObjects.push(platform);
      }
      for (_l = 0, _len3 = packages.length; _l < _len3; _l++) {
        packageSprite = packages[_l];
        gameObjects.push(packageSprite);
      }
      packagesPickedUp = 0;
      turnsPassed = 0;
      timeHit = -Infinity;
      tick = function() {
        var acceleration, bullet, canvasShifted, continueFrames, i, object, _len4, _len5, _len6, _m, _n, _o;
        turnsPassed += 1;
        player.color = '#FFF';
        acceleration = [0, 0];
        if (remainingFuel > 0) {
          acceleration = [0, 0];
          if (keysdown[37]) {
            player.velocity[0] -= JETPACK_ACCEL;
            acceleration[0] -= JETPACK_ACCEL;
            remainingFuel -= JETPACK_FUEL_USAGE;
          }
          if (keysdown[38]) {
            player.velocity[1] -= JETPACK_ACCEL;
            acceleration[1] -= JETPACK_ACCEL;
            remainingFuel -= JETPACK_FUEL_USAGE;
          }
          if (keysdown[39]) {
            player.velocity[0] += JETPACK_ACCEL;
            acceleration[0] += JETPACK_ACCEL;
            remainingFuel -= JETPACK_FUEL_USAGE;
          }
          if (keysdown[40]) {
            player.velocity[1] += JETPACK_ACCEL;
            acceleration[1] += JETPACK_ACCEL;
            remainingFuel -= JETPACK_FUEL_USAGE;
          }
          if (acceleration[0] !== 0 || acceleration[1] !== 0) {
            bullet = new Sprite([player.position[0] + Math.random() * player.dimensions[0] - 2.5, player.position[1] + Math.random() * player.dimensions[1] - 2.5], [5, 5], '#FA0');
            bullet.velocity = [Math.random() * 1 - 0.5 - 30 * acceleration[0], Math.random() * 1 - 0.5 - 30 * acceleration[1]];
            setTimeout((function() {
              return gameObjects.splice(gameObjects.indexOf(bullet), 1);
            }), 300 * Math.random());
            gameObjects.push(bullet);
          }
        }
        player.velocity[1] += GRAVITY;
        for (_m = 0, _len4 = platforms.length; _m < _len4; _m++) {
          platform = platforms[_m];
          if (player.overlaps(platform)) {
            if (player.velocity[1] > DAMAGE_THRESHOLD) {
              ctx.save();
              ctx.translate(Math.random() * 2 * SHIFT_DISTANCE - SHIFT_DISTANCE, Math.random() * 2 * SHIFT_DISTANCE - SHIFT_DISTANCE);
              canvasShifted = true;
              player.color = '#F00';
              timeHit = turnsPassed;
              remainingHealth -= player.velocity[1] * DAMAGE_FACTOR;
            }
            if (platform.canRefuel) {
              remainingFuel = Math.min(remainingFuel + REFUEL_RATE, 100);
            }
            player.position[1] = platform.position[1] - player.dimensions[1];
            if (player.velocity[1] > 0) {
              player.velocity[1] *= -0.5;
            }
            if (keysdown[37] && remainingFuel <= 0) {
              player.velocity[0] = -WALK_SPEED;
            } else if (keysdown[39] && remainingFuel <= 0) {
              player.velocity[0] = WALK_SPEED;
            } else if (remainingFuel <= 0) {
              player.velocity[0] *= 0.9;
            }
            if (keysdown[38] && remainingFuel <= 0) {
              player.velocity[1] = -JUMP_SPEED;
            }
            if (keysdown[32] && !platform.canRefuel && packagesPickedUp > 0) {
              packagesPickedUp -= 1;
              platform.canRefuel = true;
              platform.color = '#FA0';
            }
          }
        }
        for (i = _n = 0, _len5 = packages.length; _n < _len5; i = ++_n) {
          packageSprite = packages[i];
          if (i >= packages.length) {
            break;
          }
          if (player.overlaps(packageSprite)) {
            gameObjects.splice(gameObjects.indexOf(packageSprite), 1);
            packages.splice(packages.indexOf(packageSprite), 1);
            packagesPickedUp += 1;
            redraw();
          }
        }
        continueFrames = true;
        if (remainingHealth <= 0) {
          continueFrames = false;
          drawEndgame('Splat!');
        }
        player.velocity[1] *= 0.995;
        player.velocity[0] *= 0.995;
        if (continueFrames) {
          for (_o = 0, _len6 = gameObjects.length; _o < _len6; _o++) {
            object = gameObjects[_o];
            object.move();
          }
          ctx.setTransform(1, 0, 0, 1, -(player.position[0] - (canvas.width - 10) / 2), -(player.position[1] - (canvas.height - 10) / 2));
          if (turnsPassed - timeHit < CANVAS_FLASH_DURATION && canvasShifted) {
            ctx.translate(Math.random() * 2 * SHIFT_DISTANCE - SHIFT_DISTANCE, Math.random() * 2 * SHIFT_DISTANCE - SHIFT_DISTANCE);
          } else {
            canvasShifted = false;
          }
          redraw();
          return setTimeout(tick, 10 / FRAME_RATE);
        }
      };
      return tick();
    };
  };

}).call(this);

/*
//@ sourceMappingURL=out.map
*/
