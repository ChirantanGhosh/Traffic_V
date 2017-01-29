queue()
    .defer(d3.json, "/data")
    .await(makeGraphs);

function makeGraphs(error, recordsJson) {
	
	//Clean data
	var records = recordsJson;
	var dateFormat = d3.time.format("%Y-%m-%d %H:%M:%S");
	
	records.forEach(function(d) {
		d["TimeOfStop"] = dateFormat.parse(d["TimeOfStop"]);
		d["TimeOfStop"].setMinutes(0);
		d["TimeOfStop"].setSeconds(0);
		d["Longitude"] = +d["Longitude"];
		d["Latitude"] = +d["Latitude"];
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(records);

	//Define Dimensions
	var dateDim = ndx.dimension(function(d) { return d["TimeOfStop"]; });
	var GenderDim = ndx.dimension(function(d) { return d["Gender"]; });
	var RaceSegmentDim = ndx.dimension(function(d) { return d["Race"]; });
	var MakeBrandDim = ndx.dimension(function(d) { return d["Make"]; });
	var LocationdDim = ndx.dimension(function(d) { return d["Location"]; });
	var allDim = ndx.dimension(function(d) {return d;});


	//Group Data
	var numRecordsByDate = dateDim.group();
	var GenderGroup = GenderDim.group();
	var RaceSegmentGroup = RaceSegmentDim.group();
	var MakeBrandGroup = MakeBrandDim.group();
	var LocationGroup = LocationdDim.group();
	var all = ndx.groupAll();


	//Define values (to be used in charts)
	var minDate = dateDim.bottom(1)[0]["TimeOfStop"];
	var maxDate = dateDim.top(1)[0]["TimeOfStop"];


    //Charts
    var numberRecordsND = dc.numberDisplay("#number-records-nd");
	var TimeOfStopChart = dc.barChart("#TimeOfStop-chart");
	var GenderChart = dc.rowChart("#Gender-row-chart");
	var RaceSegmentChart = dc.rowChart("#Race-segment-row-chart");
	var MakeBrandChart = dc.rowChart("#Make-brand-row-chart");
	var LocationChart = dc.rowChart("#Location-row-chart");



	numberRecordsND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);


	TimeOfStopChart
		.width(650)
		.height(140)
		.margins({top: 10, right: 50, bottom: 20, left: 20})
		.dimension(dateDim)
		.group(numRecordsByDate)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.yAxis().ticks(4);

	GenderChart
        .width(300)
        .height(100)
        .dimension(GenderDim)
        .group(GenderGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .xAxis().ticks(4);

	RaceSegmentChart
		.width(300)
		.height(150)
        .dimension(RaceSegmentDim)
        .group(RaceSegmentGroup)
        .colors(['#6baed6'])
        .elasticX(true)
        .labelOffsetY(10)
        .xAxis().ticks(4);

	MakeBrandChart
		.width(300)
		.height(310)
        .dimension(MakeBrandDim)
        .group(MakeBrandGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .xAxis().ticks(4);

    LocationChart
    	.width(200)
		.height(510)
        .dimension(LocationdDim)
        .group(LocationGroup)
        .ordering(function(d) { return -d.value })
        .colors(['#6baed6'])
        .elasticX(true)
        .labelOffsetY(10)
        .xAxis().ticks(4);

    var map = L.map('map');

	var drawMap = function(){

	    map.setView([39.07111224327249, -77.09968477555934], 4);
		mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
		L.tileLayer(
			'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; ' + mapLink + ' Contributors',
				maxZoom: 15,
			}).addTo(map);

		//HeatMap
		var geoData = [];
		_.each(allDim.top(Infinity), function (d) {
			geoData.push([d["latitude"], d["longitude"], 1]);
	      });
		var heat = L.heatLayer(geoData,{
			radius: 10,
			blur: 20, 
			maxZoom: 1,
		}).addTo(map);

	};

	//Draw Map
	drawMap();

	//Update the heatmap if any dc chart get filtered
	dcCharts = [TimeOfStopChart, GenderChart, RaceSegmentChart, MakeBrandChart, LocationChart];

	_.each(dcCharts, function (dcChart) {
		dcChart.on("filtered", function (chart, filter) {
			map.eachLayer(function (layer) {
				map.removeLayer(layer)
			}); 
			drawMap();
		});
	});

	dc.renderAll();

};