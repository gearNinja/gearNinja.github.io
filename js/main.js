
$(document).ready(() => {
    var v = $(validator);
    v.text(sessionStorage.getItem('api'));
    v.css('color', 'green');

    document.getElementById("apiForm").addEventListener('submit', function (e) {
        setApiKey(document.getElementById('apiText').value);
        e.preventDefault();
    }, true);
    // $('#apiForm').on('submit', (e) => {
    //     let apiText = ($('#apiText').val());
    //     $('#apiForm')[0].reset();
    //     setApiKey(apiText);
    //     e.preventDefault();
    // });
    document.getElementById("searchForm").addEventListener('submit', function (e) {
        getSets(document.getElementById('searchText').value);
        e.preventDefault();
    }, true);
    // $('#searchForm').on('submit', (e) => {
    //     let searchText = ($('#searchText').val());
    //     //showLoader();
    //     getSets(searchText);
    //     e.preventDefault();
    // });
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

    console.log(" nodes: " + xmlDoc.getElementsByTagName("sets").length+"\n\r response.length:" + response.length);
    //console.log(xmlDoc.getElementsByTagName('node'));

    if(xmlDoc.getElementsByTagName("sets").length == 0) {
        setsNotFound();
    } else {
        let output = '';

        $.each(xmlDoc.getElementsByTagName("sets"), (index, set) => {
            //console.log(set);
            output += `
                <div class="col-md-3">
                    <div class="well text-center">
            `;
            $.each(set.getElementsByTagName("largeThumbnailURL"), (index, set1) => {
                output += `
                    <img src="${set1.innerHTML}">
                `;
            })
            $.each(set.getElementsByTagName("name"), (index, set1) => {
                output += `
                    <h5>${set1.innerHTML}</h5>
                `;
            })
            $.each(set.getElementsByTagName("number"), (index, set1) => {
                output += `
                    <h6>${set1.innerHTML}</h6>
                    <a onclick="setSelected('${set1.innerHTML}')" class="btn btn-primary" href="#">Select Set</a>
                    </div>
                </div>
                `;
            })

        })
        $('#sets').html(output);
        //updateDivSize();
    }
}

function setsNotFound() {
    let output = '';
    output += `
        <div class="col-lg-1">
            <div class="well text-center">
                <h2>No sets found for search query</h2>
            </div>
        </div>
    `;
    $('#sets').html(output);
}

function setSelected(id) {
    sessionStorage.setItem('setNumber', id);
    window.location = 'set.html';
    return false;
}

function getSet() {
    let setNumber = sessionStorage.getItem('setNumber');

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
    xhr.open("GET", "https://cryptic-headland-94862.herokuapp.com/https://www.bricklink.com/catalogItemInv.asp?S=" + setNumber + "-1&viewItemType=M", true);
    xhr.setRequestHeader('Content-Type', 'text/html');
    xhr.send();
}

function getSetResponse(response) {
    console.log(response);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response,"text/html");
    console.log(" nodes: " + xmlDoc.getElementsByTagName('tbody').length+"\n\r response.length:" + response.length);

    let output = "";
    const bodies = xmlDoc.getElementsByTagName("tbody");
    const trs = bodies[6].getElementsByTagName("tr");
    $.each(trs, (index, tr) => {
        if(index >= 3) {
            output += `
            <div class="col-md-3">
                <div class="well text-center">
            `;
            const source = tr.getElementsByTagName("td")[0].getElementsByTagName("b")[0].getElementsByTagName("a")[0].getElementsByTagName("img")[0];
            console.log(source.title);
            const figName = source.title.split(" ")[2];
            console.log(figName);
            getFigPrice(figName, index);
            output += `
                <img src="https://img.bricklink.com/ItemImage/MN/0/${figName}.png">
                    <a href="https://www.bricklink.com/v2/catalog/catalogitem.page?M=${figName}#T=P" class="btn btn-primary" target="_blank">${figName}</a>
                    <h6 id="fig${index}">$</h6>
                </div>
            </div>
            `;
        }
    })
    $('#set').html(output);
    updateHeight();
}

function getFigPrice(name, index) {
    let setNumber = sessionStorage.getItem('setNumber');

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
    console.log(" nodes: " + xmlDoc.getElementsByTagName('tbody').length+"\n\r response.length:" + response.length);
    const box = xmlDoc.getElementsByTagName('tbody')[11];
    const price = box.getElementsByTagName('tr')[0].getElementsByTagName('td')[0].getElementsByTagName('table')[0].getElementsByTagName('tbody')[0].getElementsByTagName('tr')[3].getElementsByTagName('td')[1].getElementsByTagName('b')[0].textContent;
    console.log(price.split(" ")[1]);
    const actualPrice = price.split(" ")[1];
    const hs = document.getElementsByTagName("h6");
    console.log(hs);
    document.getElementById("fig" + index).innerHTML = actualPrice;
    totalPrice += parseFloat(actualPrice.substring(1));
    console.log(totalPrice);
    document.getElementById("jumboPrice").innerHTML = "Total Price: $" + Math.round(totalPrice * 100) / 100;
}

$(window).resize(updateHeight);

function updateHeight() {
    var sets = $('#sets img');
    var set = $('#set img');
    var setsWidth = sets.width();
    var setWidth = set.width();

    sets.css('height', setsWidth*1.25);
    set.css('height', setWidth*1.25);
}

function updateDivSize() {
    var div = $('#sets div div');
    var max = 0;
    $.each(div, (index, d) => {
        if(d.offsetHeight > max) {
            max = d.offsetHeight
        }
    })
    console.log(max);
    div.css('height', max);
}
