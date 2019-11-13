
function showPriceResults() {
    document.getElementById("cardPriceList").innerHTML = "";
    document.getElementById("totalPrice").innerText = "";
    var totalPrice = 0;
    //Parse input into JSON for scryfall /card/collection
    var startingQuantityRgx = /^[0-9]* /;
    var nameList = document.getElementById("deckList").value.split('\n').map(name => name.replace(startingQuantityRgx,""));
    //Call /card/collection
    var searchUrl = new URL("https://api.scryfall.com/cards/search");
    var params = {"unique":"prints","order":"usd","dir":"asc"};
    nameList.forEach(name => {
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
        //Output total
        if (price>0) {
            document.getElementById("cardPriceList").innerHTML += "<p>"+name+" -- $"+price+" ("+set+") </p>";
            totalPrice += price;
            document.getElementById("totalPrice").innerText = totalPrice.toFixed(2);
        }
        else {
            var errListHeader=document.getElementById("errListHeader");
            if(typeof(errListHeader) == 'undefined' || errListHeader == null) { 
                document.getElementById("errList").innerHTML += "<p id='errListHeader'>"+"Could not find prices for the following cards: "+"</p>";
            }
            document.getElementById("errList").innerHTML += "<p>"+name+"</p>";
        }
        });        
    });
}

function getPriceToUse(printing) {
    var priceReg = Number(printing.prices.usd)
    var priceFoil = Number(printing.prices.usd_foil)
    if (!priceReg) return priceFoil;
    if (!priceFoil) return priceReg;
    return Math.min(priceFoil,priceReg);
}
