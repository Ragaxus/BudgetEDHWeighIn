
function showPriceResults() {
    document.getElementById("cardPriceList").innerHTML = "";
    document.getElementById("totalPrice").innerText = "";


    var totalPrice = 0;
    //Parse input into JSON for scryfall /card/collection
    var nameList = document.getElementById("deckList").value.split('\n');
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
        while (!(price>0)) {
            var printing = resList[priceIdx];
            if ((printing.prices.usd)&&(printing.set_type != "memorabilia")) {
                price=Number(printing.prices.usd);
                set=printing.set_name;
            }
            else priceIdx++;
        }
        //Output total
        document.getElementById("cardPriceList").innerHTML += "<p>"+name+" -- $"+price+" ("+set+") </p>";
        totalPrice += price;
        document.getElementById("totalPrice").innerText = totalPrice;
        });        
    });
}
