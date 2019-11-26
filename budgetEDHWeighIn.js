var basicLands = ["Plains", "Island", "Swamp", "Mountain", "Forest"]

function showPriceResults() {
    document.getElementById("saveResults").disabled = true;
    document.getElementById("cardPriceList").innerHTML = "";
    document.getElementById("totalPrice").innerText = "";
    var totalPrice = 0;
    //Parse input into JSON for scryfall /card/collection
    var startingQuantityRgx = /^[0-9]* /;
    var nameList = document.getElementById("deckList").value.split('\n').map(name => name.replace(startingQuantityRgx,""));
    var namePromiseList = [];
    //Call /card/collection
    var searchUrl = new URL("https://api.scryfall.com/cards/search");
    var params = {"unique":"prints","order":"usd","dir":"asc"};
    var cardResultArr = [];
    var hasAlerted = false;

    var limit=30.0;
    var errMsg = "you fool. you absolute baffoon. You think you can challenge me in my own realm? you think you can rebel against the agreed upon deck price limit, which is $"+limit+"? you dare come into my house and upturn my dining chairs and spill coffee grounds in my Keurig? you thought you were safe in your chain mail armor behind that screen of yours. I will take these laminate wood floor boards and destroy you. i didnt want war. but i didnt start it"

    namePromiseList = nameList.filter(name => !basicLands.includes(name)).map(name => { return new Promise( function(res,rej) {
        var price=0;
        var set;
        params["q"] = "!\""+name+"\"";
        searchUrl.search = new URLSearchParams(params).toString();
        fetch(searchUrl).then(response => response.json()).then( response => {
        //Make list of cards by lowest price (excluding sets that we don't want to consider)
        var resList = response.data;
        var priceIdx=0;
        var priceToUse=0;
        if (resList) {
            while ((!(price>0))&&(priceIdx<resList.length)) {
                var printing = resList[priceIdx];
                priceToUse=getPriceToUse(printing)
                if ((priceToUse)&&(printing.set_type != "memorabilia")) {
                    price=Number(priceToUse);
                    set=printing.set_name;
                }
                else priceIdx++;
            }
        }
        //Update running total and cache result
        if (price>0) {
            totalPrice += price;
            if ((totalPrice>limit) && !hasAlerted) {hasAlerted=true; alert(errMsg)};
            document.getElementById("totalPrice").innerText = totalPrice.toFixed(2);
            cardResultArr.push({"name": name, "price": price, "set":set});
        }
        else {
            var errListHeader=document.getElementById("errListHeader");
            if(typeof(errListHeader) == 'undefined' || errListHeader == null) { 
                document.getElementById("errList").style.visibility="visible";
                document.getElementById("errList").innerHTML += "<p id='errListHeader'>"+"Could not find prices for the following cards: "+"</p>";
            }
            document.getElementById("errList").innerHTML += "<p>"+name+"</p>";
        }
        res(1);
        })});        
    });
    Promise.all(namePromiseList).then(function (vals) {
        var sortMethod;
        if (document.getElementById("sortExpensiveFirst").checked) {
            sortMethod = function(a,b) { return (a.price < b.price) ? 1 : -1};
        }
        else {
            sortMethod = function(a,b) { return (a.price > b.price) ? 1 : -1};
        }
        cardResultArr.sort(sortMethod);
        cardResultArr.map(result => {
            var parg = document.createElement("p");
            parg.appendChild(document.createTextNode(result.name+" -- $"+result.price+" ("+result.set+")"));
            document.getElementById("cardPriceList").appendChild(parg);
        });

        document.getElementById("totalPrice").innerText += ", as of "+new Date().toLocaleString();
        document.getElementById("saveResults").disabled = false;
    });
}

function getPriceToUse(printing) {
    var priceReg = Number(printing.prices.usd)
    var priceFoil = Number(printing.prices.usd_foil)
    if (!priceReg) return priceFoil;
    if (!priceFoil) return priceReg;
    return Math.min(priceFoil,priceReg);
}

function saveResults() {
    html2canvas(document.getElementById("results")).then(function(canvas) {
        canvas.toBlob(function (blob) {
            saveAs(blob, "screenshot.png");
        })
    });
}


