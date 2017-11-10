var datadictionary = [];
var instruments = {};
var instrumentLabels = {};
var participants = [];
var parser = null;
var dataThisParticipant = [];

function checkReady() {
    if (datadictionary.length > 0 &&
	Object.keys(instruments).length > 0 &&
	participants.length > 0) {
	jQuery('#runOne').fadeIn();
    } else {
	setTimeout(function() { checkReady(); }, 200);
    }
}

jQuery(document).ready(function() {
    getDataDictionary();
    getParticipants();
    buildParser();
    checkReady(); // check every couple of seconds of the data is all there

    jQuery('#runOne').on('click', function() {
	findProblems();
    });

    jQuery('#completeness').on('mouseenter', '.box', function() {
	var t = jQuery(this).attr('instrument');
	jQuery('#message').text(t.trim());
	//console.log("hover on:" + jQuery(this).attr('data-content'));
    });
});

function dimensionalEmbedding() {
    if (datadictionary == [] || participants == []) {
	alert("Error: run Collect from ABCD first.");
	return;
    }
    
    // get the data from the page
    var data = []; // array of arrays
    var sites = [];
    jQuery.each(jQuery('#completeness > div'), function(index,value) {
	var site = jQuery(value).find('.site-name').text();
	// now we can sort each site seperately
	jQuery.each(jQuery(value).find('.part-row'),function(index,a) {
	    var participant = jQuery(jQuery(a).children()[0]).attr('title');
            var ar = [];
	    jQuery.each(jQuery(a).find(".box"), function(index, value) {
		if ( jQuery(value).hasClass("ncomplete") )
		    ar.push(0);
		else
		    ar.push(1);
	    });
	    data.push(ar);
  	    sites.push([site,participant]);
	});
    });
    var opt = {}
    opt.epsilon = 10; // epsilon is learning rate (10 = default)
    opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
    opt.dim = 2; // dimensionality of the embedding (2 = default)

    var tsne = new tsnejs.tSNE(opt); // create a tSNE instance
    tsne.initDataRaw(data);

    for(var k = 0; k < 500; k++) {
	tsne.step(); // every time you call this, solution gets better
    }

    var Y = tsne.getSolution(); // Y is an array of 2-D points that you can plot
    // for each point Y we have its site in sites, plot them now using d3js
    for (var i = 0; i < Y.length; i++) {
	Y[i].push(sites[i][0]);
	Y[i].push(sites[i][1]);
    }

    var w = jQuery(window).width();
    var h = w * 0.66;
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
	width = w - margin.left - margin.right,
	height = h - margin.top - margin.bottom;

    // setup x
    var xValue = function(d) { return d[0];}, // data -> value
	xScale = d3.scale.linear().range([0, width]), // value -> display
	xMap = function(d) { return xScale(xValue(d));}, // data -> display
	xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // setup y
    var yValue = function(d) { return d[1];}, // data -> value
	yScale = d3.scale.linear().range([height, 0]), // value -> display
	yMap = function(d) { return yScale(yValue(d));}, // data -> display
	yAxis = d3.svg.axis().scale(yScale).orient("left");

    // setup fill color
    var cValue = function(d) { return d[2]; },
	color = d3.scale.category10();

    // add the graph canvas to the body of the webpage
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
	.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // load data
    //d3.csv("cereal.csv", function(error, data) {
    data = Y;

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
    
    // x-axis
    svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis)
	.append("text")
	.attr("class", "label")
	.attr("x", width)
	.attr("y", -6)
	.style("text-anchor", "end")
	.text("embedding dimension 1");
    
    // y-axis
    svg.append("g")
	.attr("class", "y axis")
	.call(yAxis)
	.append("text")
	.attr("class", "label")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.text("embedding dimensionnn 2");
    
    // draw dots
    svg.selectAll(".dot")
	.data(data)
	.enter().append("circle")
	.attr("class", "dot")
	.attr("r", 3.5)
	.attr("cx", xMap)
	.attr("cy", yMap)
	.style("fill", function(d) { return color(cValue(d));})
	.on("mouseover", function(d) {
	    tooltip.transition()
		.duration(200)
		.style("opacity", .9);
	    tooltip.html(d[2] + "</br>" + d[3])
		.style("left", (d3.event.pageX + 5) + "px")
		.style("top", (d3.event.pageY - 28) + "px");
	})
	.on("mouseout", function(d) {
	    tooltip.transition()
		.duration(500)
		.style("opacity", 0);
	});
    
    // draw legend
    var legend = svg.selectAll(".legend")
	.data(color.domain())
	.enter().append("g")
	.attr("class", "legend")
	.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    
    // draw legend colored rectangles
    legend.append("rect")
	.attr("x", width - 18)
	.attr("width", 18)
	.attr("height", 18)
	.style("fill", color);
    
    // draw legend text
    legend.append("text")
	.attr("x", width - 24)
	.attr("y", 9)
	.attr("dy", ".35em")
	.style("text-anchor", "end")
	.text(function(d) { return d;})

}

