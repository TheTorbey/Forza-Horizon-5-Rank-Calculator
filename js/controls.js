const descriptions = document.querySelectorAll('[data-ident-description]')
const options = [...document.querySelectorAll('.option')]
const activeClass = 'active'
const multiplyCooldown = 500

// GAMEPAD STUFF
const gamepads = {}
const gamepadMultiplier = 5
const gamepadMenuCooldown = 25
const gamepadAxisThreshold = 0.25
const gamepadMenuAxisThreshold = 0.5
const gamepadInitialCooldown = 500

let horizontalMultiplier = 1
let lastMultiply = 0
let lastInitialCooldown = 0
let initialCooldownActive = false
let initialCooldownFirst = false

let lastGamepadMenuActivity = 0
let lastHorizontalDirection = null
let ACTIVE_GAMEPAD = null
let KEYBOARD_ACTIVE = true

const allowedGamepads = [
    'Xbox 360 Controller (XInput STANDARD GAMEPAD)'
]

const xboxMap = {
    'A': 0,
    'B': 1,
    'X': 2,
    'Y': 3,
    'BUMPBER_L': 4,
    'BUMPBER_R': 5,
    'TRIGGER_L': 6,
    'TRIGGER_R': 7,
    'VIEW': 8,
    'MENU': 9,
    'STICK_L': 10,
    'STICK_R': 11,
    'DPAD_UP': 12,
    'DPAD_DOWN': 13,
    'DPAD_LEFT': 14,
    'DPAD_RIGHT': 15,
}

if (options.length > 0) {
    options[0].classList.add(activeClass)
    showDescriptionPanels(options[0].dataset.ident)
    handleKeyEvents()
    handleGamepadEvents()
}

options.forEach(option => {
    option.addEventListener('mouseover', handleOptionSelection, false)
    option.addEventListener('touchstart', handleOptionSelection, false)
})

function handleOptionSelection(e) {
    selectIndex(getIndex(e.currentTarget))
}

function selectIndex(index) {
    getActive().classList.remove(activeClass)
    options[index].classList.add(activeClass)
    showDescriptionPanels(options[index].dataset.ident)
}

function showDescriptionPanels(ident) {
    descriptions.forEach(description => description.classList.toggle('show', description.dataset.identDescription == ident))
}

function handleKeyEvents() {
    document.addEventListener('keydown', e => {
        const key = e.key

        KEYBOARD_ACTIVE = true

        if (document.activeElement.tagName == 'INPUT') {
            e.preventDefault()
            document.activeElement.blur()
        }

        if (key === 'ArrowDown' || key === 's') menuVertical('down')
        if (key === 'ArrowUp' || key === 'w') menuVertical('up')

        if (key === 'ArrowLeft' || key === 'a') menuHorizontal('left')
        if (key === 'ArrowRight' || key === 'd') menuHorizontal('right')
    })

    document.addEventListener('keyup', e => {
        horizontalMultiplier = 1
    })
}

function getActive() {
    return document.getElementsByClassName(activeClass)[0]
}

function getIndex(element = null) {
    return options.indexOf(element || getActive())
}

function menuVertical(direction) {
    const maxIndex = options.length - 1
    let activeIndex = getIndex()

    if (direction === 'down' && activeIndex < maxIndex) selectIndex(++activeIndex)
    if (direction === 'up' && activeIndex > 0) selectIndex(--activeIndex)
}

function menuHorizontal(direction) {
    const option = getActive()
    const slider = option.querySelector('input[type=range]')
    const tmpEvent = new Event('input')
    const currentDate = Date.now()

    if (!slider) return

    let step = parseFloat(slider.dataset.step) * horizontalMultiplier
    if (!KEYBOARD_ACTIVE) step * gamepadMultiplier

    if (direction === 'left') slider.value = parseFloat(slider.value) - step
    if (direction === 'right') slider.value = parseFloat(slider.value) + step

    slider.dispatchEvent(tmpEvent)

    if (currentDate - lastMultiply > multiplyCooldown) {
        horizontalMultiplier *= 2
        lastMultiply = currentDate
    }
}

