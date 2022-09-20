const HOST = new URL(`http://${window.location.host}`)

const startApplication = (keyList, idleList) => {
    let keyMap = {
    /*
        a: {action: 'display'},
        b: {action: 'display'},
        z: {action: 'vibrato', keys: [a, b]}
    */
    }

    /* add keys to key list */
    keyList.forEach(key => keyMap[key] = {action: 'display'}) 

    /* sets an image's hidden state */
    const setImageHidden = (imageAlias, state) => {
        if (!imageAlias in keyMap) return
        let image = document.getElementById(`${imageAlias}-image`)
        image.hidden = state 
    }

    let idleInterval 
    let idleFrameIndex = 0
    const toggleIdle = state => {
        if (state) {
            /* turn on idle */
            if (idleList.length > 1) {
                /* multiple idle frames, cycle through them */
                idleFrameIndex = 0
                setImageHidden(idleList[0], false)
                idleFrameIndex++ 
   
                idleInterval = setInterval(() => {
                    if (idleFrameIndex === idleList.length) idleFrameIndex = 0
    
                    if (idleFrameIndex === 0) {
                        setImageHidden(idleList[idleList.length - 1], true)
                    }  else {
                        setImageHidden(idleList[idleFrameIndex - 1], true)
                    }

                    setImageHidden(idleList[idleFrameIndex], false)
                    idleFrameIndex++
                }, document.getElementById('idle-cycle-rate-input').value || 500)
            } else {
                /* singular idle frame, simply display */
                setImageHidden(idleList[0], false)
            }
        } else {
            /* turn off idle */
            if (idleList.length > 1) {
                /* multiple idle frames, disable cycle and clear last displayed idle image */
                clearInterval(idleInterval)
                idleList.forEach(idleImage => setImageHidden(idleImage, true))
            } else {
                /* singular idle frame, simply hide */
                setImageHidden(idleList[0], true)
            }
        }
    }
    toggleIdle(true) // go ahead and turn on the idle animation

    let vibratoInterval
    let vibratoFrameIndex = 0
    let lastVibratoKeys
    const vibrato = (keys, rate) => {
        lastVibratoKeys = keys
        vibratoFrameIndex = 0
        setImageHidden(keys[0], false)
        vibratoFrameIndex++ 
   
        vibratoInterval = setInterval(() => {
        if (vibratoFrameIndex === keys.length) vibratoFrameIndex = 0
    
            if (vibratoFrameIndex === 0) {
                setImageHidden(keys[keys.length - 1], true)
            }  else {
                setImageHidden(keys[vibratoFrameIndex - 1], true)
            }

            setImageHidden(keys[vibratoFrameIndex], false)
            vibratoFrameIndex++
        }, rate)
    }

    /* handles the keys that are currently pressed */
    let mostRecentlyPressed = ''
    const handlePressedKeys = keys => {
        /* make sure to hide any previously displayed images */
        if (mostRecentlyPressed !== '') {
            if (keyMap[mostRecentlyPressed].action === 'display') {
                setImageHidden(mostRecentlyPressed, true)
                currentlyDisplayed = ''
            }
        }

        if (vibratoInterval) { 
            clearInterval(vibratoInterval)
            lastVibratoKeys.forEach(key => setImageHidden(key, true))
        }

        if (keys.length > 0) {
            /* key is in the keyMap, determine action to take */
            toggleIdle(false)

            mostRecentlyPressed = keys[keys.length - 1]

            switch (keyMap[mostRecentlyPressed].action) {
                case 'display': {
                    setImageHidden(mostRecentlyPressed, false)
                    break
                }
                case 'vibrato': {
                    vibrato(keyMap[mostRecentlyPressed].keys, keyMap[mostRecentlyPressed].rate)
                    break
                }
            }
        } else {
            /* no keys are pressed, user is idle */
            toggleIdle(true)
        }
    }

    /* stores currently pressed keys and allows manipulation of them */
    let pressed = {
        currentlyPressed: [],
        /* this setter only fires handler if the keys pressed have changed, thanks arcono for the idea!!!*/
        set keys(newKeys) { 
            this.currentlyPressed = newKeys
            handlePressedKeys(this.currentlyPressed)
        }, 
        get keys() { return this.currentlyPressed }
    }

    document.addEventListener('keydown', event => {
        if (event.key in keyMap) {
            if (pressed.keys.indexOf(event.key) === -1) {
                let newKeys = pressed.keys
                newKeys.push(event.key)
                pressed.keys = newKeys
            }
        }
    })

    document.addEventListener('keyup', event => {
        if (event.key === ' ') document.getElementById('ui').hidden = !document.getElementById('ui').hidden
        
        if (event.key in keyMap) {
            let newKeys = pressed.keys.filter(key => key !== event.key)
            pressed.keys = newKeys
        }
    })

    document.getElementById('idle-cycle-rate-input').addEventListener('change', () => {
        toggleIdle(false)
        toggleIdle(true)  
    })

    document.getElementById('add-vibrato-button').addEventListener('click', () => {
        const keyToMap = document.getElementById('vibrato-key-mapping').value
        const keysToVibrato = document.getElementById('vibrato-keys-to-press').value.split('')
        const cycleRate = document.getElementById('vibrato-cycle-rate').value

        keyMap[keyToMap] = {action: 'vibrato', keys: keysToVibrato, rate: cycleRate}
        document.getElementById("vibrato-list").innerHTML += `<p>${keyToMap}: ${keysToVibrato.join('')} (${cycleRate}ms)</p>`
    })
}

/* loads all images from server and sends a keyList and idleList to the startApplication function */
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
                    imageElement.hidden = letter === 'idle1' ? false : true
                    imageElement.id = `${letter}-image`
                    
                    document.getElementById('image-box').appendChild(imageElement)
                }
            }
            document.getElementById('project-select').hidden = true

            startApplication(keyList, idleList)
        })
})