function dimensionalEmbedding2() {
    if (datadictionary == [] || participants == []) {
	alert("Error: run Collect from ABCD first.");
	return;
    }
    
    // get the data from the page
    var data = []; // array of arrays
    var sites = [];
    var firstTime = true;
    jQuery.each(jQuery('#completeness > div'), function(index,value) {
	var site = jQuery(value).find('.site-name').text();
	// now we can sort each site seperately
	jQuery.each(jQuery(value).find('.part-row'),function(index,a) {
	    var participant = jQuery(jQuery(a).children()[0]).attr('title');
            var ar = [];
	    jQuery.each(jQuery(a).find(".box"), function(index, value) {
		if (firstTime) {
		    var instrument = jQuery(value).attr('instrument');
  		    sites.push([instrument,participant]);
		}
		if ( jQuery(value).hasClass("ncomplete") )
		    ar.push(0);
		else
		    ar.push(1);
	    });
	    firstTime = false;
	    data.push(ar);
	});
    });
    // now transpose the matrix
    function transpose(a) {
	return Object.keys(a[0]).map(
	    function (c) { return a.map(function (r) { return r[c]; }); }
	);
    }
    data = transpose(data);
    
    var opt = {}
    opt.epsilon = 10; // epsilon is learning rate (10 = default)
    opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
    opt.dim = 2; // dimensionality of the embedding (2 = default)

    var tsne = new tsnejs.tSNE(opt); // create a tSNE instance
    tsne.initDataRaw(data);

    for(var k = 0; k < 500; k++) {
	tsne.step(); // every time you call this, solution gets better
    }

    var Y = tsne.getSolution(); // Y is an array of 2-D points that you can plot
    // for each point Y we have its site in sites, plot them now using d3js
    for (var i = 0; i < Y.length; i++) {
	Y[i].push(sites[i][0]);
	Y[i].push(sites[i][1]);
    }

    var w = jQuery(window).width();
    var h = w * 0.66;
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
	width = w - margin.left - margin.right,
	height = h - margin.top - margin.bottom;

    // setup x
    var xValue = function(d) { return d[0];}, // data -> value
	xScale = d3.scale.linear().range([0, width]), // value -> display
	xMap = function(d) { return xScale(xValue(d));}, // data -> display
	xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // setup y
    var yValue = function(d) { return d[1];}, // data -> value
	yScale = d3.scale.linear().range([height, 0]), // value -> display
	yMap = function(d) { return yScale(yValue(d));}, // data -> display
	yAxis = d3.svg.axis().scale(yScale).orient("left");

    // setup fill color
    var cValue = function(d) { return d[2]; },
	color = d3.scale.category10();

    // add the graph canvas to the body of the webpage
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
	.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // load data
    //d3.csv("cereal.csv", function(error, data) {
    data = Y;

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
    
    // x-axis
    svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis)
	.append("text")
	.attr("class", "label")
	.attr("x", width)
	.attr("y", -6)
	.style("text-anchor", "end")
	.text("embedding dimension 1");
    
    // y-axis
    svg.append("g")
	.attr("class", "y axis")
	.call(yAxis)
	.append("text")
	.attr("class", "label")
	.attr("transform", "rotate(-90)")
	.attr("y", 6)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.text("embedding dimensionnn 2");
    
    // draw dots
    svg.selectAll(".dot")
	.data(data)
	.enter().append("circle")
	.attr("class", "dot")
	.attr("r", 3.5)
	.attr("cx", xMap)
	.attr("cy", yMap)
	.style("fill", function(d) { return color(cValue(d));})
	.on("mouseover", function(d) {
	    tooltip.transition()
		.duration(200)
		.style("opacity", .9);
	    tooltip.html(d[2])
		.style("left", (d3.event.pageX + 5) + "px")
		.style("top", (d3.event.pageY - 28) + "px");
	})
	.on("mouseout", function(d) {
	    tooltip.transition()
		.duration(500)
		.style("opacity", 0);
	});
