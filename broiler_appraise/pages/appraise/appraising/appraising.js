//appraising.js
//获取应用实例
var app = getApp()
Page({
  data: {
    // list: [
    //   {
    //     date: '2017-01-07',
    //     open: false,
    //     detail: [{carId:'粤A12345', org:'南雄公司', qty:100, unit:'头'}, 
    //              {carId:'粤A12346', org:'曲江公司', qty:200, unit:'头'},
    //              {carId:'粤A12347', org:'春湾分公司', qty:300, unit:'头'}
    //              ]
    //   }, {
    //     date: '2017-01-06',
    //     open: false,
    //     detail: [{carId:'粤A12345', org:'南雄公司', qty:200, unit:'头'}
    //              ]
    //   }, {
    //     date: '2017-01-05',
    //     open: false,
    //     detail: [{carId:'粤A12345', org:'阳山分公司', qty:100, unit:'头'},
    //              {carId:'粤A12346', org:'曲江公司', qty:100, unit:'头'}
    //              ]
    //   }
    // ]
    list: null,
    choose: false
  },
  onLoad: function (option) {
    console.log(option);
    var that = this
    that.loginCheck();
    that.setData({
      choose: true
    })
  },
  onShow: function () {
    var that = this
    if (!that.data.choose) {
      var session_3rd = wx.getStorageSync('session_3rd')
      if (session_3rd != null) {
        that.requestFunc(session_3rd);
      }
    }else{
      that.setData({
        choose:false
      })
    }

  },
  requestFunc: function (session_3rd) {
    var that = this
    // var session_3rd = wx.getStorageSync('session_3rd')
    wx.request({
      url: app.globalData.urlDomain + '/a/192/appraise/getAppraising',
      data: {
        'session_3rd': encodeURIComponent(session_3rd)
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      dataType: 'json',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        that.setData({ list: res.data })
      }
    })
  },
  kindToggle: function (e) {
    var id = e.currentTarget.id, list = this.data.list;
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].date == id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      list: list
    });
  },
  onPullDownRefresh: function () {
    var session_3rd = wx.getStorageSync('session_3rd')
    if (session_3rd) { this.requestFunc(session_3rd); }
  },
  //事件处理函数:获取待评价项目页面 
  bindViewTap: function (e) {
    app.getItem(e.currentTarget.id)
  },
  //验证
  loginCheck: function (cb) {
    var that = this
    //先从缓存中获取session
    try {
      var session_3rd = wx.getStorageSync('session_3rd')
      if (session_3rd) {
        app.setSession_3rd(session_3rd)
      }
    }
    catch (e) {
      console.log(e)
    }
    // wx.setStorageSync('session_3rd','ST7dsCTlAX7gUwoLCL5gIwVCb6U=')
    //如果有session_sto，则发送session到Odoo服务器校验校验是否有效
    var session_sto = app.getSession_3rd()
    var isEffective = false
    var isSuccess
    if (session_sto != null) {
      //调用Odoo接口校验session是否有效

      wx.request({
        url: app.globalData.urlDomain + '/a/192/appraise/checkAccount', //odoo地址1
        data: {
          session: encodeURIComponent(session_sto)
        },
        method: 'POST',
        dataType: 'json',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        success: function (res_r) {
          //是否有效
          isEffective = res_r.data.isEffective
          //是否注册
          app.setIsRegister(res_r.data.isRegister)
          //是否跳转到待评价界面
          // res_r.data.isEffective = true
          // res_r.data.isRegister = true
          if (res_r.data.isEffective == true && res_r.data.isRegister == true) {
            wx.showToast({
              title: '登录成功',
              icon: "success",
              duration: 2000,
              success: function () {
                that.requestFunc(session_sto)
              }
            })
          }
          if (res_r.data.isEffective == true && res_r.data.isRegister == false) {
            wx.showToast({
              title: '用户未注册，请重新注册！',
              duration: 2000
            })
            wx.redirectTo({
              url: '/pages/reg/reg',
            })
          }

          //如果session无效，则调用登录接口验证
          if (!isEffective) {
            //调用登录接口
            // var code = that.getWxCode()
            that.loginInterface()
          }
        }
      })
    }
    else {
      that.loginInterface()
    }
  },

  loginInterface: function () {
    var that = this
    wx.login({
      success: function (res_l) {
        wx.request({
          url: app.globalData.urlDomain + '/a/192/appraise/login', //odoo地址2
          data: {
            code: encodeURIComponent(res_l.code)
          },
          method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          dataType: 'json',
          //header:  { 'content-type': 'application/json' },
          header: { 'content-type': 'application/x-www-form-urlencoded' },
          //header:{'content-type':'text/html'},
          success: function (res_r) {
            if (res_r.data.session_3rd) {
              //验证成功时，使用缓存记录session
              var session_3rd = decodeURIComponent(res_r.data.session_3rd)
              app.setSession_3rd(session_3rd)
              wx.setStorage({
                key: "session_3rd",
                data: session_3rd
              })
            }
            //使用全局变量保存是否注册
            app.setIsRegister(res_r.data.isRegister)
            if (res_r.data.isRegister) {
              that.requestFunc(session_3rd);
            }
            else {
              wx.showToast({
                title: res_r.data.err,
                duration: 3000
              })
              wx.redirectTo({
                url: '/pages/reg/reg',
              })
            }
          }
        })
      }
    })
  },
})
