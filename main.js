var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateHTML(title, list, body, control){
    return`
        <!doctype html>
        <html>
        <head>
            <title>WEB1 - ${title}</title>
            <meta charset="utf-8">
        </head>
        <body>
            <h1><a href="/">WEB</a></h1>
            ${list}
            ${control}
            ${body}        
        </body>
        </html>`
};

function templateList(filelist){
    var list = '<ul>';
    var i = 0;
    while(i<filelist.length){
        list += `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
        i+=1;
    }
    list+='</ul>'

    return list;

};

var app = http.createServer((request,response)=>{
    var _url = request.url;
    var queryData = url.parse(_url, true).query
    var pathname = url.parse(_url, true).pathname
    if(pathname === '/'){
        if(queryData.id === undefined){
            fs.readdir('./data', (error, filelist)=>{
                // var i = 0;
                var title = 'Welcome';
                var description = "Hell Node.js";
                var list = templateList(filelist);
                var template = templateHTML(title, list, `<h2>${title}</h2><p>${description}`,`<a href="/create">Create</a>`);
                response.writeHead(200);
                response.end(template);
            });
        }else{
            fs.readdir('./data', (error, filelist)=>{
                // console.log(filelist);
                var list = templateList(filelist);
                fs.readFile(`data/${queryData.id}`, 'utf8', (err, description)=>{
                    var title = queryData.id;
                    var template = templateHTML(title, list, `<h2>${title}</h2><p>${description}`,
                    `<a href="/create">Create</a>
                    <a href="/update?id=${title}">Update</a>
                    <form action="/delete_process" method="post">
                        <input type='hidden', name='id' value="${title}">
                        <input type='submit', value="delete">
                    </form>`
                    );
                    response.writeHead(200);
                    response.end(template);
                });
            });
        }
    }
    else if(pathname === '/create'){
        fs.readdir('./data', (error, filelist)=>{
            // var i = 0;
            var title = 'WEB - create';
            // var description = "Hell Node.js";
            var list = templateList(filelist);
            var template = templateHTML(title, list, `
            <form action="/create_process" method="post">
                <p><input type=text" name="title" placeholder="title"></p>
                <p>
                    <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>`,
            ``);
            response.writeHead(200);
            response.end(template);
        });
    }
    else if(pathname === '/create_process'){
        if(request.method == 'POST'){
            var body='';
            request.on('data', (data)=>{
                body+=data;
                if(body.length > 1e6){
                    request.connection.destroy();
                }
            });
            request.on('end', ()=>{
                var post = qs.parse(body);
                var title = post.title;
                var description = post.description;
                // console.log(post);
                fs.writeFile(`data/${title}`, description, 'utf8', (err)=>{
                    if(err) throw err;
                    console.log(`${title}.txt Saved`);
                    response.writeHead(302, {Location: `/?id=${title}`});
                    response.end();
                    });
                });
        }
    }
    else if(pathname === '/update'){
        fs.readdir('./data', (error, filelist)=>{
            // console.log(filelist);
            var list = templateList(filelist);
            fs.readFile(`data/${queryData.id}`, 'utf8', (err, description)=>{
                var title = queryData.id;
                var template = templateHTML(title, list, 
                    `<form action="/update_process" method="post">
                    <input type="hidden" name="id" value="${title}">
                    <p><input type=text" name="title" placeholder="title" value="${title}"></p>
                    <p>
                        <textarea name="description" placeholder="description">
                        ${description}
                        </textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                    </form>`,
                    `<a href="/create">Create</a> <a href="/update?id=${title}">Update</a>`);

                response.writeHead(200);
                response.end(template);
            });
        });
    }
    else if(pathname === '/update_process'){
        if(request.method == 'POST'){
            var body='';
            request.on('data', (data)=>{
                body+=data;
                if(body.length > 1e6){
                    request.connection.destroy();
                }
            });
            request.on('end', ()=>{
                var post = qs.parse(body);
                var id = post.id;
                var title = post.title;
                var description = post.description;
                // console.log(post);
                fs.rename(`data/${id}`, `data/${title}`, (error)=>{
                    fs.writeFile(`data/${title}`, description, 'utf8', (err)=>{
                        if(err) throw err;
                        response.writeHead(302, {Location: `/?id=${title}`});
                        response.end();
                    });
                    response.writeHead(302, {Location: `/?id=${title}`});
                    response.end();
                });
            });
        }
    }
    else if(pathname ==='/delete_process'){
            var body='';
            request.on('data', (data)=>{
                body+=data;
            });
            request.on('end', ()=>{
                var post = qs.parse(body);
                var id = post.id;
                fs.unlink(`data/${id}`, (error)=>{
                    response.writeHead(302, {Location: `/`});
                    response.end();
                });
            });
        
    }

    else{
        response.writeHead(404);
        response.end('Not Found');
    }
});

app.listen(3000);