/*    
    // draw legend
    var legend = svg.selectAll(".legend")
	.data(color.domain())
	.enter().append("g")
	.attr("class", "legend")
	.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    
    // draw legend colored rectangles
    legend.append("rect")
	.attr("x", width - 18)
	.attr("width", 18)
	.attr("height", 18)
	.style("fill", color);
    
    // draw legend text
    legend.append("text")
	.attr("x", width - 24)
	.attr("y", 9)
	.attr("dy", ".35em")
	.style("text-anchor", "end")
	.text(function(d) { return d;})
*/
}


// sort the rows for a site by date or similarity to each other
function sortSiteData( what ) {
    // sort by date
    jQuery.each(jQuery('#completeness > div'), function(index,value) {
	// now we can sort each site seperately

	if (what == "similarity") {
	    jQuery(value).find('.part-row').sort(function(a,b) {
		var da = 0
		jQuery.each(jQuery(a).find(".box"), function(index, value) {
		    if ( jQuery(value).hasClass("ncomplete") )
			da = da + 1;
		});
		var db = 0;
		jQuery.each(jQuery(b).find(".box"), function(index, value) {
		    if ( jQuery(value).hasClass("ncomplete") )
			db = db + 1;
		});
		if (da == db) {
		    return 0;
		} else if (da < db) {
		    return 1;
		}
		return -1;		
	    }).appendTo(value);	
	} else { // default is by date
	    jQuery(value).find('.part-row').sort(function(a,b) {
		var da = jQuery(a).attr('date').split(" ")[0].split("-");
		var adate = new Date(da[0], da[1], da[2]);
		var db = jQuery(b).attr('date').split(" ")[0].split("-");
		var bdate = new Date(db[0], db[1], db[2]);
		if (adate.getTime() == bdate.getTime())
		    return 0;
		else if (adate.getTime() < bdate.getTime()) {
		    return 1;
		}
		return -1;
	    }).appendTo(value);
	}
    });
}

function filterDataDictionary() {
    // we should filter the instruments by the baseline event for now - don't look at the other instruments yet
    jQuery.getJSON('getData.php', { 'action': 'eventMapping' }, function(data) {
	// filter out instruments that are not in the baseline event
	var okforms = [];
	for(d in data) {
	    if (data[d]['unique_event_name'] == 'baseline_year_1_arm_1')
		okforms.push(data[d]['form']);
	}
	
	for(d in instruments) {
	    if (okforms.indexOf(d) === -1) {
		//console.log("remove the form: " + d);
		delete instruments[d];
	    }
	}
    });
}

