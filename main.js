var http = require('http');
var fs = require('fs');
var url = require('url');

function templateHTML(title, list, body){
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
    var title = queryData.id

    if(pathname === '/'){
        if(queryData.id === undefined){
            fs.readdir('./data', (error, filelist)=>{
                // console.log(filelist);
                // var i = 0;
                var title = 'Welcome';
                var description = "Hell Node.js";
                var list = templateList(filelist);
                var template = templateHTML(title, list, `<h2>${title}</h2><p>${description}`);
                response.writeHead(200);
                response.end(template);
            });
        }else{
            fs.readdir('./data', (error, filelist)=>{
                // console.log(filelist);
                var list = templateList(filelist);
                fs.readFile(`data/${queryData.id}`, 'utf8', (err, description)=>{
                    var title = queryData.id;
                    var template = templateHTML(title, list, `<h2>${title}</h2><p>${description}`);

                    response.writeHead(200);
                    response.end(template);
                });
            });
        }
    }else{
        response.writeHead(404);
        response.end('Not Found');
    }
});

app.listen(3000);
