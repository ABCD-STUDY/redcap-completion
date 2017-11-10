{
    // A grammar for REDCap's branching logic
}


Expression
    = head:Term tail:(_ ("+" / "-" / "or" / "OR" / "and" / "AND" / "not") _ Term)* _ {
        return tail.reduce(function(result, element) {
	    if (element[1] === "+") { return result + element[3]; }
	    if (element[1] === "-") { return result - element[3]; }
	    if (element[1] === "or" || element[1] === "OR") {
		//console.log("OR now \"" + result + "\" with \"" + element[3] + "\"");
		return result || element[3];
	    }
	    if (element[1] === "and" || element[1] === "AND") {
		//console.log("AND now \"" + result + "\" with \"" + element[3] + "\"");
		return result && element[3];
	    }
	}, head);
    }
    / "not" _ head:Term {
	return ! element[2];
    }

Term
    = head:Factor tail:(_ ("*" / "/" / "<>" / "=" / "<=" / ">=" / ">" / "<") _ Factor)* {
        return tail.reduce(function(result, element) {
	    if (element[1] === "*") { return result * element[3]; }
	    if (element[1] === "/") { return result / element[3]; }
	    if (element[1] === "<>") {
	       //console.log("Not equal now \"" + result + "\" with \"" + element[3] + "\"");
	       return result != element[3];
	    }
	    if (element[1] === ">") {
		//console.log("Greater now \"" + result + "\" with \"" + element[3] + "\"");
		return result > element[3];
	    }
	    if (element[1] === ">=") {
		//console.log("Greater eqaul now \"" + result + "\" with \"" + element[3] + "\"");
		return result >= element[3];
	    }
	    if (element[1] === "<") {
		//console.log("Smaller now \"" + result + "\" with \"" + element[3] + "\"");
		return result < element[3];
	    }
	    if (element[1] === "<=") {
		//console.log("Smaller eqaul now \"" + result + "\" with \"" + element[3] + "\"");
		return result <= element[3];
	    }
	    if (element[1] === "=") {
		//console.log("Compare now \"" + result + "\" with \"" + element[3] + "\"");
		//if (result != element[3]) {
		//	console.log("NOT THE SAME: \"" + result + "\" \"" + element[3] + "\" should they be?");
		//}
		return result == element[3];
	    }
	}, head);
    }

Factor
    = "(" _ expr:Expression _ ")" _ { return expr; }
    / "[" _ vari:Variable _ "]" { return resolveVariable(vari); }
    / i:id _ "(" _ terms:List _ ")" { return functions[i.join("")](terms); }
    / Float
    / Integer
    / StringSingle
    / StringDouble

id "function name"
    = [a-zA-Z]+

List "function argument list"
    = head:Term tail:(_ "," _ Term)* {
	var a = tail.reduce(function(result, element) {
	    result.push(element[3]);
	    return result;
	}, [head]);
	return a;
    }

Variable
    = varname:([a-zA-Z_][a-zA-Z0-9_]*) index:(_ "(" _ idx:Integer _ ")" _ )? {
	var vn = varname[0] + varname[1].join("");
	if (typeof index == 'undefined' || index === null) {
	    return [ vn, null ];
	}
 	//console.log("index: " + JSON.stringify(vn) + " " + JSON.stringify(index));
	return [ vn, index[3] ];
    }

Integer "integer"
    = [+-]?[0-9]+ { return parseInt(text(), 10); }

Float "float"
    = [+-]? ([0-9]* "." [0-9]+) ("e" [+-]? [0-9]+)? { return parseFloat(text()); }

StringSingle
    = "'" val:[0-9]* "'" { return val.join(""); }

StringDouble
    = "\"" val:[0-9]* "\"" { return val.join(""); }

_ "whitespace"
    = [ \t\n\r]*

