// pages/reg/reg.js
var app = getApp()
Page({
  data: {
    focus: false,
    inputValue: '',
    Phone: null,
    Code: null,
    disabled: false,
    btnText:'获取验证码',
    second:30
  },
  formPhoneSubmit: function (e) {
    var that = this
    var inputPhone = e.detail.value.Phone
    var re = new RegExp(/^((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)$/)
    var retu = inputPhone.match(re) 
    if (retu) {
      var retu1 = (/^1[3|4|5|8][0-9]\d{4,8}$/.test(inputPhone))
      if (retu1) {
          app.register(inputPhone)
        that.setData({
          Phone: inputPhone
        })
        that.countdown(that)
      } else {
        wx.showToast({
          title: '手机号码格式不正确',
          duration: 3000
        })
      }
    } else {
      wx.showToast({
        title: '手机号码格式不正确',
        duration: 3000
      })
    }
  },
  countdown: function (that) {
    var second = that.data.second
    if (second == 0) {
      // console.log("Time Out...");
      that.setData({
        disabled: false,
        second:30,
        btnText:'获取验证码'
      });
      return;
    }
    var time = setTimeout(function () {
      that.setData({
        disabled: true,
        second: second - 1,
        btnText:"重新获取验证码（"+(second-1)+"s)"
      });
      that.countdown(that);
    }
      , 1000)
  }
  ,
  formCodeSubmit: function (e) {
    var that = this
    console.log(this.data.Phone)

    if (e.detail.value.Code != null) {
      var code = e.detail.value.Code
      var re = new RegExp(/^\d{6}\b/)
      var retu = code.match(re)
      if (retu) {
        app.messageCheck(e.detail.value.Code, that.data.Phone)
      }
      else {
        wx.showToast({
          title: '验证应是6位数字',
          duration: 3000
        })
      }
    }
    else {
      wx.showToast({
        title: '验证码不能为空',
        duration: 3000
      })
    }
  }
})
