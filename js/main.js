
$('#apiForm').bind("submit", function() {
        setApiKey(document.getElementById('apiText').value);
        return false;
});

$('#searchForm').bind("submit", function() {
        getSets(document.getElementById('searchText').value);
        return false;
});

var totalPrice = 0;

function setApiKey(apiText) {
    testApiKey(apiText);
    sessionStorage.setItem('api', apiText);
}

function testApiKey(apiText) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                changeKeyStatus(xhr.response);
            }
        }
    }
    xhr.open("GET", "https://cryptic-headland-94862.herokuapp.com/http://brickset.com/api/v2.asmx/checkKey?apiKey=" + apiText, true);
    xhr.setRequestHeader('Content-Type', 'text/xml');
    xhr.send();
}

function changeKeyStatus(response) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response,"text/html");
    const str = xmlDoc.getElementsByTagName("string")[0];
    var v = $(validator);
    if(str.textContent == "OK") {
        v.text("Valid API Key");
        v.css('color', 'green');
    } else {
        v.text("Invalid API Key");
        v.css('color', 'red');
    }
}

function getSets(searchText) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                getSetsResponse(xhr.response);
            } else {
                setsNotFound();
            }
        } else {

        }
    }
    var mykey = sessionStorage.getItem('api');
    xhr.open("GET", "https://cryptic-headland-94862.herokuapp.com/http://brickset.com/api/v2.asmx/getSets?apiKey=" + mykey + "&userHash=&query=" + searchText + "&theme=&subtheme=&setNumber=&year=&owned=&wanted=&orderBy=&pageSize=&pageNumber=&userName=", true);
    xhr.setRequestHeader('Content-Type', 'text/xml');
    xhr.send();
}

function getSetsResponse(response) {
    //console.log(response);
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(response,"text/xml");
    //console.log(xmlDoc);

    //console.log(" nodes: " + xmlDoc.getElementsByTagName("sets").length+"\n\r response.length:" + response.length);
    //console.log(xmlDoc.getElementsByTagName('node'));

    if(xmlDoc.getElementsByTagName("sets").length == 0) {
        setsNotFound();
    } else {
        var thisOutput = '';
        var sets = xmlDoc.getElementsByTagName("sets");
        //console.log(sets);
        var setsLength = sets.length;
        for(var i = 0; i < setsLength; i++) {
            //console.log(sets[i]);
            var setUrl = sets[i].getElementsByTagName("largeThumbnailURL")[0].innerHTML;
            var setName = sets[i].getElementsByTagName("name")[0].innerHTML;
            var setNumber = sets[i].getElementsByTagName("number")[0].innerHTML;
            //console.log(setUrl);
            thisOutput += `
                    <div class="col-sm-3">
                        <div class="well text-center">
                            <img src="${setUrl}">
                            <h5>${setName}</h5>
                            <h6>${setNumber}</h6>
                            <a onclick="setSelected(${setNumber})" class="btn btn-primary" href="#">Select Set</a>
                        </div>
                    </div>
            `;
        }
        $('#sets').html(thisOutput);
        initialDivSize();
    }
}

function setsNotFound() {
    var thisOutput = '';
    thisOutput += `
        <div class="col-lg-1">
            <div class="well text-center">
                <h2>No sets found for search query</h2>
            </div>
        </div>
    `;
    $('#sets').html(thisOutput);
}

function setSelected(id) {
    sessionStorage.setItem('setNumber', id);
    window.location = 'set.html';
    return false;
}

function getSet() {
    var setNumber = sessionStorage.getItem('setNumber');

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                getSetResponse(xhr.response);
            } else {
                setsNotFound();
            }
        } else {

        }
    }
    //console.log("SET NUMBER: " + setNumber);
    xhr.open("GET", "https://cryptic-headland-94862.herokuapp.com/https://www.bricklink.com/catalogItemInv.asp?S=" + setNumber + "-1&viewItemType=M", true);
    xhr.setRequestHeader('Content-Type', 'text/html');
    xhr.send();
}

