 
function validateForm()
{
var CCN = trimBetweenSpaces(trimBegEndSpaces(stripOffNonDigit(document.ccform.UMcard.value)));
var expireDate = trimBetweenSpaces(trimBegEndSpaces(stripOffNonDigit(document.ccform.UMexpirM.value + document.ccform.UMexpirY.value)));
var bankRouting = trimBetweenSpaces(trimBegEndSpaces(document.ccform.UMrouting.value));
var bankAccount = trimBetweenSpaces(trimBegEndSpaces(document.ccform.UMaccount.value));
var SSN = trimBetweenSpaces(trimBegEndSpaces(stripOffNonDigit(document.ccform.UMssn.value)));
var dlNum = trimBetweenSpaces(trimBegEndSpaces(document.ccform.UMdlnum.value));
var dlState = trimBetweenSpaces(trimBegEndSpaces(document.ccform.UMdlstate.value));
var amount = trimBetweenSpaces(trimBegEndSpaces(stripOffNonDigit(document.ccform.UMamount.value)));
var invoice = trimBetweenSpaces(trimBegEndSpaces(document.ccform.UMinvoice.value));
var name = document.ccform.UMname.value;
var street = document.ccform.UMstreet.value;
var zip = trimBetweenSpaces(trimBegEndSpaces(stripOffNonDigit(document.ccform.UMzip.value)));
 
if (CCN.length == 0 || expireDate.Length == 0)
{
if (bankRouting.length == 0 ||
bankAccount.length == 0 ||
SSN.length == 0 ||
dlNum.length == 0 ||
dlState.length == 0 )
{
alert ("Error: missing values.\nYou have not included any Credit Card or Check information.\nPlease fill out either one to continue.");
document.ccform.UMcard.focus == true;
return false;
}
else
{
if (SSN.length < 9)
{
alert ("Error: Incorrect Social Security Number.\nThere should be 9 digits in the social security number.\nIt appears that you have less than 9.");
document.ccform.UMssn.focus == true;
return false;
}
}
}
else
{
if (expireDate.length < 4)
{
alert ("Error: Incorrect expire date.\nThere should be 4 digits in the expire date idicating mm/yy.\nIt appears that you have less than 4.");
document.ccform.UMexpirM.focus == true;
return false;
}
document.ccform.UMexpir.value = expireDate;
}
 
if (amount.length == 0)
{
alert ("Error: missing field amount.\n Please fill out the amount field.");
document.ccform.UMamount.focus == true;
return false;
}
 
if (invoice.length == 0)
{
alert ("Error: missing field invoice.\n Please fill out the invoice field.");
document.ccform.UMinvoice.focus == true;
return false;
}
 
if (name.length == 0 || !isAlphaSymbols(name, ".,' "))
{
alert ("Error: missing or incorrect field Name.\n Please fill out the name field.\nThe name field can only have Alpha Characters!");
document.ccform.UMname.focus == true;
return false;
}
 
if (street.length == 0)
{
alert ("Error: missing field street.\n Please fill out the street field.");
document.ccform.UMstreet.focus == true;
return false;
}
 
if (zip.length == 0 || zip.length < 5)
{
alert ("Error: missing field zip or incorrect zip number.\n Please fill out the zip field which should be 5 digits.");
document.ccform.UMzip.focus == true;
return false;
}
 
return true;
}
 
// Return true if a string is combination of alpha and given symbols.
function isAlphaSymbols(objValue, symbols) {
var ch
 
for (var i=0; i < objValue.length; i++) {
ch = objValue.charAt(i)
if (isAlphaChar(ch) == false) {
if (symbols.indexOf(ch) < 0)
return false
}
}
return true
}
 
// Return true of a character is an alphabet.
function isAlphaChar( ch ) {
return ((ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z"))
}
 
// Stiff off any non digit char
function stripOffNonDigit(objValue) {
var ch
var tempStr = new String()
 
for (var i=0; i<objValue.length; i++)
{
if (isDigitChar(objValue.charAt(i)) == true)
tempStr = tempStr + objValue.charAt(i)
}
 
return tempStr
}
 
// Return true if a character is a digit.
function isDigitChar( ch ) {
return ( ch >= "0" && ch <= "9" )
}
 
// Removes leading and trailing blanks from a value
function trimBegEndSpaces(object_value)
{
var leading_blanks = 0
var string_end = (object_value.length)-1
if (string_end < 0) string_end = 0
 
// find first nonblank: start with first character and scan forwards
while (leading_blanks <= string_end && object_value.charAt(leading_blanks) == " ")
{leading_blanks++}
 
// find last nonblank: start with last character and scan backwards
while (string_end > leading_blanks && object_value.charAt(string_end) == " ")
{string_end--}
 
return object_value = object_value.substring(leading_blanks,string_end+1)
}
 
// Remove any additional spaces
function trimBetweenSpaces(objValue) {
var blankExists = false
var newValue = new String()
var ch
 
for (var i=0; i < objValue.length; i++) {
ch = objValue.charAt(i)
if ( ch == " " ) {
if ( blankExists == false ) {
blankExists = true
newValue = newValue + ch
}
}
else {
newValue = newValue + ch
blankExists = false
}
}
if ( newValue == null )
return objValue
else
return newValue
}