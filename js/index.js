const ranges = document.querySelectorAll('input[type="range"]')
const prestigeRange = document.getElementById('prestige')
const levelRange = document.getElementById('level')
const totalLevelOutput = document.getElementById('total-level-output')
const topbarLevel = document.getElementById('topbar__level')

const rankLevels = [
    200,
    300,
    400,
    500,
    600,
    750,
    850,
    900,
    1000,
    1500,
    2999
]

/*
** Key equals to prestige level
** Value contains list of levels, at which the color should change
** Index of list values equals to keys of the colorIndexClass map
*/
const colorsSwitch = {
    0: [20, 30, 40, 50, 60, 70, 80, 90, 100, 120, 150],
    1: [1, 20, 40, 60, 80, 100, 120, 140, 160, 210, 250],
    2: [1, 30, 60, 90, 120, 150, 180, 210, 240, 290, 340],
    3: [1, 30, 80, 120, 160, 200, 240, 280, 320, 370, 430],
    4: [1, 50, 100, 150, 200, 250, 300, 350, 400, 460, 520],
    5: [1, 60, 120, 180, 240, 300, 360, 420, 480, 560, 650],
    6: [1, 70, 140, 210, 280, 350, 420, 490, 560, 650, 750],
    7: [1, 80, 160, 240, 320, 400, 480, 560, 640, 720, 800],
    8: [1, 90, 180, 270, 360, 450, 540, 630, 720, 810, 900],
    9: [1, 100, 200, 300, 400, 500, 600, 700, 800, 950, 1200],
    10: [1, 250, 500, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2500]
}

const colorIndexClass = {
    0: 'yellow',
    1: 'orange',
    2: 'green',
    3: 'cyan',
    4: 'blue',
    5: 'purple',
    6: 'red',
    7: 'pink',
    8: 'bronze',
    9: 'silver',
    10: 'gold'
}

ranges.forEach(range => {
    range.style.setProperty('--min', range.min == '' ? '0' : range.min)
    range.style.setProperty('--max', range.max == '' ? '100' : range.max)
    range.addEventListener('input', updateProgress)
    updateProgress(range)
})

function getColorValue() {
    const colorSteps = colorsSwitch[prestigeRange.value]
    const index = colorSteps.findLastIndex(step => step <= levelRange.value)
    return colorIndexClass[index] ?? ""
}

function updateProgress(slider) {
    if (slider instanceof Event) slider = slider.target

    
    slider.style.setProperty('--progress', slider.value)
    topbarLevel.dataset.prestige = prestigeRange.value
    topbarLevel.dataset.color = getColorValue()
    topbarLevel.textContent = levelRange.value
    const identicator = slider.parentElement.nextElementSibling
    identicator.textContent = slider.value

    arguments[1] !== true && updateTotalLevel()
    slider.name == 'prestige' && handlePrestigeRange()
}

function updateTotalLevel() {
    const availableRanks = [0, ...rankLevels.slice(0, prestigeRange.value)]
    const rankLevel = availableRanks.reduce((previous, current) => previous += current)
    const totalLevel = rankLevel + parseInt(levelRange.value)
    totalLevelOutput.textContent = totalLevel
}

function handlePrestigeRange() {
    const max = rankLevels[prestigeRange.value]
    levelRange.max = max

    if (levelRange.value > max) levelRange.value = max
    levelRange.style.setProperty('--max', max)
    levelRange.style.setProperty('--progress', levelRange.value)

    updateProgress(levelRange, true)
}