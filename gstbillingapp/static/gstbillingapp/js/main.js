var invoice_item_row_counter = 1
var fuse_customers;

// ADDING INVOICE ROWS ===================================================
function add_invoice_item_row() {
    var allFieldsEntered = true;
    
    // Check if any input field in the last row is empty
    $('#invoice-form-items-table-body > tr:last input').each(function() {
        if ($(this).val() === '') {
            allFieldsEntered = false;
            return false; // exit the loop if any field is empty
        }
    });
    
    if (!allFieldsEntered) {
        alert('Please enter all fields in the current row.');
        return; // do not add a new row if any field is empty
    }
    
    var rowCount = $('#invoice-form-items-table-body > tr').length;
    var newRow = $('#invoice-form-items-table-body > tr:last').clone(true);
    
    newRow.find('input').val('');
    newRow.find('td:first').text(rowCount + 1);
    
    newRow.insertAfter('#invoice-form-items-table-body > tr:last');
    
    update_amounts(newRow.find('input[name=invoice-qty]'));
}

function delete_last_invoice_item_row() {
    var rowCount = $('#invoice-form-items-table-body > tr').length;

    if (rowCount <= 1) {
        alert('Cannot delete the last row.');
        return;
    }

    $('#invoice-form-items-table-body > tr:last').remove();

    // Update the serial numbers after deleting a row
    $('#invoice-form-items-table-body > tr').each(function(index) {
        $(this).find('td:first').text(index + 1);
        update_invoice_totals()
        discount()
    });
}

function setup_invoice_rows() {
    $("#invoice-form-addrow").click(function(event) {
        event.preventDefault();
        add_invoice_item_row();
    });
    
    $("#delete-previous-row-btn").click(function(event) {
        event.preventDefault();
        delete_last_invoice_item_row();
    });

    for (var i = 0; i <= -1; i++) {
        add_invoice_item_row();
    }
}


// ====================
// window.alert = function(response , timeout=null){
//     const alert =document.createElement('div');
//     const alertbutton =document.createElement('button');
//     alertbutton.innerText ='OK';
//     alert.classList.add('alert');
//     alert.setAttribute('style',`
//         position: fixed;
//         top :100%;
//         left:50%;
//         padding:10px;
//         border-radius:10px;
//         box-shadow : 0 10px 5px 0 #00000022;
//         display:flex;
//         flex-direction:column;
//     `);
//     alertbutton.setAttribute('style',`
//         border:1px solid #333;
//         background:white;
//         border-radius:5px;
//         padding:5px;
//     `);
//     alert.innerHTML=`<span style="padding:10px">${response}</span>`;
//     alert.appendChild(alertbutton);
//     alertbutton.addEventListener('click',(e)=>{
//         alert.remove();
//     });
//     if(timeout !=null){
//         setTimeout(()=>{
//             alert.remove();
//         },Number(timeout))
//     }
//     document.body.appendChild(alert)
// }


// UPDATING INVOICE TOTALS ================================================

function update_invoice_totals() {

    // amount without gst
    sum_amt_without_gst = 0
    $('input[name=invoice-amt-without-gst]').each(function(){
        sum_amt_without_gst += parseFloat($(this).val());
    });
    $('input[name=invoice-total-amt-without-gst]').val(sum_amt_without_gst.toFixed(2));

    // amount sgst
    sum_amt_sgst = 0
    $('input[name=invoice-amt-sgst]').each(function(){
        sum_amt_sgst += parseFloat($(this).val());
    });
    $('input[name=invoice-total-amt-sgst]').val(sum_amt_sgst.toFixed(2));

    // amount cgst
    sum_amt_cgst = 0
    $('input[name=invoice-amt-cgst]').each(function(){
        sum_amt_cgst += parseFloat($(this).val());
    });
    $('input[name=invoice-total-amt-cgst]').val(sum_amt_cgst.toFixed(2));

    // amount igst
    sum_amt_igst = 0
    $('input[name=invoice-amt-igst]').each(function(){
        sum_amt_igst += parseFloat($(this).val());
    });
    $('input[name=invoice-total-amt-igst]').val(sum_amt_igst.toFixed(2));

    sum_amt_with_gst = 0
    $('input[name=invoice-amt-with-gst]').each(function(){
        sum_amt_with_gst += parseFloat($(this).val());
    });
    $('input[name=invoice-total-amt-with-gst]').val(sum_amt_with_gst.toFixed(2));
    
    // total_with_discount=0
    // let discount = parseFloat($('input[name=invoice-discount]').val());
    // //alert(discount)
    // if (!isNaN(discount) && discount > 0) {
    //     let total_with_discount = sum_amt_with_gst - discount;
    //     $('input[name=invoice-total-amt-with-discount]').val(total_with_discount.toFixed(2));
    //     console.log(total_with_discount)
    // }
   
   

}
function discount(){
    var discount_amount = parseFloat($('input[name=invoice-discount]').val()); // Retrieve the discount amount from the input field
    console.log(sum_amt_with_gst)
    var total_amount_after_discount = sum_amt_with_gst - discount_amount;
    $('input[name=invoice-total-amt-with-discount]').val(total_amount_after_discount.toFixed(2));
    update_invoice_totals()
    console.log(total_amount_after_discount)
}


