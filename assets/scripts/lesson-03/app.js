const path = require('path')
const express = require('express')
const admin_routes = require('./routes/admin')
const shop_routes = require('./routes/shop')

const app = express()
const port = 8180

// body parser
app.use(express.urlencoded({ extended: false }))

// pass routes
// here we can also pass route prefixes for the specified middleware
app.use('/admin', admin_routes)
app.use(shop_routes)

// here we load files statically from the public folder
// it gives read access to the files in this folder
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', 'errors', '404.html'))
})

// this is where we assign the nodejs app to a port
app.listen(port, () => {
    console.log(`Server running at: http://127.0.0.1:${port}`)
    console.log('Hit CTRL-C to stop the server')
})