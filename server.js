var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');
var fs = require('fs');

//启动服务
var server = new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
});

var dataurl = __dirname + '/data.json';

//获取列表数据
server.app.get('/api/list', function (req, res) {
    res.sendFile(dataurl)
});

/**
 * 删除数据
 */
server.app.get('/api/del/:id', function (req, res) {
    fs.readFile(dataurl, 'utf-8', function (err, text) {
        if (err) {
            return res.json({
                msg: '获取内容失败',
                data: null,
                status: false
            });
        }

        var list = JSON.parse(text);
        var {id} = req.params;
        for (let i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                list.splice(i, 1);
                fs.writeFile(dataurl, JSON.stringify(list)); //保存删除后的文件
                return res.json({
                    msg: '删除成功',
                    data: null,
                    status: true
                });
            }
        }
        return res.json({
            msg: '删除失败，数据不存在',
            data: null,
            status: false
        });
    });
});

server.listen(3000);