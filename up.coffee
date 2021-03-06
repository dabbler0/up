FRAME_RATE = 2
JETPACK_ACCEL = 0.2 / FRAME_RATE
JETPACK_FUEL_USAGE = 1 / FRAME_RATE
DAMAGE_THRESHOLD = 5 / Math.sqrt FRAME_RATE
DAMAGE_FACTOR = 3
REFUEL_RATE = 0.2 / FRAME_RATE
FLASH_DURATION = 200 * FRAME_RATE / 10
HP_FLASH_DURATION = 50 * FRAME_RATE / 10
CANVAS_FLASH_DURATION = 50 * FRAME_RATE / 10
SHIFT_DISTANCE = 5
GRAVITY = 0.1 / FRAME_RATE
HUNGER_DEPLETION_RATE = 0.08 / FRAME_RATE
HUNGER_RESTORE = 40

class Sprite
  constructor: (@position, @dimensions, @color = '#FFF') ->
    @velocity = [0, 0]

  draw: (ctx) ->
    ctx.fillStyle = @color
    ctx.fillRect @position[0], @position[1], @dimensions[0], @dimensions[1]

  move: -> @position[0] += @velocity[0]; @position[1] += @velocity[1]

  overlaps: (other) ->
    return not (other.position[0] > (@position[0] + @dimensions[0]) or
      other.position[1] > (@position[1] + @dimensions[1]) or
      (other.position[0] + other.dimensions[0]) < @position[0] or
      (other.position[1] + other.dimensions[1]) < @position[1])

