// pages/main/main.js
var app = getApp() 
var routes = require('routes'); 
Page({ 
 data: { 
  userInfo: {}, 
  cellHeight: '120px', 
  pageItems: [] 
 }, 
 //事件处理函数 
 onLoad: function () { 
  var that = this
  console.log(app); 
  //调用应用实例的方法获取全局数据 
  app.getUserInfo(function (userInfo) {

//    wx.setNavigationBarTitle({ 
//     title: '全新测试追踪系统-' + userInfo.nickName, 
//     success: function (res) { 
//      // success 
//     } 
//    }) 

   that.setData({ 
    userInfo: userInfo 
   }) 
   var pageItems = []; 
   var row = []; 
   var len = routes.PageItems.length;//重组PageItems 
   len = Math.floor((len + 2) / 3) * 3; 
   for (var i = 0; i < len; i++) { 
    if ((i + 1) % 3 == 0) { 
     row.push(routes.PageItems[i]); 
     pageItems.push(row); 
     row = []; 
     continue; 
    } 
    else { 
     row.push(routes.PageItems[i]); 
    } 
   } 
   wx.getSystemInfo({ 
    success: function (res) { 
     var windowWidth = res.windowWidth; 
     that.setData({ 
      cellHeight: (windowWidth / 3) + 'px'
     }) 
    }, 
    complete: function () { 
     that.setData({ 
      pageItems: pageItems 
     }) 
    } 
   }) 
  }) 
 } 
}) 