// AUTO CALCULATE ITEM AMOUNTS =============================================

function initialize_auto_calculation(){
    $.ajaxSetup({
        headers: { "X-CSRFToken": getCookie("csrftoken") }
    });
    update_amounts($('#invoice-form-items-table-body input[name=invoice-qty]:first'));
    $('input[name=invoice-qty], input[name=invoice-gst-percentage], input[name=invoice-rate-with-gst]').change(function (){
        update_amounts($(this));
    });
}
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Extract the CSRF token from the cookie
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


// function update_amounts(element){
//     var product = element.parent().parent().find('input[name=invoice-product]').val();
//     var qty = parseInt(element.parent().parent().find('input[name=invoice-qty]').val());
//     var rate_with_gst = parseFloat(element.parent().parent().find('input[name=invoice-rate-with-gst]').val());
//     var gst_percentage = parseFloat(element.parent().parent().find('input[name=invoice-gst-percentage]').val());
//     //var discount=parseFloat(element.parent().parent().find('input[name=invoice-discount-amount]').val());
//     var rate_without_gst = (rate_with_gst * 100.0) / (100.0 + gst_percentage);
//     var amt_without_gst = rate_without_gst * qty;
    

//     var sgst;
//     var cgst;
//     var igst;
//     if(product == ""){
//         sgst = 0;
//         cgst = 0;
//         igst = 0;
//         amt_without_gst = 0;
//     }
//     else {
//         if($('input[name=igstcheck]').is(':checked')){
//             sgst = 0;
//             cgst = 0;
//             igst = amt_without_gst * gst_percentage / 100;
//         }
//         else {
//             sgst = amt_without_gst * gst_percentage / 200;
//             cgst = amt_without_gst * gst_percentage / 200;
//             igst = 0;

//         }
//     }
//     var amt_with_gst = amt_without_gst + cgst + sgst + igst;

//     element.parent().parent().find('input[name=invoice-rate-without-gst]').val(rate_without_gst.toFixed(2));
//     element.parent().parent().find('input[name=invoice-amt-without-gst]').val(amt_without_gst.toFixed(2));
//     element.parent().parent().find('input[name=invoice-amt-sgst]').val(sgst.toFixed(2));
//     element.parent().parent().find('input[name=invoice-amt-cgst]').val(cgst.toFixed(2));
//     element.parent().parent().find('input[name=invoice-amt-igst]').val(igst.toFixed(2));
//     element.parent().parent().find('input[name=invoice-amt-with-gst]').val(amt_with_gst.toFixed(2));

//     update_invoice_totals();

// }
function update_amounts(element) {
    var product = element.parent().parent().find('input[name=invoice-product]').val();
    var qty = parseInt(element.parent().parent().find('input[name=invoice-qty]').val());

    // Check quantity availability in inventory
    if (qty > 0 && product !== "") {
        // Perform AJAX request to check inventory
        $.ajax({
            url: '/check_inventory/',
            method: 'POST',
            data: { 'product': product, 'qty': qty },
            success: function(response) {
                if (response.available) {
                    var currentStock = response.current_stock;

                    // Quantity is available, perform calculations
                    var rate_with_gst = parseFloat(element.parent().parent().find('input[name=invoice-rate-with-gst]').val());
                    var gst_percentage = parseFloat(element.parent().parent().find('input[name=invoice-gst-percentage]').val());
                    //var discount=parseFloat(element.parent().parent().find('input[name=invoice-discount-amount]').val());
                    var rate_without_gst = (rate_with_gst * 100.0) / (100.0 + gst_percentage);
                    var amt_without_gst = rate_without_gst * qty;

                    var sgst;
                    var cgst;
                    var igst;

                    if ($('input[name=igstcheck]').is(':checked')) {
                        sgst = 0;
                        cgst = 0;
                        igst = amt_without_gst * gst_percentage / 100;
                    } else {
                        sgst = amt_without_gst * gst_percentage / 200;
                        cgst = amt_without_gst * gst_percentage / 200;
                        igst = 0;
                    }

                    var amt_with_gst = amt_without_gst + cgst + sgst + igst;

                    element.parent().parent().find('input[name=invoice-rate-without-gst]').val(rate_without_gst.toFixed(2));
                    element.parent().parent().find('input[name=invoice-amt-without-gst]').val(amt_without_gst.toFixed(2));
                    element.parent().parent().find('input[name=invoice-amt-sgst]').val(sgst.toFixed(2));
                    element.parent().parent().find('input[name=invoice-amt-cgst]').val(cgst.toFixed(2));
                    element.parent().parent().find('input[name=invoice-amt-igst]').val(igst.toFixed(2));
                    element.parent().parent().find('input[name=invoice-amt-with-gst]').val(amt_with_gst.toFixed(2));

                    update_invoice_totals();
                } else {
                    var currentStock = response.current_stock;
                    
                    // Quantity is not available, display an alert or handle the out-of-stock scenario
                    alert("Out of stock current stock is  " + currentStock 
                    );
                }
            },
            error: function() {
                // Error handling for the AJAX request
                alert("Error checking inventory");
            }
        });
    } 

}

