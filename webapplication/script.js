function verwerk(){
    let res = '';
    res += "let correct = 0; let totaal = 0;\n";
    res += `function deepCompare () {var i, l, leftChain, rightChain;function compare2Objects (x, y) {var p;if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {return true;}if (x === y) {return true;}if ((typeof x === 'function' && typeof y === 'function') ||(x instanceof Date && y instanceof Date) ||(x instanceof RegExp && y instanceof RegExp) ||(x instanceof String && y instanceof String) ||(x instanceof Number && y instanceof Number)) {return x.toString() === y.toString();}if (!(x instanceof Object && y instanceof Object)) {return false;}if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {return false;}if (x.constructor !== y.constructor) {return false;}if (x.prototype !== y.prototype) {return false;}if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {return false;}for (p in y) {if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {return false;}else if (typeof y[p] !== typeof x[p]) {return false;}}for (p in x) {if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {return false;}else if (typeof y[p] !== typeof x[p]) {return false;}switch (typeof (x[p])) {case 'object':case 'function':leftChain.push(x);rightChain.push(y);if (!compare2Objects (x[p], y[p])) {return false;}leftChain.pop();rightChain.pop();break;default:if (x[p] !== y[p]) {return false;}break;}}return true;}if (arguments.length < 1) {return true; }for (i = 1, l = arguments.length; i < l; i++) {leftChain = [];rightChain = [];if (!compare2Objects(arguments[0], arguments[i])) {return false;}}return true;}`.replace(/  /g,"");
    let lines = $("#inputField").val().split("\n");
    let index = 0;
    while(index < lines.length){
        let line = lines[index];
        if(line.startsWith(">>")){
            line = line.replace(/>+/,"").replace(";","").trim();
            if(line.indexOf("=") < 0){
                let nextline = lines[index + 1].trim();
                if(! nextline.startsWith(">>")) {
                    res += `console.log('---------- JS TEST -----------');\n`;
                    if (nextline.startsWith("AssertionError")) {
                        res += `totaal += 1;\n var check = false; try {\n` + line + `\n} catch(error) { \n check = true; \n} \n if(check) {\n console.log('The command ` + line.replace(/(['"])/g, "\\$1") + ` has CORRECTLY thrown an error.'); correct += 1; \n} else { \nconsole.log('The command ` + line.replace(/(['"])/g, "\\$1") + ` has NOT CORRECTLY thrown an AssertionError')\n }; \n`;
                    } else {
                        res += `totaal += 1;\n try { if(deepCompare(` + line + `,` + nextline + `)) { \n console.log('The command ` + line.replace(/(['"])/g, "\\$1") + ` did SUCCEED'); correct += 1; \n } else { \n console.log('The command ` + line.replace(/(['"])/g, "\\$1") + ` did NOT SUCCEED'); console.log('Expected: ` + nextline.replace(/(['"])/g, "\\$1") + `'); console.log('Got: ' + JSON.stringify(` + line + `));\n} } catch(error) { console.log('De methode: ` + line.replace(/(['"])/g, "\\$1") + ` bestaat niet.');\n}`;
                    }
                    index += 1;
                } else {
                    res += line + ";\n";
                }
            } else {
                res += line + ";\n";
            }
        }
        index += 1;
    }
    res += `console.log('---------- TOTAL -----------');\n`;
    res += "console.log(correct + ' of ' + totaal + ' tests succeeded.');";
    $("#outputField").val(res);
}

function reset(){
    $("#inputField").val("");
    $("#outputField").val("");
}

function mini(){
    $("#outputField").val($("#outputField").val().replace(/\n/g,""));
}