// Adding the required libraries
const express = require('express');
const path = require('path');

const {check, validationResult, body} = require('express-validator');

var app = express();

app.use(express.urlencoded({extended:false}));

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname+'/public'));
app.set('view engine', 'ejs');

app.get('/',function(req, res){
    res.render('main');
});
// Regex expressions for validations
var emailRegex = /^[\S]+@[\S]+\.com$/;
var phoneRegex = /^[1-9][0-9]{9}$/;
var quantityRegex = /^[1-9][0-9]{0,}$/;

// Function to compare regex
function compareRegex(input, regex){
    if(regex.test(input)){
        return true;
    }
    else{
        return false;
    }
}
// Function to validate email
function validateEmail(value){
    if(!value){
        throw new Error("Please enter your email");
    }
    else{
    if(!compareRegex(value, emailRegex)){
        throw new Error("Please enter a valid email in test@test.com format");
    }
    return true;
    }
}
// Function to validate phone number
function validatePhone(value){
    if(!value){
        throw new Error("Please enter phone number");
    }
    else{
    if(!compareRegex(value, phoneRegex)){
        throw new Error("Please enter a valid phone in 5198201234 format");
    }
    return true;
    }
}
// Function to validate province
function validateProvince(value){
    if(value == 'Select'){
        throw new Error("Please select a province");
    }
    else
    {
    return true;
    }
}
// Function to validate quantity
function validateQuantity(value, {req}){
    if (value){
        if(!compareRegex(value, quantityRegex)){
            throw new Error("Please enter a valid quantity");
        }
        else {
            return true;}
    }
    else { return true; }
}
var burger;
var pizza;
var coffee;
var pasta;
var sandwich;
// Product prices declaration
var burgerPrice = 7.00;
var pizzaPrice = 13.00;
var coffeePrice = 4.00;
var pastaPrice = 7.00;
var sandwichPrice = 6.00;
// Function to validate if minimum selection is 10$
function validateProductSelection(value, {req}){
    burger = (compareRegex(req.body.burger, quantityRegex)) ? req.body.burger : 0;
    pizza = (compareRegex(req.body.pizza, quantityRegex)) ? req.body.pizza : 0;
    coffee = (compareRegex(req.body.coffee, quantityRegex)) ? req.body.coffee : 0;
    pasta = (compareRegex(req.body.pasta, quantityRegex)) ? req.body.pasta : 0;
    sandwich = (compareRegex(req.body.sandwich, quantityRegex)) ? req.body.sandwich : 0;
    var total = 0;
    if (burger == 0 && pizza == 0 && coffee == 0 && pasta == 0 && sandwich == 0){
        throw new Error("Please select atleast one product");
    }
    else {
        total = (burger * burgerPrice) + (pizza * pizzaPrice) + (coffee * coffeePrice) + (pasta * pastaPrice) + (sandwich * sandwichPrice);
    }
    if(total < 10){
        throw new Error("Please select products worth atleast 10$");
    }
    else { return true; }
}
// Function to find the selected products and quantity
var selectedProducts;
function addSelectedProducts(){
    selectedProducts = [];
    if (burger != 0) {selectedProducts.push(['Burger', burgerPrice.toFixed(2) , burger]);}
    if (pizza != 0) {selectedProducts.push(['Pizza', pizzaPrice.toFixed(2) , pizza]);}
    if (coffee != 0) {selectedProducts.push(['Coffee', coffeePrice.toFixed(2) , coffee]);}
    if (pasta != 0) {selectedProducts.push(['Pasta', pastaPrice.toFixed(2) , pasta]);}
    if (sandwich != 0) {selectedProducts.push(['Sandwich', sandwichPrice.toFixed(2) , sandwich]);}
}
// Adding form validation and sending error response
app.post('/process',[
    check('name', 'Please enter your name').not().isEmpty(),
    check('address', 'Please enter your address').not().isEmpty(),
    check('phoneNumber').custom(validatePhone),
    check('city', 'Please enter your city').not().isEmpty(),
    check('email').custom(validateEmail),
    check('province').custom(validateProvince),
    check('burger').custom(validateQuantity),
    check('pizza').custom(validateQuantity),
    check('coffee').custom(validateQuantity),
    check('pasta').custom(validateQuantity),
    check('sandwich').custom(validateQuantity),
    check('selection').custom(validateProductSelection)
], function(req,res){
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        res.render('main',{error: errors.array()
       });
    }
    else
    {
        var name = req.body.name;
        var address = req.body.address;
        var phoneNumber = req.body.phoneNumber;
        var city = req.body.city;
        var email = req.body.email;
        var province = req.body.province;
        addSelectedProducts();
        // Finding tax rate for each province
        switch (province){
            case('Alberta'):
                taxRate = 0.05;
                break;
            case('British Columbia'):
                taxRate = 0.12;
                break;
            case('Mantioba'):
                taxRate = 0.12;
                break;
            case('New-Brunswick'):
                taxRate = 0.15;
                break;
            case('Newfoundland & Labrador'):
                taxRate = 0.15;
                break;
            case('Northwest Territories'):
                taxRate = 0.13;
                break;
            case('Nova Scotia'):
                taxRate = 0.11;
                break;
            case('Nunavut'):
                taxRate = 0.13;
                break;
            case('Ontario'):
                taxRate = 0.13;
                break;
            case('Prince Edward Island'):
                taxRate = 0.11;
                break;
            case('Quebec'):
                taxRate = 0.13;
                break;
            case('Saskatchewan'):
                taxRate = 0.13;
                break;
            case('Yukon'):
                taxRate = 0.11;
                break;
            default:
                break;
            }
        // Calculating the price    
        var totalPrice = (burger * burgerPrice) + (pizza * pizzaPrice) + (coffee * coffeePrice) + (pasta * pastaPrice) + (sandwich * sandwichPrice);
        var taxAmount = totalPrice * taxRate;
        var sumTotal = totalPrice + taxAmount;
        var pageData = {
            name : name,
            address : address,
            phoneNumber : phoneNumber,
            city : city,
            email : email,
            province : province,
            taxRate : taxRate,
            totalPrice : totalPrice.toFixed(2),
            taxAmount : taxAmount.toFixed(2),
            sumTotal : sumTotal.toFixed(2),
            selectedProducts : selectedProducts
        }
        // Rendering data to receipt page
        res.render('receipt', pageData);
    }
});
// Listening on port 4413
app.listen(4413);

console.log('Everything executed fine.. website at port 4413....');
