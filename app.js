const Koa = require('koa')
const app = new Koa()
const Router = require('koa-router')
const router = new Router()
const koaBody = require('koa-body')

// 全局中间件， ctx，body即向客户端返回的内容
app.use(async (ctx, next) => {
    console.log('全局中间件')
    // ctx.body = 'Hello Koa2'
    await next()
})

// 通过require引入student模块
const student = require('./controller/student.js')

// 给student模块使用定义根路由为 '/student'
router.use('/student', student.routes())

// 使用路由
app.use(router.routes())

// 对3000端口监听，这是nodejs的默认端口，如果被占用，可以停止相应进程或换端口
app.listen(3000, () => {
    console.log('服务开启在3000端口')
    console.log('http://localhost:3000/')
})