// function update_amounts(element) {
//     var product = element.parent().parent().find('input[name=invoice-product]').val();
//     var qty = parseInt(element.parent().parent().find('input[name=invoice-qty]').val());
//     var rate_with_gst = parseFloat(element.parent().parent().find('input[name=invoice-rate-with-gst]').val());
//     var gst_percentage = parseFloat(element.parent().parent().find('input[name=invoice-gst-percentage]').val());

//     // Perform inventory check
//     if (product !== "") {
//         $.ajax({
//             url: '/check_inventory',
//             method: 'GET',
//             data: { product: product },
//             success: function(response) {
//                 if (response.available) {
//                     // Product is available in inventory
//                     var rate_without_gst = (rate_with_gst * 100.0) / (100.0 + gst_percentage);
//                     var amt_without_gst = rate_without_gst * qty;
//                     var sgst, cgst, igst;

//                     if ($('input[name=igstcheck]').is(':checked')) {
//                         sgst = 0;
//                         cgst = 0;
//                         igst = amt_without_gst * gst_percentage / 100;
//                     } else {
//                         sgst = amt_without_gst * gst_percentage / 200;
//                         cgst = amt_without_gst * gst_percentage / 200;
//                         igst = 0;
//                     }

//                     // Update the corresponding input fields in the table row with the calculated values
//                     element.parent().parent().find('input[name=invoice-rate-without-gst]').val(rate_without_gst.toFixed(2));
//                     element.parent().parent().find('input[name=invoice-amt-without-gst]').val(amt_without_gst.toFixed(2));
//                     element.parent().parent().find('input[name=invoice-amt-sgst]').val(sgst.toFixed(2));
//                     element.parent().parent().find('input[name=invoice-amt-cgst]').val(cgst.toFixed(2));
//                     element.parent().parent().find('input[name=invoice-amt-igst]').val(igst.toFixed(2));
//                     element.parent().parent().find('input[name=invoice-amt-with-gst]').val(amt_with_gst.toFixed(2));
//                     // Update other input fields accordingly

//                     // Update invoice totals
//                     update_invoice_totals();
//                 } else {
//                     // Product is out of stock
//                     console.log("Product is out of stock");
//                     // Display appropriate message to the user
//                     showMessage("Product '" + product + "' is out of stock. Please check and re-enter.");
//                 }
//             },
//             error: function(xhr, status, error) {
//                 console.log("Error occurred during inventory check");
//                 // Display error message to the user
//                 showMessage("Error occurred during inventory check. Please try again later.");
//             }
//         });
//     }
// }


// CUSTOMER SEARCH ========================================================

function customer_result_to_domstr(result) {
    var domstr =
      "<div class='customer-search-result' data-customer='" +
      JSON.stringify(result) +
      "'>" +
      "<div>" + result['customer_name'] + "</div>" +
      "<div>" + result['customer_address'] + "</div>" +
      "<div>" + result['customer_phone'] + "</div>" +
      "<div>" + result['customer_gst'] + "</div>" +
      
      "</div>";
    return domstr;
  }
  
  function customer_result_click() {
    console.log("UPDATE THE FORM WITH SEARCH RESULT");
    var customer_data_json = JSON.parse($(this).attr('data-customer'));
    $('#customer-name-input').val(customer_data_json['customer_name']);
    $('#customer-address-input').val(customer_data_json['customer_address']);
    $('#customer-phone-input').val(customer_data_json['customer_phone']);
    $('#customer-gst-input').val(customer_data_json['customer_gst']);
    
  }
  
  
  
  