function getSetResponse(response) {
    //console.log(response);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response,"text/html");
    //console.log(" nodes: " + xmlDoc.getElementsByTagName('tbody').length+"\n\r response.length:" + response.length);
    var thisOutput = "";
    const bodies = xmlDoc.getElementsByTagName("tbody");
    const trs = bodies[6].getElementsByTagName("tr");
    for(var index = 0; index < trs.length; index++) {
        var tr = trs[index];
        //console.log(tr);
        if(index >= 3) {
            thisOutput += `
            <div class="col-md-3">
                <div class="well text-center">
            `;
            const source = tr.getElementsByTagName("td")[0].getElementsByTagName("b")[0].getElementsByTagName("a")[0].getElementsByTagName("img")[0];
            //console.log(source.title);
            const figName = source.title.split(" ")[2];
            var realFigName = source.title.split(" ")[4];
            for(var i = 5; i < source.title.split(" ").length; i++) {
                realFigName += " " + source.title.split(" ")[i];
            }
            //console.log(realFigName);
            getFigPrice(figName, index);
            thisOutput += `
                <img src="https://img.bricklink.com/ItemImage/MN/0/${figName}.png">
                    <a href="https://www.bricklink.com/v2/catalog/catalogitem.page?M=${figName}#T=P" class="btn btn-primary" target="_blank">${figName}</a>
                    <h6 id="fig${index}">$</h6>
                </div>
            </div>
            `;
        }
    }
    $('#set').html(thisOutput);
    updateHeight();
}

function getFigPrice(name, index) {
    var setNumber = sessionStorage.getItem('setNumber');

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                getFigPriceResponse(xhr.response, index);
            }
        }
    }
    xhr.open("GET", "https://cryptic-headland-94862.herokuapp.com/https://www.bricklink.com/catalogPG.asp?M=" + name, true);
    xhr.setRequestHeader('Content-Type', 'text/html');
    xhr.send();
}

function getFigPriceResponse(response, index) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response,"text/html");
    //console.log(" nodes: " + xmlDoc.getElementsByTagName('tbody').length+"\n\r response.length:" + response.length);
    const box = xmlDoc.getElementsByTagName('tbody')[11];
    const price = box.getElementsByTagName('tr')[0].getElementsByTagName('td')[0].getElementsByTagName('table')[0].getElementsByTagName('tbody')[0].getElementsByTagName('tr')[3].getElementsByTagName('td')[1].getElementsByTagName('b')[0].textContent;
    //console.log(price.split(" ")[1]);
    const actualPrice = price.split(" ")[1];
    const hs = document.getElementsByTagName("h6");
    //console.log(hs);
    document.getElementById("fig" + index).innerHTML = actualPrice;
    totalPrice += parseFloat(actualPrice.substring(1));
    //console.log(totalPrice);
    document.getElementById("jumboPrice").innerHTML = "Total Minifigure Price: $" + Math.round(totalPrice * 100) / 100;
}

function getPartOutValue() {
    var setNumber = sessionStorage.getItem('setNumber');

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                getPartOutValueResponse(xhr.response);
            } else {
                setsNotFound();
            }
        } else {

        }
    }
    //console.log("SET NUMBER: " + setNumber);
    xhr.open("GET", "https://cryptic-headland-94862.herokuapp.com/https://www.bricklink.com/catalogPOV.asp?itemType=S&itemNo=" + setNumber + "&itemSeq=1&itemQty=1&breakType=M&itemCondition=N&incInstr=Y", true);
    xhr.setRequestHeader('Content-Type', 'text/html');
    xhr.send();
}

function getPartOutValueResponse(response) {
    //console.log(response);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response,"text/html");
    console.log(" nodes: " + xmlDoc.getElementsByTagName('tbody').length+"\n\r response.length:" + response.length);
    var thisOutput = "";
    const partOutPrice = xmlDoc.getElementsByTagName("font")[5].getElementsByTagName("b")[0].textContent.split("$")[1];
    document.getElementById("jumboTotalPrice").innerHTML = "Total Part-Out Price: $" + partOutPrice;
}

$(window).resize(updateHeight);
$(window).resize(updateDivSize);


function updateHeight() {
    //var sets = $('#sets img');
    var set = $('#set img');
    //var setsWidth = sets.width();
    var setWidth = set.width();

    //sets.css('height', setsWidth*1.25);
    set.css('height', setWidth*1.25);
}

function initialDivSize() {
    setTimeout(function () {
        //alert("Hello");
    }, 2000);
    var div = $('#sets div div');
    var max = 0;
    for(var index = 0; index < div.length; index++) {
        console.log("HEIGHT " + index + ": " + div[index].offsetHeight);
        if(div[index].offsetHeight > max) {
            max = div[index].offsetHeight;
        }
    }
    console.log("MAX: " + max);
    div.css('height', max);
}

function updateDivSize() {
    var div = $('#sets div div');
    div.css('height', "");
    var max = 0;
    for(var index = 0; index < div.length; index++) {
        if(div[index].offsetHeight > max) {
            max = div[index].offsetHeight;
            console.log(div[index].offsetHeight);
        }
    }
    console.log("MAX: " + max);
    div.css('height', max);
}
