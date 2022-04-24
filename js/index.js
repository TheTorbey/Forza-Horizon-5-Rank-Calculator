const ranges = document.querySelectorAll('input[type="range"]')
const prestigeRange = document.getElementById('prestige')
const levelRange = document.getElementById('level')
const totalLevelOutput = document.getElementById('total-level-output')

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

ranges.forEach(range => {
    range.style.setProperty('--min', range.min == '' ? '0' : range.min)
    range.style.setProperty('--max', range.max == '' ? '100' : range.max)
    range.addEventListener('input', updateProgress)
    updateProgress(range)
})

function updateProgress(slider) {
    if (slider instanceof Event) slider = slider.target

    slider.style.setProperty('--progress', slider.value)
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