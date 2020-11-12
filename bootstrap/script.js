$(function() {

  var chart = {
    labels: ["成績", "英語", "理科", "プログラミング", "数学", "理解度", "宿題提出率"],
    judges: ["B", "A", "C", "B", "A", "C", "B"],
    labelColor: "#666",
    labelAlertColor: "#fa3833",
    labelFont: "12px 'arial'",
    judgeFont: "16px 'arial'",
    guideStrokeColor: "#cdcfd7", //グラフの軸の色
    maxValue: 100, //グラフの最大値
    radius: 110, //グラフの半径
    bgColor: "#fff", //背景色
    radars: [{
      name: "学級平均",
      values: [65, 70, 65, 60, 70, 65, 60],
      strokeColor: "#f5a571",
      fillColor: "rgba(245, 165, 113, .15)",
      $points: [], //createRadarPointElements()で作成したJqueryオブジェクトを格納
      balloon: {
        bg:"#f5a571",
        label:"学級平均",
        score:["B",75,67,65,63,"C","B"],
        maxScore:[0,100,100,100,100]
      }
    }, {
      name: "評価",
      values: [80, 82, 55, 80, 70, 55, 80],
      strokeColor: "#2ec2d3",
      fillColor: "rgba(46, 194, 211, .15)",
      $points: [], //createRadarPointElements()で作成したJqueryオブジェクトを格納
      balloon: {
        bg:"#2ec2d3",
        label:"評価",
        score:["B",80,60,80,63,"C","B"],
        maxScore:[0,100,100,100,100]
      }
    }]
  };

  createRadarPointElements($("#pointArea"), chart.radars);
  startAnime();

  function startAnime() {
    var animeRatesList = [];
    var timeout;
    var radarsLen = chart.radars.length;
    var labelsLen = chart.labels.length;
    var delayCnt = 2;
    var radarIdx = 0;
    var radar;

    resetAnimeSetting();
    fadeIn(onEnterFrame);

    $("#chart").click(function() {
      clearTimeout(timeout);
      resetAnimeSetting();
      fadeIn(onEnterFrame);
    });

    function fadeIn(onEnd) {

      drawChart($("#chart"), chart);
      $("#chart").css({
        opacity: 0
      }).delay(100).animate({
        opacity: 1
      }, 400, onEnd);
    }

    function resetAnimeSetting() {
      //アニメーションフレームを先頭に戻す
      for (var i = 0; i < radarsLen; i++) {
        animeRatesList[i] = [];
        radar = chart.radars[i];
        radar.tempValues = []; //アニメーション中の値を格納
        radar.completedAnime = false; //アニメーション終了フラグ
        radar.frameIdx = 0; //アニメーションのフレーム番号
        for (var j = 0; j < labelsLen; j++) {
          radar.tempValues[j] = 0;
        }
      }
      radarIdx = 0;
      radar = chart.radars[radarIdx];
      chart.animationFrame = 0;

    }

    function onEnterFrame() {

      //console.log(radarIdx,"radar.tempValues = ",radar.tempValues);
      chart.animationFrame += 1;
      if (radar.completedAnime) {
        radarIdx += 1;
        radar = chart.radars[radarIdx];
      } else {
        radar.frameIdx += 1;
        var value;
        var tempValue;
        for (var j = 0; j < labelsLen; j++) {
          if (radar.frameIdx > delayCnt * j) {
            value = radar.values[j];
            tempValue = radar.tempValues[j];
            tempValue += (value - tempValue) * .3;
            if ((value - tempValue) < chart.maxValue * .03) {
              tempValue = value;
              if (j == labelsLen - 1) {
                radar.completedAnime = true;
              }
            }
            radar.tempValues[j] = tempValue;
          }
        }
      }
      drawChart($("#chart"), chart);
      if (radar) {
        timeout = setTimeout(onEnterFrame, 30);
      }
    }
  }

  // グラフを描画する関数
  function drawChart($canvas, obj) {
    var ctx = $canvas[0].getContext('2d');
    var center = {
      x: $canvas.width() * .5,
      y: $canvas.height() * .5
    }
    var labelsLen = obj.labels.length;

    //描画をクリア
    ctx.fillStyle = obj.bgColor;
    ctx.fillRect(0, 0, $canvas.width(), $canvas.height());

    // 補助線を引く
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = chart.guideStrokeColor;
    var strokePosition;
    var strokePositionList = [];
    for (var i = 0; i < labelsLen; i++) {
      strokePosition = getPosition(i, 1);
      strokePositionList[i] = strokePosition;
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(strokePosition.x, strokePosition.y);
    }
    for (i = 0; i < labelsLen + 1; i++) {
      strokePosition = strokePositionList[i % labelsLen];
      if (i == 0) {
        ctx.moveTo(strokePosition.x, strokePosition.y);
      } else {
        ctx.lineTo(strokePosition.x, strokePosition.y);
      }
    }
    for (i = 0; i < labelsLen + 1; i++) {
      strokePosition = getPosition(i, 0.5);
      if (i == 0) {
        ctx.moveTo(strokePosition.x, strokePosition.y);
      } else {
        ctx.lineTo(strokePosition.x, strokePosition.y);
      }
    }
    ctx.closePath();
    ctx.stroke();

    // labelを描画
    if (obj.animationFrame > 15) {

      ctx.textAlign = "center";
      var labelStr;
      var judgeStr;
      for (i = 0; i < labelsLen; i++) {
        labelStr = obj.labels[i];
        judgeStr = obj.judges[i];
        strokePosition = getPosition(i, 1.15);

        if (judgeStr == "C") {
          if (obj.animationFrame % 6 < 3 && obj.animationFrame < 35) {
            ctx.fillStyle = obj.bgColor;
          } else {
            ctx.fillStyle = obj.labelAlertColor;
          }
        } else {
          ctx.fillStyle = obj.labelColor;
        }

        ctx.font = obj.labelFont;
        if (strokePosition.y > center.y) {
          ctx.fillText(labelStr, strokePosition.x, strokePosition.y + 5 + 20);
        } else {
          ctx.fillText(labelStr, strokePosition.x, strokePosition.y + 5 - 20);
        }

        ctx.font = obj.judgeFont;
        ctx.fillText(judgeStr, strokePosition.x, strokePosition.y + 5);
      }
    }

    //chartを描画
    var radarObj;
    var radarsLen = obj.radars.length;
    for (var i = 0; i < radarsLen; i++) {
      radarObj = obj.radars[i];
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = radarObj.strokeColor;
      ctx.fillStyle = radarObj.fillColor;
      var strokePosition;
      var strokePositionList = [];
      var rate;
      for (var j = 0; j < labelsLen; j++) {
        rate = radarObj.tempValues[j] / obj.maxValue;
        strokePosition = getPosition(j, rate);
        strokePositionList[j] = strokePosition;
        if (j == 0) {
          ctx.moveTo(strokePosition.x, strokePosition.y);
        } else {
          ctx.lineTo(strokePosition.x, strokePosition.y);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // $pointの座標を変更
      var $point;
      for (j = 0; j < labelsLen; j++) {
        strokePosition = strokePositionList[j];
        $point = radarObj.$points[j];
        if (radarObj.tempValues[j] <= 0) {
          $point.hide();
        } else {
          $point.show().css({
            left: strokePosition.x + "px",
            top: strokePosition.y + "px"
          });

        }
      }
    }

    // グラフ上の座標を返す関数
    function getPosition(labelIdx, rate) {
      var rotate = Math.PI * 2 / labelsLen * labelIdx - Math.PI * .5;
      var radius = obj.radius * rate;
      return {
        x: center.x + Math.cos(rotate) * radius,
        y: center.y + Math.sin(rotate) * radius
      }

    }
  }

  function createRadarPointElements($area, radars) {
    var radarObj;
    var radarsLen = radars.length;
    var valueLen;
    var $point;
    var html = "";

    // htmlElementの作成
    for (var i = 0; i < radarsLen; i++) {
      radarObj = radars[i];
      valueLen = radarObj.values.length;
      for (var j = 0; j < valueLen; j++) {
        html += "<p class='point' style='border: solid 2px " + radarObj.strokeColor + "' data-radar-id=" + i + " data-point-id=" + j + "></p>";
      }
    }
    $area.html(html);

    // 作成したhtmlのJqueryオブジェクトをradarsオブジェクトに格納
    for (var i = 0; i < radarsLen; i++) {
      radarObj = radars[i];
      for (var j = 0; j < valueLen; j++) {
        radarObj.$points[j] = $(".point:eq(" + (i * valueLen + j) + ")", $area);
      }
    }

    $(".point", $area).hover(function() {
      var radarIdx = $(this).attr("data-radar-id");
      var pointIdx = $(this).attr("data-point-id");
      var x = $(this).css("left");
      var y = $(this).css("top");
      console.log("show", radarIdx, pointIdx);
      showBalloon(x,y,radarIdx,pointIdx);
    }, function() {
      var radarIdx = $(this).attr("data-radar-id");
      var pointIdx = $(this).attr("data-point-id");
      console.log("hide", radarIdx, pointIdx);
      hideBalloon();
    });
  }
  
  function showBalloon(x,y,radarIdx,pointIdx){
    radarObj = chart.radars[radarIdx];
    balloonObj = radarObj.balloon;
    $("#balloonArea .balloon").show().css({
      left:x,
      top:y,
      background:balloonObj.bg
    });
    var label = balloonObj.label;
    var score = balloonObj.score[pointIdx];
    var maxScore = balloonObj.maxScore[pointIdx];
    $("#balloonArea .balloon .label").text(label);
    $("#balloonArea .balloon .score").text(score);
    if(maxScore){
      maxScore = "/"+maxScore;
    }else{
      maxScore = "";
    }
    $("#balloonArea .balloon .maxScore").text(maxScore);
  }
  function hideBalloon(){
    $("#balloonArea .balloon").hide();
  }
});