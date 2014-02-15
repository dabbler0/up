FRAME_RATE = 2
JETPACK_ACCEL = 0.15 / FRAME_RATE
JETPACK_FUEL_USAGE = 0.7 / FRAME_RATE
DAMAGE_THRESHOLD = 3 / Math.sqrt FRAME_RATE
DAMAGE_FACTOR = 8
REFUEL_RATE = 0.2 / FRAME_RATE
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

class Platform extends Sprite
  constructor: (@position, @dimensions, @color = '#FFF') ->
    super
  
  replace: (canvas) ->
    @position[0] = canvas.width
    @position[1] = Math.random() * (canvas.height - 30 - @dimensions[1]) + 30

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
  ctx.fillRect (canvas.width/2) - ctx.measureText('OUT').width / 2, canvas.height / 2 - 45, ctx.measureText('OUT').width, 50
  writeText '#000', '50px Arial', 'OUT', 0
  writeText '#FFF', '20px Arial', 'An enthusiastic future of jetpacks', 25
  writeText '#FFF', '15px Arial', 'Arrow keys to move.', 45
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

    clear = -> ctx.clearRect player.position[0] - (canvas.width - 10) / 2, player.position[1] - (canvas.height - 10) / 2, canvas.width, canvas.height

    remainingFuel = 100

    redraw = ->
      clear()
     
      for object in gameObjects
        object.draw ctx

      for text in texts
        ctx.fillStyle = '#FFF'
        ctx.font = '20px Arial'
        ctx.fillText text[2], text[0], text[1]

      ctx.fillStyle = '#FFF'
      ctx.fillRect player.position[0] - (canvas.width - 10) / 2, player.position[1] - (canvas.height - 10) / 2, remainingFuel, 10

    player = new Sprite [(canvas.width - 10) / 2, (canvas.height - 10) / 2], [10, 10]

    platforms = []

    platformCoordinates = [
      # Luna
      [150, -1500]
      [150, -1600]
      [150, -1700]

      # Caelica
      [0, -600]
      [150, -600]
      [300, -600]
      [450, -600]
      [600, -600]

      # Tutoria
      [0, 0]
      [100, 100]
      [200, 200]
      [300, 300]
      [200, 400]
      
      # Aphasia
      [1000, 500]
      [1100, 600]
      [1200, 700]
      [1300, 800]
      [900, 600]
      [800, 700]
      [700, 800]

      # Verdanica
      [50, 900]
      [200, 900]
      [350, 900]
      [50, 1000]
      [200, 1000]
      [350, 1000]

      # Luciferion
      [500, 2000, 10, 10]
      [550, 2030, 10, 10]
      [570, 2080, 10, 10]
      [570, 2060, 10, 10]
      [590, 2050, 10, 10]
      [510, 2100, 10, 10]
      [520, 2020, 10, 10]
      [500, 2120]
    ]

    texts = [
      [150, -1505, 'Luna']
      [0, -605, 'Caelica']
      [300, 295, 'Tutoria']
      [1000, 495, 'Aphasia']
      [200, 895, 'Verdanica']
      [500, 2115, 'Luciferion']
    ]

    for coord in platformCoordinates
      if coord.length > 2
        platforms.push new Platform [coord[0], coord[1]], [coord[2], coord[3]], '#F0F'
      else
        platforms.push new Platform coord, [100, 10], '#F0F'

    gameObjects.push player

    for platform in platforms
      gameObjects.push platform

    tick = ->
      player.color = '#FFF'

      acceleration = [0, 0]

      if remainingFuel > 0
        acceleration = [0, 0]

        if keysdown[37]
          player.velocity[0] -= JETPACK_ACCEL
          acceleration[0] -= JETPACK_ACCEL
          remainingFuel -= JETPACK_FUEL_USAGE
        if keysdown[38]
          player.velocity[1] -= JETPACK_ACCEL
          acceleration[1] -= JETPACK_ACCEL
          remainingFuel -= JETPACK_FUEL_USAGE
        if keysdown[39]
          player.velocity[0] += JETPACK_ACCEL
          acceleration[0] += JETPACK_ACCEL
          remainingFuel -= JETPACK_FUEL_USAGE
        if keysdown[40]
          player.velocity[1] += JETPACK_ACCEL
          acceleration[1] += JETPACK_ACCEL
          remainingFuel -= JETPACK_FUEL_USAGE
        if acceleration[0] isnt 0 or acceleration[1] isnt 0
          bullet = new Sprite [player.position[0] + Math.random() * player.dimensions[0] - 2.5, player.position[1] + Math.random() * player.dimensions[1] - 2.5], [5, 5], '#FA0' #['#F00', '#FA0', 'FF0'][Math.floor Math.random() * 3]
          bullet.velocity = [Math.random() * 1 - 0.5 - 30 * acceleration[0], Math.random() * 1 - 0.5 - 30 * acceleration[1]] #[player.velocity[0] * 10 + Math.random() * 2 - 1, player.velocity[1] * 10 + Math.random() * 2 - 1]
          setTimeout (->
            gameObjects.splice gameObjects.indexOf(bullet), 1
          ), 300 * Math.random()
          gameObjects.push bullet
      
      player.velocity[1] += GRAVITY
      
      for platform in platforms
        if player.overlaps platform
          player.position[1] = platform.position[1] - player.dimensions[1]
          if player.velocity[1] > 0 then player.velocity[1] *= -0.5

      player.velocity[1] *= 0.995
      player.velocity[0] *= 0.995

      if remainingFuel < 100 and
        not keysdown[37] and
        not keysdown[38] and
        not keysdown[39] and
        not keysdown[40] then remainingFuel += REFUEL_RATE
      
      for object in gameObjects
        object.move()
      
      ctx.setTransform 1, 0, 0, 1, - (player.position[0] - (canvas.width - 10) / 2), - (player.position[1] - (canvas.height - 10) / 2)

      redraw()

      setTimeout tick, 10 / FRAME_RATE

    tick()
