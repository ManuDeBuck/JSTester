if (typeof __filename !== 'undefined') {
    function isCodeLine(line) {
        return /^\.(\.)+ .*$/.test(line) ||
            /^>>>? .*$/.test(line)
    }

    function isEqual(value, other) {
        if (value === other) return true;
        // Get the value type
        var type = Object.prototype.toString.call(value);
        // If the two objects are not the same type, return false
        if (type !== Object.prototype.toString.call(other)) return false;

        // If items are not an object or array, return false
        if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;
        // Compare the length of the length of the two items
        var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
        var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
        if (valueLen !== otherLen) return false;

        // Compare two items
        var compare = function (item1, item2) {

            // Get the object type
            var itemType = Object.prototype.toString.call(item1);

            // If an object or array, compare recursively
            if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
                if (!isEqual(item1, item2)) return false;
            }

            // Otherwise, do a simple comparison
            else {

                // If the two items are not the same type, return false
                if (itemType !== Object.prototype.toString.call(item2)) return false;

                // Else if it's a function, convert to a string and compare
                // Otherwise, just compare
                if (itemType === '[object Function]') {
                    if (item1.toString() !== item2.toString()) return false;
                } else {
                    if (item1 !== item2) return false;
                }

            }
        };

        // Compare properties
        if (type === '[object Array]') {
            for (var i = 0; i < valueLen; i++) {
                if (compare(value[i], other[i]) === false) return false;
            }
        } else {
            for (var key in value) {
                if (value.hasOwnProperty(key)) {
                    if (compare(value[key], other[key]) === false) return false;
                }
            }
        }

        // If nothing failed, return true
        return true;

    };

    var lineReader = require("readline").createInterface({
        input: require("fs").createReadStream(__filename)
    });
    let definitions = ["const", "let", "var"];

    function strike(text) {
        let result = '';
        for (let c of text.split("")) {
            result = result + c + '\u0336';
        }
        return result;
    }

    let lines = [];
    let testing = false;

    function test(code, output, last) {
        let expected;
        let actual;
        let error = false;
        let correctLines = 0;
        console.oldLog = console.log;
        console.log = function (value) {
            console.oldLog(value);
            return value;
        };
        try {
            actual = eval(code.join("\n"));
            if (actual === undefined || definitions.some(s => code[code.length - 1].startsWith(s + " "))) {
                for (let x = code.length - 1; 0 <= x; x--) {
                    let line = code[x];
                    if (line.indexOf("=") !== -1) {
                        for (let definition of definitions) {
                            if (line.startsWith(definition + " ")) {
                                if (!line.endsWith(";")) line += ";";
                                line += "\n   " + line.split("=")[0].replace(definition, "").trimRight() + ";";
                                code[x] = line;
                                let result = eval(code.join("\n"));
                                if (result !== undefined) {
                                    actual = result;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            try {
                expected = eval('(' + output.join("\n") + ')');
            } catch (err) {
                expected = output.join("\n")
            }
        } catch (err) {
            actual = `${err.name}: ${err.message}`;
            expected = output.join("\n");
            error = true;
            for (let x = last + 1; x < code.length; x += 1) {
                try {
                    eval(code.slice(0, x));
                    correctLines += 1;
                } catch (err) {
                    break;
                }
            }
        }
        console.log = console.oldLog;
        console.oldLog = undefined;
        let correct = isEqual(actual, expected);
        // Whether there's an error, whether is was correct, expected, actual, correct lines in case of error
        return [error, correct, expected, actual, correctLines];
    }

    function itemsFormat(i) {
        return i === 1 ? "item" : "items";
    }

    lineReader.on("line", function (line) {
        if (/`"""/.test(line) && lines.length === 0) {
            testing = true;
            return;
        } else if (/"""`/.test(line)) {
            testing = false;
        }
        if (testing && line.trim().length !== 0 && !line.startsWith("//")) {
            if (lines.length !== 0 && !isCodeLine(line) && !isCodeLine(lines[lines.length - 1])) {
                lines[lines.length - 1] += "\n" + line;
            } else {
                lines.push(line);
            }
        }
    }).on("close", function () {
        let code = [];
        let output = [];
        let failed = 0;
        let correct = 0;
        let last = 0;
        let previousCorrect = false;
        for (let x = 0; x < lines.length; x += 1) {
            let line = lines[x];
            if (isCodeLine(line)) {
                code.push(line.substring(line.indexOf(" ") + 1).trim())
            } else {
                if (line.length !== 0) output.push(line);
                if (output.length !== 0) {
                    let t = test(code, output, last);
                    if (t[1]) {
                        correct += 1;
                        console.log('\x1b[92m' + "✓ " + '\x1b[0m' + '\x1b[94m' + code[code.length - 1] + '\x1b[0m');
                        previousCorrect = true;
                    } else {
                        if (previousCorrect) {
                            console.log(strike(Array(80).join("-")));
                            previousCorrect = false;
                        }
                        let trying = '\x1b[91m' + "Trying" + '\x1b[0m';
                        let expecting = '\x1b[93m' + "Expecting" + '\x1b[0m';
                        let actual = '\x1b[92m' + "Actual" + '\x1b[0m';
                        let tryingCode = '\x1b[94m' + code.slice(last, code.length).map(a => `\t${a}`).join("\n") + '\x1b[0m';
                        let expectingResult = '\x1b[94m' + (t[2] === undefined ? undefined : JSON.stringify(t[2]).replace(/\\n/g, "\n\t")) + '\x1b[0m';
                        let actualResult = '\x1b[94m' + (t[3] === undefined ? undefined : JSON.stringify(t[3]).replace(/\\n/g, "\n\t")) + '\x1b[0m';
                        console.log(
                            `${trying}:
    ${tryingCode}
    ${expecting}: 
        ${expectingResult}
    ${actual}:  
        ${actualResult}`);
                        console.log(strike(Array(80).join("-")));
                        failed += 1;
                    }
                    if (!t[0]) {
                        last = code.length;
                    } else {
                        code = code.slice(0, last + t[4])
                    }
                    output = [];
                }
            }
        }
        if (output.length !== 0) {
            test(code, output);
        }
        if (failed === 0) {
            console.log("All items are correct " + '\x1b[92m' + String.fromCodePoint(0x1F60E) + '\x1b[0m');
        } else if (correct === 0) {
            console.log("All items are incorrect " + '\x1b[91m' +  String.fromCodePoint(0x2620)  + '\x1b[0m');
        } else {
            let items = '\x1b[95m' + (correct + failed) + " " + itemsFormat(correct + failed) + '\x1b[0m';
            let correctItems = '\x1b[92m' + correct + " " + itemsFormat(correct) + " correct ✓" + '\x1b[0m';
            let failedItems = '\x1b[91m' + failed + " " + itemsFormat(failed) + " failed ✕" + '\x1b[0m';
            console.log(`${items}
        ${correctItems}
        ${failedItems}`
            );
        }
    });
}
