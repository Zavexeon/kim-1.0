const config    = require('../config.js')
      __rootdir = config.rootDir

const http   = require('http')
      , url  = require('url')
      , qs   = require('querystring')
      , fs   = require('fs')
      , path = require('path')

const server = http.createServer((request, response) => {
    const parsedURL = url.parse(request.url)
    const fsPath = `${__rootdir}${parsedURL.pathname}`

    // console.log(request.url)

    switch (parsedURL.pathname) {
        case '/': { 
            response.writeHead(200, {'content-type': 'text/html'})
            fs.createReadStream(`${__rootdir}/page/view.html`)
                .pipe(response) 
            break 
        }
        case '/project': {
            const parsedQuery = qs.parse(parsedURL.query)
            const responseJSON = {
                /*
                a: x
                b: y
                c: z 
                */
            }
            
            if (!parsedQuery.name) return response.end('paapaapaapaa')

            fs.readdir(`${__rootdir}/projects/${parsedQuery.name}`, (err, files) => {
                if (err) {
                    response.writeHead(404)
                    return response.end()
                }
                
                files.forEach(file => {
                    responseJSON[path.parse(file).name] = `projects/${parsedQuery.name}/${file}` //url.pathToFileURL(path.normalize(`${__rootdir}/projects/${parsedQuery.name}/${file}`))
                })

                response.writeHead(200, {'content-type': 'text/json'})
                response.end(JSON.stringify(responseJSON))
            })
            break
        }
        default: {

            fs.stat(fsPath, (err, stats) => {
                if (err) return response.end('404') 

                if(stats.isFile()) {
                    const mimes = {
                        '.png': 'image/png'
                        , '.jpg': 'image/jpeg'
                        , '.gif': 'image/gif'
                        , '.html': 'text/html'
                        , '.css': 'text/css'
                        , '.js': 'text/javascript'
                    }
                    
                    const mime = mimes[path.parse(fsPath).ext] ? mimes[path.parse(fsPath).ext] : 'text/plain'

                    response.writeHead(200, {'content-type': mime})
                    fs.createReadStream(fsPath)
                        .pipe(response)
                } else {
                    response.end(`directory: ${path.normalize(fsPath)}`)
                }
            })

            break
        }
    }
})

server.listen(config.port)