// GAMPAD HANDLING
function handleGamepadEvents() {
    window.addEventListener("gamepadconnected", gamepadHandler, false)
    window.addEventListener("gamepaddisconnected", gamepadHandler, false)
}

function gamepadHandler(event) {
    const connecting = event.type == 'gamepadconnected'
    const gamepad = event.gamepad

    if (connecting) gamepads[gamepad.index] = gamepad
    else delete gamepads[gamepad.index]

    requestAnimationFrame(gamepadLoop)
}

function scanGamepads() {
    const tmpGamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : [])
    tmpGamepads.filter(gamepad => gamepad && allowedGamepads.indexOf(gamepad.id) > -1).forEach(gamepad => gamepads[gamepad.index] = gamepad)
}

function setActiveGamepad() {
    for (const gamepad of Object.values(gamepads)) {

        if (ACTIVE_GAMEPAD != null && ACTIVE_GAMEPAD.id == gamepad.id) ACTIVE_GAMEPAD = gamepad

        const axes = getAxes(gamepad)

        Object.values(axes).forEach(axis => {
            if (Math.abs(axis.x) > gamepadAxisThreshold || Math.abs(axis.y) > gamepadAxisThreshold) {
                ACTIVE_GAMEPAD = gamepad
                KEYBOARD_ACTIVE = false
            }
        })

        gamepad.buttons.some(btn => {
            if (btn.pressed) {
                ACTIVE_GAMEPAD = gamepad
                KEYBOARD_ACTIVE = false
                return true
            }
        })
    }
}

function gamepadLoop() {
    scanGamepads()
    setActiveGamepad()

    const axes = getAxes(ACTIVE_GAMEPAD)
    const currentDate = Date.now()

    // Allow xbox controllers to control the options with the sticks or the d-pad
    if (currentDate - lastGamepadMenuActivity >= gamepadMenuCooldown && !KEYBOARD_ACTIVE) {

        const dpad_vertical = isPressed(xboxMap.DPAD_DOWN) ? 'down' : (isPressed(xboxMap.DPAD_UP) ? 'up' : false)
        const dpad_horizontal = isPressed(xboxMap.DPAD_LEFT) ? 'left' : (isPressed(xboxMap.DPAD_RIGHT) ? 'right' : false)
        let directionSwitched = false

        // navigate through options
        if (dpad_vertical || Math.abs(axes.leftAxix.y) > gamepadMenuAxisThreshold) {
            menuVertical(dpad_vertical || (axes.leftAxix.y > 0 ? 'down' : 'up'))
            lastGamepadMenuActivity = currentDate
            directionSwitched = true
            horizontalMultiplier = 1
        }

        // change slider value
        if (dpad_horizontal || Math.abs(axes.leftAxix.x) >= gamepadMenuAxisThreshold) {
            const direction = dpad_horizontal || (axes.leftAxix.x > 0 ? 'right' : 'left')

            if (lastHorizontalDirection != null && lastHorizontalDirection != direction) {
                directionSwitched = true
                horizontalMultiplier = 1
            }

            if (!initialCooldownActive || directionSwitched) {
                initialCooldownActive = true
                initialCooldownFirst = true
                lastInitialCooldown = currentDate
            }

            if (initialCooldownFirst || currentDate - lastInitialCooldown >= gamepadInitialCooldown) {

                menuHorizontal(direction)
                lastGamepadMenuActivity = currentDate
                initialCooldownFirst = false
                lastHorizontalDirection = direction
            }
        } else {
            horizontalMultiplier = 1
            initialCooldownActive = false
        }
    }

    requestAnimationFrame(gamepadLoop)
}

function isPressed(KEY_CODE) {
    return ACTIVE_GAMEPAD.buttons[KEY_CODE].pressed
}

function getAxes(gamepad) {
    return {
        leftAxix: {
            x: gamepad.axes[0],
            y: gamepad.axes[1]
        },
        rightAxix: {
            x: gamepad.axes[2],
            y: gamepad.axes[3]
        },
    }
}