function getDataDictionary() {

    jQuery.getJSON('getData.php', { 'action': 'dataDictionary' }, function(data) {
	datadictionary = data;
	console.log("got the data dictionary");

	// get list of instruments
	instruments = {};
	for(entry in datadictionary) {
	    if (datadictionary[entry]['field_type'] == 'descriptive')
		continue;
	    if (datadictionary[entry]['field_type'] == 'notes')
		continue;
	    //if (datadictionary[entry]['field_annotation'].indexOf("@READONLY") !== -1)
	    //	continue;
	    if (datadictionary[entry]['field_annotation'].indexOf("HIDEFROMCOMPLETION") !== -1)
	    	continue;
	    if (datadictionary[entry]['field_name'] == "permission_school_records" || datadictionary[entry]['field_name'] == "permission_teacher_contact")
		continue;
	    // if a variable is of type checkbox we have to replace it with the list of possible entries from the choices column
	    // any one entry filled out would make this work
	    var numChoices = [];
	    if (datadictionary[entry]['field_type'] == 'checkbox') {
		// find out how many choices there are
		var choices = datadictionary[entry]['select_choices_or_calculations'].split("|");
		for (var i = 0; i < choices.length; i++) {
		    var c = choices[i].trim().split(",")[0].trim();
		    numChoices.push(c);
		}
		//console.log("found these choices: " + numChoices.join(","));
	    }
	    if (typeof instruments[datadictionary[entry]['form_name']] == 'undefined')
		instruments[datadictionary[entry]['form_name']] = [];
	    instruments[datadictionary[entry]['form_name']].push([ datadictionary[entry]['field_name'],
								   datadictionary[entry]['branching_logic'],
								   numChoices ]);
	}
	// create the instrumentLabels, ask for the read name of the instrument in REDCap
	getNamesForInstrument();
	
	filterDataDictionary(); // remove entries from instruments again that are not part of the baseline event
    });
}

function getNamesForInstrument() {
    instrumentLabels = {};
    jQuery.getJSON('getData.php', { 'action': 'instrumentNames' }, function(data) {
	for (entry in data) {
	    instrumentLabels[data[entry]['instrument_name']] = data[entry]['instrument_label'];
	}
    });
}

function getParticipants() {

    jQuery.getJSON('getData.php', { 'action': 'participants' }, function(data) {

	console.log("got this many entries from getData: " + data.length);
	
/*    data = {
	'token' : '203916E7BD6A3AC814BAD05109FDA87D',
	'content' : 'record',
	'format' : 'json',
	'type' : 'flat',
	'fields' : ['enroll_total','id_redcap','redcap_event_name','asnt_timestamp', 'pilot_subject'],
	'events' : ['baseline_year_1_arm_1'],
	'rawOrLabel' : 'raw',
	'rawOrLabelHeaders' : 'raw',
	'exportCheckboxLabel' : 'false',
	'exportSurveyFields' : 'false',
	'exportDataAccessGroups' : 'true',
	'returnFormat' : 'json'
    }; */
    participants = [];
    // jQuery.post('https://abcd-rc.ucsd.edu/redcap/api/', data, function(data) {
	// filter out non-enrolled participants now
	for(d in data) {
	    if (data[d]['enroll_total___1'] == "1")
  	      participants.push(data[d]);
	}
	
	console.log("HIHIHI downloaded participant data (" + participants.length + ")");
    });
}

function buildParser() {
    jQuery.get('grammar.pegjs', function(data) {
	var parserSource = peg.generate(data, {
	    cache:    $("#option-cache").is(":checked"),
	    optimize: $("#option-optimize").val(),
	    output:   "source"
	});
	parser = eval(parserSource);
    });
}

// instead of getting the data for all participants, break this up into different subsets
function getParticipantData( participants, callback ) {
    var chunkSize = 100; // get data for 10 participants at a time
    thisChunk = [];
    if (participants.length <= chunkSize) {
	thisChunk = participants;
	participants = [];
    } else {
	thisChunk = participants.slice(0, chunkSize);
	participants = participants.slice(chunkSize);
    }
    console.log("Start call to get all " + thisChunk.length + " participants data...");
    jQuery('#status').html(" (" + (participants.length + thisChunk.length) + ")");
    
    jQuery.post('getData.php?action=chunk', { 'pGUIDs': JSON.stringify(thisChunk) }, function(data) {
	// console.log('got data for this set of participants');
	// assumption is that we will get the participants back in the same order, is this true?
	for (p in data) {
     	    (callback)(data[p]); // call the callback to process the data in this chunk
	}
	if (participants.length > 0)
  	    getParticipantData( participants, callback ); // call the next round of results
	else {
	    jQuery('#status').html(" (done)");
	    jQuery('#runOne').fadeOut();
	    sortSiteData( "date" );
	}
	    
    }, "json");
}

