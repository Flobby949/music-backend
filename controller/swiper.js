const Router = require('koa-router')
const router = new Router()
const cloudStorage = require('../utils/callCloudStorage');
const callCloudDB = require('../utils/callCloudDB');

// 获取轮播图列表
router.get('/list', async (ctx, next) => {
    // 查询数据库集合的字符串模板
    const query = `db.collection('swiper').get()`
    const res = await callCloudDB(ctx, 'databasequery', query)
    const data = res.data
    console.log(data.length)
    // 遍历data，给每一个fileid加上一个max_age，存入数组
    let files = []
    for (let i = 0, len = data.length; i < len; i++) {
        files.push({
            fileid: JSON.parse(data[i]).fileid,
            max_age: 7200,
        })
    }
    // 调用封装好的cloudstorage下载功能，观察返回结果包含的结果
    const download = await cloudStorage.download(ctx, files)
    console.log(download)
    // 拼装返回结果数组
    let returnData = []
    // 返回结果包括文件https地址download_url
    // 文件云存储id： fileid（用于删除文件），数据库唯一id（用于数据库删除记录）
    for (let i = 0, len = download.file_list.length; i < len; i++) {
        returnData.push({
            download_url: download.file_list[i].download_url,
            fileid: download.file_list[i].fileid,
            _id: JSON.parse(data[i])._id
        })
    }
    console.log('返回数据数组')
    console.log(returnData)
    ctx.body = {
        code: 20000,
        data: returnData
    }
})

// 上传
router.post('/upload', async(ctx, next) => {
    // 上传云存储
    const fileid = await cloudStorage.upload(ctx)
    console.log(fileid)
    // 写入数据库
    const query = `
        db.collection('swiper').add({
            data: {
                fileid: '${fileid}'
            }
        })
    `
    const res = await callCloudDB(ctx, 'databaseadd', query)
    console.log(res)
    ctx.body = {
        code: 20000,
        id_list: res.id_list
    }
})

// 删除
router.get('/delete', async(ctx, next) => {
    const params = ctx.request.query
    // 删除数据库记录
    const query = `db.collection('swiper').doc('${params._id}').remove()`
    const delDCRes = await callCloudDB(ctx, 'databasedelete', query)

    // 删除云存储文件
    const delStorageRes = await cloudStorage.delete(ctx, [params.fileid])
    ctx.body = {
        code: 20000,
        data: {
            delDBRes,
            delStorageRes
        }
    }
})

module.exports = router