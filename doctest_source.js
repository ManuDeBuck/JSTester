class A {
    b() {
        return ["multi", "line", "test"].join("\n");
    }
    c() {
        throw new AssertionError("test");
    }
    d() {
        return "123";
    }
}
class AssertionError extends Error {

    constructor(message) {
        super(message);
        this.name = "AssertionError";
        this.message = message;

    }

}


`"""
>> const a = new A();
>> a.c();
AssertionError: test
>> a.b();
multi
line
test
>> console.log(a.d());
"123"
>> let q = b => b;
>> console.log(q("c\nd"));
c
d
"""`;

function deepCompare () {
    var i, l, leftChain, rightChain;

    function compare2Objects (x, y) {
        var p;

        // remember that NaN === NaN returns false
        // and isNaN(undefined) returns true
        if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
            return true;
        }

        // Compare primitives and functions.
        // Check if both arguments link to the same object.
        // Especially useful on the step where we compare prototypes
        if (x === y) {
            return true;
        }

        // Works in case when functions are created in constructor.
        // Comparing dates is a common scenario. Another built-ins?
        // We can even handle functions passed across iframes
        if ((typeof x === 'function' && typeof y === 'function') ||
            (x instanceof Date && y instanceof Date) ||
            (x instanceof RegExp && y instanceof RegExp) ||
            (x instanceof String && y instanceof String) ||
            (x instanceof Number && y instanceof Number)) {
            return x.toString() === y.toString();
        }

        // At last checking prototypes as good as we can
        if (!(x instanceof Object && y instanceof Object)) {
            return false;
        }

        if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
            return false;
        }

        if (x.constructor !== y.constructor) {
            return false;
        }

        if (x.prototype !== y.prototype) {
            return false;
        }

        // Check for infinitive linking loops
        if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
            return false;
        }

        // Quick checking of one object being a subset of another.
        // todo: cache the structure of arguments[0] for performance
        for (p in y) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                return false;
            }
        }

        for (p in x) {
            if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
                return false;
            }
            else if (typeof y[p] !== typeof x[p]) {
                return false;
            }

            switch (typeof (x[p])) {
                case 'object':
                case 'function':

                    leftChain.push(x);
                    rightChain.push(y);

                    if (!compare2Objects (x[p], y[p])) {
                        return false;
                    }

                    leftChain.pop();
                    rightChain.pop();
                    break;

                default:
                    if (x[p] !== y[p]) {
                        return false;
                    }
                    break;
            }
        }

        return true;
    }

    if (arguments.length < 1) {
        return true; //Die silently? Don't know how to handle such case, please help...
        // throw "Need two or more arguments to compare";
    }

    for (i = 1, l = arguments.length; i < l; i++) {

        leftChain = []; //Todo: this can be cached
        rightChain = [];

        if (!compare2Objects(arguments[0], arguments[i])) {
            return false;
        }
    }

    return true;
}

var lineReader = require("readline").createInterface({
    input: require("fs").createReadStream(__filename)
});
let lines = [];
let testing = false;
function test(code, output, last) {
    let expected;
    let actual;
    let error = false;
    let correctLines = 0;
    console.oldLog = console.log;
    console.log = function(value) {
        console.oldLog(value);
        return value;
    };
    try {
        actual = eval(code.join("\n"));
        try {
            expected = eval('(' + output.join("\n") + ')');
        } catch(err) {
            expected = output.join("\n")
        }
    } catch (err) {
        actual = `${err.name}: ${err.message}`;
        expected = output.join("\n");
        error = true;
        for(let x = last + 1; x < code.length; x += 1) {
            try {
                eval(code.slice(0, x))
                correctLines += 1;
            } catch(err) {
                break;
            }
        }
    }
    console.log = console.oldLog;
    console.oldLog = undefined;
    let correct = deepCompare(actual, expected);
    // Whether there's an error, whether is was correct, expected, actual, correct lines in case of error
    return [error, correct, expected, actual, correctLines];
}
lineReader.on("line", function(line) {
    if(/`"""/.test(line) && lines.length === 0) {
        testing = true;
        return;
    } else if(/"""`/.test(line)) {
        testing = false;
    }
    if(testing && line.trim().length !== 0) {
        if(lines.length !== 0 && !/^>>>? .*$/.test(line) && !/^>>>? .*$/.test(lines[lines.length - 1])) {
            lines[lines.length - 1] += "\n" + line;
        } else {
            lines.push(line);
        }
    }
}).on("close", function() {
    let code = [];
    let output = [];
    let failed = 0;
    let correct = 0;
    let last = 0;
    for(let x = 0; x < lines.length; x +=1) {
        let line = lines[x];
        if(/^>>>? .*$/.test(line)) {
            code.push(line.substring(line.indexOf(" ")))
        } else {
            if(line.length !== 0) output.push(line);
            if(output.length !== 0) {
                let t = test(code, output, last);
                if(t[1]) {
                    correct += 1;
                } else {
                    console.log(
                        `Trying:
${code.slice(last, code.length).map(a => `\t${a}`).join("\n")}
Expecting: 
    ${JSON.stringify(t[2]).replace(/\\n/g, "\n\t")}
Actual:  
    ${JSON.stringify(t[3]).replace(/\\n/g, "\n\t")}`);
                    console.log(Array(100).join("-"));
                    failed += 1;
                }
                if(!t[0]) {
                    last = code.length;
                } else {
                    code = code.slice(0, last + t[4])
                }
                output = [];
            }
        }
    }
    if(output.length !== 0) {
        test(code, output);
    }
    console.log(`${correct + failed} items:
        ${correct} items correct
        ${failed} items failed`
    );
});