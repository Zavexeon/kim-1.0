// script version 2
const HOST = new URL(`http://${window.location.host}`)

const startApplication = (keyList, idleList) => {
    let keyMap = {
        /*
        a: {action: 'display'},
        b: {action: 'display'},
        z: {action: 'vibrato', keys: [a, b]}
        */
       1: {action: 'vibrato', keys: ['a', 'b', 'c']}
    }
    const idleImages = idleList

    keyList.forEach(key => keyMap[key] = {action: 'display'})

    let pressedKeys = [] // stores currently pressed keys in the order they were pressed

    const imageHidden = (imageAlias, state) => {
        let image = document.getElementById(`${imageAlias}-image`)
        image.hidden = state 
    }

    const idleIndex = 0
    const hideIdle = state => {
        console.log(state)
        if (!state) {
            // display idle image(s)
            console.log('idling')
        } else {
            // dont display idle images()
            console.log('not idling')
        }
    }

    let vibratoCounter = 0
    let lastVibratoKeys = []
    const vibrato = keys => {
        lastVibratoKeys = keys
        if (vibratoCounter > 0) imageHidden(keys[vibratoCounter - 1], true)
        if (vibratoCounter === keys.length) vibratoCounter = 0
        imageHidden(keys[vibratoCounter], false)
        vibratoCounter++
    }

    const handleKeypress = () => {
        if (pressedKeys.length === 0) {
            //imageHidden('idle', false) 
            hideIdle(false)
        } else {
            //imageHidden('idle', true) 
            hideIdle(true)
            pressedKeys.forEach((key, index) => {
                if (index + 1 === pressedKeys.length) { 
                    if (keyMap[pressedKeys[pressedKeys.length - 1]].action === 'display') {
                       if (vibratoCounter > 0) return
                       imageHidden(pressedKeys[pressedKeys.length - 1], false) 
                    } else { 
                       vibrato(keyMap[pressedKeys[pressedKeys.length - 1]].keys)
                    }
                } else {
                    if (keyMap[pressedKeys[index]].action === 'display') {
                        if (vibratoCounter > 0) return
                        imageHidden(pressedKeys[index], true)
                    } else {
                        // vibratooooo
                        vibrato(keyMap[pressedKeys[0]].keys)
                    }
                }
            })
        }
    }



    /* event listeners for keypresses */
    document.addEventListener('keydown', event => {
        if (event.key in keyMap) {
            if (pressedKeys.indexOf(event.key) === -1) pressedKeys.push(event.key)
        }

        handleKeypress()
    })

    document.addEventListener('keyup', event => {
        vibratoCounter = 0
        lastVibratoKeys.forEach(key => imageHidden(key, true))
        if (event.key in keyMap) {
            if (pressedKeys.indexOf(event.key) !== -1) pressedKeys = pressedKeys.filter(key => key !== event.key)
            if (keyMap[event.key].action === 'display') imageHidden(event.key, true)
        }
        handleKeypress()
    })
}

document.getElementById('load-project-button').addEventListener('click', () => {
    const projectNameInput = document.getElementById('project-name-input').value

    fetch(`${HOST}project?name=${projectNameInput}`)
        .then(response => response.json())
        .then(data => {
            let keyList = []
            let idleList = []

            for (const letter in data) {
                if (Object.hasOwnProperty.call(data, letter)) {
                    if (/(idle)[0-9]*/g.test(letter)) {
                        idleList.push(letter)
                    } else {
                        keyList.push(letter)
                    }
                    const imageElement = document.createElement('img')

                    imageElement.src = data[letter]
                    imageElement.hidden = letter === 'idle' ? false : true
                    imageElement.id = `${letter}-image`
                    
                    document.getElementById('image-box').appendChild(imageElement)
                }
            }
            document.getElementById('project-select').hidden = true

            startApplication(keyList, idleList)
        })
})