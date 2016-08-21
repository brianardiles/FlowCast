function ServerImage(){
    pathimg = 'C:\\FlowCastDev\\FC0.2\\app\\image\\1.png';
    http.createServer(function(req, res) {
        var stat = fs.statSync(pathimg);
        var total = stat.size;
        var file = fs.createReadStream(pathimg);          
        res.writeHead(206, {
            'Content-Type': 'image/png',
            'Access-Control-Allow-Origin': '*'
        });
        file.pipe(res);

    }).listen(8660, ipLocal);
    console.log("Server image listen: http://"+ipLocal+":8660/");
}