function initialize_fuse_customers_search_bar() {
    console.log("INITIALIZING CUSTOMER SEARCH");

    $(".customer_search_area").focusin(function() {
        $("#customer_search_bar").show();
        var input = $('.customer_search_input');
        var val = input.val();
        update_customer_search_bar(val);
    });

    $(document).bind('focusin click',function(e) {
        if ($(e.target).closest('#customer_search_bar, .customer_search_area').length) return;
        $('#customer_search_bar').hide();
    });

    $(".customer_search_input").on("input", function(e) {
        $("#customer_search_bar").show();
        var input = $(this);
        var val = input.val();
        update_customer_search_bar(val);
    });
}

function update_customer_search_bar(search_string){
    console.log("Update customer search bar with query: " + search_string);
    results = fuse_customers.search(search_string);
    // console.log(results);
    $("#customer_search_bar").empty();
    for (var i = 0; i < results.length; i++) {
        $("#customer_search_bar").append(customer_result_to_domstr(results[i]));
    }
    $('.customer-search-result').click(customer_result_click);
}


function initialize_fuse_customers () {
    // fetch customer data
    $.getJSON( "/customersjson", function( data ) {
        var fuse_customer_options = {
            shouldSort: true,
            threshold: 0.6,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: [
            "customer_name",
            "customer_address",
            "customer_gst",
            ]
        };
        fuse_customers = new Fuse(data, fuse_customer_options);

        // initialize the search bar
        initialize_fuse_customers_search_bar();
    });
}


// PRODUCT SEARCH ========================================================

var selected_item_input;

function product_result_to_domstr(result) {
    var domstr = "<div class='product-search-result' data-product='" + JSON.stringify(result) + "'>"+
        "<div>"+ result['product_name'] + "</div>" +
        "<div>"+ result['product_hsn'] + " | " + result['product_unit'] + " | " + result['product_gst_percentage'] + "</div>";

    // Check if the product's current_stock is available
    // if (result['available_in_stock']) {
    //     domstr += "<div>Stock Available: " + result['current_stock'] + "</div>";
    // } else {
    //     domstr += "<div>Out of Stock</div>";
    // }
    
    domstr += "</div>";
    return domstr;
}


function product_result_click() {
    console.log("UPDATE THE FORM WITH SEARCH RESULT");
    product_data_json = JSON.parse($(this).attr('data-product'));
    selected_item_input.val(product_data_json['product_name']);
    selected_item_input.parent().parent().find('input[name=invoice-hsn]').val(product_data_json['product_hsn']);    
    selected_item_input.parent().parent().find('input[name=invoice-unit]').val(product_data_json['product_unit']);    
    selected_item_input.parent().parent().find('input[name=invoice-rate-with-gst]').val(product_data_json['product_rate_with_gst']);    
    selected_item_input.parent().parent().find('input[name=invoice-gst-percentage]').val(product_data_json['product_gst_percentage']);    

    // $('#customer-address-input').val(customer_data_json['customer_address']);
    // $('#customer-phone-input').val(customer_data_json['customer_phone']);
    // $('#customer-gst-input').val(customer_data_json['customer_gst']);
}

function initialize_fuse_product_search_bar() {
    console.log("INITIALIZING PRODUCT SEARCH");

    $(".product_search_area").focusin(function() {
        console.log("DISPLAY PRODUCT SEARCH");
        $("#product_search_bar").show();
        var input = $( this );
        selected_item_input = input;
        var val = input.val();
        update_product_search_bar(val);
    });

    $(document).bind('focusin click',function(e) {
        if ($(e.target).closest('#product_search_bar, .product_search_area').length) return;
        $('#product_search_bar').hide();
    });

    $(".product_search_input").on("input", function(e) {
        $("#product_search_bar").show();
        var input = $(this);
        var val = input.val();
        update_product_search_bar(val);
    });
}


