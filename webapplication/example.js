function sum(a, b){
    return a + b;
}

function isPositive(a){
    return a >= 0;
}

/*
How you would write doctest:

>> sum(1,2);
3
>> sum(10,12);
22
>> sum(-10, 9);
-1
>> isPositive(sum(-10,9));
false
>> isPositive(0);
false <-- To see what happens on failing
 */

/*
Outcome of webapplication
 */
let correct = 0; let totaal = 0;
function deepCompare() {var i, l, leftChain, rightChain;function compare2Objects (x, y) {var p;if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') { return true;}if (x === y) {return true;}if ((typeof x === 'function' && typeof y === 'function') || (x instanceof Date && y instanceof Date) || (x instanceof RegExp && y instanceof RegExp) || (x instanceof String && y instanceof String) || (x instanceof Number && y instanceof Number)) {return x.toString() === y.toString();}if (!(x instanceof Object && y instanceof Object)) {return false;}if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {return false;}if (x.constructor !== y.constructor) {return false;}if (x.prototype !== y.prototype) {return false;}if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) { return false;}for (p in y) {if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {return false;}else if (typeof y[p] !== typeof x[p]) {return false;}}for (p in x) {if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {return false;}else if (typeof y[p] !== typeof x[p]) {return false;}switch (typeof (x[p])) {case 'object':case 'function':leftChain.push(x);rightChain.push(y);if (!compare2Objects (x[p], y[p])) {return false;}leftChain.pop();rightChain.pop();break;default:if (x[p] !== y[p]) {return false;}break;}}return true;}if (arguments.length < 1) {return true;}for (i = 1, l = arguments.length; i < l; i++) {leftChain = [];rightChain = [];if (!compare2Objects(arguments[0], arguments[i])) {return false;}}return true;};console.log('---------- JS TEST -----------');
totaal += 1;
if(deepCompare(sum(1,2),3)) {
    console.log('The command sum(1,2) did SUCCEED'); correct += 1;
} else {
    console.log('The command sum(1,2) did NOT SUCCEED'); console.log('Expected: 3'); console.log('Got: ' + JSON.stringify(sum(1,2)));
}
console.log('---------- JS TEST -----------');
totaal += 1;
if(deepCompare(sum(10,12),22)) {
    console.log('The command sum(10,12) did SUCCEED'); correct += 1;
} else {
    console.log('The command sum(10,12) did NOT SUCCEED'); console.log('Expected: 22'); console.log('Got: ' + JSON.stringify(sum(10,12)));
}
console.log('---------- JS TEST -----------');
totaal += 1;
if(deepCompare(sum(-10, 9),-1)) {
    console.log('The command sum(-10, 9) did SUCCEED'); correct += 1;
} else {
    console.log('The command sum(-10, 9) did NOT SUCCEED'); console.log('Expected: -1'); console.log('Got: ' + JSON.stringify(sum(-10, 9)));
}
console.log('---------- JS TEST -----------');
totaal += 1;
if(deepCompare(isPositive(sum(-10,9)),false)) {
    console.log('The command isPositive(sum(-10,9)) did SUCCEED'); correct += 1;
} else {
    console.log('The command isPositive(sum(-10,9)) did NOT SUCCEED'); console.log('Expected: false'); console.log('Got: ' + JSON.stringify(isPositive(sum(-10,9))));
}
console.log('---------- JS TEST -----------');
totaal += 1;
if(deepCompare(isPositive(0),false)) {
    console.log('The command isPositive(0) did SUCCEED'); correct += 1;
} else {
    console.log('The command isPositive(0) did NOT SUCCEED'); console.log('Expected: false'); console.log('Got: ' + JSON.stringify(isPositive(0)));
}
console.log('---------- TOTAL -----------');
console.log(correct + ' of ' + totaal + ' tests succeeded.');