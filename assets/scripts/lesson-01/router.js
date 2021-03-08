const routes = (req, res) => {
    const { url, method, headers } = req;

    if (url === '/') {
        res.setHeader('Content-Type', 'text/html');
        res.write('<!doctype html>');
        res.write('<html>');
        res.write('<head><title>Assignment | Home</title></head>');
        res.write(
            '<body>' +
                '<h1>Hello World! Node.js application here!</h1>' +
                '<form action="/create-user" method="POST" style="border: 1px solid #000000;border-radius: 4px;box-sizing: border-box;padding: 20px">' + 
                    '<div style="max-width: 500px; margin: 0 auto">' +
                        '<input required name="username" type="text" placeholder="Enter username..." style="border: 1px solid #464646;border-radius: 4px;background: #FFFFFF;box-sizing: border-box;padding: 10px">' + 
                        '<button type="submit" style="border: 1px solid #464646;border-radius: 4px;background: #FFFFFF;box-sizing: border-box;padding: 10px;margin-left: 10px;cursor: pointer">Submit</button>' + 
                    '</div>' +
                '</form>' +
            '</body>'
        );
        res.write('</html>');

        return res.end();
    }

    if (url === '/create-user' && method === 'POST') {
        const request_body = [];
        
        req.on('data', (chunk) => {
            request_body.push(chunk);
        });

        return req.on('end', () => {
            const parsed_body = Buffer.concat(request_body).toString();
            const [ field, value ] = parsed_body.split('=');
            
            console.log({ field, value });
            
            res.statusCode = 302;
            res.setHeader('Location', '/users');

            return res.end();
        });
    }
    
    if (url === '/users') {
        res.setHeader('Content-Type', 'text/html');
        res.write('<!doctype html>');
        res.write('<html>');
        res.write('<head><title>Assignment | Users</title></head>');
        res.write(
            '<body>' + 
                '<h1>Users:</h1>' + 
                '<ol type="I">' + 
                    '<li>User One</li>' + 
                    '<li>Spider Monkey</li>' + 
                    '<li>Banana Lover</li>' + 
                '</ol>' + 
            '</body>'
        );
        res.write('</html>');

        return res.end();
    }
}

module.exports = { routes }