function update_product_search_bar(search_string) {
    console.log("Update product search bar with query: " + search_string);
    results = fuse_products.search(search_string);
    console.log(results);
  
    $("#product_search_bar").empty();
  
    for (var i = 0; i < results.length; i++) {
      var product = results[i];
      var productId = product['id'];
  
      // Check if the product's current_stock is greater than 0
      // Skip the product if the stock is 0
      if (isProductStockAvailable(productId)) {
        product['available_in_stock'] = true;
        product['current_stock'] = getCurrentStock(productId);
        $("#product_search_bar").append(product_result_to_domstr(product));
      }
    }
  
    $('.product-search-result').click(product_result_click);
  }
  
  
  function isProductStockAvailable(productId) {
    var stockAvailable = false;
    $.ajax({
      url: '/inventory/check_stock/?product_id=' + productId,
      method: 'GET',
      data: { product_id: productId },
      async: false,
      success: function(response) {
        stockAvailable = response.stock_available;
        console.log(stockAvailable)
      }
    });
    return stockAvailable;
  }
  
  function getCurrentStock(request) {
    var currentStock = 0;
  
    $.ajax({
      url: '/inventory/get_stock/',
      method: 'GET',
      success: function(response) {
        console.log(response); // Check the raw response in the console
        
        try {
          var stock_data = JSON.parse(response);
          console.log(stock_data); // Verify the parsed stock data in the console
  
          // Iterate over the stockData array and access the product_name and current_stock attributes
          for (var i = 0; i < stock_data.length; i++) {
            var product = stock_data[i];
            var productName = product.product_name;
            var currentStock = product.current_stock;
        
            console.log(productName, currentStock); // Check the values in the console
  
            // Further processing or display of stock data
          }
        } catch (error) {
          console.log('Error parsing JSON:', error);
        }
      },
      error: function(error) {
        console.log('AJAX error:', error); // Handle any AJAX errors
      }
    });
  }
  
   


function initialize_fuse_products () {
    // fetch customer data
    $.getJSON( "/productsjson", function( data ) {
        var fuse_product_options = {
            shouldSort: true,
            threshold: 0.6,
            location: 0,
            distance: 100,
            maxPatternLength: 32,
            minMatchCharLength: 1,
            keys: [
            "product_name",
            ]
        };
        fuse_products = new Fuse(data, fuse_product_options);
        // initialize the search bar
        initialize_fuse_product_search_bar();
    });
}


//=============inventory search ================
var selected_item_input;

function inventory_result_to_domstr(result) {
    var domstr = "<div class='inventory-search-result' data-product='" + JSON.stringify(result) + "'>" +
        "<div>" + result.product_name + "</div>" +
        "<div>" + "Current Stock: " + result.current_stock + "</div>" +
        "<div>" + "Alert Level: " + result.alert_level + "</div>" +
        "</div><br>";
    return domstr;
}

function inventory_result_click() {
    console.log("UPDATE THE FORM WITH INVENTORY SEARCH RESULT");
    var productData = JSON.parse($(this).attr('data-product'));
    selected_item_input.val(productData.product_name);
    selected_item_input.parent().parent().find('input[name=inventory-current-stock]').val(productData.current_stock);
    selected_item_input.parent().parent().find('input[name=inventory-alert-level]').val(productData.alert_level);
}

function initialize_fuse_inventory_search_bar() {
    console.log("INITIALIZING INVENTORY SEARCH");

    $(".inventory_search_area").focusin(function () {
        console.log("DISPLAY INVENTORY SEARCH");
        $("#inventory_search_bar").show();
        var input = $(this);
        selected_item_input = input;
        var val = input.val();
        update_inventory_search_bar(val);
    });

    $(document).bind('focusin click', function (e) {
        if ($(e.target).closest('#inventory_search_bar, .inventory_search_area').length) return;
        $('#inventory_search_bar').hide();
    });

    $(".inventory_search_input").on("input", function (e) {
        $("#inventory_search_bar").show();
        var input = $(this);
        var val = input.val();
        update_inventory_search_bar(val);
    });
}

function update_inventory_search_bar(search_string) {
    console.log("Update inventory search bar with query: " + search_string);
    $.getJSON("/inventoryjson", function (data) {
        var results = fuse_inventory_data.search(search_string);
        console.log(results);
        $("#inventory_search_bar").empty();
        for (var i = 0; i < results.length; i++) {
            var result = results[i].item;
            $("#inventory_search_bar").append(inventory_result_to_domstr(result));
        }
        $('.inventory-search-result').click(inventory_result_click);
    });
}

function initialize_fuse_inventory() {
    // initialize the search bar
    initialize_fuse_inventory_search_bar();
}

$(document).ready(function () {
    initialize_fuse_inventory();
});


// START =============================================================

$(document).ready(function() {

    // Initialize invoice row addition
    setup_invoice_rows();

    // Initialize customer search
    initialize_fuse_customers();

    // Initialize product search
    initialize_fuse_products();

    // Initialize auto calculation of amounts
    initialize_auto_calculation();
    
    
    initialize_fuse_inventory();
    // Initialize igst toggle
    $("input[name=igstcheck]").change(function() {
            $('input[name=invoice-qty]').each(function(){
                update_amounts($( this ));
            });
    });

    // Show the invoice form
    $("#invoice-form")[0].hidden = false;

});
