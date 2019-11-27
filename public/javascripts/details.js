var pageData = [];
var blackedx = [];
var blackedy = [];

var audio = new Howl({
  src: ['/sounds/notif.mp3', '/sounds/notif.ogg']
});

$(document).ready(function () {
  axios.post('/pagedata', {trackurl: trackurl})
    .then((resp) => {
      var response = resp.data;
      if (response.status === 'SUCCESS') {
        console.log(response);
        pageData.push(response);
        addPageData(response);
        startTimer6();
      } else {
        $('.loader-overlay i').css('display', 'none');
        $('.loader-overlay .error__msg').text(response.error);
        $('.loader-overlay .error__msg').css('display', 'block');
      }
    });

  setIcononFocus();
  
  $(document).on('click', 'table.race__table thead tr th:not(:first-of-type)', function (e) { 
    var col = $(this).parent().children().index($(this));
    blackedx[col - 1] = !blackedx[col - 1];
    blackOut();
  });

  $(document).on('click', 'table.race__table tbody tr td:first-of-type', function (e) { 
    var row = $(this).parent().parent().children().index($(this).parent());
    blackedy[row] = !blackedy[row];
    blackOut();
  });
});

function blackOut() {
  var trs = $('table.race__table tbody tr');
  for (let a = 0; a < trs.length; a++) {
    var tds = $(trs).eq(a).find('td');
    var rowBlacked = false;
    if (blackedy[a]) {
      rowBlacked = true;
    }
    for (let b = 1; b < tds.length; b++) {
      if (blackedx[b - 1]) {
        $(tds).eq(b).addClass('blacked');
      } else {
        $(tds).eq(b).removeClass('blacked')
      }
      if (rowBlacked) {
        if (!$(tds).eq(b).hasClass('blacked')) $(tds).eq(b).addClass('blacked');
      }
    };
  }
}

function startTimer6() {
  var intervalFunc6 = setInterval(function () {
    axios.post('/pagedata', {trackurl: trackurl})
    .then((resp) => {
      var response = resp.data;
      if (response.status === 'SUCCESS') {
        if (response.MTP === '6') {
          if ($('.info__detail#mtp').text() !== response.MTP) {
            if (document.hidden) {
              changeFavIcon('alert');
            }
            audio.play();
            pageData.push(response);
            calcChange();     
            updatePageData();
            blackOut();
          }
        } else if (response.MTP === '0') {
          $('.info__detail#mtp').text(response.MTP);
          clearInterval(intervalFunc6);
          startTimer0();
        }
        $('.info__detail#mtp').text(response.MTP);
      } else {
        $('.loader-overlay').css('display', 'block');
        $('.loader-overlay i').css('display', 'none');
        $('.loader-overlay .error__msg').text(response.error);
        $('.loader-overlay .error__msg').css('display', 'block');
      }
    });
  }, 30000);
}

function startTimer0() {
  var intervalFunc0 = setTimeout(function () {
    axios.post('/pagedata', {trackurl: trackurl})
    .then((resp) => {
      var response = resp.data;
      if (response.status === 'SUCCESS') {
        $('.info__detail#mtp').text(response.MTP);
        pageData.push(response);
        calcChange();
        updatePageData();
        blackOut();
        if (document.hidden) {
          changeFavIcon('alert');
        };
        audio.play();
      } else {
        $('.loader-overlay').css('display', 'block');
        $('.loader-overlay i').css('display', 'none');
        $('.loader-overlay .error__msg').text(response.error);
        $('.loader-overlay .error__msg').css('display', 'block');
      };
    });
  }, 90000);
}

function setIcononFocus() {
  document.addEventListener('visibilitychange', function(){
    if (!document.hidden) {
      changeFavIcon('normal');
    }
  });
}

function addPageData(data) {
  blackedx.length = data.horsesNames.length;
  blackedx.fill(false);
  blackedy.length = data.horsesNames.length;
  blackedy.fill(false);
  $('.loader-overlay').css('display', 'none');
  document.title = data.trackName;
  $('.info__detail#trackname').text(data.trackName);
  $('.info__detail#racenumber').text(data.raceNumber);
  $('.info__detail#numberofhorses').text(data.horsesNames.length);
  $('.info__detail#mtp').text(data.MTP);

  for (let i = 0; i < data.horsesNames.length; i++) {
    var horseNameNode = '<th>' + data.horsesNames[i] + '</th>';
    $('.race__table thead tr').append(horseNameNode);
    $('.saddle__table thead tr').append(horseNameNode);
  }

  $('.saddle__table tbody tr').append('<td></td>')
  
  for (let i = 0; i < data.winOdds.length; i++) {
    $('.saddle__table tbody tr').append('<td>'+ data.winOdds[i]  +'</td>')
  }
  
  for (let i = 0; i < data.tableData.length; i++) {
    $('.race__table tbody').append('<tr class="'+ data.horsesNames[i] +'"></tr>');
    $('.race__table tbody tr.' + data.horsesNames[i]).append('<td class="table-primary" scope="col">'+ data.horsesNames[i]  +'</td>')
    for (let a = 0; a < data.tableData[i].length; a++) {
      $('.race__table tbody tr.' + data.horsesNames[i]).append('<td>' + data.tableData[i][a] + '</td>')
    }
  }
}

