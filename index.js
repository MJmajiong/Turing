var http = require("http");
var url = require("url");
var fs = require("fs");        //读文件
var res = require("request");

http.createServer(function (request, response) {

    //我必须知道要请求什么东西
    //我必须知道获取请求的url
    var pathname = url.parse(request.url).pathname;
    console.log(pathname)
    // console.log(pathname)
    // console.log(params)
    var is = isStaticFile(pathname);
    if(is) {//如果是静态文件，执行这个部分
        console.log(is)
        try{  //能找到页面，返回页面的数据
            var data = fs.readFileSync("./page" +  pathname);

            response.writeHead(200);
            response.write(data);
            response.end()
        }catch(e) {//能找到页面，返回404
            //无论是http请求还是http响应都是分：两大块，三小段    两大块：（请求头，数据体   响应头，数据体）    请求头和响应头都分一个第一行：路径，其他的那些行叫做：请求
            response.writeHead(404);        //先返回头部
            response.write("<html><body><h1>404 NOT FOUND</h1></h1></body>");            //再返回数据
            response.end();
        }
    }else{
        if(pathname === "/api/chat") {
            console.log("向图灵机器人发送数据")
            var params = url.parse(request.url, true).query;
            console.log(params);
            var respData = {
                "reqType":0,
                "perception": {
                    "inputText": {
                        "text": params.text
                    }
                },
                "userInfo": {
                    "apiKey": "7db4fc529c9743629f3b147253604f76",
                    "userId": "123456"
                }
            };
            var content = JSON.stringify(respData);
            res({
                url:"http://openapi.tuling123.com/openapi/api/v2",
                method:"POST",
                headers:{
                    "content-type":"application/json"
                },
                body:content
            }, function (error, resp, body) {
                if(!error && resp.statusCode === 200) {
                    //把结果返回给我的前端页面
                    // console.log(body);
                    // console.log(resp)
                    var head = {"Access-Control-Allow-Origin":"*",
                                "Access-Control-Allow-Methods":"GET",
                                "Access-Control-Allow-Headers":"x-request-with, content-type"}
                    response.writeHead(200, head);
                    var obj  = JSON.parse(body);
                    console.log(obj)
                    if(obj && obj.results && obj.results.length > 0 && obj.results[0].values) {  //一定要进行严谨上判断
                        response.write(JSON.stringify(obj.results[0].values));
                        response.end()
                    }else{
                        response.write("{\"text\":\"偶不知道你说的是什么~\"}");
                        response.end()
                    }
                }else{
                    //返回给自己前端页面一个400页面
                        response.writeHead(400);
                        response.write("数据异常");
                        response.end()
                }
            });
        }else{
            console.log('发错了')
        }
    }





}).listen(12306)

function isStaticFile(pathname) {
    var staticFile = [".html", ".css", ".js", ".jpg", ".jpeg", "png", "gif"];
    for(var i = 0; i < staticFile.length; i++){
        if(pathname.indexOf(staticFile[i]) == pathname.length - staticFile[i].length){
            return true
        }
    }
    return false

}