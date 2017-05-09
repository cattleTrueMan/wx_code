//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function (res_l) {
          // that.setWxCode(res_l.code)
          // that.setWxCode('013jiEbz1A226f0hiIcz1Qitbz1jiEbb')
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        },
        fail: function () {
          wx.showToast({
            title: '微信登录失败！',
            duration: 3000
          })

        }
      })
    }
  },

  //注册请求
  register: function (mobile) {
    var code
    var that = this
    wx.request({
      url: that.globalData.urlDomain + '/a/192/appraise/registerCheck',
      data: {
        mobile: mobile
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      dataType: 'json',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res_r) {
        if (res_r.data.session_3rd != null) {
          wx.setStorageSync('session_3rd', decodeURIComponent(res_r.data.session_3rd))
        }
        if (res_r.data.isClient) {
          if(res_r.data.code!=undefined){
            wx.showToast({
            title: "验证码是"+res_r.data.code,
            duration: 3000
          })

          }
          else{
            wx.showToast({
            title: '请输入手机获得的验证码',
            duration: 3000
          })
          }
        } else {
          wx.showToast({
            title: '不存在该手机号码的客户',
            duration: 3000
          })
        }
      },
    })

  },

  //短信验证
  messageCheck: function (messageCode, mobile) {
    var that = this
    var session_3rd = wx.getStorageSync('session_3rd')
    // var code = that.getWxCode()
    wx.login({
      success: function (res_l) {
        wx.request({
          url: that.globalData.urlDomain + '/a/192/appraise/messageCheck',
          data: {
            code: encodeURIComponent(res_l.code),
            messageCode: messageCode,
            session_3rd: encodeURIComponent(session_3rd),
            mobile: mobile
          },
          method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          dataType: 'json',
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            // success
            if (res.data.isRegister) {
              wx.switchTab({
                url: '/pages/appraise/appraising/appraising'
              })
            }
            else {
              wx.showToast({
                title: '注册失败:' + res.data.err,
                duration: 3000
              })
            }
          }
        })
      }
    })
  },
  //获取评价项目
  getItem: function (res_N) {
    var that = this
    wx.request({
      url: that.globalData.urlDomain + '/a/192/appraise/itemGet',
      data: {
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      dataType: 'json',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        // var obj = new Object();
        // obj.resData = res.data;
        // obj.res_N = res_N;
        that.setItemData(res.data)
        wx.navigateTo({
          url: "../appedit/appedit?" + res_N
        })
      }
    })
  },

  //获取已评价项目的数据
  getItemed: function (res_E) {
    var params = encodeURIComponent(res_E)
    wx.navigateTo({
      url: "../appedited/appedited?params=" + params
    })
  },

  //上传图片接口
  uploadDIY:function(filePaths, successUp, failUp, i, length, fparentid,fnumberList) {
    var that = this
    if (length > 0) {
      wx.uploadFile({
        url: that.globalData.urlDomain + '/a/192/appraise/upLoadImage',
        filePath: filePaths[i],
        name: 'fileData',
        formData: {
          'imageName': filePaths[i],
          'fparentid': encodeURIComponent(fparentid),
          'fnumber':fnumberList[i]
        },
        success: function(resp){
          console.log(resp.statusCode)
          var resdata = JSON.parse(resp.data)
          successUp++;
        },
        fail: function(res){
          failUp++;
          if(i==length){
            wx.switchTab({
              url: '/pages/appraise/appraising/appraising'
            })
          }
        },
        complete: function(){
          i++;
          if (i == length) {
            console.log('总共' + successUp + '张上传成功,' + failUp + '张上传失败！');
            wx.showToast({
                title: '提交完成',
                duration: 3000
              })
            wx.switchTab({
              url: '/pages/appraise/appraising/appraising'
            })
          }
          else {  //递归调用uploadDIY函数
            that.uploadDIY(filePaths, successUp, failUp, i, length, fparentid,fnumberList);
          }
        },
      });
    }
    else {
      console.log('没有要上传的图片')
       wx.showToast({
                title: '提交完成',
                duration: 5000
              })
      wx.switchTab({
        url: '/pages/appraise/appraising/appraising'
      })
    }
  },
  getIsRegister: function () {
    return this.globalData.isRegister;
  },
  setIsRegister: function (isRegister) {
    this.globalData.isRegister = isRegister;
  },
  getSession_3rd: function () {
    return this.globalData.session_3rd;
  },
  setSession_3rd: function (session_3rd) {
    this.globalData.session_3rd = session_3rd;
  },
  getItemData: function () {
    return this.globalData.itemData;
  },
  setItemData: function (obj) {
    this.globalData.itemData = obj;
  },
  getAppraisingData: function () {
    return this.globalData.appraisingData;
  },
  setAppraisingData: function (obj) {
    this.globalData.appraisingData = obj;
  },
  getWxCode: function () {
    return this.globalData.wxCode;
  },
  setWxCode: function (code) {
    this.globalData.wxCode = code;
  },
  globalData: {
    session_3rd: null,      //验证session
    isRegister: false,      //是否注册
    itemData: null,
    appraisingData: null,
    wxCode: null,
    urlDomain: 'https://oe.wens.com.cn'
    // urlDomain: 'http://localhost:8069'
  }
})