window.onload = ->
  gameStarted = false

  canvas = document.getElementById 'canvas'
  ctx = canvas.getContext '2d'

  writeText = (fill, font, text, location) ->
    ctx.fillStyle = fill
    ctx.font = font
    ctx.fillText text, (canvas.width / 2) - ctx.measureText(text).width / 2, (canvas.height / 2) + location

  ctx.fillStyle = '#FFF'
  ctx.font = '50px Arial'
  ctx.fillRect (canvas.width/2) - ctx.measureText('UP').width / 2, canvas.height / 2 - 45, ctx.measureText('UP').width, 50
  writeText '#000', '50px Arial', 'UP', 0
  writeText '#FFF', '20px Arial', 'A cautionary tale about jetpacks', 25
  writeText '#FFF', '15px Arial', 'Arrow keys to move.', 45
  writeText '#FFF', '15px Arial', 'Get the blue square.', 60
  writeText '#FFF', '20px Arial', 'Any key to start', 100

  document.body.addEventListener 'keydown', (event) ->
    unless gameStarted then startGame()

  startGame = ->
    gameStarted = true

    keysdown = {}

    document.body.addEventListener 'keydown', (event) ->
      keysdown[event.keyCode] = true

    document.body.addEventListener 'keyup', (event) ->
      keysdown[event.keyCode] = false

    gameObjects = []

    remainingFuel = 100
    remainingHealth = 100
    remainingHunger = 100

    clear = -> ctx.clearRect 0, 0, canvas.width, canvas.height

    redraw = ->
      clear()

      for object in gameObjects
        object.draw ctx
      
      ctx.fillStyle = '#FFF'
      ctx.fillRect 0, 0, remainingFuel, 10

      ctx.fillStyle = if turnsPassed - timeHit < HP_FLASH_DURATION then '#F00' else '#0F0'
      ctx.fillRect 0, 10, remainingHealth, 10
      
      ctx.fillStyle = if remainingHunger < 25 then '#F00' else '#00F'
      ctx.fillRect 0, 20, remainingHunger, 10
      
      ctx.fillStyle = '#000'
      ctx.font = '10px Arial'
      ctx.fillText 'Fuel', 0, 10
      ctx.fillText 'HP', 0, 20
      ctx.fillText 'Hunger', 0, 30

    drawEndgame = (text) ->
      redraw()
      ctx.fillStyle = '#FFF'
      ctx.font = '20px Arial'
      ctx.fillText text, (canvas.height / 2) - ctx.measureText(text).width / 2, (canvas.height / 2)

      ctx.font = '20px Arial'; text = 'Score: ' + turnsPassed
      ctx.fillText text, (canvas.height / 2) - ctx.measureText(text).width / 2, (canvas.height / 2) + 30

    player = new Sprite [(canvas.width - 10) / 2, canvas.height - 10], [10, 10]

    food = new Sprite [0, 0], [10, 10], '#00F'

    gameObjects.push player
    gameObjects.push food

    moveFood = ->
      food.position[0] = -100
      food.position[1] = -100

      redraw()
      
      setTimeout (->
        food.position[0] = Math.random() * (canvas.width - 10)
        food.position[1] = Math.random() * (canvas.height - 30) + 30

        redraw()), 500 + Math.random() * 500

    moveFood()

    turnsPassed = 0

    timeHit = -Infinity
    canvasShifted = false

    tick = ->
      turnsPassed += 1
      continueFrames = true

      if player.overlaps food
        remainingHunger = Math.min 100, remainingHunger + HUNGER_RESTORE
        moveFood()
      
      if remainingFuel > 0
        if keysdown[37]
          remainingFuel -= JETPACK_FUEL_USAGE
          player.velocity[0] -= JETPACK_ACCEL
        if keysdown[38]
          remainingFuel -= JETPACK_FUEL_USAGE
          player.velocity[1] -= JETPACK_ACCEL
        if keysdown[39]
          remainingFuel -= JETPACK_FUEL_USAGE
          player.velocity[0] += JETPACK_ACCEL
        if keysdown[40]
          remainingFuel -= JETPACK_FUEL_USAGE
          player.velocity[1] += JETPACK_ACCEL
      
      player.velocity[1] += GRAVITY

      if turnsPassed - timeHit > FLASH_DURATION and player.color is '#F00'
        player.color = '#FFF'

      if turnsPassed - timeHit < CANVAS_FLASH_DURATION and canvasShifted
        ctx.translate Math.random() * 2 * SHIFT_DISTANCE- SHIFT_DISTANCE, Math.random() * 2 * SHIFT_DISTANCE - SHIFT_DISTANCE
      else if canvasShifted
        ctx.restore()
        canvasShifted = false

      if player.position[1] > (canvas.height - 10)
        if player.velocity[1] > DAMAGE_THRESHOLD
          ctx.save()
          ctx.translate Math.random() * 2 * SHIFT_DISTANCE- SHIFT_DISTANCE, Math.random() * 2 * SHIFT_DISTANCE - SHIFT_DISTANCE; canvasShifted = true
          player.color = '#F00'
          timeHit = turnsPassed
          remainingHealth -= player.velocity[1] * DAMAGE_FACTOR
        player.position[1] = canvas.height - 10; player.velocity[1] *= -0.95

      if player.position[1] < 0
        if player.velocity[1] < -DAMAGE_THRESHOLD
          ctx.save()
          ctx.translate Math.random() * 2 * SHIFT_DISTANCE- SHIFT_DISTANCE, Math.random() * 2 * SHIFT_DISTANCE - SHIFT_DISTANCE; canvasShifted = true
          player.color = '#F00'
          timeHit = turnsPassed
          remainingHealth += player.velocity[1] * DAMAGE_FACTOR
        player.position[1] = 0; player.velocity[1] *= -1

      if player.position[0] > (canvas.width - 10)
        player.position[0] = canvas.width - 10; player.velocity[0] *= -1

      if player.position[0] < 0
        player.position[0] = 0; player.velocity[0] *= -1

      if remainingFuel < 100 and
        not keysdown[37] and
        not keysdown[38] and
        not keysdown[39] and
        not keysdown[40] then remainingFuel += REFUEL_RATE

      remainingHunger -= HUNGER_DEPLETION_RATE

      if remainingHealth <= 0
        drawEndgame 'Splat! You died.'
        continueFrames = false
      if remainingHunger <= 0
        drawEndgame 'You died of hunger.'
        continueFrames = false

      player.velocity[1] *= 0.995
      player.velocity[0] *= 0.995
      
      if continueFrames
        player.move()

        redraw()

        setTimeout tick, 10 / FRAME_RATE

    tick()
