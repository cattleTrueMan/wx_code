//appraising.js
//获取应用实例
var util = require('../../../utils/util.js')
// 路径是wxCharts文件相对于本文件的相对路径
var app = getApp()
Page({
  data: {
    list: null,
    listLength:0,
    dateStart: null,
    dateEnd: null
  },
  formatNumber: function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  PrefixInteger: function (num, n) {
    return (Array(n).join(0) + num).slice(-n);
  },
  onLoad: function (options) {
    var that = this
    var date = new Date()
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate();
    var date1 = [year, month-1,day+1].map(that.formatNumber).join('-')
    var date2 = [year, month, day].map(that.formatNumber).join('-')
    that.setData({
      dateStart: date1,
      dateEnd: date2,
    })
  },
  onShow: function () {
    this.requestFunc();
  },

  //日期字符串转化为日期格式
  stringToDate: function (dateStr, separator) {
    if (!separator) {
      separator = "-";
    }
    var dateArr = dateStr.split(separator);
    var year = parseInt(dateArr[0]);
    var month;
    if (dateArr[1].indexOf("0") == 0) {
      month = parseInt(dateArr[1].substring(1));
    } else {
      month = parseInt(dateArr[1]);
    }
    var day = parseInt(dateArr[2]);
    var date = new Date(year, month - 1, day);
    return date;
  },

  bindDateChange: function (e) {
    var that = this
    var dateStart = e.detail.value
    var dateStartD = that.stringToDate(e.detail.value, "-")
    var dateEndD = that.stringToDate(that.data.dateEnd, "-")
    if (dateStartD > dateEndD) {
      wx.showToast({
        title: '开始日期不能大于结束日期！',
        duration: 3000
      })
    }
    else {
      this.setData({
        dateStart: dateStart,
      })
      that.requestFunc();
    }

  },
  bindDateChange1: function (e) {
    var that = this
    var dateStart = that.stringToDate(that.data.dateStart, "-")
    var dateEnd = e.detail.value
    var dateEndD = that.stringToDate(e.detail.value, "-")
    if (dateStart > dateEndD) {
      wx.showToast({
        title: '开始日期不能大于结束日期！',
        duration: 3000
      })
    }
    else {
      this.setData({
        dateEnd: dateEnd
      })
      that.requestFunc();
    }

  },

  requestFunc: function () {
    var that = this
    var session_3rd = wx.getStorageSync('session_3rd')
    wx.request({
      url: app.globalData.urlDomain + '/a/192/appraise/getAppraisedCount',
      data: {
        'session_3rd': encodeURIComponent(session_3rd),
        'dateStart': that.data.dateStart,
        'dateEnd': that.data.dateEnd
      },
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      dataType: 'json',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        if(res.data.length>0){
          that.setData({ 
            list: res.data ,
            listLength:1
          })
        }
        else{
          that.setData({ 
            list: res.data ,
            listLength:0
          })
        }
        
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
    this.requestFunc();
  },
  //事件处理函数:获取已评价项目数据
  bindViewTap: function (e) {
    wx.navigateTo({
      url: "../appedited/appedited?" + e.currentTarget.id
    })
  },
})
