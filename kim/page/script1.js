// script version 1
const HOST = new URL(`http://${window.location.host}`)

const startApplication = keyList => {
    const imageHidden = (imageAlias, state) => {
        let image = document.getElementById(`${imageAlias}-image`)
        image.hidden = state 
    }

    let keys = {
        states: {}
        , pressed: []
    }

    keyList.forEach(key => keys.states[key] = false)

    const handleKeyPresses = () => {
        switch (keys.pressed.length) {
            case 0: {
                imageHidden('idle', false)
                break
            }
            case 1: {
                imageHidden('idle', true)
                if (keys.pressed[0] in vibratos) {

                } else {
                    imageHidden(keys.pressed[0], false)
                }
                break
            }
            default: {
                imageHidden('idle', true)
                // imageHidden(keys.pressed[0], true)
                // imageHidden(keys.pressed[keys.pressed.length - 1], false)
                keys.pressed.forEach((key, index) => {
                    if (index + 1 === keys.pressed.length) { 
                        imageHidden(keys.pressed[keys.pressed.length - 1], false) 
                    } else {
                        imageHidden(keys.pressed[index], true)
                    }
                })
                break
            }
        }
    }

    let idleImageTotal = 1
    if ('idle2' in keys.states) {
        idleImageTotal++
        while (`idle${idleImageTotal}` in keys.states) idleImageTotal++
        console.log(idleImageTotal)
        setInterval(() => {

        })
    }

    document.addEventListener('keydown', event => {
        if (event.key in keys.states) {
            if (keys.pressed.indexOf(event.key) === -1) keys.pressed.push(event.key)
            keys.states[event.key] = true
        }

        handleKeyPresses()
    })

    document.addEventListener('keyup', event => {
        if (event.key in keys.states) {
            if (keys.pressed.indexOf(event.key) !== -1) keys.pressed = keys.pressed.filter(key => key !== event.key)
            imageHidden(event.key, true)
            keys.states[event.key] = false
        }

        handleKeyPresses()
    })
} 

document.getElementById('load-project-button').addEventListener('click', () => {
    const projectNameInput = document.getElementById('project-name-input').value

    fetch(`${HOST}project?name=${projectNameInput}`)
        .then(response => response.json())
        .then(data => {
            let keyList = []

            for (const letter in data) {
                if (Object.hasOwnProperty.call(data, letter)) {
                    keyList.push(letter)
                    const imageElement = document.createElement('img')

                    imageElement.src = data[letter]
                    imageElement.hidden = letter === 'idle' ? false : true
                    imageElement.id = `${letter}-image`
                    
                    document.getElementById('image-box').appendChild(imageElement)
                }
            }
            document.getElementById('project-select').hidden = true

            startApplication(keyList)
        })
})