function updatePageData() {
  var currentData = pageData[pageData.length-1]
  $('.race__table.table thead').remove();
  $('.race__table.table tbody').remove();
  $('.saddle__table.table thead tr').remove();
  $('.saddle__table.table tbody tr').remove();
  $('.saddle__table.table thead').append('<tr></tr>');
  $('.saddle__table.table thead tr').append('<td>Horses</td>');
  $('.saddle__table.table tbody').append('<tr></tr>');
  $('.race__table.table').append('<thead class="table-primary"></thead>');
  $('.race__table.table thead').append('<tr></tr>');
  $('.race__table.table thead tr').append('<th>Horses</th>');
  $('.race__table.table').append('<tbody></tbody>');

  for (let i = 0; i < currentData.horsesNames.length; i++) {
    var horseNameNode = '<th>' + currentData.horsesNames[i] + '</th>';
    $('.race__table thead tr').append(horseNameNode);
    $('.saddle__table thead tr').append(horseNameNode);
  }

  $('.saddle__table tbody tr').append('<td></td>')
  for (let i = 0; i < currentData.winOdds.length; i++) {
    var decidedClass = '';
    if (currentData.winOddsChange[i] !== 0) {
      if (currentData.winOddsChange[i] < 0) {
        decidedClass = 'table-success';
      } else {
        decidedClass = 'table-danger';
      }
      if (pageData.length > 2) {
        if (pageData[2].winOddsChange[i] < 0 && pageData[1].winOddsChange[i] < 0) {
          decidedClass = 'bg-danger';
        }
      }
    }
    var html = '<td class="'+ decidedClass +'">'+ currentData.winOdds[i]  + '<sup>(' + pageData[pageData.length-2].winOdds[i] + ')</sup></td>';
    $('.saddle__table tbody tr').append(html);
  }
  
  for (let i = 0; i < currentData.tableData.length; i++) {
    $('.race__table tbody').append('<tr class="'+ currentData.horsesNames[i] +'"></tr>');
    $('.race__table tbody tr.' + currentData.horsesNames[i]).append('<td class="table-primary" scope="col">'+ currentData.horsesNames[i]  +'</td>')
    for (let j = 0; j < currentData.tableData[i].length; j++) {
      var sign = '&darr;';
      var alertClass = '';
      var diffInPerc = currentData.change[i][j];
      var diffAbsRound = Math.abs(Math.round(diffInPerc));
      if (diffInPerc >= 0) sign = '&uarr;';
      
      if (diffInPerc <= -50) {
        alertClass = 'table-warning';
      } else if (diffInPerc <= -25) {
        alertClass = 'table-danger';
      } else if (diffInPerc <= -15) {
        alertClass = 'table-success';
      }
      if (pageData.length > 2) {
        if (pageData[2].change[i][j] <= -20 && pageData[1].change[i][j] <= -20) {
          alertClass = 'bg-danger';
        }
      }
      var htmlToAppend = '<td class="' + alertClass + '">' + currentData.tableData[i][j] + '<sup title="' + diffInPerc + '">(' + sign + diffAbsRound + '%)</sup></td>';

      $('.race__table tbody tr.' + currentData.horsesNames[i]).append(htmlToAppend);
    }
  }
}

function changeFavIcon (state) {
  var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'icon';
  if (state == 'alert') {
    link.href = '/images/faviconalert.ico';
  } else {
    link.href = '/images/favicon.ico';
  };
  document.getElementsByTagName('head')[0].appendChild(link);
}

function calcChange() {
  if (pageData.length > 1) {
    pageData[pageData.length-1].change = [];
    for (var i = 0; i < pageData[pageData.length-1].tableData.length; i++) {
      var diffArray = [];
      for (var j = 0; j < pageData[pageData.length-1].tableData[i].length; j++) {
        var diff = (pageData[pageData.length-1].tableData[i][j] - pageData[pageData.length-2].tableData[i][j]);
        var diffInPerc = (diff / pageData[pageData.length-2].tableData[i][j]) * 100;
        if (!diffInPerc) {diffInPerc = 0};
        diffArray.push(diffInPerc);
      }
      pageData[pageData.length-1].change.push(diffArray);
    }

    pageData[pageData.length-1].winOddsChange = [];
    for (var i = 0; i < pageData[pageData.length-1].winOdds.length; i++) {
      if (pageData[pageData.length-2].winOdds[i] !== '' && pageData[pageData.length-2].winOdds[i].includes('-')) {
        var prevNom = Number(pageData[pageData.length-2].winOdds[i].match(/\d*(?=\-)/gi)[0]);
        var prevDenom = Number(pageData[pageData.length-2].winOdds[i].match(/(?<=\-)\d*/gi)[0]);
        var previousOdds = prevNom / prevDenom;
        var currentNom = Number(pageData[pageData.length-1].winOdds[i].match(/\d*(?=\-)/gi)[0]);
        var currentDenom = Number(pageData[pageData.length-1].winOdds[i].match(/(?<=\-)\d*/gi)[0]);
        var currentOdds = currentNom / currentDenom;
        var diffOdds = currentOdds - previousOdds;
        pageData[pageData.length-1].winOddsChange.push(diffOdds);
      } else {
        pageData[pageData.length-1].winOddsChange.push(0);
      }
    }
  };
  console.log(pageData);
}
