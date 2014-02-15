FRAME_RATE = 2
JETPACK_ACCEL = 0.15 / FRAME_RATE
JETPACK_FUEL_USAGE = 0.7 / FRAME_RATE
DAMAGE_THRESHOLD = 3 / Math.sqrt FRAME_RATE
DAMAGE_FACTOR = 8
REFUEL_RATE = 0.15 / FRAME_RATE
FLASH_DURATION = 200 * FRAME_RATE / 10
HP_FLASH_DURATION = 50 * FRAME_RATE / 10
CANVAS_FLASH_DURATION = 50 * FRAME_RATE / 10
SHIFT_DISTANCE = 5
GRAVITY = 0.07 / FRAME_RATE
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

class Food extends Sprite
  constructor: (@position, @dimensions, @color = '#FFF') ->
    super
    @velocity[0] = -1
  
  replace: (canvas) ->
    console.log 'replacing'
    @position[0] = -100
    @position[1] = -100
    
    setTimeout (=>
      @dimensions[0] = @dimensions[1] = 10 + Math.random() * 10
      @position[0] = canvas.width
      @position[1] = Math.random() * (canvas.height - 30 - @dimensions[1]) + 30), 500 + Math.random() * 500

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
  ctx.fillRect (canvas.width/2) - ctx.measureText('DOWN').width / 2, canvas.height / 2 - 45, ctx.measureText('DOWN').width, 50
  writeText '#000', '50px Arial', 'DOWN', 0
  writeText '#FFF', '20px Arial', 'A dystopian tale of jetpacks', 25
  writeText '#FFF', '15px Arial', 'Arrow keys to move.', 45
  writeText '#FFF', '15px Arial', 'Get the orange squares.', 60
  writeText '#FFF', '15px Arial', 'Avoid the ground.', 75
  writeText '#FFF', '20px Arial', 'Any key to start', 115

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

    clear = -> ctx.clearRect 0, 0, canvas.width, canvas.height

    redraw = ->
      clear()

      for object in gameObjects
        object.draw ctx
      
      ctx.fillStyle = '#FFF'
      ctx.fillRect 0, 0, remainingFuel, 10
      
      ctx.fillStyle = '#000'
      ctx.font = '10px Arial'
      ctx.fillText 'Fuel', 0, 10

    drawEndgame = (text) ->
      redraw()
      ctx.fillStyle = '#FFF'
      ctx.font = '20px Arial'
      ctx.fillText text, (canvas.height / 2) - ctx.measureText(text).width / 2, (canvas.height / 2)

      ctx.font = '20px Arial'; text = 'Score: ' + turnsPassed
      ctx.fillText text, (canvas.height / 2) - ctx.measureText(text).width / 2, (canvas.height / 2) + 30

    player = new Sprite [(canvas.width - 10) / 2, canvas.height / 2], [10, 10]

    food = ((new Food [0, 0], [20, 20], '#FA0') for [1..5])

    console.log food

    for item in food
      console.log 'replacing', item
      item.replace canvas

    gameObjects.push player
    gameObjects.push item for item in food

    turnsPassed = 0

    timeHit = -Infinity
    canvasShifted = false

    tick = ->
      turnsPassed += 1
      continueFrames = true
      
      for item in food
        if player.overlaps item
          remainingFuel = Math.min 100, remainingFuel + HUNGER_RESTORE
          item.replace canvas

        if item.position[0] < -item.dimensions[0] and item.position[1] > 0
          item.replace canvas
        item.move()

      if turnsPassed - timeHit > FLASH_DURATION
        player.color = '#FFF'

      if remainingFuel > 0
        if keysdown[37]
          player.color = '#FA0'
          remainingFuel -= JETPACK_FUEL_USAGE
          player.velocity[0] -= JETPACK_ACCEL
        if keysdown[38]
          player.color = '#FA0'
          remainingFuel -= JETPACK_FUEL_USAGE
          player.velocity[1] -= JETPACK_ACCEL
        if keysdown[39]
          player.color = '#FA0'
          remainingFuel -= JETPACK_FUEL_USAGE
          player.velocity[0] += JETPACK_ACCEL
        if keysdown[40]
          player.color = '#FA0'
          remainingFuel -= JETPACK_FUEL_USAGE
          player.velocity[1] += JETPACK_ACCEL
      
      player.velocity[1] += GRAVITY

      if player.position[1] > (canvas.height - 10)
        ctx.save()
        player.color = '#F00'
        timeHit = turnsPassed
        drawEndgame 'Splat! You died.'
        continueFrames = false

      if player.position[1] < 0
        if player.velocity[1] < -DAMAGE_THRESHOLD
          ctx.save()
          player.color = '#F00'
          timeHit = turnsPassed
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

      player.velocity[1] *= 0.995
      player.velocity[0] *= 0.995
      
      if continueFrames
        player.move()

        redraw()

        setTimeout tick, 10 / FRAME_RATE

    tick()
