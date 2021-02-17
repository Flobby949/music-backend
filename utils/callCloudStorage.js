const rp = require('request-promise')//先引用request-promise请求小程序后端
const getAccessToken = require('./getAccessToken.js');//引用之前写的获取accesstoken
const fs = require('fs');

const cloudStorage = {
    // 上传
    async upload(ctx) {
        // 获取文件上传链接
        const ACCESS_TOKEN = await getAccessToken()
        const file = ctx.request.files.file // 客户端文件对象
        const path = `swiper/${Date.now()}-${Math.random()}-${file.name}`  // 云存储路径
        // 封装请求相关操作，包括请求方法，请求地址，请求体json对象，返回值转json
        const options = {
            method: 'POST',
            uri: `https://api.weixin.qq.com/tcb/uploadfile?access_token=${ACCESS_TOKEN}`,
            body: {
                path,
                env: ctx.state.env
            },
            json: true,
        }

        // 发起异步请求，await获取的返回值可以直接赋值给一个const定值
        const info = await rp(options)
            .then(function (res) {
                return res
            })
            .catch((err) => {
                console.log(err)
            })

        // 上传图片
        // 获取到返回数据后，拼装一个http post请求，其中uri为返回包的url字段，body部分格式为multipart/form-data
        const params = {
            method: 'POST',
            headers: {
                'content-type': 'multipart/form-data'
            },
            uri: info.url,
            formData: {
                key: path,
                Signature: info.authorization,
                'x-cos-security-token': info.token,
                'x-cos-meta-fileid': info.cos_file_id,
                file: fs.createReadStream(file.path),
            },
            json: true,
        }
        // 异步上传
        await rp(params)
        // 返回云存储的fileid
        return info.file_id
    },

    // 批量获取文件下载链接
    async download(ctx, fileList) {
        const ACCESS_TOKEN = await getAccessToken()
        const options = {
            method: 'POST',
            uri: `https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=${ACCESS_TOKEN}`,
            body: {
                env: ctx.state.env,
                file_list: fileList,
            },
            json: true
        }
        const info = await rp(options)
            .then(function (res) {
                return res
            })
            .catch((err) => {
                console.log(err)
            })
        return info
    },

    // 删除文件
    async delete(ctx, fileid_list) {
        const ACCESS_TOKEN = await getAccessToken()
        const options = {
            method: 'POST',
            uri: `https://api.weixin.qq.com/tcb/batchdeletefile?access_token=${ACCESS_TOKEN}`,
            body: {
                fileid_list,
                env: ctx.state.env,
            },
            json: true
        }

        const info = await rp(options)
        .then(function (res) {
            return res
        })
        .catch((err) => {
            console.log(err)
        })
    return info
    }
}

module.exports = cloudStorage