function resolveVariable( vari ) {
    if (dataThisParticipant.length == 0) {
	console.log("Error: No data from REDCap");
	return;
    }
    if (vari[1] != null) {
	if (typeof dataThisParticipant[vari[0] + "___" + vari[1]] == 'undefined') {
	    console.log("ERROR: cannot find the variable \""+ vari[0] + "___" + vari[1] + "\"");
	    return;
	}
	
	return dataThisParticipant[vari[0] + "___" + vari[1]];
    }
    return dataThisParticipant[vari[0]];
}


// global functions supported by REDCap's branching logic
var functions = {
    mean : function(n) {
	var m = 0;
	var c = 0;
	for(i in n) {
	    if (n[i] != "") { // only add values that have a non-string zero value
		m = m + n[i];
		c = c + 1;
	    }
	}
	if ( c > 0) {
	    m = m / c;
	} else {
	    m = ""; // nothing
	}
	return m;
    },
    sum : function(n) {
	var m = 0;
	var c = 0;
	for(i in n) {
	    if (n[i] != "") { // only add values that have a non-string zero value
		m = m + n[i];
		c = c + 1;
	    }
	}
	if ( c == 0) {
	    m = ""; // nothing
	}
	return m;
    }
};


function findProblems() {
    // lets ask for one participants data for one instrument and show what that looks like
    // for example use the 'baseline_visits' instrument
    if (parser === null) {
	console.log("Error: parser did not build");
	return;
    }

    jQuery('#completeness').children().remove();
    
    // get the data for all participants first
    var allparts = participants.reduce(function( acc, val ) { acc.push(val['id_redcap']); return acc; }, []);
    //allparts = allparts.slice(0,200);
    getParticipantData( allparts, function( data ) {
	dataThisParticipant = data;
	participant = data['id_redcap'];
	site = data['redcap_data_access_group'].split("_")[0];
	date = data['asnt_timestamp'];
	
	//console.log('got all data for ' + "NDAR_INV0PRHUTZA");
	var errors = []; // store variables that produced an error - if they don't exist for example 
	
	// use the parser to evaluate the
	var str = "";
	var countGood = 0;
	var countAll = 0;
	for(i in instruments) {
	    instrument = instruments[i];
	    complete = true;
	    reason = "is complete"; // why this is not complete
	    for (e in instrument) {
		if (!complete)
		    break;
		var visible = true;
		entry = instrument[e];
		if (entry[1] == "") { // don't need to do something if branching logic is empty, always visible, always check if a value exists

		    // now in this case we could have a checkbox, any value in any field of the checkbox would count as ok
		    if (entry[2].length > 0) {
			// now check if any of these variables has a value
			var foundOne = false;
			for(var j = 0; j < entry[2].length; j++) {
			    var vname = entry[0] + "___" + entry[2][j];
			    if (typeof data[vname] == 'undefined') {
				errors.push(vname);
				continue;
			    }
			    if (data[vname] != "") {
				foundOne = true;
				break;
			    }
			}
			if (!foundOne) {
			    complete = false;
			    reason = " has " + entry[0] + " as an empty entry";
			    continue;
			}
		    } else {		    
			if (typeof data[entry[0]] == 'undefined') {
			    //console.log("Error: tried to pull value for non-existent variable " + entry[0] + ", your REDCap stinks");
			    errors.push(entry[0]);
			    continue;
			}
			if (data[entry[0]] == "") {
			    complete = false;
			    reason = " has " + entry[0] + " as an empty entry";
			}
			continue;
		    }
		} else {  // now we have some entries that do have branching logic
		    try { 
   			visible = parser.parse( entry[1].trim() );
		    } catch(err) {
			console.log("ERROR in evaluation of: " + entry[1].trim() + "error message: " + err);
		    }
		
		    if (!visible) {
			continue; // all is well, lets try another one
		    }
		}
		
		// if the value is still visible we it to have a value
		if (entry[2].length > 0) { // any of the entries could have a value and we are ok
		    var foundOne = false;
		    for (var j = 0; j < entry[2].length; j++) {
			var vname = entry[0] + "___" + entry[2][j];
			if (typeof data[vname] == 'undefined') {
			    errors.push(vname);
			    continue;
			}
			if (data[vname] != "") {
			    foundOne = true;
			    break;
			}
		    }
		    if (!foundOne) {
			complete = false;
			reason = " has " + entry[0] + " as an empty entry";
			continue;
		    }
		} else {
		    if (typeof data[entry[0]] == 'undefined') {
			//console.log("Error: tried to pull value for non-existent variable " + entry[0] + ", your REDCap stinks");
			errors.push(entry[0]);
			continue;
		    }
		}
		//console.log("instrument is:"+ JSON.stringify(entry));		    
	    }
	    //console.log("instrument " + i + " is " + (complete?"complete":"not complete") + " for this participant");
	    var instrumentLabel = instrumentLabels[i];
	    str = str + "<div class=\"box " + (complete?"complete":"ncomplete") + "\" title=\""+ participant +"\" data-toggle=\"popover\" data-trigger=\"focus\" instrument=\"" + i + "\" data-content=\"The instrument <i>" + instrumentLabel + "</i> for site " + site.toUpperCase() + " " + reason + ".\" data-container=\"body\"></div>";
	    // only count towards completenes if the instrument starts with Y_ or P_
	    if (instrumentLabel.startsWith("Y_") || instrumentLabel.startsWith("P_")) {
		if ( complete ) {
  		    countGood = countGood + 1;
		}
		countAll = countAll + 1;
	    }
	}
	// lets create a div for a site
	if (jQuery('#completeness .' + site).length == 0) {
	    var str2 = "";
	    for(i in instruments) {
		instrument = instruments[i];
		var instrumentLabel = instrumentLabels[i];
		var classStr = "boxUnMarked complete";
		var titleStr = "does not count";
		if (instrumentLabel.startsWith("Y_") || instrumentLabel.startsWith("P_")) {
		    classStr = "boxMarked complete";
		    titleStr = "counts";
		}
		str2 = str2 + "<div class=\"" + classStr + "\" instrument=\"" + i + "\" title=\""+instrumentLabel+" "+titleStr + " towards your completeness score" + "\"></div>";
		
	    }
	    jQuery('#completeness').append("<div class=\"site-name " + site + "\"><div class=\"site-name\">" + site.toUpperCase() + " (<span class=\""+ site + "-completeness\" n=\"0\" oldavg=\"0\"></span>)</div><div class=\"instrument-markers\">"+str2+"</div></div>");
	}
	var siteScore = ((countAll > 0)?(countGood/countAll * 100.0).toFixed(0):"NA");
	jQuery('#completeness .' + site).append("<div class=\"part-row\" site=\"" + site + "\" date=\""+date+"\">" + str + "<div class=\"tiny-name\">" + participant + " " + date + " " + siteScore + "&#37;</div></div>");
	// update the sites completeness score
	if (siteScore != "NA") {
	    var n = parseInt(jQuery("span."+site + "-completeness").attr('n')) + 1;
	    var oldavg = parseFloat(jQuery("span."+site + "-completeness").attr('oldavg'));
	    var newavg = oldavg + ((countGood/countAll * 100.0) - oldavg)/n;
	    jQuery("span."+site + "-completeness").attr('n', n);
	    jQuery("span."+site + "-completeness").attr('oldavg', newavg);
	    jQuery("span."+site + "-completeness").html(newavg.toFixed(0) + "&#37;");
	}

	var popOverSettings = {
	    placement: 'bottom',
	    container: 'body',
	    html: true,
	    selector: '[data-toggle="popover"]', //Sepcify the selector here
	    content: function () {
		return $('#popover-content').html();
	    }
	}
	jQuery('body').popover(popOverSettings);

	if (errors.length > 0)
	    console.log("Error: tried to pull value for non-existent variables: " + errors.join(","));
    });
}
// ([base_screenout] = '0' or [base_out_reason] = '4') and [baseline_visits_num] >= '3'

