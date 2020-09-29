//------------------------------------------------------------------------------
//Demographic Info Table
//------------------------------------------------------------------------------
function buildTable(dates) {
  var table = d3.select("#summary-table");
  var thead = table.select("thead");
  var tbody = table.select("tbody");
  // remove any children from the tbody and thead
  thead.html("");
  tbody.html("");

  var trow, idx, key, dict_length;
  dict_length = Object.keys(dates).length
  console.log (dates, dict_length);

  trow = tbody.append("tr");
  trow.append("th").text("DEMOGRAPHIC INFO");
  for (idx = 0; idx < dict_length; idx++) {
    key = Object.keys(dates)[idx].toUpperCase();
    trow.append("th").text(key);
  }

  trow = tbody.append("tr");
  trow.append("td").text("Belly Button Data Set 1");
  for (idx = 0; idx < dict_length; idx++) {
    key = Object.keys(dates)[idx];
    value = dates[key];
    trow.append("td").text(value);
  }
}
