//appedit.js
//获取应用实例
var app = getApp()
Page({
  data: {
    items_data: null,
    items_radio: [
      '优', '良', '中', '差'
    ],
    selectBill: null,//导航页面传过来的信息
    imageList: [],   //选择的图片
    imageShape: [],
    imageAvg: [],
    imageRate: [],
    imageLoss: [],
    countIndex: 0,
    count: [1, 2, 3, 4, 5, 6, 7],
    textAreaText: null,
    tempFilePaths: [],
    tempShape: [],
    tempAvg: [],
    tempRate: [],
    tempLoss: [],
    touch_start: null,
    touch_end: null,
    formDict:null
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    var itemsData = app.globalData.itemData
    var formDict = {}
    for(var i=0;i<itemsData.length;i++){
      var item = itemsData[i]
      formDict[item.fnumber] = item.name
    }
    this.setData({
      items_data: itemsData,
      formDict:formDict,
      selectBill: {
        date: options.date,
        org: options.org,
        carId: options.carId,
        qty: options.qty,
        fqtyt: options.fqtyt,
        fqtyf: options.fqtyf
      }
    })
  },
  bindinputEvent: function (e) {
    this.setData({
      textAreaText: e.detail.value
    })

  },
  formSubmit: function (e) {
    var that = this
    e.detail.value.RZKH06 = that.data.textAreaText
    var formDict = that.data.formDict
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var appraisedItemData = e.detail.value
    var appraisedItemDataN={}
    for(var key in appraisedItemData){
      appraisedItemDataN[formDict[key]] = appraisedItemData[key]
    }
    // var imageList = that.data.imageList
    var imageList = []
    imageList=imageList.concat(that.data.imageShape)
    imageList=imageList.concat(that.data.imageAvg)
    imageList=imageList.concat(that.data.imageRate)
    imageList=imageList.concat(that.data.imageLoss)
    var successUp = 0; //成功个数
    var failUp = 0; //失败个数
    var length = imageList.length; //总共个数
    var i = 0
    var imageShapeLength = that.data.imageShape.length
    var imageAvgLength = that.data.imageAvg.length
    var imageRateLength = that.data.imageRate.length
    var imageLossLength = that.data.imageLoss.length

    var fnumberList =[]
    for(var i=0; i<imageList.length;i++){
      if(i<imageShapeLength){
        fnumberList[i]="RZKH01";
      }
      else if(imageShapeLength<=i&&i<(imageShapeLength+imageAvgLength)){
        fnumberList[i]="RZKH02";
      }
      else if((imageShapeLength+imageAvgLength)<=i&&i<(imageShapeLength+imageAvgLength+imageRateLength)){
        fnumberList[i]="RZKH03";
      }
      else {
        fnumberList[i]="RZKH04";
      }
    }

    var session_3rd = wx.getStorageSync('session_3rd')
    var i = 0;
    if (e.detail.value.RZKH01 != "" && e.detail.value.RZKH02 != "" && e.detail.value.RZKH04 != "" && e.detail.value.RZKH05 != ""&&imageShapeLength==1&&imageAvgLength==1&&imageLossLength==2) {
      wx.request({
        url: app.globalData.urlDomain + '/a/192/appraise/upLoadItem',
        data: {
          appraisedItemData: JSON.stringify(appraisedItemDataN),
          selectBill: JSON.stringify(that.data.selectBill),
          session_3rd: encodeURIComponent(session_3rd)
        },
        method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        dataType: 'json',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        success: function (res) {
          wx.showToast({
            title: '正在提交...',
            duration: 3000
          })
          var fparentid = decodeURIComponent(res.data.fparentid);
          app.uploadDIY(imageList, successUp, failUp, i, length, fparentid,fnumberList);
        },
        fail: function () {
          // fail
        },
        complete: function () {
        }
      })
    } else {
      var msgStr = ""
      if (e.detail.value.RZKH01 == "") {
        msgStr += "请评价"+formDict['RZKH01']+"项！"
      }
      if (e.detail.value.RZKH02 == "") {
        msgStr += "请评价"+formDict['RZKH02']+"项！"
      }
      if (e.detail.value.RZKH04 == "") {
        msgStr += "请评价"+formDict['RZKH04']+"项！"
      }
      if (e.detail.value.RZKH05 == "") {
        msgStr += "请评价"+formDict['RZKH05']+"项！"
      }
      if(imageShapeLength!=1){
        msgStr += "保证"+formDict['RZKH01']+"项的图片为一张"
      }
      if(imageAvgLength!=1)
      {
        msgStr += "保证"+formDict['RZKH02']+"项的图片为一张"
      }
      if(imageLossLength!=2){
        msgStr += "保证"+formDict['RZKH04']+"项的图片为两张"
      }
      wx.showToast({
        title: msgStr + "然后，再次提交",
        duration: 3000
      })
    }

  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
radioChange:function(e){
  console.log(e)

},
  chooseImage: function (event) {
    var that = this
    if (event.currentTarget.dataset.name == "RZKH01") {
      var tempImagePaths = that.data.tempShape
      var wxImageList = that.data.imageShape
      that.wxChooseImage(that, event, tempImagePaths, wxImageList)
    }
    if (event.currentTarget.dataset.name == "RZKH02") {
      var tempImagePaths = that.data.tempAvg
      var wxImageList = that.data.imageAvg
      that.wxChooseImage(that, event,tempImagePaths, wxImageList)
    }
    if (event.currentTarget.dataset.name == "RZKH03") {
      var tempImagePaths = that.data.tempRate
      var wxImageList = that.data.imageRate
      that.wxChooseImage(that, event,tempImagePaths, wxImageList)
    }
    if (event.currentTarget.dataset.name == "RZKH04") {
      var tempImagePaths = that.data.tempLoss
      var wxImageList = that.data.imageLoss
      that.wxChooseImage(that,event, tempImagePaths, wxImageList,)
    }
  },

  wxChooseImage: function (that,event, tempImagePaths, wxImageList) {
    var imageName = event.currentTarget.dataset.name
    var count = event.currentTarget.dataset.num
    var imageListLen = wxImageList.length
    var tempFilepathsLen = 0
    tempImagePaths = []
    wx.chooseImage({
      sourceType: ['album', 'camera '],
      sizeType: '压缩',
      count: count,
      success: function (res) {
        console.log(res)
        tempFilepathsLen = res.tempFilePaths.length
        if (imageListLen < count) {
          Array.prototype.push.apply(tempImagePaths, wxImageList)
          Array.prototype.push.apply(tempImagePaths, res.tempFilePaths);
          if ((imageListLen + tempFilepathsLen) > count) {
            if (imageName == "RZKH01") {
              that.setData({
                imageShape: tempImagePaths.slice(0, count)
              })
            }
            if (imageName == "RZKH02") {
              that.setData({
                imageAvg: tempImagePaths.slice(0, count)
              })
            }
            if (imageName == "RZKH03") {
              that.setData({
                imageRate: tempImagePaths.slice(0, count)
              })
            }
            if (imageName == "RZKH04") {
              that.setData({
                imageLoss: tempImagePaths.slice(0, count)
              })
            }

          }
          else {
            if (imageName == "RZKH01") {
              that.setData({
                imageShape: tempImagePaths
              })
            }
             if (imageName == "RZKH02") {
              that.setData({
                imageAvg: tempImagePaths
              })
            }
            if (imageName == "RZKH03") {
              that.setData({
                imageRate: tempImagePaths
              })
            }
            if (imageName == "RZKH04") {
              that.setData({
                imageLoss:tempImagePaths
              })
            }
          }
        }
        else {
          wx.showToast({
            title: "图片已满，要新增请先删除要替换的照片！",
            duration: 3000
          })
        }
      }
    })
  },

  previewImage: function (e) {
    var that = this
    var imageList = []
    if (e.target.dataset.name == "RZKH01") {
      imageList = that.data.imageShape
    }
    if (e.target.dataset.name == "RZKH02") {
      imageList = that.data.imageAvg
    }
    if (e.target.dataset.name == "RZKH03") {
      imageList = that.data.imageRate
    }
    if (e.target.dataset.name == "RZKH04") {
      imageList = that.data.imageLoss
    }
    var current = e.target.dataset.src
    var touchTime = that.data.touch_end - that.data.touch_start
    if (touchTime > 350) {
    }
    else {
      wx.previewImage({
        current: current,
        urls: imageList
      })
    }


  },
  myTouchStart: function (e) {
    console.log(e)
    var that = this
    that.setData({
      touch_start: e.timeStamp
    })
  },
  myTouchEnd: function (e) {
    var that = this
    that.setData({
      touch_end: e.timeStamp
    })
  },
  longTap: function (e) {
    var that = this

    var imageList = []
    if (e.target.dataset.name == "RZKH01") {
      imageList = that.data.imageShape
    }
    if (e.target.dataset.name == "RZKH02") {
      imageList = that.data.imageAvg
    }
    if (e.target.dataset.name == "RZKH03") {
      imageList = that.data.imageRate
    }
    if (e.target.dataset.name == "RZKH04") {
      imageList = that.data.imageLoss
    }
    var current = e.target.dataset.src
    var touchTime = e.timeStamp - that.data.touch_start
    wx.showModal({
      title: '提示',
      content: '是否删除该图片',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          var index = -1
          for (var i = 0; i < imageList.length; i++) {
            if (current == imageList[i]) {
              index = i
            }
          }
          if (index != -1) {
            imageList.splice(index, 1);
            if (e.target.dataset.name == "RZKH01") {
              that.setData({
                imageShape: imageList
              })
            }
            if (e.target.dataset.name == "RZKH02") {
              that.setData({
                imageAvg: imageList
              })
            }
            if (e.target.dataset.name == "RZKH03") {
              that.setData({
                imageRate: imageList
              })
            }
            if (e.target.dataset.name == "RZKH04") {
              that.setData({
                imageLoss: imageList
              })
            }
          }
        } else {
          console.log('用户点击取消')
        }
      }
    })
  }
})
