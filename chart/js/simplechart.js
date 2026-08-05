// Versions
var DEF_PROSTICKS = "prosticks";
var DEF_PROSTICKS_TEST = "test";
var DEF_ETNET_BUNDLED = "etnet0";
var DEF_ETNET_VALADD = "etnet1";

// Languages
var DEF_ENGLISH = 0;
var DEF_TCHINESE = 1;
var DEF_SCHINESE = 2;
var DEF_JAPANESE = 3;
var DEF_KOREAN = 4;

var DEF_OK = 0;
var DEF_FAIL = -1;

// Refresh
var DEF_REFRESH_INTERVAL = 60;		// seconds

// Exch
var DEF_EXCH_HK	= "HK";
var DEF_EXCH_IX	= "IX";
var DEF_EXCH_CU	= "CU";
var DEF_EXCH_US	= "US";

// Unit
var DEF_UNIT_K	= "K";
var DEF_UNIT_M	= "M";


// Chart Types
var DEF_PROSTICKS_CHART		= 0;
var DEF_PROSTICKS_VOL_CHART	= 1;
var DEF_BAR_CHART			= 2;	//3
var DEF_BAR_MODAL_CHART		= 3;	//5
var DEF_CANDLE_CHART		= 4;	//2
var DEF_MODAL_LINE_CHART	= 5;	//6
var DEF_LINE_CHART			= 6;	//4
var DEF_AREA_CHART			= 7;
var DEF_BAR_MODAL_VOL_CHART	= 8;
var DEF_MODAL_LINE_VOL_CHART = 9;
var DEF_MCANDLE_CHART		= 10;
var DEF_PCANDLE_CHART		= 11;

// Chart Intervals
var DEF_DAY		= 0;
var DEF_WEEK	= 1;
var DEF_MONTH	= 2;
var DEF_MIN		= 3;
var DEF_5MIN	= 4;
var DEF_10MIN	= 5;
var DEF_15MIN	= 6;
var DEF_30MIN	= 7;
var DEF_HOUR	= 8;
var DEF_2HOUR	= 9;
var DEF_4HOUR	= 10;
var DEF_INTERVAL_TEXT = ["D", "W", "M", "1m", "5m", "10m", "15m", "30m", "1h", "2h", "4h"];
var DEF_INTERVAL_LONGTEXT = ["Daily", "Weekly", "Monthly", "1-min", "5-min", "10-min", "15-min", "30-min", "1-hour", "2-hour", "4-hour"];
var DEF_INTERVAL_LANG = ["Daily", "Weekly", "Monthly", "Min1", "Min5", "Min10", "Min15", "Min30", "Hour1", "Hour2", "Hour4"];


// Upper Tech
var DEF_UT_NONE = 0;
var DEF_SMA	= 1;
var DEF_BOLL = 2;
var DEF_EMA = 3;
var DEF_SAR = 4;
var DEF_IKH = 5;
var DEF_WMA = 6;
var DEF_MAE = 7;
var DEF_KC = 8;
var DEF_UTECH_TEXT = ["N/A", "SMA", "Boll", "EMA", "SAR", "Ichimoku", "WMA", "MAE", "KC"];

// Lower Tech
var DEF_LT_NONE = 0;
var DEF_VOLUME = 1;
var DEF_RSI = 2;
var DEF_MACD = 3;
var DEF_STC = 4;
var DEF_MOM = 5;
var DEF_PCTR = 6;
var DEF_OBV = 7;
var DEF_MC = 8;
var DEF_ROC = 9;
var DEF_ADX = 10;
var DEF_MFI = 11;
var DEF_VOLA = 12;
var DEF_VOLUMEPLUS = 13;
var DEF_VAO = 14;
var DEF_CCI = 15;
var DEF_ATR = 16;
var DEF_LTECH_TEXT = ["N/A", "VOLUME", "RSI", "MACD", "STC", "MOM", "PCTR", "OBV", "MC", "ROC", "ADX", "MFI", "VOLA", "VOLP", "VAO", "CCI", "ATR"];

// Tool
var DEF_TOOL_NONE = 0;
var DEF_TOOL_DRAWLINE = -1;
var DEF_TOOL_TRENDLINE = 1;
var DEF_TOOL_PARALLEL_LINE = 2;
var DEF_TOOL_CLEAR_ONELINE = 3;
var DEF_TOOL_CLEAR_ALLLINE = 4;
var DEF_TOOL_FIBON_RET = 5;
var DEF_TOOL_FIBON_PRO = 6;
var DEF_TOOL_CLEAR_FIBON = 7;
var DEF_TOOL_TEXTBOX = 8;
var DEF_TOOL_CLEAR_ONETEXT = 9;
var DEF_TOOL_CLEAR_ALLTEXT = 10;

// Chart Scale
var offsetXS = 42;	// Offset X scale : 30
var offsetXX = 8;	// Offset X gap
var offsetXM = 8;	// Offset X margin
var offsetYS = 16;	// Offset Y scale : 16
var offsetYY = 4;	// Offset Y axis
var offsetYM = 24;	// Offset Y margin : 8

var offsetXG = 0;	// Offset X gap : 24
var offsetYT = 10;	// Offset Y top
var offsetTS = 20;	// Offset Technical scale
var offsetTB;		// Offset Technical header
	
var DEF_MAX_OFFSET_XS = 42;
var DEF_MAX_OFFSET_YS = 20;
var DEF_MAX_OFFSET_TS = 100;
var DEF_MAX_OFFSET_TB = 22;

var DEF_MIN_BAR_SPACING = 1;
var DEF_MIN_PRO_BAR_WIDTH = 3;	//3
var DEF_MIN_PRO_BAR_HAND = 1;
var DEF_MAX_PRO_BAR_WIDTH = 9;	//13
var DEF_MAX_PRO_BAR_HAND = 3;

var DEF_MIN_PRO_MP_DIAMETER = 1; // 3
var DEF_MAX_PRO_MP_DIAMETER = 5;
var DEF_MIN_PRO_MP_RADIUS = 1;

var DEF_DOT_WIDTH = 2;		// dotted line width (Technical sp. line)
var DEF_DOT_SPACE = 10;		// dotted line space (Technical sp. line)

// Strings
var DEF_MONTH_NAME = [["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],		// ENG
					  ["1\u6708","2\u6708","3\u6708","4\u6708","5\u6708","6\u6708","7\u6708","8\u6708","9\u6708","10\u6708","11\u6708","12\u6708"],		// TC
					  ["1\u6708","2\u6708","3\u6708","4\u6708","5\u6708","6\u6708","7\u6708","8\u6708","9\u6708","10\u6708","11\u6708","12\u6708"],		// SC
					 ];
/*
var DEF_MONTH_NAME = [["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],		// ENG
					  ["1る","2る","3る","4る","5る","6る","7る","8る","9る","10る","11る","12る"],		// TC
					  ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"]];	// SC
*/

// Draw Bars
var startBarNo;				// Index of the first bar in the chart (default : 100)
var startExBarNo;			// Index of the first bar (default : 0)
var drawBarNo=90;			// No. of visible bars (default : user-dependent)
var drawExBarNo;			// No. of all valid bars (default : 400 - 300 actual + 100 extension)
var lastBarNo;				// The latest actual bar (default : 100)
var activeBar;				// Bar pointed by value cursor
var shiftBarNo=0;			// Current Shift Bar #

// X Scale
var barWidth;				// Bar width
var barHand;				// Bar hand
var barSpacing;				// Bar spacing
var mpDiameter;				// MP diameter
var mpRadius;				// MP radius

// Y Scale
var maxHigh;				// Max. value of Y-axis
var minLow;					// Min. value of Y-axis
var finalScale;				// Y-axis scale in price
var yRatio;					// Y-axis scale in pixel
var drawMaxHigh;
var drawMinLow;
var chartMaxHigh;
var chartMinLow;

// Grid
var drawGrid=true;

var DEF_BASE_VALUE = 10000;
var DEF_OPT_SCALE = [ 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 7.5, 8, 9 ];

// Tech
var DEF_CALCBY_LAST = 0;
var DEF_CALCBY_MP = 1;
var DEF_CALCBY_HIGH = 2;
var DEF_CALCBY_LOW = 3;

var DEF_MAX_TECH = 7;			// Total no. of technicals available
var DEF_MAX_TECH_OVERLAY = 3;	// Maximum overlay technicals
var DEF_MAX_TECH_PANE = 4;		// Maximum technical panes
var DEF_MAX_TECH_PARM = 5;		// Maximum technical parameters
var DEF_MAX_TECH_SP = 4;		// Special values used in technical pane

var DEF_ZOOM_DRAWBAR = 30;
var DEF_SHIFT_DRAWBAR = 10;
var DEF_MAX_RIGHT_SHIFT = 50;

var techOverlayNo=0;		// No. of overlay technicals visible
var techPaneNo=0;			// No. of pane technicals visible

var techZero;				// Used in MACD

var techMaxHigh=[];
var techMinLow=[];
var techFinalScale=[];
var techYRatio=[];
var techDrawMaxHigh=[];
var techDrawMinLow=[];
var techChartMaxHigh=[];
var techChartMinLow=[];

var techPaneExName=[];		// English name
var techPaneName=[];		// Name in display language
var techPaneParm=[];		// No. of technical input parameters
var techPaneValue=[];		// Technical input parameters (2D)
var techPaneBar=[];			// No. of display bars for each technical (2D)
var techPaneText=[];		// Formatted display for technical values (2D)
var techPaneSp=[];			// Reference lines for particular technical (2D)
var techPaneColor=[];		//  (2D)

var techOverlayExName=[];
var techOverlayName=[];
var techOverlayParm=[];
var techOverlayValue=[];	// (2D)
var techOverlayBar=[];		// (2D)
var techOverlayText=[];		// (2D)
var techOverlayColor=[];	// (2D)

// Colors
var DEF_BLACK_COLOR = "#000000";
var DEF_WHITE_COLOR = "#FFFFFF";

var DEF_AXIS_COLOR = "#C0C0C0";
var DEF_MAJOR_GRID_COLOR = "#D0D0D0";	// Major Grid : light grey 3(#D0D0D0)
var	DEF_GRID_COLOR = "#F0F0F0";			// Grid : ligh grey 1(#F0F0F0)
var DEF_TITLE_COLOR = "#003366";
var DEF_FONT_COLOR = "#202020";			// Font : dark grey(#202020)
var DEF_BAR_COLOR = "#000000";			// Bar : black(#000000)
var DEF_MP_COLOR = "#FF0000";			// Modal Point : red(#FF0000)
var DEF_IMPMP_COLOR = "#FF0080";		// Important MP : Voilet(#FF0080)
var DEF_TAIL_COLOR = "#0000FF";			// Extreme Tail : blue(#0000FF)
var DEF_LINE_COLOR = "#FF0080";			// All Lines : Voilet(#FF0080)
var DEF_AREA_COLOR = "#60B0FF";			// Fill Area Color : pale blue(#60B0FF)
var DEF_TEXT_COLOR = "#0000FF";			// Text Color : blue

var DEF_TEMPLINE_COLOR = "#C0C0C0";		// Temp Lines : Grey(#C0C0C0)

var DEF_PROSTICKS_DOWN_COLOR = "#B0D0F0";

var DEF_FIBRE_COLOR = "#6090F0";
var DEF_FIBPR_COLOR = "#9060F0";

var DEF_TECH_DOTTED_LINE = "#FF0000";	// Tech Dotted Line : Red(#FF0000)
var DEF_TECH_DOTTED_LINE2 = "#FF9900";	// Tech Dotted Line : Orange(#FF9900)

var DEF_IKH_KUMO_UP_COLOR = "#C0F0C0";
var DEF_IKH_KUMO_DN_COLOR = "#80A080";

var DEF_TECH_PANEBAR_COLOR = "#F0F0F0";			// Tech Bar : lightest grey 1(#F0F0F0)
var DEF_TECH_PANEBAR_BR_COLOR = "#A0C0D0";		// Tech Border : (#A0C0D0)
var DEF_TECH_PANEBAR_TEXT_COLOR = "#004080";	// Tech Text :  (#004080)

// Upper Technicals
var DEF_IKH_COLOR = ["#606060", "#D020A0", "#40C040", "#008000", "#20B0F0"];
var DEF_IKH_PARAM = [7, 22, 44];

var DEF_SMA_COLOR = ["#4000C0", "#C04000", "#00A040", "#FFA0A0", "#A0A0FF"];
var DEF_SMA_PARAM = [10, 20, 50];

var DEF_EMA_COLOR = ["#0000A0", "#A00000", "#00A000", "#FFA0A0", "#A0A0FF"];
var DEF_EMA_PARAM = [10, 20, 50];

var DEF_WMA_COLOR = ["#0000A0", "#FFA0FF", "#00D080", "#FFA0A0", "#A0A0FF"];
var DEF_WMA_PARAM = [10, 20, 50];

var DEF_BOLL_COLOR = ["#0000F0", "#0000F0", "#00A000", "#00A000"];
var DEF_BOLL_PARAM = [20, 2];

var DEF_SAR_COLOR = ["#0000E0", "#0000E0", "#0000E0", "#0000E0"];
var DEF_SAR_PARAM = [0.02, 0.02, 0.2];

var DEF_MAE_COLOR = ["#0000F0", "#0000F0", "#00A000", "#00A000"];
var DEF_MAE_PARAM = [20, 5];

var DEF_KC_COLOR = ["#F00000", "#00A000", "#00A000", "#F00000"];
var DEF_KC_PARAM = [10];


// Lower Technicals
var DEF_RSI_COLOR = ["#0000FF", "#C000C0", "#FF0000", "#004000"];
var DEF_RSI_PARAM = [14];

var DEF_STC_COLOR = ["#0000FF", "#C000C0", "#FF0000", "#004000"];
var DEF_STC_PARAM = [14, 3, 3];

var DEF_MOM_COLOR = ["#0000FF", "#C000C0", "#FF0000", "#004000"];
var DEF_MOM_PARAM = [10, 3, 3];

var DEF_MACD_COLOR = ["#004000", "#FF0000", "#0000FF", "#C000C0"];
var DEF_MACD_PARAM = [12, 26, 9];

var DEF_MC_COLOR = ["#4080FF", "#C000C0", "#FF0000", "#004000"];
var DEF_MC_PARAM = [300];
//var DEF_MC_PARAM = [300, 0, 0];

var DEF_VOLUME_COLOR = ["#4080FF", "#C000C0", "#FF0000", "#004000"];
var DEF_VOLUME_PARAM = [];
//var DEF_VOLUME_PARAM = [100, 0, 0];

var DEF_VOLUMEPLUS_COLOR = ["#4080FF", "#C000C0", "#00D080", "#FFA0A0"];
var DEF_VOLUMEPLUS_PARAM = [100];
//var DEF_VOLUMEPLUS_PARAM = [100, 0, 0];

var DEF_ADX_COLOR = ["#0000FF", "#FF0000", "#004000", "#C000C0"];
var DEF_ADX_PARAM = [14];
//var DEF_ADX_PARAM = [14, 0, 0];

var DEF_OBV_COLOR = ["#4080FF", "#C000C0", "#FF0000", "#004000"];
var DEF_OBV_PARAM = [10];

var DEF_MFI_COLOR = ["#0000FF", "#C000C0", "#FF0000", "#004000"];
var DEF_MFI_PARAM = [14];
//var DEF_MFI_PARAM = [14, 0, 0];

var DEF_PCTR_COLOR = ["#0000FF", "#C000C0", "#FF0000", "#004000"];
var DEF_PCTR_PARAM = [10];
//var DEF_PCTR_PARAM = [10, 0, 0];

var DEF_ROC_COLOR = ["#0000FF", "#C000C0", "#FF0000", "#004000"];
var DEF_ROC_PARAM = [14];
//var DEF_ROC_PARAM = [14, 0, 0];

var DEF_VOLA_COLOR = ["#0000FF", "#C000C0", "#FF0000", "#004000"];
var DEF_VOLA_PARAM = [10];
//var DEF_VOLA_PARAM = [10, 0, 0];

var DEF_VAO_COLOR = ["#4080FF", "#C000C0", "#00D080", "#FFA0A0"];
var DEF_VAO_PARAM = [10];

var DEF_CCI_COLOR = ["#4080FF", "#C000C0", "#00D080", "#FFA0A0"];
var DEF_CCI_PARAM = [5];

var DEF_ATR_COLOR = ["#4080FF", "#C000C0", "#00D080", "#FFA0A0"];
var DEF_ATR_PARAM = [14];

var isShowADXDI=true;

// Arrows
var DEF_TYPE_DNARROW = 0;
var DEF_TYPE_UPARROW = 1;

var DEF_DNARROW_COLOR = "#0000FF";
var DEF_UPARROW_COLOR = "#FF0000";

// Support / Resistance
var DEF_RESISTANCE_COLOR	= "#0000FF";
var DEF_SUPPORT_COLOR		= "#FF0000";


// Tools
var drawLineOn=false;						// Line
var drawLX, drawLY, saveDrawLX, saveDrawLY;
var drawTrendLineOn=false;					// Trend Line
var drawTX, drawTY, saveDrawTX, saveDrawTY;
var drawParallelLineOn=false;				// Parallel Line
var isDrawParallelLine=false;				
var drawPX, drawPY, saveDrawPX, saveDrawPY;
var saveTouchX,saveTouchY;
var lineStore=[];							// Stores manual drawn trendline
var linePriceStore=[];
var lineBarStore=[];
var lineType=[];
var textBoxOn=false;						// Text Box
var boxX, boxY;
var textBox;
var textBoxStore=[];						// Stores textboxes
var textBoxLocation=[];						// Textbox locations
var fibReOn=false;							// Fibon. Retracement
var fibPrOn=false;							// Fibon. Projection
var fibRePoint=[];							// Array of selected points for retracement
var fibPrPoint=[];							// Array of selected points for projection
var fibRe=[];								// Array of computed Fib Retracement
var fibPr=[];								// Array of computed Fib Projection
var drawFibRe=[];							// Array of Fib Re pixel values
var drawFibPr=[];							// Array of Fib Pr pixels values
var fibReRatio = [ 0.382, 0.5, 0.618, 1.618, 2 ];	// Array of retracement ratio
var fibPrRatio = [ 0.618, 1, 1.618 ];				// Array of projection ratio
var fibIndex=0;
var saveFibX, saveFibY;

// Fonts
var DEF_FONT = "10px Arial";

// Data
var barData;

// Chart Parameters
var version;
var withFutures;						// 0=No Futures, 1=With Futures
var sCode;								// Passed-in Code
var code, exch, interval, typeChart;
var codeName;
var upper, lower;
var tool;
var chartCalcMethod=DEF_CALCBY_MP;		// Calc. method: by last price or MP
var oldcode = "";
var oldinterval = 999;
var oldtool=0;
var dps = 4;
var lang = 0;
var X,Y;
var containerID="cvsChart";
var domain=window.location.hostname;
var reload;
var isHttps=false;
var prot="http:";

var _lang;
var _valueCursorCross=true;

// Support / Resistance
var supportMP=0;
var resistMP=0;
var latestMP=0;
var latestMC=0;
var averageMC=0;
var margin=200;

// CBBC
var bullCode;
var bullCallLevel;
var bullPrice;
var bullVolume;

var bearCode;
var bearCallLevel;
var bearPrice;
var bearVolume;

// Dummy Layer
var overlayID = "cvsChartOver";
var ctxOver;

// Locale
var timeoffset = new Date().getTimezoneOffset();

// Date Format
var DEF_DATETIME_FORMAT = "yyyymmddHHMM"
var DEF_TITLE_DATE_FORMAT = "mm/dd"
var DEF_TITLE_DATETIME_FORMAT = "mm/dd HH:MM"
var DEF_TITLE_DAY_FORMAT = "dd"

function Language(lang)
{
    var __construct = function() {
        if (eval('typeof ' + lang) == 'undefined')
        {
            lang = "en";
        }
        return;
    }()

    this.getStr = function(str, defaultStr) {
        var retStr = eval('eval(lang).' + str);
        if (typeof retStr != 'undefined')
        {
            return retStr;
        }
        else
        {
            if (typeof defaultStr != 'undefined')
            {
                return defaultStr;
            }
            else
            {
                return eval('en.' + str);
            }
        }
    }
}


function saveSettings()
{
	if (window.localStorage)
	{
		if (exch == DEF_EXCH_HK)
			localStorage.setItem("codeHK", code);
		else if (exch == DEF_EXCH_HK)
			localStorage.setItem("codeIX", code);
		else
			localStorage.setItem("code", code);
		
		localStorage.setItem("exch", exch);
		localStorage.setItem("interval", interval);
		localStorage.setItem("charttype", typeChart);
		localStorage.setItem("upper", upper);
		localStorage.setItem("lower", lower);
		//localStorage.clear();
	}
}

function loadSettings()
{
	var value;
	/* Disabled
	if (window.localStorage)
	{
		value = localStorage.getItem("exch");
		if (value && value != "undefined")
		{
			exch = value;
			document.getElementById('exch').value = exch;
		}
		else
			exch = DEF_EXCH_HK;

		if (sCode && !isNaN(sCode))
		{
			exch = DEF_EXCH_HK;
			document.getElementById('exch').value = exch;
			document.getElementById('codeHK').value = sCode;
		}
		else
		{
			value = localStorage.getItem("codeHK");
			if (value && value != "undefined")
				document.getElementById('codeHK').value = value;
			//console.log("codeHK = "+value);

			value = localStorage.getItem("codeIX");
			if (value && value != "undefined")
				document.getElementById('codeIX').value = value;

			value = localStorage.getItem("codeUS");
			if (value && value != "undefined")
				document.getElementById('codeUS').value = value;
			//console.log("codeHK = "+value);

			value = localStorage.getItem("code");
			if (value && value != "undefined")
				document.getElementById('code').value = value;
			//console.log("code = "+value);
		}
		
		value = localStorage.getItem("interval");
		if (value && value != "undefined")
			document.getElementById('interval').value = value;

		value = localStorage.getItem("charttype");
		if (value && value != "undefined")
			document.getElementById('type').value = value;

		value = localStorage.getItem("upper");
		if (value && value != "undefined")
			document.getElementById('upper').value = value;

		value = localStorage.getItem("lower");
		if (value && value != "undefined")
			document.getElementById('lower').value = value;
	}
	*/
}

function setReload()
{
	if (reload)
		clearInterval(reload);
	reload = setInterval( function(){ refreshChart() }, DEF_REFRESH_INTERVAL*1000);
}

function setChartParam()
{
	var e;
	
	e = document.getElementById('exch');
	if (e && e != "undefined" && e.selectedIndex > 0)
		exch = e.options[e.selectedIndex].value;
	else
		exch = "CU";

	//console.log("setChartParam, exch = "+exch);
	updateExch();

	if (exch == DEF_EXCH_IX)
	{
		e = document.getElementById('codeIX');
		if (e && e != "undefined" && e.selectedIndex > 0)
			code = e.options[e.selectedIndex].value;
		else
			code = "/HSI";
		
	}
	else if (exch == DEF_EXCH_HK)
	{
		e = document.getElementById('codeHK');
		if (e && e != "undefined")
			code = e.value;
		else
			code = "0001";
	}
	else if (exch == DEF_EXCH_US)
	{
		e = document.getElementById('codeUS');
		if (e && e != "undefined" && e.selectedIndex > 0)
			code = e.options[e.selectedIndex].value;
		else
			code - "/DJIA";
	}
	else
	{
		e = document.getElementById('code');
		if (e.selectedIndex >= 0)
			code = e.options[e.selectedIndex].value;
		else if (e && e != "undefined")
			code = e.value;
		else
			code = "JPY";
	}

	e = document.getElementById('interval');
	if (e && e != "undefined" && e.selectedIndex > 0)
		interval = parseInt(e.options[e.selectedIndex].value);
	else
		interval = 0;	// daily

	e = document.getElementById('type');
	if (e && e != "undefined" && e.selectedIndex > 0)
		typeChart = parseInt(e.options[e.selectedIndex].value);
	else
		typeChart = 6;	// line

	e = document.getElementById('upper');
	if (e && e != "undefined" && e.selectedIndex > 0)
		upper = parseInt(e.options[e.selectedIndex].value);
	else
		upper = 0;		// None
	
	e = document.getElementById('lower');
	if (e && e != "undefined" && e.selectedIndex > 0)
		lower = parseInt(e.options[e.selectedIndex].value);
	else
		lower = 0;		// None

	e = document.getElementById('tool');
	if (e && e != "undefined" && e.selectedIndex > 0)
		tool = parseInt(e.options[e.selectedIndex].value);
	else
		tool = 0;		// None

	setTool();
	//console.log("tech : " + upper + "," + lower);

	if (exch == DEF_EXCH_CU || exch == DEF_EXCH_IX)	// No ProSticks-by-Vol
	{
		if (typeChart == DEF_PROSTICKS_VOL_CHART)
			typeChart = DEF_PROSTICKS_CHART;
		if (typeChart == DEF_BAR_MODAL_VOL_CHART)
			typeChart = DEF_BAR_MODAL_CHART;	
		if (typeChart == DEF_MODAL_LINE_VOL_CHART)
			typeChart = DEF_BAR_MODAL_CHART;
	}
	
	if (interval > DEF_MONTH)		// Intraday - No ProSticks
	{
		if (typeChart == DEF_PROSTICKS_CHART)
			typeChart = DEF_CANDLE_CHART;
		if (typeChart == DEF_BAR_MODAL_CHART)
			typeChart = DEF_BAR_CHART;	
		if (typeChart == DEF_MODAL_LINE_CHART)
			typeChart = DEF_LINE_CHART;
	}

	dps = 2;
	if (exch == DEF_EXCH_HK)
		dps = 3;
	else if (exch == DEF_EXCH_CU)
	{
		if (code.indexOf("JPY") > -1)
			dps = 2;
		else if (code.indexOf("XAU") > -1	|| code.indexOf("XAG") > -1)
			dps = 1;
		else
			dps = 4;
	}
}

function updateTitleBar()
{
	var textString;
	var date;
	
	textString = codeName + "("+code + ") " + _lang.getStr(DEF_INTERVAL_LANG[interval]) + " " + _lang.getStr("chart");
	//console.log(textString);
	$("div#titletext").text(textString);
	//$("div#titletext").innerHTML = textString;
	//$("titletext").update(textString);
	//console.log($("div#titletext").innerHTML);
}

function refreshChart()
{
	setChartParam();
	loadData();
	drawChart();
}

function updateExch()
{
	if (exch == DEF_EXCH_IX)
	{
		$("#inputHK").hide();
		$("#selectIX").show();
		$("#selectCU").hide();
		$("#selectUS").hide();
		
		$("#inputHK *").prop('disabled',true);
		$("#selectIX *").prop('disabled',false);
		$("#selectCU *").prop('disabled',true);
		$("#selectUS *").prop('disabled',true);
	}
	else if (exch == DEF_EXCH_HK)
	{
		$("#inputHK").show();
		$("#selectIX").hide();
		$("#selectCU").hide();
		$("#selectUS").hide();

		$("#inputHK *").prop('disabled',false);
		$("#selectIX *").prop('disabled',true);
		$("#selectCU *").prop('disabled',true);
		$("#selectUS *").prop('disabled',true);
	}
	else if (exch == DEF_EXCH_US)
	{
		$("#inputHK").hide();
		$("#selectIX").hide();
		$("#selectCU").hide();
		$("#selectUS").show();

		$("#inputHK *").prop('disabled',true);
		$("#selectIX *").prop('disabled',true);
		$("#selectCU *").prop('disabled',true);
		$("#selectUS *").prop('disabled',false);
	}
	else // CU
	{
		$("#inputHK").hide();
		$("#selectIX").hide();
		$("#selectCU").show();
		$("#selectUS").hide();

		$("#inputHK *").prop('disabled',true);
		$("#selectIX *").prop('disabled',true);
		$("#selectCU *").prop('disabled',false);
		$("#selectUS *").prop('disabled',true);
	}
}

function updateChart()
{
	setChartParam();
	saveSettings();
	
	if (code != oldcode || oldinterval != interval)
	{
		loadData();
		initChartBar(true);
	}
	
	drawChart();
	setReload();
}

function exportChart()
{
	createImageDataPressed();
}

function changeParameter()
{
	var DEF_MAX_PARAM = 3;
	var div = document.getElementById("paramform");
	div.style.display = "block";
	
	document.getElementById("upper").disabled = true;
	document.getElementById("lower").disabled = true;
	
	var u_lbl = document.getElementById("u_lbl");
	u_lbl.innerHTML = DEF_UTECH_TEXT[upper];
	
	var parm;
	for (i=0; i<DEF_MAX_PARAM; i++)
	{
		parm = document.getElementById("u_p"+(i+1));
		if (i<techOverlayParm[0])
		{
			parm.style.display = "inline";
			parm.value = techOverlayValue[techOverlayNo-1][i];
		}
		else
			parm.style.display = "none";
	}

	var l_lbl = document.getElementById("l_lbl");
	l_lbl.innerHTML = DEF_LTECH_TEXT[lower];

	for (i=0; i<DEF_MAX_PARAM; i++)
	{
		parm = document.getElementById("l_p"+(i+1));
		if (i<techPaneParm[0])
		{
			parm.style.display = "inline";
			parm.value = techPaneValue[techPaneNo-1][i];
		}
		else
			parm.style.display = "none";
	}

}

function saveParameter()
{
	var parm;
	var value;
	var arr;
	
	switch (upper)
	{
		case DEF_SMA:
			arr = DEF_SMA_PARAM;
		break;
		case DEF_BOLL:
			arr = DEF_BOLL_PARAM;
		break;
		case DEF_EMA:
			arr = DEF_EMA_PARAM;
		break;
		case DEF_SAR:
			arr = DEF_SAR_PARAM;
		break;
		case DEF_IKH:
			arr = DEF_IKH_PARAM;
		break;
		case DEF_WMA:
			arr = DEF_WMA_PARAM;
		break;
		case DEF_MAE:
			arr = DEF_MAE_PARAM;
		break;
		case DEF_KC:
			arr = DEF_KC_PARAM;
		break;
	}
	
	for (i=0; i<techOverlayParm[0]; i++)
	{
		parm = document.getElementById("u_p"+(i+1));
		value = parseFloat(parm.value);
		if (value > 0)
		{
			techOverlayValue[techOverlayNo-1][i] = value;
			arr[i] = value;
		}
	}

	switch (lower)
	{
		case DEF_RSI:
			arr = DEF_RSI_PARAM;
		break;
		case DEF_MACD:
			arr = DEF_MACD_PARAM;
			break;
		case DEF_STC:
			arr = DEF_STC_PARAM;
			break;
		case DEF_MOM:
			arr = DEF_MOM_PARAM;
			break;
		case DEF_PCTR:
			arr = DEF_PCTR_PARAM;
			break;
		case DEF_MC:
			arr = DEF_MC_PARAM;
			break;
		case DEF_ROC:
			arr = DEF_ROC_PARAM;
			break;
		case DEF_ADX:
			arr = DEF_ADX_PARAM;
			break;
		case DEF_MFI:
			arr = DEF_MFI_PARAM;
			break;
		case DEF_VOLA:
			arr = DEF_VOLA_PARAM;
			break;
	}
	
	for (i=0; i<techPaneParm[0]; i++)
	{
		parm = document.getElementById("l_p"+(i+1));
		value = parseFloat(parm.value);
		if (value > 0)
		{
			techPaneValue[techPaneNo-1][i] = value;
			arr[i] = value;			
		}
	}
	drawChart();

	document.getElementById("paramform").style.display = "none";	
	document.getElementById("upper").disabled = false;
	document.getElementById("lower").disabled = false;
}

function mouseMoveHandler(ctx, posX, posY)
{
	if ((posX < ctx.canvas.width - offsetXS - offsetXX - offsetXG) && (posX > offsetXM))
	{
		if (drawBarNo > 0)
		{
			var bar=-1;

			// Find the nearest bar
			if (barWidth + 2 * barHand + barSpacing > 0)
				bar = float2int((ctx.canvas.width - offsetXS - offsetXX - offsetXG - posX) / (barWidth + 2 * barHand + barSpacing));

			if ((bar >= 0) && (bar < drawBarNo))
			{
				var drawWidth = ctx.canvas.width - offsetXS - offsetXX - offsetXM - offsetXG; //Drawable width

				activeBar = bar + startBarNo;
				if (activeBar < startExBarNo)
					activeBar = startExBarNo;

				//console.log("Active Bar = " + activeBar);
				if ((barData[activeBar].o > 0) && (barData[activeBar].h > 0) &&
					(barData[activeBar].l > 0) && (barData[activeBar].c > 0))
				{
					setActiveBar(ctx, activeBar);
					updateTitle(ctx);
					drawTechPaneBar(ctx);
				}
			}
			
			var valueCursorOn;
			valueCursorOn = !(drawTrendLineOn || drawParallelLineOn || textBoxOn || fibPrOn || fibReOn);
			if (valueCursorOn)
			{
				if (ctxOver)
				{
					ctxOver.clearRect(0, 0, ctxOver.canvas.width, ctxOver.canvas.height);
					if (_valueCursorCross)
					{
						ctxOver.strokeStyle = DEF_BLACK_COLOR;
						if ((posX > offsetXM) && (posX < ctx.canvas.width - offsetXS - offsetXX))
						{
							ctxOver.beginPath();
							ctxOver.moveTo(posX, 0);
							ctxOver.lineTo(posX, ctx.canvas.height-1);
							ctxOver.stroke();
							ctxOver.closePath();								
						}

						if ((posY < chartMinLow) && (posY  > offsetYM)  && (drawExBarNo != 0))
						{
							ctxOver.beginPath();
							ctxOver.moveTo(0, posY);
							ctxOver.lineTo(ctx.canvas.width - offsetXS - offsetXX, posY);
							ctxOver.stroke();
							ctxOver.closePath();								
						}
						else
						{
							ctxOver.beginPath();
							ctxOver.moveTo(0, posY);
							ctxOver.lineTo(ctx.canvas.width - offsetXS - offsetXX, posY);
							ctxOver.stroke();
							ctxOver.closePath();								
						}
					}
					drawValueBox(ctxOver, {x:posX, y:posY});
				}
			}
		}  // drawBarNo > 0
		
		if (drawTrendLineOn)
		{
			if ((drawTX > 0) || (drawTY > 0))
			{
				if (ctxOver)
				{
					ctxOver.clearRect(0, 0, ctxOver.canvas.width, ctxOver.canvas.height);
					ctxOver.strokeStyle = DEF_TEMPLINE_COLOR;

					if ((saveDrawTX > 0) || (saveDrawTY >  0))
					{
						ctxOver.beginPath();
						ctxOver.moveTo(drawTX, drawTY);
						ctxOver.lineTo(saveDrawTX, saveDrawTY);
						ctxOver.stroke();
						ctxOver.closePath();
					}

					ctxOver.beginPath();
					ctxOver.moveTo(drawTX, drawTY);
					ctxOver.lineTo(posX, posY);
					ctxOver.stroke();
					ctxOver.closePath();
				}

				saveDrawTX = posX;
				saveDrawTY = posY;
			}
			//
		} // drawTrendLineOn

		if (drawParallelLineOn)
		{
			//ctx.globalCompositeOperation = 'xor';
			ctxOver.clearRect(0, 0, ctxOver.canvas.width, ctxOver.canvas.height);
			ctxOver.strokeStyle = DEF_TEMPLINE_COLOR;

			if (isDrawParallelLine)
			{
				var midX, midY;

				if (((drawPX > 0) || (drawPY > 0)) && ((saveDrawPX > 0) || (saveDrawPY > 0)))
				{
					ctxOver.beginPath();
					ctxOver.moveTo(drawPX, drawPY);
					ctxOver.lineTo(saveDrawPX, saveDrawPY);
					ctxOver.stroke();
					ctxOver.closePath();

					midX = (drawPX + saveDrawPX) / 2;
					midY = (drawPY + saveDrawPY) / 2;

					// Add displacement relative to previous line
					drawPX = drawPX + (posX - midX);
					drawPY = drawPY + (posY - midY);
					saveDrawPX = saveDrawPX + (posX - midX);
					saveDrawPY = saveDrawPY + (posY - midY);

					ctxOver.beginPath();
					ctxOver.moveTo(drawPX, drawPY);
					ctxOver.lineTo(saveDrawPX, saveDrawPY);
					ctxOver.stroke();
					ctxOver.closePath();
				}
			}
			else
			{
				if ((drawPX > 0) || (drawPY > 0))
				{
					if ((saveDrawPX > 0) || (saveDrawPY >  0))
					{
						ctxOver.beginPath();
						ctxOver.moveTo(drawPX, drawPY);
						ctxOver.lineTo(saveDrawPX, saveDrawPY);
						ctxOver.stroke();
						ctxOver.closePath();
					}

					ctxOver.beginPath();
					ctxOver.moveTo(drawPX, drawPY);
					ctxOver.lineTo(posX, posY);
					ctxOver.stroke();
					ctxOver.closePath();

					saveDrawPX = posX;
					saveDrawPY = posY;
					
				}
			}
		}  // drawParallelLineOn
		
		if (fibReOn)
		{
			/* todo
			if ((fibRePoint[0].x > 0) || (fibRePoint[0].y > 0))
			{
				fibRePoint[fibIndex].x = mousePos.x;
				fibRePoint[fibIndex].y = mousePos.y;

				var fibStart;
				var fibEnd;
				var sign;

				// Find start point: 100%
				fibStart = drawMaxHigh - yRatio * (fibRePoint[0].y - offsetYM - offsetYT);

				// Find end point: 0%
				fibEnd = drawMaxHigh - yRatio * (fibRePoint[1].y - offsetYM - offsetYT);

				if (fibStart > fibEnd)
					sign = 1;
				else
					sign = -1;

				// Loop through ratios to calculate percentage difference
				fibRe[0] = fibEnd;
				drawFibRe[0] = fibRePoint[1].y;

				for (i = 1; i < fibReRatio.length+1; i++)
				{
					fibRe[i] = sign * Math.abs(fibStart - fibEnd) * fibReRatio[i-1] + fibEnd;
					drawFibRe[i] = float2int(offsetYM + offsetYT + ((drawMaxHigh - fibRe[i]) / yRatio));
				}
				fibRe[6] = fibStart;
				drawFibRe[6] = fibRePoint[0].y;
				//repaint();
			}
			*/
		}

		if (fibPrOn)
		{
			/* todo
			if ((fibPrPoint[0].x > 0) && (fibPrPoint[0].y > 0) && (fibPrPoint[1].x > 0) && (fibPrPoint[1].y > 0))
			{
				fibPrPoint[fibIndex].x = mousePos.x;
				fibPrPoint[fibIndex].y = mousePos.y;

				var fibStart;
				var fibMid;
				var fibEnd;
				var sign;

				fibStart = drawMaxHigh - yRatio * (fibPrPoint[0].y - offsetYM - offsetYT);
				fibMid = drawMaxHigh - yRatio * (fibPrPoint[1].y - offsetYM - offsetYT);
				fibEnd = drawMaxHigh - yRatio * (fibPrPoint[2].y - offsetYM - offsetYT);

				if (fibMid >= fibEnd)
					sign = 1;
				else
					sign = -1;

				for (i = 0; i < fibPrRatio.length; i++)
				{
					fibPr[i] = sign * Math.abs(fibStart - fibMid) * fibPrRatio[i] + fibEnd;
					drawFibPr[i] = float2int(offsetYM + offsetYT + ((drawMaxHigh - fibPr[i]) / yRatio));
				}
				//repaint();
			}
			*/
		}				
	}
}

function mouseDownHandler(ctx, posX, posY)
{
	if ((posX < ctx.canvas.width - offsetXS - offsetXX - offsetXG) && (posX > offsetXM) && drawBarNo > 0)
	{
		var drawWidth = ctx.canvas.width - offsetXS;
		var drawHeight = ctx.canvas.height - offsetYS - techPaneNo * offsetTS - offsetYT;
		var mx = posX;
		var my = posY;
		
		if (drawTrendLineOn)
		{
			if ((mx > offsetXM) && (mx < drawWidth) && (my > offsetYM) && (my < offsetYT + drawHeight + techPaneNo * offsetTS))
			{
				if (((drawTX > 0) || (drawTY > 0)) && (mx != drawTX) && (my != drawTY))	// If drawX > 0 or drawY > 0 indicates the first point of this line is selected
				{
					var endX,endY;

					endX = ctx.canvas.width - offsetXS - offsetXX - offsetXG - barSpacing - barHand - float2int(barWidth / 2);
					endY = float2int((my - drawTY) * (endX - drawTX) / (mx - drawTX)) + drawTY;

					//ctx.save();
					//ctx.globalCompositeOperation = 'xor';
					ctx.beginPath();
					ctx.strokeStyle = DEF_LINE_COLOR;
					if (mx > drawTX)
					{
						ctx.moveTo(drawTX, drawTY);
						ctx.lineTo(endX, endY);
					}
					else
					{
						ctx.moveTo(mx, my);
						ctx.lineTo(endX, endY);
					}
					ctx.stroke();
					ctx.closePath();
					//ctx.restore();

					if (drawExBarNo > 0)
					{
						var tempY;
						if (mx > drawTX)
						{
							lineStore.push({x:drawTX, y:drawTY});	// Add first point
							tempY = (-1.0) * ((drawTY - offsetYT - offsetYM) * yRatio - drawMaxHigh);
							linePriceStore.push(tempY);
							lineBarStore.push(convertXcoordinate(ctx, drawTX));
							//lineType.push(DEF_TOOL_TRENDLINE);
						}
						else
						{
							lineStore.push({x:mx, y:my});			// Add first point
							tempY = (-1.0) * ((my - offsetYT - offsetYM) * yRatio - drawMaxHigh);
							linePriceStore.push(tempY);
							lineBarStore.push(convertXcoordinate(ctx, mx));
							//lineType.push(DEF_TOOL_TRENDLINE);
						}
						lineStore.push({x:endX, y:endY});			// Add second point
						tempY = (-1.0) * ((endY - offsetYT - offsetYM) * yRatio - drawMaxHigh);
						linePriceStore.push(tempY);
						lineBarStore.push(convertXcoordinate(ctx, endX));
						lineType.push(DEF_TOOL_TRENDLINE);
					}
					//console.log(lineStore + "|" + linePriceStore + "|" + lineBarStore + "|" + lineType);
					drawTX = drawTY = saveDrawTX = saveDrawTY = 0;	// Reset values
				}
				else
				{
					// The first point
					drawTX = saveDrawTX = mx;
					drawTY = saveDrawTY = my;
					/*
					ctx.beginPath();
					console.log(mx + "," + my + " vs " + drawTX + "," + drawTY + " vs " + saveDrawTX + "," + saveDrawTY);
					ctx.moveTo(drawTX, drawTY);
					ctx.lineTo(mx, my);		// Starting and ending point is the same
					ctx.stroke();
					*/
				}
			}
		} // drawTrendLineOn

		if (drawParallelLineOn)
		{
			if ((mx > offsetXM) && (mx < drawWidth) && (my > offsetYM) && (my < offsetYT + drawHeight + techPaneNo * offsetTS))
			{
				if (isDrawParallelLine)
				{
					//ctx.strokeStyle = DEF_BLACK_COLOR;
					if (((drawPX > 0) || (drawPY > 0)) && ((saveDrawPX > 0) || (saveDrawPY > 0)))
					{
						if (drawExBarNo > 0)
						{
							if ((drawPX > offsetXM) && (drawPX < drawWidth) && (drawPY > offsetYM) && (drawPY < offsetYT + drawHeight + techPaneNo * offsetTS) &&
								(saveDrawPX > offsetXM) && (saveDrawPX < drawWidth) && (saveDrawPY > offsetYM) && (saveDrawPY < offsetYT + drawHeight + techPaneNo * offsetTS))
							{
								if (((drawPX > 0) || (drawPY > 0)) && ((saveDrawPX > 0) || (saveDrawPY > 0)))
								{
									midX = (drawPX + saveDrawPX) / 2;
									midY = (drawPY + saveDrawPY) / 2;

									// Add displacement relative to previous line
									drawPX = drawPX + (mx - midX);
									drawPY = drawPY + (my - midY);
									saveDrawPX = saveDrawPX + (mx - midX);
									saveDrawPY = saveDrawPY + (my - midY);

									//ctx.globalCompositeOperation = 'xor';
									ctx.beginPath();
									ctx.strokeStyle = DEF_LINE_COLOR;
									ctx.moveTo(drawPX, drawPY);
									ctx.lineTo(saveDrawPX, saveDrawPY);
									ctx.stroke();
									ctx.closePath();
									//ctx.globalCompositeOperation = 'source-over';
								}
								
								lineStore.push({x:drawPX, y:drawPY});
								lineStore.push({x:saveDrawPX, y:saveDrawPY});
								var tempY = (-1.0) * ((drawPY - offsetYT - offsetYM) * yRatio - drawMaxHigh);
								linePriceStore.push(tempY);
								lineBarStore.push(convertXcoordinate(ctx, drawPX));
								tempY = (-1.0) * ((saveDrawPY - offsetYT - offsetYM) * yRatio - drawMaxHigh);
								linePriceStore.push(tempY);
								lineBarStore.push(convertXcoordinate(ctx, saveDrawPX));
								lineType.push(DEF_TOOL_PARALLEL_LINE);
								drawPX = drawPY = saveDrawPX = saveDrawPY = 0;	// Reset values
								isDrawParallelLine = false;
							}
						}
					}
				}
				else
				{
					if ((drawPX > 0) || (drawPY > 0))	// If drawX > 0 or drawY > 0 indicates the first point of this line is selected
					{
						//ctx.globalCompositeOperation = 'xor';
						ctx.beginPath();
						ctx.strokeStyle = DEF_LINE_COLOR;
						ctx.moveTo(drawPX, drawPY);
						ctx.lineTo(mx, my);
						ctx.stroke();
						ctx.closePath();
						//ctx.globalCompositeOperation = 'source-over';

						if (drawExBarNo > 0)
						{
							lineStore.push({x:drawPX, y:drawPY});	// Add first point to vector
							lineStore.push({x:mx, y:my});			// Add second point to vector
							var tempY = (-1.0) * ((drawPY - offsetYT - offsetYM) * yRatio - drawMaxHigh);
							linePriceStore.push(tempY);
							lineBarStore.push(convertXcoordinate(ctx, drawPX));
							tempY = (-1.0) * ((my - offsetYT - offsetYM) * yRatio - drawMaxHigh);
							linePriceStore.push(tempY);
							lineBarStore.push(convertXcoordinate(ctx, mx));
							lineType.push(DEF_TOOL_PARALLEL_LINE);
							isDrawParallelLine = true;
						}
						saveDrawPX = mx;
						saveDrawPY = my;
					}
					else
					{
						// The first point
						drawPX = saveDrawPX = mx;
						drawPY = saveDrawPY = my;
						/*
						console.log(mx + "," + my + " vs " + drawTX + "," + drawTY + " vs " + saveDrawTX + "," + saveDrawTY);
						ctx.beginPath();
						ctx.moveTo(drawTX, drawTY);
						ctx.lineTo(mx, my);		// Starting and ending point is the same
						ctx.stroke();
						*/
					}
				}
			}
		}  // drawParallelLineOn

		if (textBoxOn)
		{
			var text = prompt("Enter Your Text :");
			//console.log(text);
			textBoxStore.push(text);
			textBoxLocation.push({x:mx, y:my});
			drawChart();
		}

		if (fibReOn)
		{
			fibRePoint.push({x:mx, y:my});
			fibIndex++;
			compFibRe();
			drawChart();
		}

		if (fibPrOn)
		{
			fibPrPoint.push({x:mx, y:my});
			fibIndex++;
			compFibPr();
			drawChart();
		}

		if (!drawTrendLineOn && !drawParallelLineOn && !textBoxOn && !fibReOn && !fibPrOn)
			_valueCursorCross = !_valueCursorCross;

	} // posX
}

function mouseUpHandler(ctx, posX, posY)
{
	if (ctxOver)
		ctxOver.clearRect(0, 0, ctxOver.canvas.width, ctxOver.canvas.height);

	if ((posX < ctx.canvas.width - offsetXS - offsetXX - offsetXG) && (posX > offsetXM) && drawBarNo > 0)
	{
		var drawWidth = ctx.canvas.width - offsetXS;
		var drawHeight = ctx.canvas.height - offsetYS - techPaneNo * offsetTS - offsetYT;
		var mx = posX;
		var my = posY;
		
		if (drawTrendLineOn)
		{
			if ((mx > offsetXM) && (mx < drawWidth) && (my > offsetYM) && (my < offsetYT + drawHeight + techPaneNo * offsetTS))
			{
				if (((drawTX > 0) || (drawTY > 0)) && (mx != drawTX) && (my != drawTY))	// If drawX > 0 or drawY > 0 indicates the first point of this line is selected
				{
					var endX,endY;

					endX = ctx.canvas.width - offsetXS - offsetXX - offsetXG - barSpacing - barHand - float2int(barWidth / 2);
					endY = float2int((my - drawTY) * (endX - drawTX) / (mx - drawTX)) + drawTY;

					ctx.beginPath();
					ctx.strokeStyle = DEF_LINE_COLOR;
					if (mx > drawTX)
					{
						ctx.moveTo(drawTX, drawTY);
						ctx.lineTo(endX, endY);
					}
					else
					{
						ctx.moveTo(mx, my);
						ctx.lineTo(endX, endY);
					}
					ctx.stroke();
					ctx.closePath();

					if (drawExBarNo > 0)
					{
						var tempY;
						if (mx > drawTX)
						{
							lineStore.push({x:drawTX, y:drawTY});	// Add first point
							tempY = (-1.0) * ((drawTY - offsetYT - offsetYM) * yRatio - drawMaxHigh);
							linePriceStore.push(tempY);
							lineBarStore.push(convertXcoordinate(ctx, drawTX));
							//lineType.push(DEF_TOOL_TRENDLINE);
						}
						else
						{
							lineStore.push({x:mx, y:my});			// Add first point
							tempY = (-1.0) * ((my - offsetYT - offsetYM) * yRatio - drawMaxHigh);
							linePriceStore.push(tempY);
							lineBarStore.push(convertXcoordinate(ctx, mx));
							//lineType.push(DEF_TOOL_TRENDLINE);
						}
						lineStore.push({x:endX, y:endY});			// Add second point
						tempY = (-1.0) * ((endY - offsetYT - offsetYM) * yRatio - drawMaxHigh);
						linePriceStore.push(tempY);
						lineBarStore.push(convertXcoordinate(ctx, endX));
						lineType.push(DEF_TOOL_TRENDLINE);
					}
					//console.log(lineStore + "|" + linePriceStore + "|" + lineBarStore + "|" + lineType);
					drawTX = drawTY = saveDrawTX = saveDrawTY = 0;	// Reset values
				}
			}
		} // drawTrendLineOn
	}
}

function initChart(container, strDomain, sizeX, sizeY, langID, ver, fut, cod)
{
	containerID = container;
	//domain = strDomain;
	X = parseInt(sizeX);
	Y = parseInt(sizeY);
	lang = langID;
	if (lang > DEF_KOREAN)
		lang = DEF_ENGLISH;
	
	if (lang == DEF_TCHINESE)
	{
		_lang = new Language("tc");	
	}
	else if (lang == DEF_SCHINESE)
	{
		_lang = new Language("sc");	
	}
	else if (lang == DEF_JAPANESE)
	{
		_lang = new Language("ja");	
	}
	else if (lang == DEF_KOREAN)
	{
		_lang = new Language("kr");	
	}
	else
	{
		_lang = new Language("en");	
	}
	
	version = ver;
	withFutures = fut;
	sCode = cod;
	
	if (window.location.protocol == "https:")
	{
		isHttps = true;
		prot = "https:";
	}
	
	drawBarNo = (float2int(X/300)+2)*30;
	console.log(domain + " " + containerID + ":" + X + "," + Y + "," + lang + "," + drawBarNo + "," + timeoffset + "," + isHttps + "," + version + "," + withFutures + "," + sCode);
	
	loadSettings();
	
	/*
	var formElement = document.getElementById("image");
	if (formElement)
		formElement.addEventListener('click', createImageDataPressed, false);
	*/
	
	formElement = document.getElementById("clear");
	if (formElement)
		formElement.addEventListener('click', clearStoragePrssed, false);

	var c1=document.getElementById(overlayID);
	try {ctxOver = c1.getContext("2d"); } catch (er) { ctxOver=null; }

	var c=document.getElementById(containerID);
	var cvsok=1;
	var ctx;
	try { ctx = c.getContext("2d"); } catch (er) { console.log(er); cvsok=0; }
	
	var cvs;
	
	if (ctxOver)
		cvs = c1;
	else
		cvs = c;
	
	if (cvsok==1)
	{
		/*
		document.onselectstart = function( e )
		{ 
			e.preventDefault();
			return false;
		};
		*/
		
		// disable scrolling
		//document.body.addEventListener('touchmove', function(event)
		//{
		//	event.preventDefault();
		//}, false);
			
		// Mouse Events
		cvs.addEventListener('mousemove', function(evt) 
		{
			//evt.preventDefault();
	        var mousePos = getMousePos(cvs, evt);
        	var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
        	//console.log(message);
        	
        	mouseMoveHandler(ctx, mousePos.x, mousePos.y);
        	
        	/*
        	if ((mousePos.x < ctx.canvas.width - offsetXS - offsetXX - offsetXG) && (mousePos.x > offsetXM))
			{
				if (drawBarNo > 0)
				{
					var bar=-1;

					// Find the nearest bar
					if (barWidth + 2 * barHand + barSpacing > 0)
						bar = float2int((ctx.canvas.width - offsetXS - offsetXX - offsetXG - mousePos.x) / (barWidth + 2 * barHand + barSpacing));

					if ((bar >= 0) && (bar < drawBarNo))
					{
						var drawWidth = ctx.canvas.width - offsetXS - offsetXX - offsetXM - offsetXG; //Drawable width

						activeBar = bar + startBarNo;
						if (activeBar < startExBarNo)
							activeBar = startExBarNo;

						//console.log("Active Bar = " + activeBar);
						if ((barData[activeBar].o > 0) && (barData[activeBar].h > 0) &&
							(barData[activeBar].l > 0) && (barData[activeBar].c > 0))
						{
							setActiveBar(ctx, activeBar);
							updateTitle(ctx);
							drawTechPaneBar(ctx);
						}
					}
					
					var valueCursorOn;
					valueCursorOn = !(drawTrendLineOn || drawParallelLineOn || textBoxOn || fibPrOn || fibReOn);
					if (valueCursorOn)
					{
						if (ctxOver)
						{
							ctxOver.clearRect(0, 0, ctxOver.canvas.width, ctxOver.canvas.height);
							ctxOver.strokeStyle = DEF_BLACK_COLOR;
							if ((mousePos.x > offsetXM) && (mousePos.x < ctx.canvas.width - offsetXS - offsetXX))
							{
								ctxOver.beginPath();
								ctxOver.moveTo(mousePos.x, 0);
								ctxOver.lineTo(mousePos.x, ctx.canvas.height-1);
								ctxOver.stroke();
								ctxOver.closePath();								
							}

							if ((mousePos.y < chartMinLow) && (mousePos.y  > offsetYM)  && (drawExBarNo != 0))
							{
								ctxOver.beginPath();
								ctxOver.moveTo(0, mousePos.y);
								ctxOver.lineTo(ctx.canvas.width - offsetXS - offsetXX, mousePos.y);
								ctxOver.stroke();
								ctxOver.closePath();								
							}
							else
							{
								ctxOver.beginPath();
								ctxOver.moveTo(0, mousePos.y);
								ctxOver.lineTo(ctx.canvas.width - offsetXS - offsetXX, mousePos.y);
								ctxOver.stroke();
								ctxOver.closePath();								
							}

							drawValueBox(ctxOver, mousePos);
						}
					}
				}  // drawBarNo > 0
				
				if (drawTrendLineOn)
				{
					if ((drawTX > 0) || (drawTY > 0))
					{
						if (ctxOver)
						{
							ctxOver.clearRect(0, 0, ctxOver.canvas.width, ctxOver.canvas.height);
							ctxOver.strokeStyle = DEF_TEMPLINE_COLOR;

							if ((saveDrawTX > 0) || (saveDrawTY >  0))
							{
								ctxOver.beginPath();
								ctxOver.moveTo(drawTX, drawTY);
								ctxOver.lineTo(saveDrawTX, saveDrawTY);
								ctxOver.stroke();
								ctxOver.closePath();
							}

							ctxOver.beginPath();
							ctxOver.moveTo(drawTX, drawTY);
							ctxOver.lineTo(mousePos.x, mousePos.y);
							ctxOver.stroke();
							ctxOver.closePath();
						}

						saveDrawTX = mousePos.x;
						saveDrawTY = mousePos.y;
					}
					//
				} // drawTrendLineOn

				if (drawParallelLineOn)
				{
					//ctx.globalCompositeOperation = 'xor';
					ctxOver.clearRect(0, 0, ctxOver.canvas.width, ctxOver.canvas.height);
					ctxOver.strokeStyle = DEF_TEMPLINE_COLOR;

					if (isDrawParallelLine)
					{
						var midX, midY;

						if (((drawPX > 0) || (drawPY > 0)) && ((saveDrawPX > 0) || (saveDrawPY > 0)))
						{
							ctxOver.beginPath();
							ctxOver.moveTo(drawPX, drawPY);
							ctxOver.lineTo(saveDrawPX, saveDrawPY);
							ctxOver.stroke();
							ctxOver.closePath();

							midX = (drawPX + saveDrawPX) / 2;
							midY = (drawPY + saveDrawPY) / 2;

							// Add displacement relative to previous line
							drawPX = drawPX + (mousePos.x - midX);
							drawPY = drawPY + (mousePos.y - midY);
							saveDrawPX = saveDrawPX + (mousePos.x - midX);
							saveDrawPY = saveDrawPY + (mousePos.y - midY);

							ctxOver.beginPath();
							ctxOver.moveTo(drawPX, drawPY);
							ctxOver.lineTo(saveDrawPX, saveDrawPY);
							ctxOver.stroke();
							ctxOver.closePath();
						}
					}
					else
					{
						if ((drawPX > 0) || (drawPY > 0))
						{
							if ((saveDrawPX > 0) || (saveDrawPY >  0))
							{
								ctxOver.beginPath();
								ctxOver.moveTo(drawPX, drawPY);
								ctxOver.lineTo(saveDrawPX, saveDrawPY);
								ctxOver.stroke();
								ctxOver.closePath();
							}

							ctxOver.beginPath();
							ctxOver.moveTo(drawPX, drawPY);
							ctxOver.lineTo(mousePos.x, mousePos.y);
							ctxOver.stroke();
							ctxOver.closePath();

							saveDrawPX = mousePos.x;
							saveDrawPY = mousePos.y;
							
						}
					}
				}  // drawParallelLineOn
				
				if (fibReOn)
				{
					// todo
					if ((fibRePoint[0].x > 0) || (fibRePoint[0].y > 0))
					{
						fibRePoint[fibIndex].x = mousePos.x;
						fibRePoint[fibIndex].y = mousePos.y;

						var fibStart;
						var fibEnd;
						var sign;

						// Find start point: 100%
						fibStart = drawMaxHigh - yRatio * (fibRePoint[0].y - offsetYM - offsetYT);

						// Find end point: 0%
						fibEnd = drawMaxHigh - yRatio * (fibRePoint[1].y - offsetYM - offsetYT);

						if (fibStart > fibEnd)
							sign = 1;
						else
							sign = -1;

						// Loop through ratios to calculate percentage difference
						fibRe[0] = fibEnd;
						drawFibRe[0] = fibRePoint[1].y;

						for (i = 1; i < fibReRatio.length+1; i++)
						{
							fibRe[i] = sign * Math.abs(fibStart - fibEnd) * fibReRatio[i-1] + fibEnd;
							drawFibRe[i] = float2int(offsetYM + offsetYT + ((drawMaxHigh - fibRe[i]) / yRatio));
						}
						fibRe[6] = fibStart;
						drawFibRe[6] = fibRePoint[0].y;
						//repaint();
					}
					//
				}

				if (fibPrOn)
				{
					// todo
					if ((fibPrPoint[0].x > 0) && (fibPrPoint[0].y > 0) && (fibPrPoint[1].x > 0) && (fibPrPoint[1].y > 0))
					{
						fibPrPoint[fibIndex].x = mousePos.x;
						fibPrPoint[fibIndex].y = mousePos.y;

						var fibStart;
						var fibMid;
						var fibEnd;
						var sign;

						fibStart = drawMaxHigh - yRatio * (fibPrPoint[0].y - offsetYM - offsetYT);
						fibMid = drawMaxHigh - yRatio * (fibPrPoint[1].y - offsetYM - offsetYT);
						fibEnd = drawMaxHigh - yRatio * (fibPrPoint[2].y - offsetYM - offsetYT);

						if (fibMid >= fibEnd)
							sign = 1;
						else
							sign = -1;

						for (i = 0; i < fibPrRatio.length; i++)
						{
							fibPr[i] = sign * Math.abs(fibStart - fibMid) * fibPrRatio[i] + fibEnd;
							drawFibPr[i] = float2int(offsetYM + offsetYT + ((drawMaxHigh - fibPr[i]) / yRatio));
						}
						//repaint();
					}
					//
				}				
			}
			*/
      	}, false);	// Mouse Move
		
		
		cvs.addEventListener('touchstart', function(evt) 
		{
			evt.preventDefault();
			var touchX = event.targetTouches[0].pageX;
			var touchY = event.targetTouches[0].pageY;
			//(ctx, touchX + "," + touchY);
        	cvs.style.cursor = 'crosshair';
        	mouseDownHandler(ctx, touchX, touchY);
			return false;
		});

		cvs.addEventListener('touchmove', function(evt) 
		{
			evt.preventDefault();
			var touchX = event.targetTouches[0].pageX;
			var touchY = event.targetTouches[0].pageY;
			mouseMoveHandler(ctx, touchX, touchY);
			saveTouchX = touchX;
			saveTouchY = touchY;
		});

		cvs.addEventListener('touchend', function(evt) 
		{
			evt.preventDefault();
			//drawDebug(ctx, saveTouchX + "," + saveTouchY);
        	cvs.style.cursor = 'pointer';
			mouseUpHandler(ctx, saveTouchX, saveTouchY);
		});

		/*
		c.addEventListener('click', function(evt) 
		{
			var mousePos = getMousePos(c, evt);
			var message = 'Mouse Click position: ' + mousePos.x + ',' + mousePos.y;
			//console.log(message);
		});
		*/

		cvs.addEventListener('mouseup', function(evt) 
		{
			var mousePos = getMousePos(cvs, evt);
		    var message = 'Mouse Up position: ' + mousePos.x + ',' + mousePos.y;
		    //console.log(message);

		    cvs.style.cursor = 'pointer';
        	
		    mouseUpHandler(ctx, mousePos.x, mousePos.y);
		    
		    /*
        	if (ctxOver)
        		ctxOver.clearRect(0, 0, ctxOver.canvas.width, ctxOver.canvas.height);

        	if ((mousePos.x < ctx.canvas.width - offsetXS - offsetXX - offsetXG) && (mousePos.x > offsetXM) && drawBarNo > 0)
			{
				var drawWidth = ctx.canvas.width - offsetXS;
				var drawHeight = ctx.canvas.height - offsetYS - techPaneNo * offsetTS - offsetYT;
				var mx = mousePos.x;
				var my = mousePos.y;
				
				if (drawTrendLineOn)
				{
					if ((mx > offsetXM) && (mx < drawWidth) && (my > offsetYM) && (my < offsetYT + drawHeight + techPaneNo * offsetTS))
					{
						if (((drawTX > 0) || (drawTY > 0)) && (mx != drawTX) && (my != drawTY))	// If drawX > 0 or drawY > 0 indicates the first point of this line is selected
						{
							var endX,endY;

							endX = ctx.canvas.width - offsetXS - offsetXX - offsetXG - barSpacing - barHand - float2int(barWidth / 2);
							endY = float2int((my - drawTY) * (endX - drawTX) / (mx - drawTX)) + drawTY;

							//ctx.save();
							//ctx.globalCompositeOperation = 'xor';
							ctx.beginPath();
							ctx.strokeStyle = DEF_LINE_COLOR;
							if (mx > drawTX)
							{
								ctx.moveTo(drawTX, drawTY);
								ctx.lineTo(endX, endY);
							}
							else
							{
								ctx.moveTo(mx, my);
								ctx.lineTo(endX, endY);
							}
							ctx.stroke();
							ctx.closePath();
							//ctx.restore();

							if (drawExBarNo > 0)
							{
								var tempY;
								if (mx > drawTX)
								{
									lineStore.push({x:drawTX, y:drawTY});	// Add first point
									tempY = (-1.0) * ((drawTY - offsetYT - offsetYM) * yRatio - drawMaxHigh);
									linePriceStore.push(tempY);
									lineBarStore.push(convertXcoordinate(ctx, drawTX));
									//lineType.push(DEF_TOOL_TRENDLINE);
								}
								else
								{
									lineStore.push({x:mx, y:my});			// Add first point
									tempY = (-1.0) * ((my - offsetYT - offsetYM) * yRatio - drawMaxHigh);
									linePriceStore.push(tempY);
									lineBarStore.push(convertXcoordinate(ctx, mx));
									//lineType.push(DEF_TOOL_TRENDLINE);
								}
								lineStore.push({x:endX, y:endY});			// Add second point
								tempY = (-1.0) * ((endY - offsetYT - offsetYM) * yRatio - drawMaxHigh);
								linePriceStore.push(tempY);
								lineBarStore.push(convertXcoordinate(ctx, endX));
								lineType.push(DEF_TOOL_TRENDLINE);
							}
							//console.log(lineStore + "|" + linePriceStore + "|" + lineBarStore + "|" + lineType);
							drawTX = drawTY = saveDrawTX = saveDrawTY = 0;	// Reset values
						}
					}
				} // drawTrendLineOn
			}
			*/
		}); // mouseup

		cvs.addEventListener('mousedown', function(evt) 
		{
			//evt.preventDefault();
	        var mousePos = getMousePos(cvs, evt);
        	var message = 'Mouse Down position: ' + mousePos.x + ',' + mousePos.y;
        	//console.log(message);
        	
        	cvs.style.cursor = 'crosshair';
        	
        	mouseDownHandler(ctx, mousePos.x,  mousePos.y);
        	
        	/*
        	if ((mousePos.x < ctx.canvas.width - offsetXS - offsetXX - offsetXG) && (mousePos.x > offsetXM) && drawBarNo > 0)
			{
				var drawWidth = ctx.canvas.width - offsetXS;
				var drawHeight = ctx.canvas.height - offsetYS - techPaneNo * offsetTS - offsetYT;
				var mx = mousePos.x;
				var my = mousePos.y;
				
				if (drawTrendLineOn)
				{
					if ((mx > offsetXM) && (mx < drawWidth) && (my > offsetYM) && (my < offsetYT + drawHeight + techPaneNo * offsetTS))
					{
						if (((drawTX > 0) || (drawTY > 0)) && (mx != drawTX) && (my != drawTY))	// If drawX > 0 or drawY > 0 indicates the first point of this line is selected
						{
							var endX,endY;

							endX = ctx.canvas.width - offsetXS - offsetXX - offsetXG - barSpacing - barHand - float2int(barWidth / 2);
							endY = float2int((my - drawTY) * (endX - drawTX) / (mx - drawTX)) + drawTY;

							//ctx.save();
							//ctx.globalCompositeOperation = 'xor';
							ctx.beginPath();
							ctx.strokeStyle = DEF_LINE_COLOR;
							if (mx > drawTX)
							{
								ctx.moveTo(drawTX, drawTY);
								ctx.lineTo(endX, endY);
							}
							else
							{
								ctx.moveTo(mx, my);
								ctx.lineTo(endX, endY);
							}
							ctx.stroke();
							ctx.closePath();
							//ctx.restore();

							if (drawExBarNo > 0)
							{
								var tempY;
								if (mx > drawTX)
								{
									lineStore.push({x:drawTX, y:drawTY});	// Add first point
									tempY = (-1.0) * ((drawTY - offsetYT - offsetYM) * yRatio - drawMaxHigh);
									linePriceStore.push(tempY);
									lineBarStore.push(convertXcoordinate(ctx, drawTX));
									//lineType.push(DEF_TOOL_TRENDLINE);
								}
								else
								{
									lineStore.push({x:mx, y:my});			// Add first point
									tempY = (-1.0) * ((my - offsetYT - offsetYM) * yRatio - drawMaxHigh);
									linePriceStore.push(tempY);
									lineBarStore.push(convertXcoordinate(ctx, mx));
									//lineType.push(DEF_TOOL_TRENDLINE);
								}
								lineStore.push({x:endX, y:endY});			// Add second point
								tempY = (-1.0) * ((endY - offsetYT - offsetYM) * yRatio - drawMaxHigh);
								linePriceStore.push(tempY);
								lineBarStore.push(convertXcoordinate(ctx, endX));
								lineType.push(DEF_TOOL_TRENDLINE);
							}
							//console.log(lineStore + "|" + linePriceStore + "|" + lineBarStore + "|" + lineType);
							drawTX = drawTY = saveDrawTX = saveDrawTY = 0;	// Reset values
						}
						else
						{
							// The first point
							drawTX = saveDrawTX = mx;
							drawTY = saveDrawTY = my;
						}
					}
				} // drawTrendLineOn

				if (drawParallelLineOn)
				{
					if ((mx > offsetXM) && (mx < drawWidth) && (my > offsetYM) && (my < offsetYT + drawHeight + techPaneNo * offsetTS))
					{
						if (isDrawParallelLine)
						{
							//ctx.strokeStyle = DEF_BLACK_COLOR;
							if (((drawPX > 0) || (drawPY > 0)) && ((saveDrawPX > 0) || (saveDrawPY > 0)))
							{
								if (drawExBarNo > 0)
								{
									if ((drawPX > offsetXM) && (drawPX < drawWidth) && (drawPY > offsetYM) && (drawPY < offsetYT + drawHeight + techPaneNo * offsetTS) &&
										(saveDrawPX > offsetXM) && (saveDrawPX < drawWidth) && (saveDrawPY > offsetYM) && (saveDrawPY < offsetYT + drawHeight + techPaneNo * offsetTS))
									{
										if (((drawPX > 0) || (drawPY > 0)) && ((saveDrawPX > 0) || (saveDrawPY > 0)))
										{
											midX = (drawPX + saveDrawPX) / 2;
											midY = (drawPY + saveDrawPY) / 2;

											// Add displacement relative to previous line
											drawPX = drawPX + (mx - midX);
											drawPY = drawPY + (my - midY);
											saveDrawPX = saveDrawPX + (mx - midX);
											saveDrawPY = saveDrawPY + (my - midY);

											//ctx.globalCompositeOperation = 'xor';
											ctx.beginPath();
											ctx.strokeStyle = DEF_LINE_COLOR;
											ctx.moveTo(drawPX, drawPY);
											ctx.lineTo(saveDrawPX, saveDrawPY);
											ctx.stroke();
											ctx.closePath();
											//ctx.globalCompositeOperation = 'source-over';
										}
										
										lineStore.push({x:drawPX, y:drawPY});
										lineStore.push({x:saveDrawPX, y:saveDrawPY});
										var tempY = (-1.0) * ((drawPY - offsetYT - offsetYM) * yRatio - drawMaxHigh);
										linePriceStore.push(tempY);
										lineBarStore.push(convertXcoordinate(ctx, drawPX));
										tempY = (-1.0) * ((saveDrawPY - offsetYT - offsetYM) * yRatio - drawMaxHigh);
										linePriceStore.push(tempY);
										lineBarStore.push(convertXcoordinate(ctx, saveDrawPX));
										lineType.push(DEF_TOOL_PARALLEL_LINE);
										drawPX = drawPY = saveDrawPX = saveDrawPY = 0;	// Reset values
										isDrawParallelLine = false;
									}
								}
							}
						}
						else
						{
							if ((drawPX > 0) || (drawPY > 0))	// If drawX > 0 or drawY > 0 indicates the first point of this line is selected
							{
								//ctx.globalCompositeOperation = 'xor';
								ctx.beginPath();
								ctx.strokeStyle = DEF_LINE_COLOR;
								ctx.moveTo(drawPX, drawPY);
								ctx.lineTo(mx, my);
								ctx.stroke();
								ctx.closePath();
								//ctx.globalCompositeOperation = 'source-over';

								if (drawExBarNo > 0)
								{
									lineStore.push({x:drawPX, y:drawPY});	// Add first point to vector
									lineStore.push({x:mx, y:my});			// Add second point to vector
									var tempY = (-1.0) * ((drawPY - offsetYT - offsetYM) * yRatio - drawMaxHigh);
									linePriceStore.push(tempY);
									lineBarStore.push(convertXcoordinate(ctx, drawPX));
									tempY = (-1.0) * ((my - offsetYT - offsetYM) * yRatio - drawMaxHigh);
									linePriceStore.push(tempY);
									lineBarStore.push(convertXcoordinate(ctx, mx));
									lineType.push(DEF_TOOL_PARALLEL_LINE);
									isDrawParallelLine = true;
								}
								saveDrawPX = mx;
								saveDrawPY = my;
							}
							else
							{
								// The first point
								drawPX = saveDrawPX = mx;
								drawPY = saveDrawPY = my;
							}
						}
					}
				}  // drawParallelLineOn

				if (textBoxOn)
				{
					var text = prompt("Enter Your Text :");
					//console.log(text);
					textBoxStore.push(text);
					textBoxLocation.push({x:mx, y:my});
					drawChart();
				}

				if (fibReOn)
				{
					fibRePoint.push({x:mx, y:my});
					fibIndex++;
					compFibRe();
					drawChart();
				}

				if (fibPrOn)
				{
					fibPrPoint.push({x:mx, y:my});
					fibIndex++;
					compFibPr();
					drawChart();
				}
				
			} // if mousePos.x
			*/
		}, false);	// Mouse Down
	}

}

function initTools()
{
	drawLineOn = false;
	drawTrendLineOn = false;
	drawParallelLineOn = false;
	textBoxOn = false;
	fibReOn = false;
	fibPrOn = false;
	
	drawLX = drawLY = saveDrawLX = saveDrawLY = 0;
	drawTX = drawTY = saveDrawTX = saveDrawTY = 0;
	drawPX = drawPY = saveDrawPX = saveDrawPY = 0;
	boxX = boxY = 0;
	fibIndex = 0;
	saveFibX = saveFibY = 0;
}

function setTool()
{
	if (tool != oldtool)
		initTools();			// Reset
		
	switch (tool)
	{
		case DEF_TOOL_TRENDLINE:
			drawTrendLineOn = true;
			break;
		case DEF_TOOL_PARALLEL_LINE:
			drawParallelLineOn = true;
			break;
		case DEF_TOOL_CLEAR_ONELINE:
			switch(lineType.pop())
			{
				case DEF_TOOL_DRAWLINE:
				case DEF_TOOL_TRENDLINE:
					lineStore.pop();
					lineStore.pop();
					linePriceStore.pop();
					linePriceStore.pop();
					lineBarStore.pop();
					lineBarStore.pop();
					break;
				case DEF_TOOL_PARALLEL_LINE:
					lineStore.pop();
					lineStore.pop();
					lineStore.pop();
					lineStore.pop();
					linePriceStore.pop();
					linePriceStore.pop();
					lineBarStore.pop();
					lineBarStore.pop();
					break;
			}
			//console.log(lineStore + "|" + linePriceStore + "|" + lineBarStore + "|" + lineType);
			break;
		case DEF_TOOL_CLEAR_ALLLINE:
			lineStore = [];
			linePriceStore = [];
			lineBarStore = [];
			lineType = [];
			break;
		case DEF_TOOL_FIBON_RET:
			fibReOn = true;
			break;
		case DEF_TOOL_FIBON_PRO:
			fibPrOn = true;
			break;
		case DEF_TOOL_CLEAR_FIBON:
			fibRePoint=[];
			fibPrPoint=[];
			fibRe=[];
			fibPr=[];
			drawFibRe=[];
			drawFibPr=[];
			break;
		case DEF_TOOL_TEXTBOX:
			textBoxOn = true;
			break;
		case DEF_TOOL_CLEAR_ONETEXT:
			textBoxStore.pop();
			textBoxLocation.pop();
			break;
		case DEF_TOOL_CLEAR_ALLTEXT:
			textBoxStore = [];
			textBoxLocation = [];
			break;
		default :
			//console.log("no tool");
		break;
	}
	oldtool = tool;
}

function clearStoragePrssed(e)
{
	if (window.localStorage)
	{
		localStorage.clear();
	}
}

function createImageDataPressed(e)
{
	var theCanvas=document.getElementById(containerID);
	//theCanvas.toDataURL("image/jpeg", 1.0)
	var imageData=theCanvas.toDataURL();
	
	var myWindow = window.open();
	myWindow.document.write("<img src='"+imageData+"'>");

	//var myWindow = window.open("","Image","left=0,top=0,width=" +
	//		   theCanvas.width + ",height=" + theCanvas.height +",toolbar=0,resizable=0");

	//window.open(theCanvas.toDataURL("image/png"),"Image","left=0,top=0,width=" +
	 //  theCanvas.width + ",height=" + theCanvas.height +",toolbar=0,resizable=0");
}


function initTech()
{
	if (upper > 0)
		techOverlayNo = 1;
	
	if (lower > 0)
		techPaneNo += 1;

	//if (lower2 > 0)
	//	techPaneNo += 1;
	
	for (i=0; i<techOverlayNo; i++)
	{
		techOverlayValue[i] = [];
		techOverlayBar[i] = [];
		techOverlayText[i] = [];
		techOverlayColor[i] = [];		
	}

	for (i=0; i<techPaneNo; i++)
	{
		techPaneValue[i] = [];
		techPaneBar[i] = [];
		techPaneText[i] = [];
		techPaneSp[i] = [];
		techPaneColor[i] = [];		
	}

	if (interval <= DEF_MONTH)
		chartCalcMethod = DEF_CALCBY_MP;
	else
		chartCalcMethod= DEF_CALCBY_LAST;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		if (chartCalcMethod == DEF_CALCBY_MP)
			barData[bar].calcPrice = barData[bar].mp;
		else
			barData[bar].calcPrice = barData[bar].c;
		
		barData[bar].techOverlay = [];
		barData[bar].chartTechOverlay = [];
		for (to=0; to<techOverlayNo; to++)
		{
			barData[bar].techOverlay[to] = [];
			barData[bar].chartTechOverlay[to] = [];
		}

		barData[bar].techPane = [];
		barData[bar].chartTechPane = [];
		for (i=0; i<techPaneNo; i++)
		{
			barData[bar].techPane[i] = [];
			barData[bar].chartTechPane[i] = [];
		}
		
	}
}

function getMousePos(canvas, evt)
{
	var rect = canvas.getBoundingClientRect();
	return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
	};
}


function drawValueBox(ctx, mousePos)
{
	if ( drawExBarNo == 0)
		return;
	
	var isDrawValueBox = false;

	if (mousePos.y >= chartMaxHigh && mousePos.y <= chartMinLow)
		isDrawValueBox = true;

	if (isDrawValueBox)
	{
		//var fontHeight = (g.getFontMetrics()).getHeight();
		//var fontDescent = (g.getFontMetrics()).getDescent();

		if (offsetXS > DEF_MAX_OFFSET_XS)
			offsetXS = DEF_MAX_OFFSET_XS;

		//draw new value box
		if ((mousePos.y < chartMinLow) && (mousePos.y > offsetYM))
		{
			var pixelDataValue = (-1.0) * ((mousePos.y - offsetYT - offsetYM) * yRatio - drawMaxHigh);
			var mousePriceDisplay = pixelDataValue.toFixed(dps);

			ctx.font = DEF_FONT;
			ctx.fillStyle = DEF_FONT_COLOR;
			ctx.fillText(mousePriceDisplay, ctx.canvas.width - offsetXS + 2, mousePos.y + 5);
		}
	}
}

function drawLines(ctx)
{
	var pt1, pt2;
	var i = 0;
	
	pt1 = pt2 = null;

	for (j=0; j<lineStore.length; j+=2)
	{
		var endX, endY;
		endX = endY = 0;

		pt1 = lineStore[j];
		pt2 = lineStore[j+1];

		ctx.strokeStyle = DEF_LINE_COLOR;
		if ((pt1.x > ctx.canvas.width - offsetXS - offsetXX - offsetXG - barSpacing - barHand - float2int(barWidth) / 2 &&
			 pt2.x > ctx.canvas.width - offsetXS - offsetXX - offsetXG - barSpacing - barHand - float2int(barWidth) / 2) ||
			(pt1.x < ctx.canvas.width - offsetXS - offsetXX - offsetXG - drawBarNo * (barSpacing + barHand * 2 + float2int(barWidth)) &&
			 pt2.x < ctx.canvas.width - offsetXS - offsetXX - offsetXG - drawBarNo * (barSpacing + barHand * 2 + float2int(barWidth))))
		{
			i++;
			continue;
		}
		
		if (pt2.x > pt1.x)
		{
			if (lineType[i] == DEF_TOOL_TRENDLINE)
			{
				endX = ctx.canvas.width - offsetXS - offsetXX - offsetXG - barSpacing - barHand - float2int(barWidth) / 2;
				endY = float2int((pt2.y - pt1.y) * (endX - pt1.x) / (pt2.x - pt1.x)) + pt1.y;
				ctx.beginPath();
				ctx.moveTo(pt1.x, pt1.y);
				ctx.lineTo(endX, endY);
				ctx.stroke();
				ctx.closePath();
			}
			else
			{
				if (pt2.x > ctx.canvas.width - offsetXS - offsetXX - offsetXG - barSpacing - barHand - float2int(barWidth) / 2)
				{
					endX = ctx.canvas.width - offsetXS - offsetXX - offsetXG - barSpacing - barHand - float2int(barWidth) / 2;
					endY = float2int((pt2.y - pt1.y) * (endX - pt1.x) / (pt2.x - pt1.x)) + pt1.y;
					ctx.beginPath();
					ctx.moveTo(pt1.x, pt1.y);
					ctx.lineTo(endX, endY);
					ctx.stroke();
					ctx.closePath();
				}
				else
				{
					ctx.beginPath();
					ctx.moveTo(pt1.x, pt1.y);
					ctx.lineTo(pt2.x, pt2.y);
					ctx.stroke();
					ctx.closePath();
				}
			}
		}
		else
		{
			if (lineType[i] == DEF_TOOL_TRENDLINE)
			{
				endX = ctx.canvas.width - offsetXS - offsetXX - offsetXG - barSpacing - barHand - float2int(barWidth) / 2;
				endY = float2int((pt1.y - pt2.y) * (endX - pt2.x) / (pt1.x - pt2.x)) + pt2.y;
				ctx.beginPath();
				ctx.moveTo(pt2.x, pt2.y);
				ctx.lineTo(endX, endY);
				ctx.stroke();
				ctx.closePath();
			}
			else
			{
				if (pt1.x > ctx.canvas.width - offsetXS - offsetXX - offsetXG - barSpacing - barHand - float2int(barWidth) / 2)
				{
					endX = ctx.canvas.width - offsetXS - offsetXX - offsetXG - barSpacing - barHand - float2int(barWidth) / 2;
					endY = float2int((pt1.y - pt2.y) * (endX - pt2.x) / (pt1.x - pt2.x)) + pt2.y;
					ctx.beginPath();
					ctx.moveTo(pt2.x, pt2.y);
					ctx.lineTo(endX, endY);
					ctx.stroke();
					ctx.closePath();
				}
				else
				{
					ctx.beginPath();
					ctx.moveTo(pt1.x, pt1.y);
					ctx.lineTo(pt2.x, pt2.y);
					ctx.stroke();
					ctx.closePath();					
				}
			}
		}

		/*
		if (endX != 0 && lineType[i] == DEF_TOOL_TRENDLINE)
		{
			if (pt1.x > pt2.x)
				drawValueBox(g, d, endY);
			else
				drawValueBox(g, d, endY);
		}
		*/
		i++;
	}

	if ((pt1 != null) && (pt2 != null) && (drawBarNo > 0))
	{
		var x, y;
		var price;

		// Using two-point form
		if (pt1.x != pt2.x)	// Avoid division by zero
		{
			// X-coordinate of the first bar
			x = ctx.canvas.width - offsetXS - offsetXX - offsetXG - barSpacing - barHand - float2int(barWidth) / 2;
			y = float2int((pt2.y - pt1.y) * (x - pt1.x) / (pt2.x - pt1.x)) + pt1.y;

			// Calculate projected price
			price = drawMaxHigh - yRatio * (y - offsetYM - offsetYT);
		}
	}
}


function drawFibRet(ctx)
{
	var drawWidth = ctx.canvas.width - offsetXS - offsetXX - offsetXM - offsetXG;

	// Draw selected points
	/*
	g.setColor(Color.red);
	if ((fibRePoint[0].x > 0) && (fibRePoint[0].y > 0))
		g.fillRect(fibRePoint[0].x - 1, drawFibRe[0] - 1, 3, 3);
	if ((fibRePoint[1].x > 0) && (fibRePoint[1].y > 0))
		g.fillRect(fibRePoint[1].x - 1, drawFibRe[6] - 1, 3, 3);
	*/

	//console.log(fibRe);
	//console.log(drawFibRe);

	// Draw Fibonacci Retracement
	ctx.strokeStyle = DEF_FIBRE_COLOR;
	ctx.fillStyle =  DEF_FIBRE_COLOR;
	for (i = 0; i < drawFibRe.length; i++)
	{
		if (fibRe[i] > 0)
		{
			if ((drawFibRe[i] <= chartMinLow) && (drawFibRe[i] >= chartMaxHigh))
			{
				ctx.beginPath();
				ctx.moveTo(fibRePoint[0].x, drawFibRe[i]);
				ctx.lineTo(drawWidth, drawFibRe[i]);
				ctx.stroke();
				ctx.closePath();	
				
				var textwidth = ctx.measureText(fibRe[0].toFixed(dps) + " (0.000)").width;
				
				if (i == 0)
					ctx.fillText(fibRe[i].toFixed(dps) + " (0.0)", drawWidth-textwidth-5, drawFibRe[i]);
				else if (i == 6)
					ctx.fillText(fibRe[i].toFixed(dps) + " (1.0)", drawWidth-textwidth-5, drawFibRe[i]);
				else
					ctx.fillText(fibRe[i].toFixed(dps) + " ("+fibReRatio[i]+")", drawWidth-textwidth-5, drawFibRe[i]);
			}
		}
	}
}


function drawFibPrj(ctx)
{
	var drawWidth = ctx.canvas.width - offsetXS - offsetXX - offsetXM - offsetXG;

	// Draw Fibonacci Projection
	ctx.strokeStyle = DEF_FIBPR_COLOR;
	ctx.fillStyle =  DEF_FIBPR_COLOR;
	for (i = 0; i < drawFibPr.length; i++)
	{
		if (fibPr[i] > 0)
		{
			if ((drawFibPr[i] <= chartMinLow) && (drawFibPr[i] >= chartMaxHigh))
			{
				ctx.beginPath();
				ctx.moveTo(fibPrPoint[0].x, drawFibPr[i]);
				ctx.lineTo(drawWidth, drawFibPr[i]);
				ctx.stroke();
				ctx.closePath();	
				
				var textwidth = ctx.measureText(fibPr[0].toFixed(dps) + " (0.000)").width;
				ctx.fillText(fibPr[i].toFixed(dps) + " ("+fibPrRatio[i]+")", drawWidth-textwidth-5, drawFibPr[i]);
			}
		}
	}

}

function drawTextBox(ctx)
{
	var text;
	var point;
	//ctx.strokeStyle = DEF_TEXT_COLOR;
	ctx.fillStyle = DEF_TEXT_COLOR;
	for (i=0; i<textBoxStore.length; i++ )
	{
		text = textBoxStore[i];
		point = textBoxLocation[i];
		ctx.fillText(text, point.x, point.y);
	}
}

function drawChart()
{
	var c=document.getElementById(containerID);
	var cvsok=1;
	var ctx;
	try {ctx = c.getContext("2d"); } catch (er) { console.log(er); cvsok=0; }

	updateTitleBar();

	if (cvsok==1)
	{
//		startBarNo = startExBarNo = 0;
//		activeBar = lastBarNo = startBarNo;
//		drawExBarNo = barData.length;
		//drawBarNo = barData.length;
		
		drawAxis(ctx);

		initTech();
		addTechOverlay(upper);
		addTech(lower);
		
		compXScale(ctx);
		compYScale(ctx);
		compTechScale(ctx);
		drawYScale(ctx);
		drawMain(ctx);
		
		setActiveBar(ctx, activeBar);
		drawTitle(ctx);
		
		/* Disabled
		if (version != DEF_ETNET_BUNDLED)
			drawAddOns(ctx);
		*/
		drawTechPaneBar(ctx);

		/* Disabled
		//drawPoints(ctx);		// Draw high low points
		drawLines(ctx);			// Draw manual trendlines
		drawTextBox(ctx);		// Draw Textboxes
		drawFibRet(ctx);		// Draw Fibonacci retracement
		drawFibPrj(ctx);		// Draw Fibonacci projection

		if (interval > DEF_MONTH)	// Intraday
			drawSupportResist(ctx);	// Draw Support & Resistance

		//drawLatestMP(ctx);		// Display Latest MP
		//drawLast(ctx);			// Draw the latest closing price
		*/
	}
}

function ajaxNav(url)
{
	/*
    $.ajax({
        url: url,
        data: { "X-Requested-With": "XMLHttpRequest" },
        type: "POST",
        dataType: "html",
        beforeSend: function() {
            $('#' + jsAction).html(ajaxBeforeSendTip);
        },
        error: function() {
            //ajax error
            $('#' + jsAction).html(ajaxErrorTip);
        },
        success: function(data) {
            $('#' + jsAction).html(data);
            //for change the language
            toggleLang(url);
            //for Image roll over
            rolloverInit();

            //not ready for ajax loading
            if ($('.mainError').length > 0) {

                curStatus = $("#hidStatus").val();
                if (curStatus == "NOTREADY") {
                    window.location = url; //refresh the url and use reload approach                                                
                } else { //ERROR or ...
                    $(".mainError").show();
                    if (curIsSimulcast) {
                        changeIFrameSize("sysdata_iframe");
                    }
                }

            } //endif
        }
    });
    */
}

function encode_utf8(s)
{
	  return unescape(encodeURIComponent(s));
}

function decode_utf8(s)
{
	  return decodeURIComponent(escape(s));
}

function loadData()
{
	var charttype=DEF_PROSTICKS_CHART;
	
	if (exch == DEF_EXCH_HK && (typeChart == DEF_PROSTICKS_VOL_CHART || typeChart == DEF_BAR_MODAL_VOL_CHART || typeChart == DEF_MODAL_LINE_VOL_CHART))
		charttype = DEF_PROSTICKS_VOL_CHART;

	/* Disabled
	codeName = $.ajax({
		type : "GET",
		//url: prot+"//"+domain+"/chartasp/GetCodeInfo.asp?code="+code+"&exch="+exch+"&lang="+lang,
		url: prot+"//"+domain+"/chartasp/GetCodeInfoUTF8.asp?code="+code+"&exch="+exch+"&lang="+lang,
		//contentType: "text/html;charset=big5",
		//contentType: "text/html;charset=windows-1252",
		//contentType: "application/x-www-form-urlencoded;charset=utf-8",
		async: false,
		success: function(data)
		{
			//codeInfoString = $.parseJSON(data.responseText);
		}
	}).responseText;
	*/
	codeName = code

	//codeName = decode_utf8(codeName);
	//console.log(codeName);
	//console.log(encode_utf8(codeName));
	//console.log(iconv("UTF-8","windows-1250",codeName));

	//console.log("URL : " + prot+"//"+domain+"/chartasp/DataJSON.asp?code="+code+"&exch="+exch+"&interval="+interval+"&chartType="+charttype);
	/* Disabled
	var jsonString = $.ajax({
			type : "GET",
			url: prot+"//"+domain+"/chartasp/DataJSON.asp?code="+code+"&exch="+exch+"&interval="+interval+"&chartType="+charttype,
			dataType:"json",
			async: false
			//
			success: function(data)
			{
				var jsonData = $.parseJSON(data.responseText);
				console.log(jsonData.length + " bars loaded...");
				barData = jsonData;
			}
			//
		}).responseText;
	*/
	var jsonString = '[{"dt":202005292059,"o":107.62,"h":107.9,"l":107.05,"c":107.8,"v":0,"vap":107.7126,"vam":107.18,"mp":107.18,"mc":73,"ut":107.86,"lt":107.08}, {"dt":202005282058,"o":107.71,"h":107.9,"l":107.55,"c":107.62,"v":0,"vap":107.8118,"vam":107.6464,"mp":107.8,"mc":99,"ut":0,"lt":0}, {"dt":202005272058,"o":107.48,"h":107.95,"l":107.34,"c":107.71,"v":0,"vap":107.7485,"vam":107.4908,"mp":107.5,"mc":113,"ut":107.88,"lt":107.4}, {"dt":202005262057,"o":107.68,"h":107.92,"l":107.37,"c":107.51,"v":0,"vap":107.82,"vam":107.5292,"mp":107.82,"mc":80,"ut":107.88,"lt":107.42}, {"dt":202005252058,"o":107.59,"h":107.78,"l":107.56,"c":107.67,"v":0,"vap":107.6834,"vam":107.68,"mp":107.68,"mc":210,"ut":0,"lt":107.6}, {"dt":202005222059,"o":107.6,"h":107.76,"l":107.3,"c":107.62,"v":0,"vap":107.6069,"vam":107.4415,"mp":107.58,"mc":129,"ut":107.68,"lt":107.34}, {"dt":202005212058,"o":107.52,"h":107.85,"l":107.45,"c":107.6,"v":0,"vap":107.7325,"vam":107.5927,"mp":107.68,"mc":108,"ut":0,"lt":107.5}, {"dt":202005202058,"o":107.66,"h":107.98,"l":107.32,"c":107.53,"v":0,"vap":107.7771,"vam":107.4907,"mp":107.76,"mc":67,"ut":107.92,"lt":107.38}, {"dt":202005192057,"o":107.3,"h":108.09,"l":107.26,"c":107.7,"v":0,"vap":107.8218,"vam":107.3499,"mp":107.36,"mc":92,"ut":107.98,"lt":0}, {"dt":202005182058,"o":107.07,"h":107.5,"l":107.05,"c":107.31,"v":0,"vap":107.3464,"vam":107.1391,"mp":107.26,"mc":81,"ut":107.46,"lt":0}, {"dt":202005152059,"o":107.22,"h":107.44,"l":106.83,"c":107.02,"v":0,"vap":107.3028,"vam":107.0451,"mp":107.22,"mc":98,"ut":107.38,"lt":106.9}, {"dt":202005142058,"o":106.98,"h":107.37,"l":106.75,"c":107.22,"v":0,"vap":107.1583,"vam":106.8336,"mp":106.86,"mc":93,"ut":107.32,"lt":106.78}, {"dt":202005132058,"o":107.12,"h":107.28,"l":106.72,"c":107.03,"v":0,"vap":107.1756,"vam":106.9336,"mp":107,"mc":105,"ut":107.24,"lt":106.82}, {"dt":202005122056,"o":107.62,"h":107.69,"l":107.09,"c":107.15,"v":0,"vap":107.5493,"vam":107.2768,"mp":107.36,"mc":82,"ut":0,"lt":107.14}, {"dt":202005112058,"o":106.52,"h":107.77,"l":106.51,"c":107.65,"v":0,"vap":107.5557,"vam":106.8884,"mp":106.9,"mc":58,"ut":0,"lt":106.6}, {"dt":202005082059,"o":106.24,"h":106.75,"l":106.19,"c":106.62,"v":0,"vap":106.5849,"vam":106.2788,"mp":106.32,"mc":121,"ut":0,"lt":106.22}, {"dt":202005072058,"o":106.08,"h":106.66,"l":105.97,"c":106.26,"v":0,"vap":106.4705,"vam":106.158,"mp":106.26,"mc":95,"ut":106.62,"lt":106.02}, {"dt":202005062058,"o":106.51,"h":106.6,"l":105.95,"c":106.1,"v":0,"vap":106.3661,"vam":106.0797,"mp":106.32,"mc":84,"ut":106.54,"lt":105.98}, {"dt":202005052056,"o":106.72,"h":106.89,"l":106.4,"c":106.53,"v":0,"vap":106.7098,"vam":106.5,"mp":106.5,"mc":80,"ut":106.82,"lt":106.44}, {"dt":202005042058,"o":106.8,"h":107.07,"l":106.61,"c":106.72,"v":0,"vap":106.8534,"vam":106.6881,"mp":106.72,"mc":144,"ut":106.98,"lt":106.64}, {"dt":202005012059,"o":107.12,"h":107.41,"l":106.58,"c":106.88,"v":0,"vap":107.1386,"vam":106.7584,"mp":106.82,"mc":72,"ut":107.34,"lt":106.64}, {"dt":202004302059,"o":106.58,"h":107.5,"l":106.37,"c":107.13,"v":0,"vap":106.9838,"vam":106.5038,"mp":106.58,"mc":92,"ut":107.32,"lt":106.44}, {"dt":202004292059,"o":106.86,"h":106.9,"l":106.33,"c":106.63,"v":0,"vap":106.6772,"vam":106.4897,"mp":106.54,"mc":110,"ut":106.86,"lt":106.4}, {"dt":202004282057,"o":107.23,"h":107.34,"l":106.54,"c":106.86,"v":0,"vap":107.22,"vam":106.7209,"mp":107.22,"mc":83,"ut":0,"lt":0}, {"dt":202004272059,"o":107.59,"h":107.62,"l":106.97,"c":107.2,"v":0,"vap":107.4174,"vam":107.1049,"mp":107.22,"mc":102,"ut":107.58,"lt":107}, {"dt":202004242059,"o":107.55,"h":107.76,"l":107.34,"c":107.48,"v":0,"vap":107.6516,"vam":107.4749,"mp":107.62,"mc":124,"ut":107.72,"lt":0}, {"dt":202004232059,"o":107.76,"h":108.04,"l":107.32,"c":107.55,"v":0,"vap":107.7703,"vam":107.5283,"mp":107.76,"mc":103,"ut":107.86,"lt":107.38}, {"dt":202004222059,"o":107.76,"h":107.94,"l":107.48,"c":107.7,"v":0,"vap":107.7804,"vam":107.6273,"mp":107.72,"mc":107,"ut":107.88,"lt":107.52}, {"dt":202004212057,"o":107.62,"h":107.89,"l":107.26,"c":107.76,"v":0,"vap":107.7373,"vam":107.4248,"mp":107.72,"mc":85,"ut":107.82,"lt":107.3}, {"dt":202004202059,"o":107.48,"h":107.95,"l":107.47,"c":107.61,"v":0,"vap":107.804,"vam":107.6386,"mp":107.68,"mc":99,"ut":107.88,"lt":107.56}, {"dt":202004172059,"o":107.94,"h":108.08,"l":107.27,"c":107.51,"v":0,"vap":107.8589,"vam":107.5054,"mp":107.72,"mc":74,"ut":108.02,"lt":107.34}, {"dt":202004162059,"o":107.4,"h":108.08,"l":107.13,"c":107.9,"v":0,"vap":107.8449,"vam":107.4914,"mp":107.72,"mc":78,"ut":107.98,"lt":107.28}, {"dt":202004152059,"o":107.21,"h":107.87,"l":106.9,"c":107.41,"v":0,"vap":107.5132,"vam":107.0582,"mp":107.36,"mc":78,"ut":107.76,"lt":106.98}, {"dt":202004142057,"o":107.74,"h":107.76,"l":106.95,"c":107.21,"v":0,"vap":107.6611,"vam":107.1976,"mp":107.66,"mc":72,"ut":0,"lt":107}, {"dt":202004132059,"o":108.41,"h":108.52,"l":107.48,"c":107.73,"v":0,"vap":108.1435,"vam":107.6675,"mp":107.9,"mc":57,"ut":108.36,"lt":0}, {"dt":202004102059,"o":108.44,"h":108.59,"l":108.3,"c":108.44,"v":0,"vap":108.4622,"vam":108.36,"mp":108.36,"mc":140,"ut":0,"lt":0}, {"dt":202004092059,"o":108.77,"h":109.06,"l":108.19,"c":108.44,"v":0,"vap":108.9553,"vam":108.4876,"mp":108.9,"mc":105,"ut":109,"lt":108.28}, {"dt":202004082059,"o":108.72,"h":109.1,"l":108.48,"c":108.81,"v":0,"vap":108.8541,"vam":108.6666,"mp":108.82,"mc":119,"ut":108.94,"lt":108.54}, {"dt":202004072057,"o":109.2,"h":109.28,"l":108.65,"c":108.77,"v":0,"vap":109.0578,"vam":108.7926,"mp":108.82,"mc":105,"ut":109.22,"lt":108.7}, {"dt":202004062059,"o":108.35,"h":109.38,"l":108.35,"c":109.19,"v":0,"vap":109.1746,"vam":108.7893,"mp":109,"mc":76,"ut":109.26,"lt":108.42}, {"dt":202004032059,"o":107.87,"h":108.67,"l":107.77,"c":108.52,"v":0,"vap":108.4938,"vam":107.9899,"mp":108.44,"mc":80,"ut":108.6,"lt":107.8}, {"dt":202004022059,"o":107.12,"h":108.1,"l":107,"c":107.86,"v":0,"vap":107.7232,"vam":107.1641,"mp":107.3,"mc":83,"ut":107.98,"lt":107.06}, {"dt":202004012059,"o":107.51,"h":107.94,"l":106.9,"c":107.12,"v":0,"vap":107.6469,"vam":107.1919,"mp":107.5,"mc":76,"ut":107.8,"lt":107}, {"dt":202003312056,"o":107.7,"h":108.73,"l":107.44,"c":107.52,"v":0,"vap":108.4997,"vam":107.8266,"mp":108.44,"mc":64,"ut":108.64,"lt":107.52}, {"dt":202003302059,"o":107.68,"h":108.29,"l":107.09,"c":107.72,"v":0,"vap":108.0211,"vam":107.5411,"mp":107.9,"mc":88,"ut":108.16,"lt":107.26}, {"dt":202003272059,"o":109.52,"h":109.72,"l":107.73,"c":107.91,"v":0,"vap":109.0189,"vam":108.1197,"mp":108.72,"mc":44,"ut":109.48,"lt":107.84}, {"dt":202003262059,"o":111.16,"h":111.3,"l":109.19,"c":109.54,"v":0,"vap":110.6976,"vam":109.5656,"mp":110.62,"mc":40,"ut":111.18,"lt":109.34}, {"dt":202003252059,"o":111.19,"h":111.68,"l":110.73,"c":111.19,"v":0,"vap":111.4359,"vam":111.0714,"mp":111.26,"mc":79,"ut":111.58,"lt":110.84}, {"dt":202003242057,"o":111.24,"h":111.72,"l":110.07,"c":111.24,"v":0,"vap":111.2549,"vam":110.36,"mp":110.36,"mc":53,"ut":111.56,"lt":110.18}, {"dt":202003232059,"o":110.81,"h":111.59,"l":109.65,"c":111.25,"v":0,"vap":111.016,"vam":110.0827,"mp":110.18,"mc":81,"ut":111.48,"lt":109.82}, {"dt":202003202059,"o":110.69,"h":111.5,"l":109.3,"c":110.91,"v":0,"vap":111.062,"vam":109.944,"mp":110.16,"mc":51,"ut":111.38,"lt":109.58}, {"dt":202003192058,"o":108.04,"h":110.96,"l":107.84,"c":110.66,"v":0,"vap":110.0795,"vam":108.5886,"mp":108.9,"mc":40,"ut":110.78,"lt":108.02}, {"dt":202003182058,"o":107.63,"h":108.65,"l":106.73,"c":108.05,"v":0,"vap":108.139,"vam":107.187,"mp":107.2,"mc":55,"ut":108.48,"lt":106.96}, {"dt":202003172057,"o":105.8,"h":107.83,"l":105.8,"c":107.55,"v":0,"vap":107.2533,"vam":106.3305,"mp":106.9,"mc":49,"ut":107.7,"lt":105.92}, {"dt":202003162058,"o":107.24,"h":107.57,"l":105.12,"c":105.89,"v":0,"vap":106.7915,"vam":105.7799,"mp":105.94,"mc":63,"ut":107.24,"lt":105.38}, {"dt":202003132058,"o":104.62,"h":108.5,"l":104.48,"c":107.99,"v":0,"vap":107.4265,"vam":105.02,"mp":105.02,"mc":38,"ut":108.28,"lt":104.68}, {"dt":202003122058,"o":104.49,"h":106.09,"l":103.07,"c":104.62,"v":0,"vap":105.1267,"vam":103.6757,"mp":103.68,"mc":57,"ut":105.64,"lt":103.3}, {"dt":202003112058,"o":105.63,"h":105.63,"l":104.08,"c":104.48,"v":0,"vap":105.06,"vam":104.5044,"mp":104.72,"mc":86,"ut":105.32,"lt":104.22}, {"dt":202003102057,"o":102.36,"h":105.92,"l":101.98,"c":105.63,"v":0,"vap":104.9013,"vam":103.2477,"mp":104.32,"mc":45,"ut":105.54,"lt":102.22}, {"dt":202003092058,"o":104.19,"h":104.6,"l":101.16,"c":102.37,"v":0,"vap":103.2473,"vam":101.8851,"mp":102.3,"mc":108,"ut":104.32,"lt":101.64}, {"dt":202003062158,"o":106.4,"h":106.52,"l":104.97,"c":105.36,"v":0,"vap":105.9506,"vam":105.2032,"mp":105.24,"mc":63,"ut":106.3,"lt":105.06}, {"dt":202003052200,"o":107.38,"h":107.74,"l":105.94,"c":106.4,"v":0,"vap":107.3692,"vam":106.4898,"mp":106.86,"mc":69,"ut":107.6,"lt":106.08}, {"dt":202003042200,"o":107.09,"h":107.69,"l":106.82,"c":107.38,"v":0,"vap":107.4936,"vam":107.2284,"mp":107.36,"mc":135,"ut":107.6,"lt":106.94}, {"dt":202003032200,"o":108.29,"h":108.53,"l":106.91,"c":107.09,"v":0,"vap":108.0963,"vam":107.3308,"mp":107.94,"mc":65,"ut":108.34,"lt":107.06}, {"dt":202003022200,"o":107.41,"h":108.58,"l":107.37,"c":108.29,"v":0,"vap":108.1535,"vam":107.6232,"mp":107.72,"mc":70,"ut":108.4,"lt":107.46}, {"dt":202002282158,"o":109.58,"h":109.68,"l":107.48,"c":108,"v":0,"vap":109.2477,"vam":108.1297,"mp":108.68,"mc":53,"ut":109.6,"lt":107.68}, {"dt":202002272200,"o":110.34,"h":110.46,"l":109.52,"c":109.58,"v":0,"vap":110.2411,"vam":109.8766,"mp":109.94,"mc":62,"ut":110.4,"lt":109.68}, {"dt":202002262200,"o":110.15,"h":110.7,"l":110.11,"c":110.34,"v":0,"vap":110.4682,"vam":110.2807,"mp":110.4,"mc":111,"ut":110.6,"lt":110.14}, {"dt":202002252200,"o":110.62,"h":111.04,"l":109.87,"c":110.15,"v":0,"vap":110.82,"vam":110.2024,"mp":110.82,"mc":62,"ut":110.96,"lt":109.96}, {"dt":202002242200,"o":111.24,"h":111.68,"l":110.3,"c":110.62,"v":0,"vap":111.5482,"vam":110.7097,"mp":111.54,"mc":91,"ut":111.62,"lt":110.38}, {"dt":202002212158,"o":112.05,"h":112.19,"l":111.44,"c":111.54,"v":0,"vap":112,"vam":111.6269,"mp":112,"mc":73,"ut":112.1,"lt":111.5}, {"dt":202002202200,"o":111.29,"h":112.18,"l":111.08,"c":112.05,"v":0,"vap":111.8986,"vam":111.1915,"mp":111.26,"mc":45,"ut":112.12,"lt":111.12}, {"dt":202002192200,"o":109.83,"h":111.57,"l":109.8,"c":111.29,"v":0,"vap":111.0501,"vam":110.04,"mp":110.04,"mc":66,"ut":111.42,"lt":0}, {"dt":202002182200,"o":109.84,"h":109.95,"l":109.62,"c":109.83,"v":0,"vap":109.7993,"vam":109.7109,"mp":109.72,"mc":116,"ut":109.88,"lt":0}, {"dt":202002172200,"o":109.84,"h":109.96,"l":109.69,"c":109.84,"v":0,"vap":109.8683,"vam":109.8058,"mp":109.82,"mc":155,"ut":0,"lt":109.72}, {"dt":202002142158,"o":109.82,"h":109.91,"l":109.68,"c":109.78,"v":0,"vap":109.8277,"vam":109.7195,"mp":109.76,"mc":196,"ut":109.86,"lt":0}, {"dt":202002132200,"o":110.02,"h":110.09,"l":109.59,"c":109.82,"v":0,"vap":109.909,"vam":109.6925,"mp":109.78,"mc":114,"ut":0,"lt":109.62}, {"dt":202002122200,"o":109.79,"h":110.13,"l":109.73,"c":110.02,"v":0,"vap":110.0313,"vam":109.82,"mp":109.82,"mc":96,"ut":0,"lt":0}, {"dt":202002112200,"o":109.76,"h":109.96,"l":109.7,"c":109.79,"v":0,"vap":109.8674,"vam":109.7592,"mp":109.82,"mc":132,"ut":0,"lt":0}, {"dt":202002102200,"o":109.68,"h":109.88,"l":109.54,"c":109.76,"v":0,"vap":109.7711,"vam":109.6827,"mp":109.74,"mc":150,"ut":0,"lt":109.58}, {"dt":202002072158,"o":109.94,"h":110.02,"l":109.51,"c":109.76,"v":0,"vap":109.9085,"vam":109.721,"mp":109.9,"mc":96,"ut":0,"lt":109.56}, {"dt":202002062200,"o":109.79,"h":110,"l":109.69,"c":109.94,"v":0,"vap":109.9438,"vam":109.8188,"mp":109.86,"mc":122,"ut":0,"lt":109.74}, {"dt":202002052200,"o":109.52,"h":109.85,"l":109.27,"c":109.79,"v":0,"vap":109.7262,"vam":109.4398,"mp":109.44,"mc":85,"ut":0,"lt":109.32}, {"dt":202002042200,"o":108.65,"h":109.55,"l":108.52,"c":109.52,"v":0,"vap":109.3202,"vam":108.62,"mp":108.62,"mc":57,"ut":0,"lt":108.56}, {"dt":202002032200,"o":108.39,"h":108.8,"l":108.3,"c":108.65,"v":0,"vap":108.6309,"vam":108.4434,"mp":108.5,"mc":142,"ut":108.74,"lt":108.34}, {"dt":202001312158,"o":108.94,"h":109.13,"l":108.29,"c":108.33,"v":0,"vap":109.0587,"vam":108.5138,"mp":109.04,"mc":89,"ut":0,"lt":0}, {"dt":202001302200,"o":108.94,"h":109.06,"l":108.55,"c":108.94,"v":0,"vap":108.9616,"vam":108.7278,"mp":108.86,"mc":132,"ut":0,"lt":108.58}, {"dt":202001292200,"o":109.09,"h":109.27,"l":108.94,"c":108.94,"v":0,"vap":109.1697,"vam":109.0447,"mp":109.12,"mc":121,"ut":0,"lt":108.98}, {"dt":202001282200,"o":108.89,"h":109.2,"l":108.73,"c":109.09,"v":0,"vap":109.1019,"vam":108.8765,"mp":108.94,"mc":81,"ut":0,"lt":108.76}, {"dt":202001272200,"o":108.89,"h":109.14,"l":108.7,"c":108.89,"v":0,"vap":109.0283,"vam":108.8752,"mp":108.94,"mc":121,"ut":109.1,"lt":108.78}, {"dt":202001242158,"o":109.45,"h":109.65,"l":109.15,"c":109.27,"v":0,"vap":109.5583,"vam":109.333,"mp":109.5,"mc":106,"ut":0,"lt":109.18}, {"dt":202001232200,"o":109.8,"h":109.86,"l":109.23,"c":109.45,"v":0,"vap":109.6592,"vam":109.4254,"mp":109.54,"mc":94,"ut":109.82,"lt":109.3}, {"dt":202001222200,"o":109.86,"h":110.1,"l":109.79,"c":109.8,"v":0,"vap":109.9877,"vam":109.86,"mp":109.86,"mc":124,"ut":110.06,"lt":0}, {"dt":202001212200,"o":110.18,"h":110.22,"l":109.73,"c":109.86,"v":0,"vap":110.0579,"vam":109.8602,"mp":109.94,"mc":134,"ut":0,"lt":0}, {"dt":202001202200,"o":110.07,"h":110.22,"l":110.07,"c":110.18,"v":0,"vap":110.16,"vam":110.156,"mp":110.16,"mc":232,"ut":0,"lt":110.1}, {"dt":202001172158,"o":110.14,"h":110.29,"l":110.02,"c":110.13,"v":0,"vap":110.1871,"vam":110.1246,"mp":110.18,"mc":147,"ut":110.24,"lt":110.06}, {"dt":202001162200,"o":109.89,"h":110.18,"l":109.82,"c":110.14,"v":0,"vap":110.1027,"vam":109.8862,"mp":109.94,"mc":122,"ut":0,"lt":0}, {"dt":202001152200,"o":109.98,"h":110.01,"l":109.76,"c":109.89,"v":0,"vap":109.9355,"vam":109.8471,"mp":109.9,"mc":182,"ut":0,"lt":109.8}, {"dt":202001142200,"o":109.87,"h":110.21,"l":109.83,"c":109.98,"v":0,"vap":110.04,"vam":110.0101,"mp":110.04,"mc":150,"ut":110.12,"lt":109.88}, {"dt":202001132200,"o":109.52,"h":109.95,"l":109.5,"c":109.87,"v":0,"vap":109.9099,"vam":109.5912,"mp":109.86,"mc":110,"ut":0,"lt":0}, {"dt":202001102158,"o":109.51,"h":109.69,"l":109.41,"c":109.48,"v":0,"vap":109.5976,"vam":109.4726,"mp":109.5,"mc":130,"ut":0,"lt":0}, {"dt":202001092200,"o":109.09,"h":109.58,"l":108.98,"c":109.51,"v":0,"vap":109.4697,"vam":109.1766,"mp":109.46,"mc":67,"ut":109.54,"lt":109.02}, {"dt":202001082200,"o":108.45,"h":109.24,"l":107.62,"c":109.09,"v":0,"vap":108.9053,"vam":108.1,"mp":108.68,"mc":58,"ut":109.18,"lt":107.76}, {"dt":202001072200,"o":108.31,"h":108.63,"l":108.23,"c":108.45,"v":0,"vap":108.4993,"vam":108.3743,"mp":108.4,"mc":132,"ut":108.58,"lt":108.28}, {"dt":202001062200,"o":107.83,"h":108.51,"l":107.75,"c":108.31,"v":0,"vap":108.2594,"vam":107.9407,"mp":108.02,"mc":95,"ut":108.46,"lt":107.8}, {"dt":202001032158,"o":108.51,"h":108.63,"l":107.82,"c":108.08,"v":0,"vap":108.2825,"vam":107.946,"mp":108.08,"mc":107,"ut":108.56,"lt":107.9}, {"dt":202001022200,"o":108.62,"h":108.87,"l":108.19,"c":108.51,"v":0,"vap":108.78,"vam":108.4656,"mp":108.78,"mc":56,"ut":0,"lt":108.24}, {"dt":201912312206,"o":108.83,"h":108.88,"l":108.44,"c":108.62,"v":0,"vap":108.7238,"vam":108.5262,"mp":108.62,"mc":93,"ut":0,"lt":0}, {"dt":201912302205,"o":109.43,"h":109.45,"l":108.75,"c":108.83,"v":0,"vap":109.2645,"vam":108.9054,"mp":109.12,"mc":116,"ut":0,"lt":0}, {"dt":201912272158,"o":109.55,"h":109.59,"l":109.37,"c":109.43,"v":0,"vap":109.48,"vam":109.4729,"mp":109.48,"mc":183,"ut":0,"lt":0}, {"dt":201912262200,"o":109.35,"h":109.68,"l":109.33,"c":109.55,"v":0,"vap":109.5928,"vam":109.5303,"mp":109.54,"mc":87,"ut":0,"lt":0}, {"dt":201912252202,"o":109.35,"h":109.35,"l":109.35,"c":109.35,"v":0,"vap":109.35,"vam":109.35,"mp":109.35,"mc":1,"ut":0,"lt":0}, {"dt":201912241958,"o":109.34,"h":109.44,"l":109.3,"c":109.37,"v":0,"vap":109.4026,"vam":109.3401,"mp":109.36,"mc":208,"ut":0,"lt":0}, {"dt":201912232200,"o":109.4,"h":109.54,"l":109.32,"c":109.34,"v":0,"vap":109.3866,"vam":109.36,"mp":109.36,"mc":211,"ut":0,"lt":0}, {"dt":201912202158,"o":109.37,"h":109.53,"l":109.23,"c":109.44,"v":0,"vap":109.4013,"vam":109.3129,"mp":109.32,"mc":171,"ut":0,"lt":0}, {"dt":201912192200,"o":109.52,"h":109.68,"l":109.16,"c":109.37,"v":0,"vap":109.584,"vam":109.3045,"mp":109.56,"mc":128,"ut":0,"lt":0}, {"dt":201912182200,"o":109.48,"h":109.63,"l":109.37,"c":109.52,"v":0,"vap":109.5375,"vam":109.44,"mp":109.44,"mc":121,"ut":0,"lt":0}, {"dt":201912172200,"o":109.53,"h":109.63,"l":109.41,"c":109.48,"v":0,"vap":109.5637,"vam":109.5012,"mp":109.54,"mc":182,"ut":0,"lt":0}, {"dt":201912162200,"o":109.25,"h":109.68,"l":109.25,"c":109.53,"v":0,"vap":109.5486,"vam":109.351,"mp":109.36,"mc":131,"ut":0,"lt":0}, {"dt":201912132158,"o":109.27,"h":109.71,"l":109.14,"c":109.34,"v":0,"vap":109.5951,"vam":109.3374,"mp":109.58,"mc":88,"ut":0,"lt":0}, {"dt":201912122200,"o":108.51,"h":109.44,"l":108.44,"c":109.27,"v":0,"vap":109.1447,"vam":108.5104,"mp":108.54,"mc":75,"ut":0,"lt":0}, {"dt":201912112200,"o":108.71,"h":108.86,"l":108.44,"c":108.51,"v":0,"vap":108.7349,"vam":108.6267,"mp":108.68,"mc":143,"ut":0,"lt":0}, {"dt":201912102200,"o":108.55,"h":108.77,"l":108.48,"c":108.71,"v":0,"vap":108.6796,"vam":108.5546,"mp":108.58,"mc":141,"ut":0,"lt":0}, {"dt":201912092200,"o":108.61,"h":108.68,"l":108.41,"c":108.55,"v":0,"vap":108.6012,"vam":108.4929,"mp":108.58,"mc":155,"ut":0,"lt":0}, {"dt":201912062158,"o":108.7,"h":108.92,"l":108.5,"c":108.57,"v":0,"vap":108.7283,"vam":108.5753,"mp":108.68,"mc":104,"ut":0,"lt":0}, {"dt":201912052200,"o":108.82,"h":109,"l":108.62,"c":108.7,"v":0,"vap":108.8914,"vam":108.7261,"mp":108.86,"mc":136,"ut":0,"lt":0}, {"dt":201912042200,"o":108.63,"h":108.96,"l":108.41,"c":108.82,"v":0,"vap":108.7822,"vam":108.5245,"mp":108.64,"mc":71,"ut":0,"lt":0}, {"dt":201912032200,"o":108.94,"h":109.21,"l":108.45,"c":108.63,"v":0,"vap":109.0902,"vam":108.6142,"mp":109.08,"mc":49,"ut":0,"lt":0}, {"dt":201912022200,"o":109.52,"h":109.73,"l":108.9,"c":108.94,"v":0,"vap":109.6757,"vam":109.1202,"mp":109.62,"mc":80,"ut":0,"lt":0}, {"dt":201911292158,"o":109.48,"h":109.67,"l":109.37,"c":109.49,"v":0,"vap":109.54,"vam":109.4516,"mp":109.46,"mc":126,"ut":0,"lt":0}, {"dt":201911282200,"o":109.51,"h":109.56,"l":109.3,"c":109.48,"v":0,"vap":109.5,"vam":109.418,"mp":109.5,"mc":123,"ut":0,"lt":0}, {"dt":201911272200,"o":109,"h":109.61,"l":108.98,"c":109.51,"v":0,"vap":109.3788,"vam":109.0601,"mp":109.12,"mc":119,"ut":0,"lt":0}, {"dt":201911262200,"o":108.9,"h":109.21,"l":108.84,"c":109,"v":0,"vap":109.0553,"vam":108.9155,"mp":108.94,"mc":130,"ut":0,"lt":0}, {"dt":201911252200,"o":108.67,"h":108.98,"l":108.63,"c":108.9,"v":0,"vap":108.9073,"vam":108.7542,"mp":108.82,"mc":103,"ut":0,"lt":0}, {"dt":201911222158,"o":108.58,"h":108.73,"l":108.45,"c":108.63,"v":0,"vap":108.6557,"vam":108.5307,"mp":108.62,"mc":163,"ut":0,"lt":0}, {"dt":201911212200,"o":108.55,"h":108.7,"l":108.26,"c":108.58,"v":0,"vap":108.6178,"vam":108.441,"mp":108.58,"mc":124,"ut":0,"lt":0}, {"dt":201911202200,"o":108.54,"h":108.74,"l":108.33,"c":108.55,"v":0,"vap":108.5781,"vam":108.4383,"mp":108.5,"mc":110,"ut":0,"lt":0}, {"dt":201911192200,"o":108.63,"h":108.84,"l":108.43,"c":108.54,"v":0,"vap":108.6918,"vam":108.5043,"mp":108.54,"mc":87,"ut":0,"lt":0}, {"dt":201911182201,"o":108.79,"h":109.07,"l":108.48,"c":108.63,"v":0,"vap":108.9245,"vam":108.612,"mp":108.8,"mc":72,"ut":0,"lt":0}, {"dt":201911152158,"o":108.36,"h":108.86,"l":108.33,"c":108.77,"v":0,"vap":108.7383,"vam":108.5129,"mp":108.58,"mc":85,"ut":0,"lt":0}, {"dt":201911142200,"o":108.83,"h":108.86,"l":108.22,"c":108.36,"v":0,"vap":108.7437,"vam":108.4712,"mp":108.62,"mc":79,"ut":0,"lt":0}, {"dt":201911132200,"o":109,"h":109.15,"l":108.62,"c":108.83,"v":0,"vap":109.04,"vam":108.7781,"mp":109.04,"mc":71,"ut":0,"lt":0}, {"dt":201911122200,"o":109.05,"h":109.29,"l":108.9,"c":109,"v":0,"vap":109.1829,"vam":109.0431,"mp":109.14,"mc":109,"ut":0,"lt":0}, {"dt":201911112200,"o":109.2,"h":109.26,"l":108.87,"c":109.05,"v":0,"vap":109.1212,"vam":108.9236,"mp":109,"mc":106,"ut":0,"lt":0}, {"dt":201911082158,"o":109.23,"h":109.48,"l":109.05,"c":109.23,"v":0,"vap":109.3301,"vam":109.177,"mp":109.32,"mc":106,"ut":0,"lt":0}, {"dt":201911072200,"o":108.91,"h":109.49,"l":108.62,"c":109.23,"v":0,"vap":109.2757,"vam":108.8164,"mp":109.12,"mc":57,"ut":0,"lt":0}, {"dt":201911062200,"o":109.17,"h":109.18,"l":108.8,"c":108.91,"v":0,"vap":109.0847,"vam":108.908,"mp":109,"mc":128,"ut":0,"lt":0}, {"dt":201911052200,"o":108.55,"h":109.25,"l":108.51,"c":109.17,"v":0,"vap":109.0653,"vam":108.6903,"mp":108.82,"mc":89,"ut":0,"lt":0}, {"dt":201911042200,"o":108.2,"h":108.65,"l":108.18,"c":108.55,"v":0,"vap":108.5704,"vam":108.22,"mp":108.22,"mc":89,"ut":0,"lt":0}, {"dt":201911012058,"o":108.03,"h":108.3,"l":107.87,"c":108.16,"v":0,"vap":108.1426,"vam":107.9261,"mp":108,"mc":145,"ut":0,"lt":0}, {"dt":201910312058,"o":108.83,"h":108.9,"l":107.9,"c":108.03,"v":0,"vap":108.6889,"vam":108.0733,"mp":108.62,"mc":64,"ut":0,"lt":0}, {"dt":201910302058,"o":108.83,"h":109.29,"l":108.69,"c":108.85,"v":0,"vap":108.96,"vam":108.7527,"mp":108.82,"mc":226,"ut":0,"lt":0}, {"dt":201910292056,"o":108.91,"h":109.07,"l":108.73,"c":108.88,"v":0,"vap":108.9762,"vam":108.8512,"mp":108.94,"mc":145,"ut":109.02,"lt":108.8}, {"dt":201910282059,"o":108.73,"h":109.04,"l":108.63,"c":108.91,"v":0,"vap":108.8981,"vam":108.6908,"mp":108.72,"mc":140,"ut":109,"lt":0}, {"dt":201910252059,"o":108.55,"h":108.77,"l":108.48,"c":108.65,"v":0,"vap":108.668,"vam":108.5796,"mp":108.62,"mc":153,"ut":0,"lt":0}, {"dt":201910242058,"o":108.63,"h":108.75,"l":108.47,"c":108.58,"v":0,"vap":108.6633,"vam":108.5383,"mp":108.58,"mc":135,"ut":0,"lt":0}, {"dt":201910232057,"o":108.48,"h":108.71,"l":108.23,"c":108.66,"v":0,"vap":108.567,"vam":108.32,"mp":108.32,"mc":107,"ut":0,"lt":108.26}, {"dt":201910222056,"o":108.57,"h":108.73,"l":108.41,"c":108.49,"v":0,"vap":108.598,"vam":108.5096,"mp":108.54,"mc":134,"ut":108.68,"lt":0}, {"dt":201910212058,"o":108.43,"h":108.66,"l":108.29,"c":108.57,"v":0,"vap":108.5886,"vam":108.4118,"mp":108.54,"mc":126,"ut":0,"lt":108.32}, {"dt":201910182059,"o":108.62,"h":108.72,"l":108.37,"c":108.4,"v":0,"vap":108.6204,"vam":108.455,"mp":108.56,"mc":97,"ut":108.68,"lt":0}, {"dt":201910172058,"o":108.75,"h":108.94,"l":108.43,"c":108.62,"v":0,"vap":108.779,"vam":108.6022,"mp":108.74,"mc":121,"ut":108.86,"lt":108.48}, {"dt":201910162058,"o":108.85,"h":108.87,"l":108.55,"c":108.76,"v":0,"vap":108.7688,"vam":108.629,"mp":108.68,"mc":153,"ut":0,"lt":108.58}, {"dt":201910152056,"o":108.39,"h":108.9,"l":108.12,"c":108.86,"v":0,"vap":108.6725,"vam":108.244,"mp":108.32,"mc":147,"ut":0,"lt":108.2}, {"dt":201910142058,"o":108.42,"h":108.52,"l":108.01,"c":108.4,"v":0,"vap":108.399,"vam":108.1736,"mp":108.32,"mc":100,"ut":0,"lt":108.08}, {"dt":201910112059,"o":107.96,"h":108.62,"l":107.8,"c":108.27,"v":0,"vap":108.4349,"vam":107.94,"mp":107.94,"mc":87,"ut":108.58,"lt":107.84}, {"dt":201910102058,"o":107.38,"h":108.02,"l":107.01,"c":107.94,"v":0,"vap":107.7768,"vam":107.3175,"mp":107.44,"mc":91,"ut":107.96,"lt":107.08}, {"dt":201910092058,"o":107.01,"h":107.59,"l":106.91,"c":107.38,"v":0,"vap":107.4103,"vam":107.0978,"mp":107.36,"mc":119,"ut":107.52,"lt":106.94}, {"dt":201910082057,"o":107.2,"h":107.44,"l":106.77,"c":107.08,"v":0,"vap":107.36,"vam":106.9584,"mp":107.36,"mc":69,"ut":0,"lt":106.82}, {"dt":201910072058,"o":106.67,"h":107.44,"l":106.65,"c":107.22,"v":0,"vap":107.083,"vam":106.7407,"mp":106.82,"mc":106,"ut":107.32,"lt":106.68}, {"dt":201910042059,"o":106.87,"h":107.13,"l":106.55,"c":106.91,"v":0,"vap":106.9362,"vam":106.7109,"mp":106.82,"mc":131,"ut":107.06,"lt":106.66}, {"dt":201910032058,"o":107.18,"h":107.3,"l":106.45,"c":106.87,"v":0,"vap":107.1891,"vam":106.8194,"mp":107.12,"mc":102,"ut":107.26,"lt":106.6}, {"dt":201910022059,"o":107.74,"h":107.89,"l":107.01,"c":107.18,"v":0,"vap":107.7415,"vam":107.278,"mp":107.7,"mc":65,"ut":107.84,"lt":107.08}, {"dt":201910012057,"o":108.08,"h":108.47,"l":107.59,"c":107.75,"v":0,"vap":108.3068,"vam":107.7,"mp":107.7,"mc":58,"ut":108.42,"lt":107.64}, {"dt":201909302059,"o":107.97,"h":108.18,"l":107.72,"c":108.08,"v":0,"vap":108.0728,"vam":107.839,"mp":107.9,"mc":107,"ut":108.14,"lt":0}, {"dt":201909272059,"o":107.8,"h":108.18,"l":107.62,"c":107.9,"v":0,"vap":108.0302,"vam":107.7304,"mp":107.82,"mc":88,"ut":108.14,"lt":0}, {"dt":201909262058,"o":107.76,"h":107.96,"l":107.4,"c":107.84,"v":0,"vap":107.7678,"vam":107.5605,"mp":107.62,"mc":127,"ut":107.88,"lt":107.46}, {"dt":201909252058,"o":107.05,"h":107.88,"l":106.97,"c":107.77,"v":0,"vap":107.6577,"vam":107.1616,"mp":107.32,"mc":97,"ut":107.82,"lt":107.02}, {"dt":201909242056,"o":107.54,"h":107.8,"l":106.94,"c":107.11,"v":0,"vap":107.6691,"vam":107.2184,"mp":107.54,"mc":78,"ut":107.72,"lt":106.98}, {"dt":201909232058,"o":107.71,"h":107.77,"l":107.29,"c":107.54,"v":0,"vap":107.7,"vam":107.427,"mp":107.7,"mc":96,"ut":0,"lt":107.34}, {"dt":201909202059,"o":108.03,"h":108.09,"l":107.5,"c":107.54,"v":0,"vap":108.0071,"vam":107.7276,"mp":107.94,"mc":114,"ut":0,"lt":0}, {"dt":201909192058,"o":108.4,"h":108.47,"l":107.76,"c":108.03,"v":0,"vap":108.1751,"vam":107.8689,"mp":107.94,"mc":102,"ut":0,"lt":107.8}, {"dt":201909182056,"o":108.12,"h":108.44,"l":108.05,"c":108.43,"v":0,"vap":108.2516,"vam":108.1118,"mp":108.18,"mc":178,"ut":0,"lt":0}, {"dt":201909172056,"o":108.08,"h":108.37,"l":108,"c":108.09,"v":0,"vap":108.201,"vam":108.0928,"mp":108.12,"mc":156,"ut":108.28,"lt":0}, {"dt":201909162059,"o":107.46,"h":108.13,"l":107.45,"c":108.08,"v":0,"vap":107.9533,"vam":107.6956,"mp":107.82,"mc":98,"ut":108.08,"lt":107.56}, {"dt":201909132059,"o":108.05,"h":108.26,"l":107.87,"c":108.07,"v":0,"vap":108.1267,"vam":108.0184,"mp":108.08,"mc":122,"ut":108.22,"lt":107.92}, {"dt":201909122058,"o":107.77,"h":108.19,"l":107.5,"c":108.11,"v":0,"vap":108.0697,"vam":107.7765,"mp":108,"mc":90,"ut":0,"lt":107.62}, {"dt":201909112058,"o":107.48,"h":107.86,"l":107.45,"c":107.8,"v":0,"vap":107.7709,"vam":107.5942,"mp":107.72,"mc":122,"ut":0,"lt":0}, {"dt":201909102056,"o":107.24,"h":107.58,"l":107.16,"c":107.5,"v":0,"vap":107.417,"vam":107.2516,"mp":107.36,"mc":120,"ut":107.52,"lt":0}, {"dt":201909092058,"o":106.8,"h":107.27,"l":106.73,"c":107.19,"v":0,"vap":107.0779,"vam":106.8904,"mp":106.9,"mc":100,"ut":107.22,"lt":106.8}, {"dt":201909062059,"o":106.93,"h":107.1,"l":106.59,"c":106.9,"v":0,"vap":107.035,"vam":106.8185,"mp":107,"mc":116,"ut":0,"lt":106.68}, {"dt":201909052058,"o":106.33,"h":107.2,"l":106.27,"c":106.95,"v":0,"vap":106.94,"vam":106.4312,"mp":106.94,"mc":64,"ut":107.12,"lt":106.3}, {"dt":201909042058,"o":105.93,"h":106.44,"l":105.8,"c":106.41,"v":0,"vap":106.2679,"vam":105.9884,"mp":106.22,"mc":92,"ut":106.4,"lt":105.84}, {"dt":201909032057,"o":106.19,"h":106.38,"l":105.72,"c":105.95,"v":0,"vap":106.2571,"vam":105.9323,"mp":106.04,"mc":62,"ut":0,"lt":105.78}, {"dt":201909022058,"o":106.03,"h":106.4,"l":105.9,"c":106.19,"v":0,"vap":106.2998,"vam":106.0833,"mp":106.16,"mc":114,"ut":0,"lt":106}, {"dt":201908302059,"o":106.48,"h":106.55,"l":106.08,"c":106.26,"v":0,"vap":106.4654,"vam":106.2315,"mp":106.36,"mc":97,"ut":0,"lt":0}, {"dt":201908292058,"o":106.11,"h":106.68,"l":105.8,"c":106.51,"v":0,"vap":106.4389,"vam":105.86,"mp":105.86,"mc":68,"ut":106.64,"lt":105.84}, {"dt":201908282058,"o":105.72,"h":106.23,"l":105.62,"c":106.11,"v":0,"vap":105.9326,"vam":105.7072,"mp":105.72,"mc":121,"ut":106.16,"lt":105.66}, {"dt":201908272056,"o":106.11,"h":106.15,"l":105.57,"c":105.76,"v":0,"vap":105.9366,"vam":105.6714,"mp":105.76,"mc":113,"ut":0,"lt":105.6}, {"dt":201908262058,"o":104.94,"h":106.41,"l":104.45,"c":106.12,"v":0,"vap":106.0344,"vam":105.1527,"mp":105.86,"mc":47,"ut":106.18,"lt":104.74}, {"dt":201908232059,"o":106.38,"h":106.73,"l":105.23,"c":105.37,"v":0,"vap":106.6757,"vam":105.6095,"mp":106.58,"mc":78,"ut":106.66,"lt":105.26}, {"dt":201908222058,"o":106.6,"h":106.64,"l":106.23,"c":106.4,"v":0,"vap":106.5105,"vam":106.3855,"mp":106.4,"mc":121,"ut":106.6,"lt":106.28}, {"dt":201908212058,"o":106.19,"h":106.65,"l":106.18,"c":106.61,"v":0,"vap":106.5379,"vam":106.3402,"mp":106.44,"mc":142,"ut":0,"lt":0}, {"dt":201908202056,"o":106.63,"h":106.69,"l":106.13,"c":106.23,"v":0,"vap":106.5353,"vam":106.2853,"mp":106.32,"mc":89,"ut":106.64,"lt":106.18}, {"dt":201908192058,"o":106.25,"h":106.7,"l":106.22,"c":106.63,"v":0,"vap":106.5812,"vam":106.3558,"mp":106.54,"mc":86,"ut":106.66,"lt":0}, {"dt":201908162059,"o":106.05,"h":106.49,"l":106,"c":106.36,"v":0,"vap":106.3343,"vam":106.109,"mp":106.12,"mc":86,"ut":106.44,"lt":0}, {"dt":201908152058,"o":105.86,"h":106.78,"l":105.68,"c":106.08,"v":0,"vap":106.1921,"vam":105.8556,"mp":105.9,"mc":87,"ut":106.38,"lt":105.72}, {"dt":201908142056,"o":106.69,"h":106.73,"l":105.62,"c":105.88,"v":0,"vap":106.4299,"vam":105.8851,"mp":106.36,"mc":73,"ut":106.66,"lt":105.72}, {"dt":201908132056,"o":105.23,"h":106.97,"l":105.04,"c":106.72,"v":0,"vap":106.3513,"vam":105.1123,"mp":105.22,"mc":63,"ut":106.76,"lt":105.1}, {"dt":201908122059,"o":105.56,"h":105.69,"l":105.05,"c":105.26,"v":0,"vap":105.4772,"vam":105.1908,"mp":105.3,"mc":59,"ut":105.64,"lt":105.08}, {"dt":201908092059,"o":106.1,"h":106.14,"l":105.25,"c":105.66,"v":0,"vap":105.96,"vam":105.5796,"mp":105.96,"mc":76,"ut":106.04,"lt":105.3}, {"dt":201908082058,"o":106.26,"h":106.3,"l":105.87,"c":106.09,"v":0,"vap":106.186,"vam":106.0092,"mp":106.12,"mc":156,"ut":106.24,"lt":105.92}, {"dt":201908072058,"o":106.46,"h":106.46,"l":105.47,"c":106.27,"v":0,"vap":106.274,"vam":105.8233,"mp":106.22,"mc":94,"ut":106.42,"lt":105.6}, {"dt":201908062056,"o":106.01,"h":107.05,"l":105.5,"c":106.46,"v":0,"vap":106.611,"vam":105.9437,"mp":106.36,"mc":100,"ut":106.74,"lt":105.56}, {"dt":201908052058,"o":106.56,"h":106.68,"l":105.76,"c":106.01,"v":0,"vap":106.232,"vam":105.9073,"mp":106,"mc":127,"ut":106.6,"lt":105.84}, {"dt":201908022059,"o":107.3,"h":107.57,"l":106.48,"c":106.57,"v":0,"vap":107.17,"vam":106.6509,"mp":106.86,"mc":55,"ut":107.46,"lt":0}, {"dt":201908012058,"o":108.75,"h":109.32,"l":107.23,"c":107.32,"v":0,"vap":109.2252,"vam":107.9443,"mp":109.18,"mc":69,"ut":109.24,"lt":107.3}, {"dt":201907312059,"o":108.55,"h":109,"l":108.47,"c":108.75,"v":0,"vap":108.675,"vam":108.5219,"mp":108.54,"mc":201,"ut":108.86,"lt":0}, {"dt":201907302054,"o":108.78,"h":108.95,"l":108.43,"c":108.58,"v":0,"vap":108.7604,"vam":108.5183,"mp":108.58,"mc":118,"ut":108.88,"lt":108.46}, {"dt":201907292058,"o":108.66,"h":108.9,"l":108.4,"c":108.78,"v":0,"vap":108.7445,"vam":108.5469,"mp":108.62,"mc":116,"ut":0,"lt":0}, {"dt":201907262059,"o":108.63,"h":108.83,"l":108.54,"c":108.66,"v":0,"vap":108.6467,"vam":108.62,"mp":108.62,"mc":183,"ut":108.74,"lt":0}, {"dt":201907252058,"o":108.17,"h":108.76,"l":108.01,"c":108.63,"v":0,"vap":108.5113,"vam":108.0353,"mp":108.12,"mc":92,"ut":108.72,"lt":0}, {"dt":201907242058,"o":108.22,"h":108.28,"l":107.91,"c":108.12,"v":0,"vap":108.1682,"vam":108.04,"mp":108.04,"mc":102,"ut":108.24,"lt":107.98}, {"dt":201907232056,"o":107.85,"h":108.29,"l":107.8,"c":108.24,"v":0,"vap":108.1845,"vam":107.9868,"mp":108.12,"mc":115,"ut":0,"lt":107.84}, {"dt":201907222059,"o":107.73,"h":108.07,"l":107.69,"c":107.87,"v":0,"vap":107.9389,"vam":107.8139,"mp":107.86,"mc":138,"ut":108.02,"lt":107.72}, {"dt":201907192059,"o":107.29,"h":107.95,"l":107.19,"c":107.69,"v":0,"vap":107.7159,"vam":107.4659,"mp":107.68,"mc":90,"ut":107.78,"lt":107.24}, {"dt":201907182058,"o":107.94,"h":108.02,"l":107.19,"c":107.29,"v":0,"vap":107.8969,"vam":107.5546,"mp":107.72,"mc":103,"ut":107.98,"lt":107.24}, {"dt":201907172058,"o":108.24,"h":108.33,"l":107.91,"c":107.94,"v":0,"vap":108.2225,"vam":108.1143,"mp":108.22,"mc":124,"ut":0,"lt":107.98}, {"dt":201907162056,"o":107.91,"h":108.38,"l":107.8,"c":108.25,"v":0,"vap":108.2193,"vam":107.9068,"mp":107.94,"mc":85,"ut":0,"lt":0}, {"dt":201907152058,"o":107.85,"h":108.08,"l":107.76,"c":107.91,"v":0,"vap":107.965,"vam":107.8567,"mp":107.86,"mc":148,"ut":0,"lt":0}, {"dt":201907122059,"o":108.49,"h":108.61,"l":107.77,"c":107.88,"v":0,"vap":108.448,"vam":108.015,"mp":108.32,"mc":88,"ut":108.54,"lt":107.8}, {"dt":201907112058,"o":108.41,"h":108.53,"l":107.83,"c":108.49,"v":0,"vap":108.44,"vam":108.0132,"mp":108.44,"mc":66,"ut":0,"lt":107.88}, {"dt":201907102058,"o":108.83,"h":108.99,"l":108.33,"c":108.47,"v":0,"vap":108.9177,"vam":108.5079,"mp":108.86,"mc":129,"ut":0,"lt":0}, {"dt":201907092056,"o":108.69,"h":108.96,"l":108.63,"c":108.85,"v":0,"vap":108.8301,"vam":108.7417,"mp":108.82,"mc":127,"ut":108.92,"lt":108.66}, {"dt":201907082058,"o":108.41,"h":108.81,"l":108.26,"c":108.68,"v":0,"vap":108.6435,"vam":108.32,"mp":108.32,"mc":62,"ut":0,"lt":0}, {"dt":201907052059,"o":107.81,"h":108.62,"l":107.75,"c":108.56,"v":0,"vap":108.4572,"vam":107.82,"mp":107.82,"mc":86,"ut":0,"lt":0}, {"dt":201907042057,"o":107.81,"h":107.84,"l":107.69,"c":107.76,"v":0,"vap":107.8016,"vam":107.7391,"mp":107.78,"mc":221,"ut":0,"lt":0}, {"dt":201907032058,"o":107.89,"h":107.92,"l":107.51,"c":107.83,"v":0,"vap":107.82,"vam":107.6101,"mp":107.82,"mc":91,"ut":0,"lt":0}, {"dt":201907022056,"o":108.43,"h":108.48,"l":107.73,"c":107.88,"v":0,"vap":108.3911,"vam":107.9812,"mp":108.36,"mc":78,"ut":0,"lt":107.78}, {"dt":201907012058,"o":108.18,"h":108.53,"l":108.08,"c":108.43,"v":0,"vap":108.4168,"vam":108.2003,"mp":108.26,"mc":113,"ut":108.48,"lt":108.14}, {"dt":201906282059,"o":107.78,"h":107.93,"l":107.54,"c":107.83,"v":0,"vap":107.7915,"vam":107.6262,"mp":107.66,"mc":108,"ut":107.88,"lt":107.58}, {"dt":201906272058,"o":107.76,"h":108.16,"l":107.62,"c":107.77,"v":0,"vap":107.9823,"vam":107.7171,"mp":107.72,"mc":113,"ut":108.12,"lt":107.66}, {"dt":201906262058,"o":107.16,"h":107.85,"l":107.08,"c":107.78,"v":0,"vap":107.7092,"vam":107.3188,"mp":107.66,"mc":80,"ut":0,"lt":107.12}, {"dt":201906252057,"o":107.27,"h":107.41,"l":106.76,"c":107.16,"v":0,"vap":107.2106,"vam":106.9311,"mp":107.04,"mc":78,"ut":107.36,"lt":106.82}, {"dt":201906242058,"o":107.3,"h":107.54,"l":107.23,"c":107.3,"v":0,"vap":107.4194,"vam":107.2796,"mp":107.32,"mc":163,"ut":107.48,"lt":0}, {"dt":201906212058,"o":107.34,"h":107.74,"l":107.02,"c":107.31,"v":0,"vap":107.5036,"vam":107.2105,"mp":107.32,"mc":85,"ut":107.66,"lt":0}, {"dt":201906202058,"o":108.16,"h":108.16,"l":107.19,"c":107.35,"v":0,"vap":107.853,"vam":107.4338,"mp":107.62,"mc":96,"ut":108.1,"lt":107.24}, {"dt":201906192058,"o":108.46,"h":108.62,"l":107.87,"c":108.05,"v":0,"vap":108.4921,"vam":108.2057,"mp":108.36,"mc":119,"ut":108.58,"lt":107.98}, {"dt":201906182056,"o":108.51,"h":108.68,"l":108.04,"c":108.46,"v":0,"vap":108.4921,"vam":108.2421,"mp":108.26,"mc":97,"ut":108.62,"lt":108.16}, {"dt":201906171653,"o":108.5,"h":108.72,"l":108.46,"c":108.54,"v":0,"vap":108.6263,"vam":108.5379,"mp":108.58,"mc":148,"ut":0,"lt":0}, {"dt":201906142059,"o":108.35,"h":108.59,"l":108.13,"c":108.56,"v":0,"vap":108.4382,"vam":108.2044,"mp":108.32,"mc":117,"ut":0,"lt":0}, {"dt":201906132059,"o":108.45,"h":108.54,"l":108.13,"c":108.36,"v":0,"vap":108.4692,"vam":108.2924,"mp":108.44,"mc":143,"ut":0,"lt":108.2}, {"dt":201906122058,"o":108.52,"h":108.57,"l":108.19,"c":108.51,"v":0,"vap":108.5012,"vam":108.3358,"mp":108.44,"mc":119,"ut":0,"lt":108.22}, {"dt":201906112056,"o":108.43,"h":108.8,"l":108.33,"c":108.52,"v":0,"vap":108.6751,"vam":108.4412,"mp":108.58,"mc":99,"ut":108.76,"lt":0}, {"dt":201906102058,"o":108.49,"h":108.72,"l":108.3,"c":108.45,"v":0,"vap":108.6202,"vam":108.4226,"mp":108.5,"mc":94,"ut":108.68,"lt":108.38}, {"dt":201906072059,"o":108.41,"h":108.62,"l":107.86,"c":108.16,"v":0,"vap":108.4946,"vam":108.0944,"mp":108.44,"mc":127,"ut":108.56,"lt":107.94}, {"dt":201906062058,"o":108.42,"h":108.56,"l":108,"c":108.37,"v":0,"vap":108.36,"vam":108.11,"mp":108.18,"mc":137,"ut":108.5,"lt":108.04}, {"dt":201906052058,"o":108.14,"h":108.49,"l":107.79,"c":108.45,"v":0,"vap":108.3014,"vam":108.0219,"mp":108.04,"mc":73,"ut":108.44,"lt":107.9}, {"dt":201906042057,"o":108.06,"h":108.36,"l":107.82,"c":108.14,"v":0,"vap":108.1781,"vam":107.9129,"mp":108,"mc":77,"ut":108.3,"lt":0}, {"dt":201906032058,"o":108.28,"h":108.45,"l":107.86,"c":108.06,"v":0,"vap":108.3174,"vam":108.1101,"mp":108.26,"mc":97,"ut":108.4,"lt":107.94}, {"dt":201905312059,"o":109.59,"h":109.62,"l":108.26,"c":108.26,"v":0,"vap":109.2327,"vam":108.5424,"mp":108.76,"mc":66,"ut":0,"lt":108.34}, {"dt":201905302058,"o":109.59,"h":109.93,"l":109.44,"c":109.58,"v":0,"vap":109.7397,"vam":109.5324,"mp":109.68,"mc":110,"ut":109.86,"lt":109.48}, {"dt":201905292058,"o":109.37,"h":109.7,"l":109.12,"c":109.58,"v":0,"vap":109.4327,"vam":109.2254,"mp":109.32,"mc":138,"ut":109.64,"lt":0}, {"dt":201905282057,"o":109.45,"h":109.63,"l":109.19,"c":109.36,"v":0,"vap":109.5264,"vam":109.361,"mp":109.5,"mc":136,"ut":109.58,"lt":109.22}, {"dt":201905272058,"o":109.33,"h":109.58,"l":109.28,"c":109.48,"v":0,"vap":109.5,"vam":109.435,"mp":109.5,"mc":121,"ut":0,"lt":0}, {"dt":201905242059,"o":109.6,"h":109.75,"l":109.25,"c":109.29,"v":0,"vap":109.6425,"vam":109.3925,"mp":109.54,"mc":98,"ut":0,"lt":0}, {"dt":201905232058,"o":110.32,"h":110.37,"l":109.44,"c":109.6,"v":0,"vap":110.2719,"vam":109.6823,"mp":110.26,"mc":64,"ut":0,"lt":109.48}, {"dt":201905222058,"o":110.45,"h":110.63,"l":110.22,"c":110.3,"v":0,"vap":110.5046,"vam":110.2973,"mp":110.44,"mc":74,"ut":110.58,"lt":0}, {"dt":201905212057,"o":110.06,"h":110.67,"l":110,"c":110.44,"v":0,"vap":110.4934,"vam":110.0932,"mp":110.12,"mc":75,"ut":0,"lt":0}, {"dt":201905202058,"o":110.13,"h":110.31,"l":109.79,"c":110.06,"v":0,"vap":110.1597,"vam":109.9258,"mp":109.94,"mc":75,"ut":110.26,"lt":109.82}, {"dt":201905172059,"o":109.84,"h":110.19,"l":109.47,"c":110.06,"v":0,"vap":109.9645,"vam":109.6459,"mp":109.86,"mc":73,"ut":110.1,"lt":109.52}, {"dt":201905162058,"o":109.59,"h":109.97,"l":109.3,"c":109.84,"v":0,"vap":109.7645,"vam":109.44,"mp":109.44,"mc":82,"ut":109.92,"lt":109.34}, {"dt":201905152058,"o":109.58,"h":109.7,"l":109.12,"c":109.59,"v":0,"vap":109.6354,"vam":109.3629,"mp":109.62,"mc":80,"ut":0,"lt":109.2}, {"dt":201905142053,"o":109.29,"h":109.77,"l":109.12,"c":109.58,"v":0,"vap":109.696,"vam":109.3652,"mp":109.58,"mc":99,"ut":109.72,"lt":109.16}, {"dt":201905132059,"o":109.75,"h":109.84,"l":109,"c":109.28,"v":0,"vap":109.7303,"vam":109.2,"mp":109.72,"mc":80,"ut":0,"lt":109.04}, {"dt":201905102059,"o":109.76,"h":110.05,"l":109.44,"c":109.91,"v":0,"vap":109.8853,"vam":109.6432,"mp":109.82,"mc":90,"ut":110,"lt":109.52}, {"dt":201905092059,"o":110.07,"h":110.11,"l":109.44,"c":109.75,"v":0,"vap":109.9545,"vam":109.6297,"mp":109.72,"mc":82,"ut":0,"lt":109.5}, {"dt":201905082059,"o":110.23,"h":110.29,"l":109.87,"c":110.08,"v":0,"vap":110.1857,"vam":109.9982,"mp":110.12,"mc":122,"ut":0,"lt":109.92}, {"dt":201905072057,"o":110.71,"h":110.85,"l":110.15,"c":110.25,"v":0,"vap":110.7221,"vam":110.3577,"mp":110.62,"mc":96,"ut":110.78,"lt":0}, {"dt":201905062059,"o":110.63,"h":110.96,"l":110.26,"c":110.73,"v":0,"vap":110.8564,"vam":110.584,"mp":110.82,"mc":93,"ut":0,"lt":110.36}, {"dt":201905032059,"o":111.48,"h":111.69,"l":111.05,"c":111.07,"v":0,"vap":111.5178,"vam":111.2116,"mp":111.48,"mc":144,"ut":111.54,"lt":0}, {"dt":201905022059,"o":111.37,"h":111.67,"l":111.33,"c":111.49,"v":0,"vap":111.5422,"vam":111.4339,"mp":111.5,"mc":192,"ut":111.62,"lt":0}, {"dt":201905012059,"o":111.41,"h":111.61,"l":111.02,"c":111.37,"v":0,"vap":111.4844,"vam":111.2119,"mp":111.4,"mc":95,"ut":0,"lt":0}, {"dt":201904302057,"o":111.64,"h":111.69,"l":111.2,"c":111.44,"v":0,"vap":111.5547,"vam":111.2895,"mp":111.32,"mc":119,"ut":0,"lt":111.24}, {"dt":201904292059,"o":111.55,"h":111.9,"l":111.54,"c":111.64,"v":0,"vap":111.7703,"vam":111.6,"mp":111.6,"mc":99,"ut":111.86,"lt":0}, {"dt":201904262059,"o":111.59,"h":112.02,"l":111.41,"c":111.55,"v":0,"vap":111.7097,"vam":111.5222,"mp":111.58,"mc":121,"ut":111.78,"lt":111.44}, {"dt":201904252058,"o":112.11,"h":112.24,"l":111.36,"c":111.58,"v":0,"vap":112.0528,"vam":111.5978,"mp":111.82,"mc":68,"ut":112.18,"lt":111.42}, {"dt":201904242059,"o":111.84,"h":112.4,"l":111.66,"c":112.17,"v":0,"vap":112.0186,"vam":111.7609,"mp":111.82,"mc":178,"ut":112.32,"lt":111.72}, {"dt":201904232057,"o":111.87,"h":112.03,"l":111.62,"c":111.87,"v":0,"vap":111.9097,"vam":111.7847,"mp":111.82,"mc":134,"ut":111.98,"lt":111.68}, {"dt":201904222059,"o":111.85,"h":111.99,"l":111.84,"c":111.94,"v":0,"vap":111.92,"vam":111.9108,"mp":111.92,"mc":222,"ut":0,"lt":0}, {"dt":201904192059,"o":111.95,"h":112.01,"l":111.87,"c":111.9,"v":0,"vap":111.9601,"vam":111.8717,"mp":111.92,"mc":239,"ut":0,"lt":0}, {"dt":201904182059,"o":112.01,"h":112.06,"l":111.73,"c":111.98,"v":0,"vap":111.9637,"vam":111.8753,"mp":111.9,"mc":158,"ut":0,"lt":111.8}, {"dt":201904172059,"o":111.99,"h":112.17,"l":111.9,"c":112.06,"v":0,"vap":112.0475,"vam":111.9393,"mp":111.98,"mc":187,"ut":112.12,"lt":0}, {"dt":201904162057,"o":112.02,"h":112.05,"l":111.82,"c":112.02,"v":0,"vap":112.0021,"vam":111.8771,"mp":111.94,"mc":189,"ut":0,"lt":0}, {"dt":201904152059,"o":111.95,"h":112.1,"l":111.87,"c":112.03,"v":0,"vap":112,"vam":111.9349,"mp":112,"mc":143,"ut":112.06,"lt":0}, {"dt":201904122059,"o":111.64,"h":112.1,"l":111.55,"c":112,"v":0,"vap":111.968,"vam":111.718,"mp":111.94,"mc":69,"ut":112.04,"lt":0}, {"dt":201904112058,"o":110.99,"h":111.7,"l":110.86,"c":111.66,"v":0,"vap":111.4427,"vam":110.9877,"mp":111.08,"mc":81,"ut":111.66,"lt":0}, {"dt":201904102058,"o":111.12,"h":111.28,"l":110.82,"c":111.01,"v":0,"vap":111.1788,"vam":110.9715,"mp":111.12,"mc":161,"ut":111.22,"lt":0}, {"dt":201904092056,"o":111.45,"h":111.58,"l":110.95,"c":111.15,"v":0,"vap":111.4069,"vam":111.1072,"mp":111.32,"mc":97,"ut":111.5,"lt":111}, {"dt":201904082058,"o":111.68,"h":111.75,"l":111.26,"c":111.49,"v":0,"vap":111.5436,"vam":111.3669,"mp":111.44,"mc":131,"ut":111.7,"lt":111.3}, {"dt":201904052059,"o":111.64,"h":111.82,"l":111.52,"c":111.7,"v":0,"vap":111.68,"vam":111.6781,"mp":111.68,"mc":203,"ut":111.78,"lt":111.58}]';

	//console.log(jsonString);

	var jsonData = $.parseJSON(jsonString);
	console.log(jsonData.length + " bars loaded...");
	barData = jsonData;
	
	for (i=jsonData.length-1; i>=0; i--)		// Calc from oldest data first
	{
		if (exch == DEF_EXCH_CU)
			barData[i].localtime = getLocalTime(barData[i].dt.toString());
		else
			barData[i].localtime = barData[i].dt.toString();

		barData[i].mclose = (barData[i].o + barData[i].h + barData[i].l + barData[i].c) / 4;

		if (barData[i].mp > 0)
			barData[i].pclose = (barData[i].mp + barData[i].h + barData[i].l) / 3;
		else
			barData[i].pclose = (barData[i].h + barData[i].l) / 2;
		
		if (i==jsonData.length-1)
			barData[i].popen = barData[i].pclose;
		else
			barData[i].popen = (barData[i+1].popen + barData[i+1].pclose) / 2;
		//console.log("pcandle["+i+"]="+barData[i].popen+","+barData[i].pclose);
	}

	/* Disabled
	var strSupRes;
	strSupRes = $.ajax({
		type : "GET",
		url: prot+"//"+domain+"/chartasp/supportresistnew.asp?Exch=" + exch + "&Code=" + code,
		async: false,
		success: function(data)
		{
			//codeInfoString = $.parseJSON(data.responseText);
		}
	}).responseText;

	
	if (strSupRes)
	{
		var tokens = strSupRes.split("|");

		if (tokens.length >= 5)
		{
			supportMP	= Math.round(parseFloat(tokens[0]), 4);
			resistMP	= Math.round(parseFloat(tokens[1]), 4);
			latestMP	= Math.round(parseFloat(tokens[2]), 4);
			averageMC	= parseInt(tokens[3]);
			latestMC	= parseInt(tokens[4]);
		}
		//console.log(supportMP + "," + resistMP + "," + latestMP + "," + averageMC + "," + latestMC);
	}

	
	var strCBBC;
	var support = 0;
	var resistance = 0;
	var margin = 200;

	if (code == "/HSI" || code == "HSI")
	{
		if (supportMP)
			support = supportMP;

		if (resistMP)
			resistance = resistMP;

		strCBBC = $.ajax({
			type : "GET",
			url: prot+"//"+domain+"/chartasp/getcbbc.asp?Code=" + code + "&support="+support+"&resistance="+resistance+"&margin="+margin,
			async: false,
			success: function(data)
			{
				//codeInfoString = $.parseJSON(data.responseText);
			}
		}).responseText;
		//console.log(strCBBC);

		var strs = strCBBC.split(";");
		for (var i = 0; i < strs.length; i++)
		{
			var tokens = strs[i].split("|");
			if (tokens.length >= 5)
			{
				if (tokens[0] == "B")
				{
					bullCode		= tokens[1];
					bullCallLevel	= Math.round(parseFloat(tokens[2]), 4);
					bullPrice		= Math.round(parseFloat(tokens[3]), 4);
					bullVolume		= Math.round(parseFloat(tokens[4]), 4);
				}
				else
				{
					bearCode		= tokens[1];
					bearCallLevel	= Math.round(parseFloat(tokens[2]), 4);
					bearPrice		= Math.round(parseFloat(tokens[3]), 4);
					bearVolume		= Math.round(parseFloat(tokens[4]), 4);
				}
			}
		} // for
		
		//console.log("Bull : " + bullCode + "," + bullCallLevel + "," + bullPrice + "," + bullVolume);
		//console.log("Bear : " + bearCode + "," + bearCallLevel + "," + bearPrice + "," + bearVolume);
	}
	*/
	
	initChartBar(false);
	
	var avgMC;
	if ((interval == DEF_DAY) || (interval == DEF_WEEK) || (interval == DEF_MONTH))
	{
		avgMC = getAverageMC();
		//console.log("averageMC: " + averageMC);
	}

	//var lastidx = startExBarNo+drawExBarNo-2;

	for (var i = startExBarNo+drawExBarNo-2; i >= startExBarNo; i--)
	{
		if (barData[i].mc > avgMC && barData[i].mc > 0)
			barData[i].impmp = true;
		else
			barData[i].impmp = false;
	}

	for (var i = 0; i < DEF_MAX_RIGHT_SHIFT; i++)
	{
		var barNewData = {
			dt			: "000000000000",
			localtime	: "000000000000",
			o			: 0,
			h			: 0,
			l			: 0,
			c			: 0,
			v			: 0,
			vap			: 0,
			vam			: 0,
			mp			: 0,
			mc			: 0,
			ut			: 0,
			lt			: 0,
			
			mclose		: 0,
			popen		: 0,
			pclose		: 0,
			impmp		: false,
			
			calcPrice	: 0,
			volUnit		: "",
			//lastPercent = 0;
		}
		barData.unshift(barNewData);
	}
	
	startBar = DEF_MAX_RIGHT_SHIFT;	
	oldcode = code;
	oldinterval = interval;
}

function compFibRe()
{
	var fibStart;
	var fibEnd;
	var sign;

	if (fibIndex != 2)	// Insufficient data
		return;

	// Find start point: 100%
	fibStart = drawMaxHigh - yRatio * (fibRePoint[0].y - offsetYM - offsetYT);

	// Find end point: 0%
	fibEnd = drawMaxHigh - yRatio * (fibRePoint[1].y - offsetYM - offsetYT);

	if (fibStart > fibEnd)
		sign = 1;
	else
		sign = -1;

	// Loop through ratios to calculate percentage difference
	fibRe[0] = fibEnd;
	drawFibRe[0] = fibRePoint[1].y;

	for (i = 1; i < fibReRatio.length+1; i++)
	{
		fibRe[i] = sign * Math.abs(fibStart - fibEnd) * fibReRatio[i-1] + fibEnd;
		drawFibRe[i] = float2int(offsetYM + offsetYT + ((drawMaxHigh - fibRe[i]) / yRatio));
	}
	fibRe[6] = fibStart;
	drawFibRe[6] = fibRePoint[0].y;
	
	//console.log("compFibRe : " + fibRe);
	//console.log("compFibRe : " + drawFibRe);

	fibReOn = false;
	fibIndex = 0;
}

function compFibPr()
{
	var fibStart;
	var fibMid;
	var fibEnd;
	var sign;

	if (fibIndex != 3)	// Insufficient data
		return;

	fibStart = drawMaxHigh - yRatio * (fibPrPoint[0].y - offsetYM - offsetYT);
	fibMid = drawMaxHigh - yRatio * (fibPrPoint[1].y - offsetYM - offsetYT);
	fibEnd = drawMaxHigh - yRatio * (fibPrPoint[2].y - offsetYM - offsetYT);

	if (fibMid >= fibEnd)
		sign = 1;
	else
		sign = -1;

	for (i = 0; i < fibPrRatio.length; i++)
	{
		fibPr[i] = sign * Math.abs(fibStart - fibMid) * fibPrRatio[i] + fibEnd;
		drawFibPr[i] = float2int(offsetYM + offsetYT + ((drawMaxHigh - fibPr[i]) / yRatio));
	}

	//console.log(fibPr);

	fibPrOn = false;
	fibIndex = 0;
}

function drawBar(ctx, x, bar)
{
	var drawHeight = ctx.canvas.height - offsetYS - offsetYY - techPaneNo * offsetTS - offsetYT - offsetYM;	// Drawable height
	var midPt;
	var radius;
	var diameter;

	if (! ((barData[bar].chartOpen > 0) && (barData[bar].chartHigh > 0) &&
		   (barData[bar].chartLow > 0) && (barData[bar].chartLast > 0)))
		return;

	//console.log("drawBar "+bar+" : " +  barData[bar].chartOpen + ", " + barData[bar].chartHigh + ", " + barData[bar].chartLow + ", " + barData[bar].chartLast);
	//console.log("drawBar "+bar+" : " +  barData[bar].chartVaplus + ", " + barData[bar].chartVaminus + ", " + barData[bar].chartUt + ", " + barData[bar].chartLt);
	//console.log("drawBar "+bar+" : " +  barData[bar].chartMp);

	// Bar body
	midPt = x - barSpacing - barHand - float2int(barWidth / 2);

	//console.log("typeChart = " + typeChart);
	switch (typeChart)
	{
		case DEF_PROSTICKS_CHART:
		case DEF_PROSTICKS_VOL_CHART:

		  if (version != DEF_PROSTICKS_TEST || barData[bar].impmp)
		  {
			// Check if y-coordinate of vaplus is less than that of vaminus
			// Remember y-coordinates increases downward
			if ((barData[bar].chartVaplus > 0) && (barData[bar].chartVaminus > 0) &&
				(barData[bar].chartVaplus < barData[bar].chartVaminus))
			{
				ctx.beginPath();
				ctx.strokeStyle = DEF_BAR_COLOR;
				ctx.rect(x - barSpacing - barHand - barWidth, barData[bar].chartVaplus,
					barWidth, barData[bar].chartVaminus - barData[bar].chartVaplus);
				ctx.stroke();
				ctx.closePath();

				// chartOpen < chartLast means open > last
				if (barData[bar].o > barData[bar].c)
					ctx.fillStyle = DEF_PROSTICKS_DOWN_COLOR;
				else
					ctx.fillStyle = DEF_WHITE_COLOR;

				ctx.fillRect(x - barSpacing - barHand - barWidth + 1, barData[bar].chartVaplus + 1,
					barWidth - 1, barData[bar].chartVaminus - barData[bar].chartVaplus - 1);

				// Head and tail
				ctx.strokeStyle = DEF_BAR_COLOR;
				if ((barData[bar].chartHigh > 0) && (barData[bar].chartVaplus > 0))
				{
					ctx.beginPath();
					ctx.moveTo(midPt, barData[bar].chartVaplus);
					ctx.lineTo(midPt, barData[bar].chartHigh);
					ctx.stroke();
				}

				if ((barData[bar].chartLow > 0) && (barData[bar].chartVaminus > 0))
				{
					ctx.beginPath();
					ctx.moveTo(midPt, barData[bar].chartVaminus);
					ctx.lineTo(midPt, barData[bar].chartLow);
					ctx.stroke();
					ctx.closePath();
				}

				// Bar hands
				if ((barData[bar].chartOpen > barData[bar].chartVaplus) &&
					(barData[bar].chartOpen < barData[bar].chartVaminus))
				{
					ctx.beginPath();
					ctx.moveTo(x - barSpacing - 2 * barHand - barWidth, barData[bar].chartOpen);
					ctx.lineTo(x - barSpacing - barHand - barWidth, barData[bar].chartOpen);
					ctx.stroke();
					ctx.closePath();
				}
				else
				{
					ctx.beginPath();
					ctx.moveTo(x - barSpacing - 2 * barHand - barWidth, barData[bar].chartOpen);
					ctx.lineTo(midPt, barData[bar].chartOpen);
					ctx.stroke();
					ctx.closePath();
				}

				if ((barData[bar].chartLast > barData[bar].chartVaplus) &&
					(barData[bar].chartLast < barData[bar].chartVaminus))
				{
					ctx.beginPath();
					ctx.moveTo(x - barSpacing - barHand, barData[bar].chartLast);
					ctx.lineTo(x - barSpacing, barData[bar].chartLast);
					ctx.stroke();
					ctx.closePath();
				}
				else
				{
					ctx.beginPath();
					ctx.moveTo(x - barSpacing - barHand, barData[bar].chartLast);
					ctx.lineTo(midPt, barData[bar].chartLast);
					ctx.stroke();
					ctx.closePath();
				}

				// Extreme tails
				if (barData[bar].chartUt > 0)
				{
					ctx.fillStyle = DEF_TAIL_COLOR;
					ctx.fillRect(midPt - 1, barData[bar].chartHigh,
						3, barData[bar].chartUt - barData[bar].chartHigh + 1);
				}

				if (barData[bar].chartLt > 0)
				{
					ctx.fillStyle = DEF_TAIL_COLOR;
					ctx.fillRect(midPt - 1, barData[bar].chartLt,
						3, barData[bar].chartLow - barData[bar].chartLt + 1);
				}
			}
			else
			{
				// Special case: No VAPlus and VAMinus
				// Draw bar chart
				ctx.beginPath();

				ctx.moveTo(x - barSpacing - barHand - barWidth, barData[bar].chartOpen);
				ctx.lineTo(midPt, barData[bar].chartOpen);
				ctx.stroke();

				ctx.moveTo(midPt, barData[bar].chartLast);
				ctx.lineTo(x - barSpacing - barHand, barData[bar].chartLast);
				ctx.stroke();

				ctx.moveTo(midPt, barData[bar].chartHigh);
				ctx.lineTo(midPt, barData[bar].chartLow);
				ctx.stroke();

				ctx.closePath();
			}

			// Draw Modal point
			if ((barData[bar].chartMp > 0) && (barData[bar].mc > 0))
			{
				ctx.beginPath();
				if (barData[bar].impmp)
					ctx.arc(midPt, barData[bar].chartMp, mpRadius*2, 0, 2*Math.PI);
				else
					ctx.arc(midPt, barData[bar].chartMp, mpRadius, 0, 2*Math.PI);
				ctx.fillStyle = DEF_MP_COLOR;
      			ctx.fill();
      			ctx.strokeStyle = DEF_MP_COLOR;
				ctx.stroke();
				ctx.closePath();
			}
		  }

		break;

		case DEF_CANDLE_CHART:

			ctx.strokeStyle = DEF_BAR_COLOR;
			if (barData[bar].chartOpen == barData[bar].chartLast)
			{
				ctx.beginPath();

				ctx.moveTo(x - barSpacing - barHand - barWidth, barData[bar].chartOpen);
				ctx.lineTo(x - barSpacing - barHand, barData[bar].chartOpen);
				ctx.stroke();

				if (barData[bar].chartHigh < barData[bar].chartOpen)
				{
					ctx.moveTo(midPt, barData[bar].chartOpen);
					ctx.lineTo(midPt, barData[bar].chartHigh);
					ctx.stroke();
				}

				if (barData[bar].chartLow > barData[bar].chartLast)
				{
					ctx.moveTo(midPt, barData[bar].chartLast);
					ctx.lineTo(midPt, barData[bar].chartLow);
					ctx.stroke();
				}
				ctx.closePath();
			}
			else if (barData[bar].chartOpen < barData[bar].chartLast)
			{
				ctx.beginPath();
				ctx.strokeStyle = DEF_BAR_COLOR;
				ctx.rect(x - barSpacing - barHand - barWidth, barData[bar].chartOpen,
					barWidth, barData[bar].chartLast - barData[bar].chartOpen);
				ctx.stroke();
				ctx.closePath();

				ctx.fillStyle = DEF_BLACK_COLOR;
				ctx.fillRect(x - barSpacing - barHand - barWidth + 1, barData[bar].chartOpen + 1,
					barWidth - 1, barData[bar].chartLast - barData[bar].chartOpen - 1);

				ctx.beginPath();
				ctx.strokeStyle = DEF_BAR_COLOR;
				if (barData[bar].chartHigh < barData[bar].chartOpen)
				{
					ctx.moveTo(midPt, barData[bar].chartOpen);
					ctx.lineTo(midPt, barData[bar].chartHigh);
					ctx.stroke();
				}

				if (barData[bar].chartLow > barData[bar].chartLast)
				{
					ctx.moveTo(midPt, barData[bar].chartLast);
					ctx.lineTo(midPt, barData[bar].chartLow);
					ctx.stroke();
				}
				ctx.closePath();
			}
			else
			{
				ctx.beginPath();
				ctx.strokeStyle = DEF_BAR_COLOR;
				ctx.rect(x - barSpacing - barHand - barWidth, barData[bar].chartLast,
					barWidth, barData[bar].chartOpen - barData[bar].chartLast);
				ctx.stroke();
				ctx.closePath();

				ctx.fillStyle = DEF_WHITE_COLOR;
				ctx.fillRect(x - barSpacing - barHand - barWidth + 1, barData[bar].chartLast + 1,
					barWidth - 1, barData[bar].chartOpen - barData[bar].chartLast - 1);

				ctx.beginPath();
				ctx.strokeStyle = DEF_BAR_COLOR;
				if (barData[bar].chartHigh < barData[bar].chartLast)
				{
					ctx.moveTo(midPt, barData[bar].chartLast);
					ctx.lineTo(midPt, barData[bar].chartHigh);
					ctx.stroke();
				}

				if (barData[bar].chartLow > barData[bar].chartOpen)
				{
					ctx.moveTo(midPt, barData[bar].chartOpen);
					ctx.lineTo(midPt, barData[bar].chartLow);
					ctx.stroke();
				}
				ctx.closePath();
			}

		break;

		case DEF_MCANDLE_CHART:

			ctx.strokeStyle = DEF_BAR_COLOR;
			if (barData[bar].chartMOpen == barData[bar].chartMClose)
			{
				ctx.beginPath();
				ctx.moveTo(x - barSpacing - barHand - barWidth, barData[bar].chartMOpen);
				ctx.lineTo(x - barSpacing - barHand, barData[bar].chartMOpen);
				ctx.stroke();

				if (barData[bar].chartHigh < barData[bar].chartMOpen)
				{
					ctx.moveTo(midPt, barData[bar].chartMOpen);
					ctx.lineTo(midPt, barData[bar].chartHigh);
					ctx.stroke();
				}

				if (barData[bar].chartLow > barData[bar].chartMClose)
				{
					ctx.moveTo(midPt, barData[bar].chartMClose);
					ctx.lineTo(midPt, barData[bar].chartLow);
					ctx.stroke();
				}
				ctx.closePath();
			}
			else if (barData[bar].chartMOpen < barData[bar].chartMClose)
			{
				ctx.beginPath();
				ctx.strokeStyle = DEF_BAR_COLOR;
				ctx.rect(x - barSpacing - barHand - barWidth, barData[bar].chartMOpen,
					barWidth, barData[bar].chartMClose - barData[bar].chartMOpen);
				ctx.stroke();
				ctx.closePath();

				ctx.fillStyle = DEF_BLACK_COLOR;
				ctx.fillRect(x - barSpacing - barHand - barWidth + 1, barData[bar].chartMOpen + 1,
					barWidth - 1, barData[bar].chartMClose - barData[bar].chartMOpen - 1);

				ctx.beginPath();
				ctx.strokeStyle = DEF_BAR_COLOR;
				if (barData[bar].chartHigh < barData[bar].chartMOpen)
				{
					ctx.moveTo(midPt, barData[bar].chartMOpen);
					ctx.lineTo(midPt, barData[bar].chartHigh);
					ctx.stroke();
				}

				if (barData[bar].chartLow > barData[bar].chartMClose)
				{
					ctx.moveTo(midPt, barData[bar].chartMClose);
					ctx.lineTo(midPt, barData[bar].chartLow);
					ctx.stroke();
				}
				ctx.closePath();
			}
			else
			{
				ctx.beginPath();
				ctx.strokeStyle = DEF_BAR_COLOR;
				ctx.rect(x - barSpacing - barHand - barWidth, barData[bar].chartMClose,
					barWidth, barData[bar].chartMOpen - barData[bar].chartMClose);
				ctx.stroke();
				ctx.closePath();

				ctx.fillStyle = DEF_WHITE_COLOR;
				ctx.fillRect(x - barSpacing - barHand - barWidth + 1, barData[bar].chartMClose + 1,
					barWidth - 1, barData[bar].chartMOpen - barData[bar].chartMClose - 1);

				ctx.beginPath();
				ctx.strokeStyle = DEF_BAR_COLOR;
				if (barData[bar].chartHigh < barData[bar].chartMClose)
				{
					ctx.moveTo(midPt, barData[bar].chartMClose);
					ctx.lineTo(midPt, barData[bar].chartHigh);
					ctx.stroke();
				}

				if (barData[bar].chartLow > barData[bar].chartMOpen)
				{
					ctx.moveTo(midPt, barData[bar].chartMOpen);
					ctx.lineTo(midPt, barData[bar].chartLow);
					ctx.stroke();
				}
				ctx.closePath();
			}

		break;

		case DEF_PCANDLE_CHART:

			if (barData[bar].o > 0 || barData[bar].h > 0 || barData[bar].l > 0 || barData[bar].c > 0)
			{
				ctx.strokeStyle = DEF_BAR_COLOR;
				if (barData[bar].chartPOpen == barData[bar].chartPClose)
				{
					ctx.beginPath();
					ctx.moveTo(x - barSpacing - barHand - barWidth, barData[bar].chartPOpen);
					ctx.lineTo(x - barSpacing - barHand, barData[bar].chartPOpen);
					ctx.stroke();

					if (barData[bar].chartHigh < barData[bar].chartPOpen)
					{
						ctx.moveTo(midPt, barData[bar].chartPOpen);
						ctx.lineTo(midPt, barData[bar].chartHigh);
						ctx.stroke();
					}

					if (barData[bar].chartLow > barData[bar].chartPClose)
					{
						ctx.moveTo(midPt, barData[bar].chartPClose);
						ctx.lineTo(midPt, barData[bar].chartLow);
						ctx.stroke();
					}
					ctx.closePath();
				}
				else if (barData[bar].chartPOpen < barData[bar].chartPClose)
				{
					ctx.beginPath();
					ctx.strokeStyle = DEF_BAR_COLOR;
					ctx.rect(x - barSpacing - barHand - barWidth, barData[bar].chartPOpen,
						barWidth, barData[bar].chartPClose - barData[bar].chartPOpen);
					ctx.stroke();
					ctx.closePath();

					ctx.fillStyle = DEF_BLACK_COLOR;
					ctx.fillRect(x - barSpacing - barHand - barWidth + 1, barData[bar].chartPOpen + 1,
						barWidth - 1, barData[bar].chartPClose - barData[bar].chartPOpen - 1);

					ctx.beginPath();
					ctx.strokeStyle = DEF_BAR_COLOR;
					if (barData[bar].chartHigh < barData[bar].chartPOpen)
					{
						ctx.moveTo(midPt, barData[bar].chartPOpen);
						ctx.lineTo(midPt, barData[bar].chartHigh);
						ctx.stroke();
					}

					if (barData[bar].chartLow > barData[bar].chartPClose)
					{
						ctx.moveTo(midPt, barData[bar].chartPClose);
						ctx.lineTo(midPt, barData[bar].chartLow);
						ctx.stroke();
					}
					ctx.closePath();
				}
				else
				{
					ctx.beginPath();
					ctx.strokeStyle = DEF_BAR_COLOR;
					ctx.rect(x - barSpacing - barHand - barWidth, barData[bar].chartPClose,
						barWidth, barData[bar].chartPOpen - barData[bar].chartPClose);
					ctx.stroke();
					ctx.closePath();

					ctx.fillStyle = DEF_WHITE_COLOR;
					ctx.fillRect(x - barSpacing - barHand - barWidth + 1, barData[bar].chartPClose + 1,
						barWidth - 1, barData[bar].chartPOpen - barData[bar].chartPClose - 1);

					ctx.beginPath();
					ctx.strokeStyle = DEF_BAR_COLOR;
					if (barData[bar].chartHigh < barData[bar].chartPClose)
					{
						ctx.moveTo(midPt, barData[bar].chartPClose);
						ctx.lineTo(midPt, barData[bar].chartHigh);
						ctx.stroke();
					}

					if (barData[bar].chartLow > barData[bar].chartPOpen)
					{
						ctx.moveTo(midPt, barData[bar].chartPOpen);
						ctx.lineTo(midPt, barData[bar].chartLow);
						ctx.stroke();
					}
					ctx.closePath();
				}
			}

		break;

		case DEF_BAR_CHART:
		case DEF_BAR_MODAL_CHART:
		case DEF_BAR_MODAL_VOL_CHART:

			ctx.beginPath();
			ctx.strokeStyle = DEF_BAR_COLOR;

			ctx.moveTo(x - barSpacing - barHand - barWidth, barData[bar].chartOpen);
			ctx.lineTo(midPt, barData[bar].chartOpen);
			ctx.stroke();

			ctx.moveTo(midPt, barData[bar].chartLast);
			ctx.lineTo(x - barSpacing - barHand +2, barData[bar].chartLast);
			//ctx.lineTo(x - barSpacing - barHand, barData[bar].chartLast);
			ctx.stroke();

			ctx.moveTo(midPt, barData[bar].chartHigh);
			ctx.lineTo(midPt, barData[bar].chartLow);
			ctx.stroke();
			ctx.closePath();

			if (((typeChart == DEF_BAR_MODAL_CHART) || (typeChart == DEF_BAR_MODAL_VOL_CHART)) &&
				(barData[bar].chartMp > 0) && (barData[bar].mc > 0))
			{
				ctx.beginPath();
				ctx.arc(midPt, barData[bar].chartMp, mpRadius, 0, 2*Math.PI);
				ctx.fillStyle = DEF_MP_COLOR;
      			ctx.fill();
      			ctx.strokeStyle = DEF_MP_COLOR;
				ctx.stroke();
				ctx.closePath();
			}

		break;

		case DEF_LINE_CHART:

			if (bar != startBarNo)
			{
				if ((barData[bar - 1].o > 0) && (barData[bar - 1].h > 0) &&
					(barData[bar - 1].l > 0) && (barData[bar - 1].c > 0))
				{
					ctx.beginPath();
					ctx.strokeStyle = DEF_BAR_COLOR;

					ctx.moveTo(midPt, barData[bar].chartLast);
					ctx.lineTo(x + barHand + float2int(barWidth / 2), barData[bar-1].chartLast);
					ctx.stroke();
				}
			}

			ctx.beginPath();
			ctx.arc(midPt, barData[bar].chartLast, mpRadius, 0, 2*Math.PI);
			ctx.fillStyle = DEF_MP_COLOR;
      		ctx.fill();
      		ctx.strokeStyle = DEF_MP_COLOR;
			ctx.stroke();
			ctx.closePath();

		break;

		case DEF_MODAL_LINE_CHART:
		case DEF_MODAL_LINE_VOL_CHART:

			if ((barData[bar].chartMp > 0) && (barData[bar].mc > 0))
			{
				if ((bar != startBarNo) &&
					(barData[bar - 1].chartMp > 0) && (barData[bar - 1].mc > 0))
				{
					ctx.beginPath();
					ctx.strokeStyle = DEF_BAR_COLOR;

					ctx.moveTo(midPt, barData[bar].chartMp);
					ctx.lineTo(x + barHand + float2int(barWidth / 2), barData[bar - 1].chartMp);
					ctx.stroke();
					ctx.closePath();
				}

				ctx.beginPath();
				ctx.arc(midPt, barData[bar].chartMp, mpRadius, 0, 2*Math.PI);
				ctx.fillStyle = DEF_MP_COLOR;
	      		ctx.fill();
	      		ctx.strokeStyle = DEF_MP_COLOR;
				ctx.stroke();
				ctx.closePath();
			}

		break;

		case DEF_AREA_CHART:

			if (bar != startBarNo)
			{
				if ((barData[bar - 1].o > 0) && (barData[bar - 1].h > 0) &&
					(barData[bar - 1].l > 0) && (barData[bar - 1].c > 0))
				{
					// fill the shape of bar
					var yScale = 0;
					yScale = float2int((drawMaxHigh - drawMinLow) / yRatio + offsetYT + offsetYM);
					
					ctx.fillStyle = DEF_AREA_COLOR;
					ctx.beginPath();
					
					ctx.moveTo(midPt, barData[bar].chartLast);
					ctx.lineTo(x + barHand + float2int(barWidth / 2) + 1, barData[bar - 1].chartLast);
					ctx.lineTo(x + barHand + float2int(barWidth / 2) + 1, yScale);
					ctx.lineTo(midPt, yScale);
					ctx.closePath();
					ctx.fill();
				}
			}
		break;
		
		default :
			console.log("no chart");
		break;
	}
}

function drawMain(ctx)
{
	var	x = ctx.canvas.width - offsetXS - offsetXX - offsetXG;
	var newgrid;
	var dt1, dt2;

	// Calculate skip line by dividing 40 by the whole bar width
	// Number 40 is chosen by trial and error for the best effect
	var skipCount = 0;
	var skipLine = 0;
	
	var textDate;
	var monthIndex;

	if ((interval == DEF_DAY) || (interval == DEF_WEEK)|| (interval == DEF_MONTH))
	{
		if (barSpacing + 2 * barHand + barWidth > 0)
			skipLine = float2int(40 / (barSpacing + 2 * barHand + barWidth));
	}
	else
	{
		// Spacing between 2 vertical lines must be at least 2 times of
		// string length "00:00"
		skipLine = float2int(2 * ctx.measureText("00:00").width / (barWidth + 2 * barHand + barSpacing));

		// Spacing should be a multiple of 5 (i.e. every 5, 10, 15, bars...)
		while ((skipLine % 5 != 0) && (skipLine > 1))
				skipLine++;
	}

	if (skipLine <= 0)
		skipLine = 1;

	// Draw special lines for lower chart technicals
	var spScale;
	for (i = 0; i < techPaneNo; i++)
	{
		for (sp = 0; sp < DEF_MAX_TECH_SP; sp++)
		{
			if (techPaneName[i] != DEF_LTECH_TEXT[DEF_PCTR])
			{
				if (techPaneSp[i][sp] < 0)
					continue;
			}

			// If value is less than lowest point on the chart, then don't display
			if (techPaneSp[i][sp] < techDrawMinLow[i])
				continue;

			if (techPaneSp[i][sp] > techDrawMaxHigh[i])
				continue;

			spScale = ctx.canvas.height - offsetYS - offsetYY - float2int(offsetTB * 0.125) -
				(techPaneNo - i - 1) * offsetTS - float2int((techPaneSp[i][sp] - techMinLow[i]) / techYRatio[i]);

			if ((techPaneName[i] == DEF_LTECH_TEXT[DEF_RSI] ||
				techPaneName[i] == DEF_LTECH_TEXT[DEF_PCTR]) && (sp % 2 != 0))
				ctx.strokeStyle = DEF_TECH_DOTTED_LINE;
			else
				ctx.strokeStyle = DEF_TECH_DOTTED_LINE2;

			// Draw dotted line
			var offsetX = ctx.canvas.width - offsetXS - offsetXX - 1;
			while ((offsetX - DEF_DOT_WIDTH) >= offsetXM)
			{
				ctx.beginPath();
				ctx.moveTo(offsetX, spScale);
				ctx.lineTo(offsetX - DEF_DOT_WIDTH, spScale);
				ctx.stroke();
				ctx.closePath();
				
				offsetX -= DEF_DOT_WIDTH + DEF_DOT_SPACE;
			}
		}
	}

	//console.log("startBarNo = " + startBarNo + " drawBarNo = " + drawBarNo);
	for (bar = startBarNo; bar < startBarNo + drawBarNo; bar++)
	{
		midPt = x - barSpacing - barHand - float2int(barWidth / 2);

		newGrid = false;
		dt1 = barData[bar].dt.toString();
		if (bar+1 >= startBarNo + drawBarNo)
			dt2 = dt1;
		else
			dt2 = barData[bar+1].dt.toString();
		
		if (interval == DEF_DAY)
		{
			//console.log(barData[bar].dt);
			// Every month
			if ((bar < startBarNo + drawBarNo - 1) &&
				(dt1.substring(4, 6) != dt2.substring(4, 6)))
					newGrid = true;
		}
		else if (interval == DEF_WEEK)
		{
			// Every 2 months
			if ((bar < startBarNo + drawBarNo - 1) &&
				(dt1.substring(4, 6) != dt2.substring(4, 6)) &&
				((parseInt(dt1.substring(4, 6)) % 2) != 0))
				newGrid = true;
		}
		else if (interval == DEF_MONTH)
		{
			// Every year
			if ((bar < startBarNo + drawBarNo - 1) &&
				(dt1.substring(0, 4) != dt2.substring(0, 4)))
				newGrid = true;
		}
		else
		{
			// Every day
			if ((bar < startBarNo + drawBarNo - 1) &&
				(barData[bar].localtime.substring(6, 8) != barData[bar+1].localtime.substring(6, 8)))
					newGrid = true;

			// For intra-day charts, the first grid should fall on time 00, 05, 10, ...
			if (skipCount == 0)
			{
				if ((parseInt(dt1.substring(2, 4)) % 5) == 0)
					skipCount = skipLine;
				else
					skipCount = 0;
			}
		}

		//console.log("newGrid = " + newGrid);

		// (1) draw gridlines
		if (newGrid)
			ctx.strokeStyle = DEF_MAJOR_GRID_COLOR;
		else if (drawGrid)
			ctx.strokeStyle = DEF_GRID_COLOR;

		// Should draw grid line if it falls on the start of a new month or
		// skipCount reaches skipLine
		if (newGrid || (drawGrid && ((skipCount > 0) && ((skipCount % skipLine) == 0))))
		{
			ctx.beginPath();
			ctx.moveTo(midPt, ctx.canvas.height - offsetYS - offsetYY - 1);
			ctx.lineTo(midPt, offsetYM);
			ctx.stroke();
			ctx.closePath();
		}
		
		if (newGrid)
		{
			monthIndex = parseInt(dt1.substring(4, 6)) - 1;
			ctx.font = DEF_FONT;
			ctx.fillStyle = DEF_FONT_COLOR;
			if ((interval == DEF_DAY) || (interval == DEF_WEEK))
			{
				// Month
				if (monthIndex >= 0)
				{
					textDate = DEF_MONTH_NAME[lang][monthIndex].trim();

					// Same year? If not, display year as well
					if ((bar < startBarNo + drawBarNo - 1) &&
						(dt1.substring(0, 4) != dt2.substring(0, 4)))
						textDate += " " + dt1.substring(2, 4);

					ctx.fillText(textDate, midPt - float2int(ctx.measureText(textDate).width / 2),
						offsetYM + offsetYT);
				}
			}
			else if (interval == DEF_MONTH)
			{
				// Month and year (YY)
				if (monthIndex >= 0)
				{
					textDate = DEF_MONTH_NAME[lang][monthIndex].trim() + " " +
						dt1.substring(2, 4);
					ctx.fillText(textDate, midPt - float2int(ctx.measureText(textDate).width / 2),
						offsetYM + offsetYT);
				}
			}
			else
			{
				// Day
				var	date = new Date(dt1.replace(
						    /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)$/,
						    "$2/$3/$1 $4:$5 GMT"
						));
				try
				{
					textDate = date.format(DEF_TITLE_DAY_FORMAT);
				}
				catch (err) { textDate = "" };
				
				//textDate = dt1;
				if (textDate != "00")
				{
					ctx.fillText(textDate, midPt - float2int(ctx.measureText(textDate).width / 2),
						offsetYM + offsetYT);
				}
			}
		}
		
		drawTechOverlay(ctx, x, bar);
		drawBar(ctx, x, bar);

		//console.log("skipCount = " + skipCount + " skipLine = " + skipLine);

		// (4) Draw X scale
		if ((skipCount > 0) && ((skipCount % skipLine) == 0))
		{
			ctx.font = DEF_FONT;
			ctx.fillStyle = DEF_FONT_COLOR;

			if ((interval == DEF_DAY) || (interval == DEF_WEEK))
			{
				// Display date
				textDate = dt1.substring(6, 8);
				//console.log("dt1 = " + dt1);
				if (textDate != "00")
					ctx.fillText(textDate, midPt - float2int(ctx.measureText(textDate).width / 2),
						ctx.canvas.height - offsetYS + 15);
			}
			else if (interval == DEF_MONTH)
			{
				// Display nothing
			}
			else
			{
				// Display time
				if (barData[bar].localtime.length == 12)	// YYYYMMDD + HHMM
				{
					textDate = barData[bar].localtime.substring(8, 10) + ":" +
						barData[bar].localtime.substring(10);
					ctx.fillText(textDate, midPt - float2int(ctx.measureText(textDate).width / 2),
						ctx.canvas.height - offsetYS + 15);
				}
			}
		}
		
		// Draw lower technicals
		// Lower technicals are drawn at last
		// because the order of drawing is important.
		// It affects clarity of the chart
		drawTechPane(ctx, x, bar);
		
		if ((skipCount > 0) || (interval == DEF_DAY) || (interval == DEF_WEEK) || (interval == DEF_MONTH))
			skipCount++;

		x -= (barWidth + 2 * barHand + barSpacing);
	}
}

function addTechOverlay(tech)
{
	var allParmValue = [];
	var langTechName;
	
	techOverlayNo = 0;

	if (tech == DEF_IKH)
	{
		techOverlayExName[techOverlayNo] = DEF_UTECH_TEXT[DEF_IKH];
		techOverlayName[techOverlayNo] = langTechName = DEF_UTECH_TEXT[DEF_IKH];
		techOverlayParm[techOverlayNo] = 3;

		for (k = 0; k < DEF_IKH_COLOR.length; k++)
			techOverlayColor[techOverlayNo][k] = DEF_IKH_COLOR[k];

		allParmValue = DEF_IKH_PARAM;
		if (allParmValue != null)
		{
			for (j = 0; j < techOverlayParm[techOverlayNo]; j++)
				techOverlayValue[techOverlayNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
		{
			techOverlayBar[techOverlayNo][0] = getIKH(techOverlayValue[techOverlayNo][0], techOverlayValue[techOverlayNo][1], techOverlayValue[techOverlayNo][2], techOverlayValue[techOverlayNo][1], techOverlayValue[techOverlayNo][1], techOverlayNo);
			techOverlayBar[techOverlayNo][1] = startExBarNo + drawExBarNo - float2int(techOverlayValue[techOverlayNo][1]);
			techOverlayBar[techOverlayNo][2] = startExBarNo + drawExBarNo - float2int(techOverlayValue[techOverlayNo][2]);
			techOverlayBar[techOverlayNo][3] = startExBarNo + drawExBarNo - float2int(techOverlayValue[techOverlayNo][1]);
			techOverlayBar[techOverlayNo][4] = startExBarNo + drawExBarNo - float2int(techOverlayValue[techOverlayNo][1]);
		}
		techOverlayNo++;
	}
	else if (tech == DEF_SMA)
	{
		techOverlayExName[techOverlayNo] = DEF_UTECH_TEXT[DEF_SMA];
		techOverlayName[techOverlayNo] = langTechName = DEF_UTECH_TEXT[DEF_SMA];
		techOverlayParm[techOverlayNo] = 3;

		for (k = 0; k < DEF_SMA_COLOR.length; k++)
			techOverlayColor[techOverlayNo][k] = DEF_SMA_COLOR[k];

		allParmValue = DEF_SMA_PARAM;
		if (allParmValue != null)
		{
			for (j = 0; j < techOverlayParm[techOverlayNo]; j++)
				techOverlayValue[techOverlayNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
		{
			var inData = [];
			var outData = [];

			for (j = 0; j < techOverlayParm[techOverlayNo]; j++)
			{
				// Initialisation: Clear bar data and bar chart data
				for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
				{
					inData[bar] = barData[bar].calcPrice;
					barData[bar].chartTechOverlay[techOverlayNo][j] = 0;
				}

				techOverlayBar[techOverlayNo][j] = getSMA(float2int(techOverlayValue[techOverlayNo][j]), inData, outData, true);
				for (bar = startExBarNo; bar < startExBarNo + techOverlayBar[techOverlayNo][j]; bar++)
					barData[bar].techOverlay[techOverlayNo][j] = outData[bar];
			}
		}

		techOverlayNo++;
	}
	else if (tech == DEF_EMA)
	{
		techOverlayExName[techOverlayNo] = DEF_UTECH_TEXT[DEF_EMA];
		techOverlayName[techOverlayNo] = langTechName = DEF_UTECH_TEXT[DEF_EMA];
		techOverlayParm[techOverlayNo] = 3;

		for (k = 0; k < DEF_EMA_COLOR.length; k++)
			techOverlayColor[techOverlayNo][k] = DEF_EMA_COLOR[k];

		allParmValue = DEF_EMA_PARAM;
		if (allParmValue != null)
		{
			for (j = 0; j < techOverlayParm[techOverlayNo]; j++)
				techOverlayValue[techOverlayNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
		{
			var inData = [];
			var outData = [];

			for (j = 0; j < techOverlayParm[techOverlayNo]; j++)
			{
				for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
					inData[bar] = barData[bar].calcPrice;

				techOverlayBar[techOverlayNo][j] = getEMA(float2int(techOverlayValue[techOverlayNo][j]), inData, outData, true);
				for (bar = startExBarNo; bar < startExBarNo + techOverlayBar[techOverlayNo][j]; bar++)
					barData[bar].techOverlay[techOverlayNo][j] = outData[bar];
			}
		}

		techOverlayNo++;
	}
	else if (tech == DEF_WMA)
	{
		techOverlayExName[techOverlayNo] = DEF_UTECH_TEXT[DEF_WMA];
		techOverlayName[techOverlayNo] = langTechName = DEF_UTECH_TEXT[DEF_WMA];
		techOverlayParm[techOverlayNo] = 3;

		for (k = 0; k < DEF_WMA_COLOR.length; k++)
			techOverlayColor[techOverlayNo][k] = DEF_WMA_COLOR[k];

		allParmValue = DEF_WMA_PARAM;
		if (allParmValue != null)
		{
			for (j = 0; j < techOverlayParm[techOverlayNo]; j++)
				techOverlayValue[techOverlayNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
		{
			var inData = [];
			var outData = [];

			for (j = 0; j < techOverlayParm[techOverlayNo]; j++)
			{
				for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
				{
					inData[bar] = barData[bar].calcPrice;
					barData[bar].chartTechOverlay[techOverlayNo][j] = 0;
				}

				techOverlayBar[techOverlayNo][j] = getWMA(float2int(techOverlayValue[techOverlayNo][j]), inData, outData, true);
				for (bar = startExBarNo; bar < startExBarNo + techOverlayBar[techOverlayNo][j]; bar++)
					barData[bar].techOverlay[techOverlayNo][j] = outData[bar];
			}
		}

		techOverlayNo++;
	}
	else if (tech == DEF_BOLL)
	{
		techOverlayExName[techOverlayNo] = DEF_UTECH_TEXT[DEF_BOLL];
		techOverlayName[techOverlayNo] = langTechName = DEF_UTECH_TEXT[DEF_BOLL];
		techOverlayParm[techOverlayNo] = 2;

		for (k = 0; k < DEF_BOLL_COLOR.length; k++)
			techOverlayColor[techOverlayNo][k] = DEF_BOLL_COLOR[k];

		allParmValue = DEF_BOLL_PARAM;
		if (allParmValue != null)
		{
			for (j = 0; j < techOverlayParm[techOverlayNo]; j++)
				techOverlayValue[techOverlayNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
		{
			techOverlayBar[techOverlayNo][0] = getBollinger(float2int(techOverlayValue[techOverlayNo][0]), float2int(techOverlayValue[techOverlayNo][1]), techOverlayNo);
			techOverlayBar[techOverlayNo][1] = techOverlayBar[techOverlayNo][0];
			techOverlayBar[techOverlayNo][2] = techOverlayBar[techOverlayNo][0];
		}
		techOverlayNo++;
	}
	else if (tech == DEF_SAR)
	{
		techOverlayExName[techOverlayNo] = DEF_UTECH_TEXT[DEF_SAR];
		techOverlayName[techOverlayNo] = langTechName = DEF_UTECH_TEXT[DEF_SAR];
		techOverlayParm[techOverlayNo] = 3;
	
		for (k = 0; k < DEF_SAR_COLOR.length; k++)
			techOverlayColor[techOverlayNo][k] = DEF_SAR_COLOR[k];

		allParmValue = DEF_SAR_PARAM;

		if (allParmValue != null)
		{
			for (j = 0; j < techOverlayParm[techOverlayNo]; j++)
				techOverlayValue[techOverlayNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
		{
			techOverlayBar[techOverlayNo][0] = getParabolic(techOverlayValue[techOverlayNo][0], techOverlayValue[techOverlayNo][1], techOverlayValue[techOverlayNo][2], techOverlayNo);
			techOverlayBar[techOverlayNo][1] = 0;
			techOverlayBar[techOverlayNo][2] = 0;
		}
		techOverlayNo++;
	}
	else if (tech == DEF_MAE)
	{
		techOverlayExName[techOverlayNo] = DEF_UTECH_TEXT[DEF_MAE];
		techOverlayName[techOverlayNo] = langTechName = DEF_UTECH_TEXT[DEF_MAE];
		techOverlayParm[techOverlayNo] = 2;
		for (k = 0; k < DEF_MAE_COLOR.length; k++)
			techOverlayColor[techOverlayNo][k] = DEF_MAE_COLOR[k];

		allParmValue = DEF_MAE_PARAM;
		if (allParmValue != null)
		{
			for (j = 0; j < techOverlayParm[techOverlayNo]; j++)
				techOverlayValue[techOverlayNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
		{
			techOverlayBar[techOverlayNo][0] = getMAE(float2int(techOverlayValue[techOverlayNo][0]), float2int(techOverlayValue[techOverlayNo][1]), techOverlayNo);
			techOverlayBar[techOverlayNo][1] = techOverlayBar[techOverlayNo][0];
			techOverlayBar[techOverlayNo][2] = 0;
		}
		techOverlayNo++;
	}
	else if (tech == DEF_KC)
	{
		techOverlayExName[techOverlayNo] = DEF_UTECH_TEXT[DEF_KC];
		techOverlayName[techOverlayNo] = langTechName = DEF_UTECH_TEXT[DEF_KC];
		techOverlayParm[techOverlayNo] = 1;
		for (k = 0; k < DEF_KC_COLOR.length; k++)
			techOverlayColor[techOverlayNo][k] = DEF_KC_COLOR[k];

		allParmValue = DEF_KC_PARAM;
		if (allParmValue != null)
		{
			for (j = 0; j < techOverlayParm[techOverlayNo]; j++)
				techOverlayValue[techOverlayNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
		{
			//techOverlayBar[techOverlayNo][0] = getMAE(float2int(techOverlayValue[techOverlayNo][0]), 1, techOverlayNo);
			techOverlayBar[techOverlayNo][0] = getKC(float2int(techOverlayValue[techOverlayNo][0]), techOverlayNo);
			techOverlayBar[techOverlayNo][1] = techOverlayBar[techOverlayNo][0];
			techOverlayBar[techOverlayNo][2] = techOverlayBar[techOverlayNo][0];
		}
		techOverlayNo++;
	}
}

function clearSp(tp)
{
	for (sp = 0; sp < DEF_MAX_TECH_SP; sp++)
		techPaneSp[tp][sp] = -1;
}

function addTech(tech)
{
	var langTechName;
	techPaneNo = 0;
	
	if (tech == DEF_RSI)
	{
		techPaneExName[techPaneNo] = DEF_LTECH_TEXT[DEF_RSI];
		techPaneName[techPaneNo] = langTechName = DEF_LTECH_TEXT[DEF_RSI];
		techPaneParm[techPaneNo] = 1;
		for (k = 0; k < DEF_RSI_COLOR.length; k++)
			techPaneColor[techPaneNo][k] = DEF_RSI_COLOR[k];

		allParmValue = DEF_RSI_PARAM;
		if (allParmValue != null)
		{
			for (j = 0; j < techPaneParm[techPaneNo]; j++)
				techPaneValue[techPaneNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
			techPaneBar[techPaneNo][0] = getRSI(float2int(techPaneValue[techPaneNo][0]), techPaneNo);

		clearSp(techPaneNo);
		techPaneSp[techPaneNo][0] = 30;
		techPaneSp[techPaneNo][1] = 50;
		techPaneSp[techPaneNo][2] = 70;
		techPaneNo++;
	}
	else if (tech == DEF_STC)
	{
		techPaneExName[techPaneNo] = DEF_LTECH_TEXT[DEF_STC];
		techPaneName[techPaneNo] = langTechName = DEF_LTECH_TEXT[DEF_STC];
		techPaneParm[techPaneNo] = 3;
		for (k = 0; k < DEF_STC_COLOR.length; k++)
			techPaneColor[techPaneNo][k] = DEF_STC_COLOR[k];

		allParmValue = DEF_STC_PARAM;
		if (allParmValue != null)
		{
			for (j = 0; j < techPaneParm[techPaneNo]; j++)
				techPaneValue[techPaneNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
			techPaneBar[techPaneNo][0] = techPaneBar[techPaneNo][1] =
				getStochastics(float2int(techPaneValue[techPaneNo][0]), float2int(techPaneValue[techPaneNo][1]), float2int(techPaneValue[techPaneNo][2]), techPaneNo);

		clearSp(techPaneNo);
		techPaneSp[techPaneNo][0] = 20;
		techPaneSp[techPaneNo][1] = 80;
		techPaneNo++;
	}
	else if (tech == DEF_MOM)
	{
		techPaneExName[techPaneNo] = DEF_LTECH_TEXT[DEF_MOM];
		techPaneName[techPaneNo] = langTechName = DEF_LTECH_TEXT[DEF_MOM];
		techPaneParm[techPaneNo] = 3;
		for (k = 0; k < DEF_MOM_COLOR.length; k++)
			techPaneColor[techPaneNo][k] = DEF_MOM_COLOR[k];

		allParmValue = DEF_MOM_PARAM;
		if (allParmValue != null)
		{
			for (j = 0; j < techPaneParm[techPaneNo]; j++)
				techPaneValue[techPaneNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
			techPaneBar[techPaneNo][0] = getMomentum(float2int(techPaneValue[techPaneNo][0]), float2int(techPaneValue[techPaneNo][1]), float2int(techPaneValue[techPaneNo][2]), techPaneNo);
			techPaneBar[techPaneNo][1] = techPaneBar[techPaneNo][0];

		clearSp(techPaneNo);
		techPaneNo++;
	}
	else if (tech == DEF_MACD)
	{
		techPaneExName[techPaneNo] = DEF_LTECH_TEXT[DEF_MACD];
		techPaneName[techPaneNo] = langTechName = DEF_LTECH_TEXT[DEF_MACD];
		techPaneParm[techPaneNo] = 3;
		for (k = 0; k < DEF_MACD_COLOR.length; k++)
			techPaneColor[techPaneNo][k] = DEF_MACD_COLOR[k];

		allParmValue = DEF_MACD_PARAM;
		if (allParmValue != null)
		{
			for (j = 0; j < techPaneParm[techPaneNo]; j++)
				techPaneValue[techPaneNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
			techPaneBar[techPaneNo][0] = techPaneBar[techPaneNo][1] = techPaneBar[techPaneNo][2] =
				getMACD(float2int(techPaneValue[techPaneNo][0]), float2int(techPaneValue[techPaneNo][1]), float2int(techPaneValue[techPaneNo][2]), techPaneNo);

		clearSp(techPaneNo);
		techPaneNo++;
	}
	else if (tech == DEF_MC)
	{
		techPaneExName[techPaneNo] = DEF_LTECH_TEXT[DEF_MC];
		techPaneName[techPaneNo] = langTechName = DEF_LTECH_TEXT[DEF_MC];
		techPaneParm[techPaneNo] = 1;
		for (k = 0; k < DEF_MC_COLOR.length; k++)
			techPaneColor[techPaneNo][k] = DEF_MC_COLOR[k];

		allParmValue = DEF_MC_PARAM;
		if (allParmValue != null)
		{
			for (j = 0; j < techPaneParm[techPaneNo]; j++)
				techPaneValue[techPaneNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
			techPaneBar[techPaneNo][0] = techPaneBar[techPaneNo][1] =
				getModalCount(float2int(techPaneValue[techPaneNo][0]), techPaneNo);

		clearSp(techPaneNo);
		techPaneNo++;
	}
	else if (tech == DEF_ADX)
	{
		techPaneExName[techPaneNo] = DEF_LTECH_TEXT[DEF_ADX];
		techPaneName[techPaneNo] = langTechName = DEF_LTECH_TEXT[DEF_ADX];
		techPaneParm[techPaneNo] = 1;		// 4 : show ADXR
		for (var k = 0; k < DEF_ADX_COLOR.length; k++)
			techPaneColor[techPaneNo][k] = DEF_ADX_COLOR[k];

		allParmValue = DEF_ADX_PARAM;
		if (allParmValue != null)
		{
			for (var j = 0; j < techPaneParm[techPaneNo]; j++)
				techPaneValue[techPaneNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
			techPaneBar[techPaneNo][0] = techPaneBar[techPaneNo][1] = techPaneBar[techPaneNo][2] = techPaneBar[techPaneNo][3] =
				getADX(float2int(techPaneValue[techPaneNo][0]), techPaneNo);

		clearSp(techPaneNo);
		techPaneSp[techPaneNo][0] = 30;
		techPaneNo++;
	}
	else if (tech == DEF_VOLUME)
	{
		techPaneExName[techPaneNo] = DEF_LTECH_TEXT[DEF_VOLUME];
		techPaneName[techPaneNo] = langTechName = DEF_LTECH_TEXT[DEF_VOLUME];
		techPaneParm[techPaneNo] = 1;
		for (var k = 0; k < DEF_VOLUME_COLOR.length; k++)
			techPaneColor[techPaneNo][k] = DEF_VOLUME_COLOR[k]

		allParmValue = DEF_VOLUME_PARAM;
		if (allParmValue != null)
		{
			for (var j = 0; j < techPaneParm[techPaneNo]; j++)
				techPaneValue[techPaneNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
			techPaneBar[techPaneNo][0] = techPaneBar[techPaneNo][1] =  
				getVolume(techPaneNo);
				//getVolume(float2int(techPaneValue[techPaneNo][0]), float2int(techPaneValue[techPaneNo][1]), float2int(techPaneValue[techPaneNo][2]), techPaneNo);

		clearSp(techPaneNo);
		techPaneNo++;
	}
	else if (tech == DEF_VOLUMEPLUS)
	{
		techPaneExName[techPaneNo] = DEF_LTECH_TEXT[DEF_VOLUMEPLUS];
		techPaneName[techPaneNo] = langTechName = DEF_LTECH_TEXT[DEF_VOLUMEPLUS];
		techPaneParm[techPaneNo] = 1;
		for (var k = 0; k < DEF_VOLUMEPLUS_COLOR.length; k++)
			techPaneColor[techPaneNo][k] = DEF_VOLUMEPLUS_COLOR[k];

		allParmValue = DEF_VOLUMEPLUS_PARAM;
		if (allParmValue != null)
		{
			for (var j = 0; j < techPaneParm[techPaneNo]; j++)
				techPaneValue[techPaneNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
			techPaneBar[techPaneNo][0] = techPaneBar[techPaneNo][1] =  
				getVolumePlus(techPaneNo);
				//getVolumePlus(float2int(techPaneValue[techPaneNo][0]), techPaneNo);

		clearSp(techPaneNo);
		techPaneNo++;
	}
	else if (tech == DEF_OBV)
	{
		techPaneExName[techPaneNo] = DEF_LTECH_TEXT[DEF_OBV];
		techPaneName[techPaneNo] = langTechName = DEF_LTECH_TEXT[DEF_OBV];
		techPaneParm[techPaneNo] = 1;
		
		for (var k = 0; k < DEF_OBV_COLOR.length; k++)
			techPaneColor[techPaneNo][k] = DEF_OBV_COLOR[k];

		allParmValue = DEF_OBV_PARAM;
		if (allParmValue != null)
		{
			for (var j = 0; j < techPaneParm[techPaneNo]; j++)
				techPaneValue[techPaneNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
			techPaneBar[techPaneNo][0] = getOBV(techPaneNo);

		clearSp(techPaneNo);
		techPaneNo++;
	}
	else if (tech == DEF_MFI)
	{
		techPaneExName[techPaneNo] = DEF_LTECH_TEXT[DEF_MFI];
		techPaneName[techPaneNo] = langTechName = DEF_LTECH_TEXT[DEF_MFI];
		techPaneParm[techPaneNo] = 1;
		for (k = 0; k < DEF_MFI_COLOR.length; k++)
			techPaneColor[techPaneNo][k] = DEF_MFI_COLOR[k];

		allParmValue = DEF_MFI_PARAM;
		if (allParmValue != null)
		{
			for (j = 0; j < techPaneParm[techPaneNo]; j++)
				techPaneValue[techPaneNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
			techPaneBar[techPaneNo][0] = getMoneyFlow(float2int(techPaneValue[techPaneNo][0]), techPaneNo);

		clearSp(techPaneNo);
		techPaneNo++;
	}
	else if (tech == DEF_PCTR)
	{
		techPaneExName[techPaneNo] = DEF_LTECH_TEXT[DEF_PCTR];
		techPaneName[techPaneNo] = langTechName = DEF_LTECH_TEXT[DEF_PCTR];
		techPaneParm[techPaneNo] = 1;
		for (var k = 0; k < DEF_PCTR_COLOR.length; k++)
			techPaneColor[techPaneNo][k] = DEF_PCTR_COLOR[k];

		allParmValue = DEF_PCTR_PARAM;
		if (allParmValue != null)
		{
			for (var j = 0; j < techPaneParm[techPaneNo]; j++)
				techPaneValue[techPaneNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
			techPaneBar[techPaneNo][0] = getPercentR(float2int(techPaneValue[techPaneNo][0]), techPaneNo);

		clearSp(techPaneNo);

		// Special case
		techPaneSp[techPaneNo][0] = - 20;
		techPaneSp[techPaneNo][1] = - 50;
		techPaneSp[techPaneNo][2] = - 80;
		techPaneNo++;
	}
	else if (tech == DEF_ROC)
	{
		techPaneExName[techPaneNo] = DEF_LTECH_TEXT[DEF_ROC];
		techPaneName[techPaneNo] = langTechName = DEF_LTECH_TEXT[DEF_ROC];
		techPaneParm[techPaneNo] = 1;
		for (var k = 0; k < DEF_ROC_COLOR.length; k++)
			techPaneColor[techPaneNo][k] = DEF_ROC_COLOR[k];

		allParmValue = DEF_ROC_PARAM;
		if (allParmValue != null)
		{
			for (var j = 0; j < techPaneParm[techPaneNo]; j++)
				techPaneValue[techPaneNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
			techPaneBar[techPaneNo][0] = getROC(float2int(techPaneValue[techPaneNo][0]), techPaneNo);

		clearSp(techPaneNo);
		techPaneNo++;
	}
	else if (tech == DEF_VOLA)
	{
		techPaneExName[techPaneNo] = DEF_LTECH_TEXT[DEF_VOLA];
		techPaneName[techPaneNo] = langTechName = DEF_LTECH_TEXT[DEF_VOLA];
		techPaneParm[techPaneNo] = 1;
		for (var k = 0; k < DEF_VOLA_COLOR.length; k++)
			techPaneColor[techPaneNo][k] = DEF_VOLA_COLOR[k];

		allParmValue = DEF_VOLA_PARAM;
		if (allParmValue != null)
		{
			for (var j = 0; j < techPaneParm[techPaneNo]; j++)
				techPaneValue[techPaneNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
			techPaneBar[techPaneNo][0] = getVolatility(float2int(techPaneValue[techPaneNo][0]), techPaneNo);

		clearSp(techPaneNo);
		techPaneNo++;
	}
	else if (tech == DEF_VAO)
	{
		techPaneExName[techPaneNo] = DEF_LTECH_TEXT[DEF_VAO];
		techPaneName[techPaneNo] = langTechName = DEF_LTECH_TEXT[DEF_VAO];
		techPaneParm[techPaneNo] = 1;
		for (var k = 0; k < DEF_VAO_COLOR.length; k++)
			techPaneColor[techPaneNo][k] = DEF_VAO_COLOR[k];	// purple

		allParmValue = DEF_VAO_PARAM;
		if (allParmValue != null)
		{
			for (var j = 0; j < techPaneParm[techPaneNo]; j++)
				techPaneValue[techPaneNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
			techPaneBar[techPaneNo][0] = getVAO(techPaneNo);

		clearSp(techPaneNo);
		techPaneNo++;
	}
	else if (tech == DEF_CCI)
	{
		techPaneExName[techPaneNo] = DEF_LTECH_TEXT[DEF_CCI];
		techPaneName[techPaneNo] = langTechName = DEF_LTECH_TEXT[DEF_CCI];
		techPaneParm[techPaneNo] = 1;
		for (var k = 0; k < DEF_CCI_COLOR.length; k++)
			techPaneColor[techPaneNo][k] = DEF_CCI_COLOR[k];	// purple

		allParmValue = DEF_CCI_PARAM;
		if (allParmValue != null)
		{
			for (var j = 0; j < techPaneParm[techPaneNo]; j++)
				techPaneValue[techPaneNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
			techPaneBar[techPaneNo][0] = getCCI(float2int(techPaneValue[techPaneNo][0]), techPaneNo);

		clearSp(techPaneNo);
		techPaneSp[techPaneNo][0] = 100;
		techPaneSp[techPaneNo][1] = -100;
		techPaneNo++;
	}
	else if (tech == DEF_ATR)
	{
		techPaneExName[techPaneNo] = DEF_LTECH_TEXT[DEF_ATR];
		techPaneName[techPaneNo] = langTechName = DEF_LTECH_TEXT[DEF_ATR];
		techPaneParm[techPaneNo] = 1;
		for (var k = 0; k < DEF_ATR_COLOR.length; k++)
			techPaneColor[techPaneNo][k] = DEF_ATR_COLOR[k];

		allParmValue = DEF_ATR_PARAM;
		if (allParmValue != null)
		{
			for (var j = 0; j < techPaneParm[techPaneNo]; j++)
				techPaneValue[techPaneNo][j] = allParmValue[j];
		}

		if (drawExBarNo > 0)
			techPaneBar[techPaneNo][0] = getATR(float2int(techPaneValue[techPaneNo][0]), techPaneNo);

		clearSp(techPaneNo);
		techPaneNo++;
	}

	/*
	if (drawExBarNo > 0)
	{
		setActiveBar(activeBar);
		mainChart.headPane.update(barData[activeBar],
			techOverlayName, techOverlayParm, techOverlayValue, techOverlayText, techOverlayColor);
		mainChart.statusPane.update(barData[activeBar], typeChart, code);
	}
	*/

	return langTechName;

}

function formatVolumeDisplay(volume)
{
	var strText = "";
	var volUnit = "";
	var vol=volume;
	
	// Convert volume in unit of thousand / ten thousand for Chinese
	if (Math.abs(vol) > 100000000)			// 100M
	{
		vol /= 1000000;
		volUnit = DEF_UNIT_M;
	}
	else if (Math.abs(vol) > 100000)		// 100K
	{
		vol /= 1000;
		volUnit = DEF_UNIT_K;
	}

	strText = "" + vol.toFixed(0) + volUnit;
	
	return strText;
}



function setActiveBar(ctx, bar)
{
	var drawWidth = ctx.width - offsetXS - offsetXX - offsetXM - offsetXG;

	if (drawExBarNo == 0)
		return;

	if (bar < startExBarNo)
		return;

	if (bar >= startExBarNo + drawExBarNo)
		return;

	/*
	// Format display
	for (i = 0; i < techOverlayNo; i++)
	{
		if (techOverlayName[i] == DEF_UTECH_TEXT[DEF_BOLL] || techOverlayName[i] == DEF_UTECH_TEXT[DEF_KC])
		{
			techOverlayText[i][0] = (barData[bar].techOverlay[i][0]).toFixed(4) + ", ";
			techOverlayText[i][1] = (barData[bar].techOverlay[i][1]).toFixed(4) + ", ";
			techOverlayText[i][2] = (barData[bar].techOverlay[i][2]).toFixed(4) + " ";
		}
		else if (techOverlayName[i] == DEF_UTECH_TEXT[DEF_MAE])
		{
			techOverlayText[i][0] = (barData[bar].techOverlay[i][0]).toFixed(4) + ", ";
			techOverlayText[i][1] = (barData[bar].techOverlay[i][1]).toFixed(4);
			techOverlayText[i][2] = "";
		}

		else if (techOverlayName[i] == DEF_UTECH_TEXT[DEF_IKH])
		{
			techOverlayText[i][0] = (barData[bar].techOverlay[i][0]).toFixed(4) + ", ";
			techOverlayText[i][1] = (barData[bar].techOverlay[i][1]).toFixed(4) + ", ";
			techOverlayText[i][2] = (barData[bar].techOverlay[i][2]).toFixed(4) + ", ";
			techOverlayText[i][3] = (barData[bar].techOverlay[i][3]).toFixed(4) + ", ";
			techOverlayText[i][4] = (barData[bar].techOverlay[i][4]).toFixed(4);
			console.log("IKH : " + techOverlayParm[i][0] + "," + techOverlayParm[i][1] + "," + techOverlayParm[i][2] + "," + techOverlayParm[i][3] + "," + techOverlayParm[i][4]);
		}
		else if (techOverlayName[i] == DEF_UTECH_TEXT[DEF_SAR])
		{
			techOverlayText[i][0] = (barData[bar].techOverlay[i][0]).toFixed(4) + " ";
			techOverlayText[i][1] = "";
			techOverlayText[i][2] = "";
		}
		else
		{
			// SMA, EMA, WMA
			//console.log("techOverlayParm["+i+"]="+techOverlayParm[i]);
			for (j = 0; j < techOverlayParm[i]; j++)
				if (techOverlayValue[i][j] != 0 && barData[bar].techOverlay[i][j]>0)
					techOverlayText[i][j] = "(" + (techOverlayValue[i][j]) + "): " +
						(barData[bar].techOverlay[i][j]).toFixed(4) + " ";
		}
	}
	*/
	

	//console.log("active bar = " + bar);
	var ltech_dps = 4;

	for (var i = 0; i < techPaneNo; i++)
	{
		for (var j = 0; j < techPaneBar[i].length; j++)
		{
			//techPaneText[i][j] = "" + df.format(barData[bar].techPane[i][j]);
			if ( barData[bar].techPane[i][j] )
				techPaneText[i][j] = "" + (barData[bar].techPane[i][j]).toFixed(ltech_dps);
			//console.log(barData[bar].techPane[i][j] + " vs " + techPaneText[i][j]);

			if (techPaneName[i] == DEF_LTECH_TEXT[DEF_VOLUME] || techPaneName[i] == DEF_LTECH_TEXT[DEF_VOLUMEPLUS]  || techPaneName[i] == DEF_LTECH_TEXT[DEF_OBV])
			{
				if (j == 0)
				{
					techPaneText[i][j] = formatVolumeDisplay( barData[bar].techPane[i][j] );
				}
				else
					techPaneText[i][j] = "";

				/*
				if (j == 1  && techPaneValue[i][0] > 0)
					techPaneText[i][j] = labels.getString(DEF_AVERAGE) + " (" + df.format(techPaneValue[i][j-1]) + "): " + df4.format(barData[bar].techPane[i][j]);
				*/
			}
			else if (techPaneName[i] == DEF_LTECH_TEXT[DEF_ADX])
			{
				if (j == 1)
					techPaneText[i][j] = "DI+ (" + (barData[bar].techPane[i][j]).toFixed(ltech_dps) + ")";
				else if (j == 2)
					techPaneText[i][j] = "DI- (" + (barData[bar].techPane[i][j]).toFixed(ltech_dps) + ")";
				else if (j == 3)
					techPaneText[i][j] = "ADXR " + (barData[bar].techPane[i][j]).toFixed(ltech_dps);
			}
			else if (techPaneName[i] == DEF_LTECH_TEXT[DEF_STC])
			{
				if (j == 0)
					techPaneText[i][j] = "%K " + (barData[bar].techPane[i][j]).toFixed(ltech_dps);
				else if (j == 1)
					techPaneText[i][j] = "%D " + (barData[bar].techPane[i][j]).toFixed(ltech_dps);
			}
			else if (techPaneName[i] == DEF_LTECH_TEXT[DEF_MACD])
			{
				//df = new DecimalFormat("###,##0.####");		// 4 dec. pls (for MACD)
				techPaneText[i][j] = "" + (barData[bar].techPane[i][j]).toFixed(ltech_dps);
			}
			else if (techPaneName[i] == DEF_LTECH_TEXT[DEF_MC])
			{
				/*
				if (j == 1)
					techPaneText[i][j] = labels.getString(DEF_AVERAGE) + " (" + df.format(techPaneValue[i][j-1]) + "): " + df.format(barData[bar].techPane[i][j]);
				*/
			}

		}

		//repaint(offsetXM, d.height - offsetYS - offsetYY - (techPaneNo - i) * offsetTS, drawWidth, offsetTB);
	}
	//df = new DecimalFormat("###,##0.####");		// 4 dec. pls (for Price)
}

function drawArrow(ctx, type, pos_x, pos_y, r)
{
	var x_center = pos_x;
	var y_center = pos_y;
	var tox = pos_x;
	var toy = pos_y;

	var color;
	var angle;
	var x;
	var y;
	
	if (type == DEF_TYPE_DNARROW)
	{
		color = DEF_DNARROW_COLOR;
		y_center += r;
		toy += r;
	}
	else
	{
		color = DEF_UPARROW_COLOR;
		y_center -= r;
		toy -= r;
	}
		
	ctx.strokeStyle = color;
	ctx.fillStyle = color;
	ctx.beginPath();
	
	angle = Math.atan2(toy-pos_y,tox-pos_x)
	x = r*Math.cos(angle) + x_center;
	y = r*Math.sin(angle) + y_center;

	ctx.moveTo(x, y);
	
	angle += (1/3)*(2*Math.PI)
	x = r*Math.cos(angle) + x_center;
	y = r*Math.sin(angle) + y_center;
	
	ctx.lineTo(x, y);
	
	angle += (1/3)*(2*Math.PI)
	x = r*Math.cos(angle) + x_center;
	y = r*Math.sin(angle) + y_center;
	
	ctx.lineTo(x, y);
	
	ctx.closePath();
	
	ctx.fill();
}

function drawTechOverlay(ctx, x, bar)
{
	if (! ((barData[bar].chartOpen > 0) && (barData[bar].chartHigh > 0) &&
		   (barData[bar].chartLow > 0) && (barData[bar].chartLast > 0)))
		return;

	var drawHeight = ctx.canvas.height - offsetYS - techPaneNo * offsetTS - offsetYT;
	var midPt = x - barSpacing - barHand - float2int(barWidth / 2);
	var kumo1, kumo2;

	//console.log("bar="+bar+",midPt="+midPt+",barSpacing="+barSpacing+",barHand="+barHand+",barWidth="+barWidth)
	
	for (i = 0; i < techOverlayNo; i++)
	{
		//console.log("drawTechOverlay("+techOverlayNo+") " + i + "," + techOverlayParm[i] + "," + techOverlayBar[i].length);
		
		for (j = 0; j < techOverlayBar[i].length; j++)
		{
			//console.log("drawTechOverlay " + i + "," + j + " , " + barData[bar].chartTechOverlay[i][j] + "," + barData[bar].techOverlay[i][j]);
			if (barData[bar].chartTechOverlay[i][j] <= 0 || barData[bar].techOverlay[i][j] <= 0)
				continue;

			if (bar >= (startExBarNo + techOverlayBar[i][j]))
				continue;

			if (upper == DEF_IKH)
			{
				if (bar != startBarNo)
				{
					if (barData[bar - 1].chartTechOverlay[i][j] > 0 && barData[bar - 1].chartTechOverlay[i][j] < drawHeight)
					{
						ctx.strokeStyle = techOverlayColor[i][j];
						ctx.beginPath();
						ctx.moveTo(midPt, barData[bar].chartTechOverlay[i][j]);
						ctx.lineTo(x + barHand + float2int(barWidth / 2)+(barWidth%2), barData[bar - 1].chartTechOverlay[i][j]);
						ctx.stroke();
						ctx.closePath();

						// Ichimoku Signal for Class 2/3 or ETNet Value-added package
						//if (mainChart.chartApplet.showSignal && j == 1 && mainChart.chartApplet.memClass > 1 && mainChart.chartApplet.etnetpackage != DEF_ETNET_BUNDLED)
						if (j == 1 && version != DEF_ETNET_BUNDLED)
						{
							var k = 1;
							while (barData[bar - k].techOverlay[i][j - 1] == barData[bar - k].techOverlay[i][j] && k < bar)
								k++;

							var l = k;
							while (barData[bar-l].techOverlay[i][j+1] == 0 & l < bar)
								l++;
							kumo1 = barData[bar-l].techOverlay[i][j+1];

							l = k;
							while (barData[bar-l].techOverlay[i][j+2] == 0 & l < bar)
								l++;
							kumo2 = barData[bar-l].techOverlay[i][j+2];

							var arrow_x = x+(k-1)*(barWidth+2*barHand+barSpacing)+barHand+float2int(barWidth)/2;
							var arrow_y;
							var arrow_size=5;

							if (barData[bar - k].techOverlay[i][j - 1] < barData[bar - k].techOverlay[i][j] &&					// Current Bar  : fast line < slow line
								barData[bar].techOverlay[i][j - 1] > barData[bar].techOverlay[i][j]			&&					// Previous Bar : fast line > slow line
								barData[bar - k].techOverlay[i][j - 1] < barData[bar].techOverlay[i][j - 1] &&					// Current Fast Line < Previous Fast Line (i.e. fast line should be decreasing)
								bar - k > 1 )
							{
								arrow_y = barData[bar-k].chartTechOverlay[i][j]-15;
								drawArrow(ctx, DEF_TYPE_DNARROW, arrow_x, arrow_y, arrow_size);									// 1 DN arrow

								if (chartCalcMethod == DEF_CALCBY_MP && interval <= DEF_MONTH)
								{
					        	    if (barData[bar-k].mp < kumo1 && barData[bar-k].mp < kumo2)									// Below Kumo => 3 DN arrows
					        	    {
										drawArrow(ctx, DEF_TYPE_DNARROW, arrow_x, arrow_y-10, arrow_size);
										drawArrow(ctx, DEF_TYPE_DNARROW, arrow_x, arrow_y-20, arrow_size);
				    	    	    }
				        		    else if (!(barData[bar-k].mp > kumo1 && barData[bar-k].mp > kumo2))							// Inside Kumo => 2 DN arrows
				        		    {
										drawArrow(ctx, DEF_TYPE_DNARROW, arrow_x, arrow_y-10, arrow_size);
				        		    }
								}
								else
								{
					        	    if (barData[bar-k].c < kumo1 && barData[bar-k].c < kumo2)								// Below Kumo => 3 DN arrows
					        	    {
										drawArrow(ctx, DEF_TYPE_DNARROW, arrow_x, arrow_y-10, arrow_size);
										drawArrow(ctx, DEF_TYPE_DNARROW, arrow_x, arrow_y-20, arrow_size);
				    	    	    }
				        		    else if (!(barData[bar-k].c > kumo1 && barData[bar-k].c > kumo2))						// Inside Kumo => 2 DN arrows
				        		    {
										drawArrow(ctx, DEF_TYPE_DNARROW, arrow_x, arrow_y-10, arrow_size);
				        		    }
								}

							}
							else if (barData[bar - k].techOverlay[i][j - 1] > barData[bar - k].techOverlay[i][j] &&				// Current Bar  : fast line > slow line
									 barData[bar].techOverlay[i][j - 1] < barData[bar].techOverlay[i][j]		 &&				// Previous Bar : fast line < slow line
									 barData[bar - k].techOverlay[i][j - 1] > barData[bar].techOverlay[i][j - 1] &&				// Current Fast Line > Previous Fast Line (i.e. fast line should be increasing)
									 bar - k > 1)
							{
								arrow_y = barData[bar-k].chartTechOverlay[i][j]+25;
								drawArrow(ctx, DEF_TYPE_UPARROW, arrow_x, arrow_y, arrow_size);									// 1 UP arrow

								if (chartCalcMethod == DEF_CALCBY_MP && interval <= DEF_MONTH)
								{
					        	    if (barData[bar-k].mp > kumo1 && barData[bar-k].mp > kumo2)									// Above Kumo => 3 UP arrows
					        	    {
										drawArrow(ctx, DEF_TYPE_UPARROW, arrow_x, arrow_y+10, arrow_size);
										drawArrow(ctx, DEF_TYPE_UPARROW, arrow_x, arrow_y+20, arrow_size);
					        	    }
				        		    else if (!(barData[bar-k].mp < kumo1 && barData[bar-k].mp < kumo2))							// Inside Kumo => 2 UP arrows
				        		    {
										drawArrow(ctx, DEF_TYPE_UPARROW, arrow_x, arrow_y+10, arrow_size);
				        		    }
								}
								else
								{
					        	    if (barData[bar-k].c > kumo1 && barData[bar-k].c > kumo2)								// Above Kumo => 3 UP arrows
					        	    {
										drawArrow(ctx, DEF_TYPE_UPARROW, arrow_x, arrow_y+10, arrow_size);
										drawArrow(ctx, DEF_TYPE_UPARROW, arrow_x, arrow_y+20, arrow_size);
					        	    }
				        		    else if (!(barData[bar-k].c < kumo1 && barData[bar-k].c < kumo2))						// Inside Kumo => 2 UP arrows
				        		    {
										drawArrow(ctx, DEF_TYPE_UPARROW, arrow_x, arrow_y+10, arrow_size);
				        		    }
								}
							}
						}

						if (j == 3)	// Cloud
						{
							if (barData[bar].chartTechOverlay[i][j] > barData[bar].chartTechOverlay[i][j - 1])
							{
								for (no = barData[bar].chartTechOverlay[i][j - 1]; no < barData[bar].chartTechOverlay[i][j]; no += 10)
								{
									ctx.fillStyle = DEF_IKH_KUMO_UP_COLOR;
									ctx.beginPath();	
									if (no + 5 > barData[bar].chartTechOverlay[i][j] - 1)
										ctx.moveTo(midPt, barData[bar].chartTechOverlay[i][j] - 1);
									else
										ctx.moveTo(midPt, no + 5);

									if (no + 5 > barData[bar - 1].chartTechOverlay[i][j] - 1)
										ctx.lineTo(x + (barHand + float2int(barWidth / 2))/5, barData[bar - 1].chartTechOverlay[i][j] - 1);
									else
										ctx.lineTo(x + (barHand + float2int(barWidth / 2))/5, no + 5);

									if (no < barData[bar - 1].chartTechOverlay[i][j - 1] + 1)
										ctx.lineTo(x + (barHand + float2int(barWidth / 2))/5, barData[bar - 1].chartTechOverlay[i][j] + 1);
									else
										ctx.lineTo(x + (barHand + float2int(barWidth / 2))/5, no);

									if (no < barData[bar].chartTechOverlay[i][j - 1] + 1)
										ctx.lineTo(midPt, barData[bar].chartTechOverlay[i][j - 1] + 1);
									else
										ctx.lineTo(midPt, no);

									ctx.closePath();
									ctx.fill();
								}
							}
							else
							{
								for (no = barData[bar].chartTechOverlay[i][j]; no < barData[bar].chartTechOverlay[i][j - 1]; no += 10)
								{
									ctx.fillStyle = DEF_IKH_KUMO_DN_COLOR;
									ctx.beginPath();	
									if (no < barData[bar].chartTechOverlay[i][j] + 1)
										ctx.moveTo(midPt, barData[bar].chartTechOverlay[i][j] + 1);
									else
										ctx.moveTo(midPt, no);

									if (no < barData[bar - 1].chartTechOverlay[i][j] + 1)
										ctx.lineTo(x + (barHand + float2int(barWidth / 2))/5, barData[bar - 1].chartTechOverlay[i][j] + 1);
									else
										ctx.lineTo(x + (barHand + float2int(barWidth / 2))/5, no);

									if (no + 5 > barData[bar - 1].chartTechOverlay[i][j - 1] - 1)
										ctx.lineTo(x + (barHand + float2int(barWidth / 2))/5, barData[bar - 1].chartTechOverlay[i][j - 1] - 1);
									else
										ctx.lineTo(x + (barHand + float2int(barWidth / 2))/5, no + 5);

									if (no + 5 > barData[bar].chartTechOverlay[i][j - 1] - 1)
										ctx.lineTo(midPt, barData[bar].chartTechOverlay[i][j - 1] - 1);
									else
										ctx.lineTo(midPt, no + 5);

									ctx.closePath();
									ctx.fill();
								}
							}
						}	// j = 3
					}
				}
			}
			else if (upper == DEF_SAR)
			{
				if ((barData[bar].o > 0) && (barData[bar].h > 0) &&
					(barData[bar].l > 0) && (barData[bar].c > 0))
				{
					ctx.beginPath();
					ctx.arc(midPt, barData[bar].chartTechOverlay[i][0], mpRadius, 0, 2*Math.PI);
					ctx.fillStyle = techOverlayColor[i][j];
	      			ctx.fill();
	      			ctx.strokeStyle = techOverlayColor[i][j];
					ctx.stroke();
					ctx.closePath();					
				}
			}
			else // Others : SMA, EMA, WMA, BOLL, ...
			{
				if (bar != startBarNo)
				{
					if ((barData[bar - 1].o > 0) && (barData[bar - 1].h > 0) &&
						(barData[bar - 1].l > 0) && (barData[bar - 1].c > 0) && (barData[bar - 1].techOverlay[i][j] > 0))
					{
						ctx.strokeStyle = techOverlayColor[i][j];
						ctx.beginPath();
						ctx.moveTo(midPt, barData[bar].chartTechOverlay[i][j]);
						ctx.lineTo(x + barHand + float2int(barWidth/2)+(barWidth%2), barData[bar - 1].chartTechOverlay[i][j]);
						ctx.stroke();
						ctx.closePath();
					}
				}
			}
		}
	}
}  // drawTechOverlay


function drawTechPane(ctx, x, bar)
{
	if (! ((barData[bar].o > 0) && (barData[bar].h > 0) &&
		   (barData[bar].l > 0) && (barData[bar].c > 0)))
		return;

	var midPt = x - barSpacing - barHand - float2int(barWidth / 2);

	for (i = 0; i < techPaneNo; i++)
	{
		for (j = 0; j < techPaneBar[i].length; j++)		
		{
			//console.log("drawing tech..." + barData[bar].chartTechPane[i][j]);

			if (barData[bar].chartTechPane[i][j] <= 0)
				continue;

			ctx.strokeStyle = techPaneColor[i][j];
			
			if (techPaneName[i] == DEF_LTECH_TEXT[DEF_VOLUME])
			{
				ctx.beginPath();
				ctx.moveTo(midPt, techChartMinLow[i]);
				ctx.lineTo(midPt, barData[bar].chartTechPane[i][j]);
				ctx.stroke();
				ctx.closePath();	
			}
			else if (techPaneName[i] == DEF_LTECH_TEXT[DEF_VOLUMEPLUS])
			{
				if (j == 0)
				{
					if (barData[bar].techPane[i][j] < 0)
						ctx.strokeStyle = "#FF0000";		// red
					else
						ctx.strokeStyle = techPaneColor[i][j];

					ctx.beginPath();
					ctx.moveTo(midPt, techChartMinLow[i]);
					ctx.lineTo(midPt, barData[bar].chartTechPane[i][j]);
					ctx.stroke();
					ctx.closePath();
					
				}
			}
			else if (techPaneName[i] == DEF_LTECH_TEXT[DEF_MC])
			{
				if (j==0)
				{
					ctx.beginPath();
					ctx.moveTo(midPt, barData[bar].chartTechPane[i][j]);
					ctx.lineTo(midPt, techChartMinLow[i]);
					ctx.stroke();
					ctx.closePath();					
				}
				else if ((j == 1) && (bar != startBarNo))
				{
					ctx.beginPath();
					ctx.moveTo(midPt, barData[bar].chartTechPane[i][j]);
					ctx.lineTo(x + barSpacing + barHand + float2int(barWidth/2)+(barWidth%2), barData[bar].chartTechPane[i][j]);
					ctx.stroke();
					ctx.closePath();										
				}
				/*
				if (j == 0)
				{
					if (barData[bar].techPane[i][0] >= barData[bar].techPane[i][1])
					{
						g.setColor(Color.black);
						g.drawRect(midPt-2, barData[bar].chartTechPane[i][j], 4, techChartMinLow[i]-barData[bar].chartTechPane[i][j]);
					}
					else
					{
						g.setColor(Color.black);
						g.fillRect(midPt-2, barData[bar].chartTechPane[i][j], 4, techChartMinLow[i]-barData[bar].chartTechPane[i][j]);
					}
				}
				else if ((j == 1) && (bar != startBarNo))
					g.drawLine(midPt, barData[bar].chartTechPane[i][j], x + barSpacing + barHand + (int) barWidth / 2, barData[bar].chartTechPane[i][j]);
				*/
			}
			else
			{
				if ((bar != startBarNo)  && (bar > startExBarNo)  && (bar < startExBarNo + techPaneBar[i][j]))
				{
					if (techPaneName[i] == DEF_LTECH_TEXT[DEF_MACD] && (j == techPaneParm[i] - 1))
					{
						if ((barData[bar - 1].o > 0) && (barData[bar - 1].h > 0) &&
							(barData[bar - 1].l > 0) && (barData[bar - 1].c > 0))
						{
							ctx.beginPath();
							ctx.moveTo(midPt, barData[bar].chartTechPane[i][j]);
							ctx.lineTo(midPt, techZero);
							ctx.stroke();
							ctx.closePath();	
						}
					}
					else
					{
						if ((techPaneName[i] == DEF_LTECH_TEXT[DEF_STC]) && (j == techPaneParm[i] - 1) ||
							(techPaneName[i] == DEF_LTECH_TEXT[DEF_MOM]) && (j == techPaneParm[i] - 1))
						{
							// Don't display
						}
						else
						{
							if (techPaneName[i] == DEF_LTECH_TEXT[DEF_ADX] && !isShowADXDI)
							{
								if (j == 0)
								{
									if ((barData[bar - 1].o > 0) && (barData[bar - 1].h > 0) &&
										(barData[bar - 1].l > 0) && (barData[bar - 1].c > 0))
									{
										ctx.beginPath();
										ctx.moveTo(midPt, barData[bar].chartTechPane[i][j]);
										ctx.lineTo(x + barHand + float2int(barWidth / 2) + (barWidth%2), barData[bar - 1].chartTechPane[i][j]);
										ctx.stroke();
										ctx.closePath();
									}
								}
							}
							else
							{
								if ((barData[bar - 1].o > 0) && (barData[bar - 1].h > 0) &&
									(barData[bar - 1].l > 0) && (barData[bar - 1].c > 0))
								{
									ctx.beginPath();
									ctx.moveTo(midPt, barData[bar].chartTechPane[i][j]);
									ctx.lineTo(x + barHand + float2int(barWidth / 2) + (barWidth%2), barData[bar - 1].chartTechPane[i][j]);
									ctx.stroke();
									ctx.closePath();								
								}
							}
						}
					}
				}
			}
		}
	}
}  // drawTechPane

function drawTechPaneBar(ctx)
{
	var techString;
	var date;

	var drawWidth = ctx.canvas.width - offsetXS - offsetXX - offsetXM - offsetXG;
	var offsetX;
	var yScale;

	if (drawExBarNo <= 0)
		return;
	
	for (i = 0; i < techPaneNo; i++)
	{
		offsetX = offsetXM + 4;

		ctx.beginPath();
		ctx.strokeStyle = DEF_TECH_PANEBAR_BR_COLOR;
		ctx.rect(offsetXM, ctx.canvas.height - offsetYS - offsetYY - (techPaneNo - i) * offsetTS, drawWidth - 1, offsetTB);
		ctx.stroke();
		ctx.closePath();

		ctx.fillStyle = DEF_TECH_PANEBAR_COLOR;
		ctx.fillRect(offsetXM, ctx.canvas.height - offsetYS - offsetYY - (techPaneNo - i) * offsetTS, drawWidth - 1, offsetTB);

		//yScale = float2int(ctx.canvas.height - offsetYS - offsetYY - (techPaneNo - i) * offsetTS + float2int(offsetTB + fontHeight - fontDescent) / 2);
		yScale = float2int(ctx.canvas.height - offsetYS - offsetYY - (techPaneNo - i) * offsetTS + float2int(offsetTB + 8) / 2);

		techString = _lang.getStr(techPaneName[i]);
		if (techPaneName[i] == DEF_LTECH_TEXT[DEF_MC] || techPaneName[i] == DEF_LTECH_TEXT[DEF_VOLUME] ||
			techPaneName[i] == DEF_LTECH_TEXT[DEF_VOLUMEPLUS] || techPaneName[i] == DEF_LTECH_TEXT[DEF_OBV])
			techString += "  ";
		else
		{
			for (j = 0; j < techPaneParm[i]; j++)
			{
				if (!techPaneValue[i][j])
					continue;
					
				if (j == 0)
					techString += " (";
				//techString += df.format(techPaneValue[i][j]);
				techString += techPaneValue[i][j];
				if (j !=  techPaneParm[i] - 1)
					techString += ", ";
				else
					techString += ") ";
			}
		}

		//textString = strDate + " O " + barData[activeBar].o + " H " + barData[activeBar].h + " L " + barData[activeBar].l + " C " + barData[activeBar].c;
		//if (typeChart == DEF_PROSTICKS_CHART || typeChart == DEF_BAR_MODAL_CHART || typeChart == DEF_MODAL_LINE_CHART)
		//	textString += " MP " + barData[activeBar].mp + " MC " + barData[activeBar].mc + " AR " + barData[activeBar].vam + " - " + barData[activeBar].vap;
		//ctx.font = DEF_FONT;
		//ctx.fillStyle = DEF_TITLE_COLOR;
		//ctx.fillText(textString,2,12);
		//ctx.fillText(code + " - " + interval,2,10);

		ctx.font = DEF_FONT;
		ctx.fillStyle = DEF_TECH_PANEBAR_TEXT_COLOR;
		ctx.fillText(techString,offsetX,yScale);
		
		offsetX += ctx.measureText(techString).width;

		//for (j = 0; j < techPaneParm[i]; j++)
		for (j = 0; j < techPaneBar[i].length; j++)
		{
			if (!techPaneText[i][j])
				continue;
			
			// As we know STC and MOMENTUM accept 3 parameters but only have 2 lines
			if ((techPaneName[i] == DEF_LTECH_TEXT[DEF_STC] && (j == techPaneBar[i].length)) ||
				(techPaneName[i] == DEF_LTECH_TEXT[DEF_MOM] && (j == techPaneBar[i].length)))
			{
			}
			else
			{
				ctx.fillStyle = techPaneColor[i][j];
				ctx.fillText(techPaneText[i][j],offsetX,yScale);
				offsetX += ctx.measureText(techPaneText[i][j]).width;
			}

			// Display comma
			if (j != techPaneBar[i].length - 1)
			{
				if (techPaneName[i] == DEF_LTECH_TEXT[DEF_VOLUME] || techPaneName[i] == DEF_LTECH_TEXT[DEF_VOLUMEPLUS]	||
					(techPaneName[i] == DEF_LTECH_TEXT[DEF_STC] && (j == techPaneBar[i].length - 1))	||
					(techPaneName[i] == DEF_LTECH_TEXT[DEF_MOM] && (j == techPaneBar[i].length - 1)) )
				{
				}
				else
				{
					ctx.fillStyle = DEF_TECH_PANEBAR_TEXT_COLOR;
					ctx.fillText(", ",offsetX,yScale);
					offsetX += ctx.measureText(", ").width;
				}
			}
		}
	}
}  // drawTechPaneBar


function drawSupportResist(ctx)
{
	var tempValue = 0;
	var	width = ctx.canvas.width - offsetXS - offsetXX - offsetXG;		//Drawable width
	var drawHeight = ctx.canvas.height - offsetYS - offsetYY - techPaneNo * offsetTS - offsetYT - offsetYM;	// Drawable height

	if (supportMP && supportMP > 0)
	{
		if (supportMP < drawMaxHigh && supportMP > drawMinLow)
		{
			var supLabel = _lang.getStr("support") + "  ";
			var tempValue = float2int((drawMaxHigh - supportMP) / yRatio + offsetYT + offsetYM);
			
			ctx.beginPath();
			ctx.strokeStyle = DEF_SUPPORT_COLOR;
			ctx.moveTo(offsetXM+ctx.measureText(supLabel).width, tempValue);
			ctx.lineTo(width, tempValue);
			ctx.stroke();
			ctx.closePath();								

			ctx.font = DEF_FONT;
			ctx.fillStyle = DEF_SUPPORT_COLOR;
			ctx.fillText(supLabel, offsetXM, tempValue+4);
		}
		//drawValueBoxByPrice(g, d, "S:", supportMP);
	}

	if (resistMP && resistMP > 0)
	{
		if (resistMP < drawMaxHigh && resistMP > drawMinLow)
		{
			var resLabel = _lang.getStr("resistance") + "  ";
			var tempValue = float2int((drawMaxHigh - resistMP) / yRatio + offsetYT + offsetYM);
			
			ctx.beginPath();
			ctx.strokeStyle = DEF_RESISTANCE_COLOR;
			ctx.moveTo(offsetXM+ctx.measureText(resLabel).width, tempValue);
			ctx.lineTo(width, tempValue);
			ctx.stroke();
			ctx.closePath();								

			ctx.font = DEF_FONT;
			ctx.fillStyle = DEF_RESISTANCE_COLOR;
			ctx.fillText(resLabel, offsetXM, tempValue+4);
		}
		//drawValueBoxByPrice(g, d, "R:", resistMP);
	}
}


function drawOldValueCursor(ctx)
{
/*
	ctx.globalCompositeOperation = "xor";
	g.setColor(Color.black);
	g.setXORMode(Color.white);
	if ((saveX > offsetXM) && (saveX < ctx.canvas.width - offsetXS - offsetXX))
		g.drawLine(saveX, 0, saveX, cts.canvas.height - 1);

	if ((saveY < chartMinLow) && (saveY > offsetYM) && (drawExBarNo != 0))
	{
		//leave a gap if valueBox needs to be drawn.
		g.drawLine(0, saveY, valueBoxX - 1, saveY);
		g.drawLine(valueBoxX + valueBoxWidth, saveY, d.width - 1, saveY);
	}
	else
	{
		g.drawLine(0, saveY, d.width-1, saveY);
	}
	eraseValueBox(g, d);
*/
}

function drawValueCursor(ctx)
{
/*
	ctx.globalCompositeOperation = "xor";
	g.setColor(Color.black);
	g.setXORMode(Color.white);

	if ((mouseX > offsetXM) && (mouseX < ctx.canvas.width - offsetXS - offsetXX))
		g.drawLine(mouseX, 0, mouseX, cts.canvas.height - 1);

	if ((mouseY < chartMinLow) && (mouseY > offsetYM)  && (drawExBarNo != 0))
	{
		//leave a gap if valueBox needs to be drawn.
		g.drawLine(0, mouseY, valueBoxX - 1, mouseY);
		g.drawLine(valueBoxX + valueBoxWidth, mouseY, d.width - 1, mouseY);
	}
	else
		g.drawLine(0, mouseY, d.width-1, mouseY);

	drawValueBox(g, d);
	g.setXORMode(Color.white);
*/
}
	
// Draw Y scale
function drawYScale(ctx)
{
	var yScale = 0;
	var no = 0;
	var startPoint = 0;

	for (yPrice = drawMaxHigh; yPrice > drawMinLow; yPrice -= finalScale)
	{
		yScale = float2int((drawMaxHigh - yPrice) / yRatio + offsetYT + offsetYM);

		if (drawGrid)
		{
			ctx.beginPath();
			ctx.strokeStyle = DEF_GRID_COLOR;
	
			ctx.moveTo(ctx.canvas.width - offsetXS - offsetXX - 1, yScale);
			ctx.lineTo(offsetXM, yScale);
			ctx.stroke();
			ctx.closePath();
		}

		ctx.font = DEF_FONT;
		ctx.fillStyle = DEF_FONT_COLOR;
		ctx.fillText(yPrice.toFixed(dps), ctx.canvas.width - offsetXS + 2, yScale + 5);
	}
}

function convertXcoordinate(ctx, x)
{
	var bar;
	var width = ctx.canvas.width - offsetXS - offsetXX - offsetXG;
	var currentBarNo = 0;

	if (drawBarNo > 0)
	{
		// Find the nearest bar
		bar = -1;
		if (barWidth + 2 * barHand + barSpacing > 0)
			bar = float2int((ctx.canvas.width - offsetXS - offsetXX - offsetXG - x) / (barWidth + 2 * barHand + barSpacing));
		currentBarNo = bar + startBarNo;
	}
	return currentBarNo;
}

function convertYcoordinate(ctx, y)
{
	var mousePriceDisplay = "";
	var dataValue = 0;

	if ((y <= chartMinLow) && (y >= offsetYM))
	{
		if (offsetXS > DEF_MAX_OFFSET_XS)
			offsetXS = DEF_MAX_OFFSET_XS;

		if ((y < chartMinLow) && (y > offsetYM))
		{
			dataValue = (-1.0) * ((y - offsetYT - offsetYM) * yRatio - drawMaxHigh);
			mousePriceDisplay = dataValue.toFixed(4);
		}
	}
	return mousePriceDisplay;
}

function compTechScale(ctx)
{
	if ((drawBarNo <= 0) || (drawExBarNo <= 0))
		return;

	if (techPaneNo <= 0)
		return;

	var drawHeight = float2int(offsetTS - 1.25 * offsetTB);

	if (drawHeight <= 0)
		return;

	var minBar = drawBarNo;
	var volume;

	for (var i = 0; i < techPaneNo; i++)
	{
		techMaxHigh[i] = 0;
		techMinLow[i] = Number.MAX_VALUE;
		techYRatio[i] = 0;

		for (var j = 0; j < techPaneBar[i].length; j++)
		{
			if (techPaneName[i] == DEF_LTECH_TEXT[DEF_STC] && (j == techPaneParm[i] - 1))
				break;

			if (techPaneBar[i][j] < drawBarNo)
				minBar = techPaneBar[i][j];
			else
				minBar = drawBarNo;

			var startNo;
			if (startBarNo < DEF_MAX_RIGHT_SHIFT)
				startNo = DEF_MAX_RIGHT_SHIFT;
			else
				startNo = startBarNo;

			//startNo = startBarNo;
			//console.log("startNo="+startNo+", minBar="+ minBar+",startExBarNo="+startExBarNo+",techPaneBar[i][j]="+techPaneBar[i][j]);
			
			for (var bar = startNo; bar < startNo + minBar; bar++)
			{
				//console.log("looping..."+bar);
				if (bar >= startExBarNo + techPaneBar[i][j])
					continue;

				if ( techPaneName[i] == DEF_LTECH_TEXT[DEF_VOLUMEPLUS] )
				{
					if (Math.abs(barData[bar].techPane[i][j]) > techMaxHigh[i])
						techMaxHigh[i] = Math.abs(barData[bar].techPane[i][j]);

					if (Math.abs(barData[bar].techPane[i][j]) < techMinLow[i])
						techMinLow[i] = Math.abs(barData[bar].techPane[i][j]);
				}
				else
				{
					if (barData[bar].techPane[i][j] > techMaxHigh[i])
						techMaxHigh[i] = barData[bar].techPane[i][j];

					if (barData[bar].techPane[i][j] < techMinLow[i])
						techMinLow[i] = barData[bar].techPane[i][j];
				}
			}
		}

		if (techPaneName[i] == DEF_LTECH_TEXT[DEF_RSI] ||
			techPaneName[i] == DEF_LTECH_TEXT[DEF_STC])
		{
			techMaxHigh[i] = 100;
			techMinLow[i] = 0;
		}

		for (var sp = 0; sp < DEF_MAX_TECH_SP; sp++)
		{
			if (techPaneSp[i][sp] >= 0)
			{
				if (techMaxHigh[i] < techPaneSp[i][sp])
					techMaxHigh[i] = techPaneSp[i][sp];

				if (techMinLow[i] > techPaneSp[i][sp])
					techMinLow[i] = techPaneSp[i][sp];
			}
		}
		
		//console.log("techMaxHigh[i]="+techMaxHigh[i]+", techMinLow[i]"+ techMinLow[i]);

		//if (df.format(techMaxHigh[i]).equals(df.format(techMinLow[i])))	// Just one data
		//	techMinLow[i] /= 10;

		techYRatio[i] = (techMaxHigh[i] - techMinLow[i]) / drawHeight;

		if (techYRatio[i] > 0)
		{
			for (var j = 0; j < techPaneBar[i].length; j++)
			{
				if (techPaneBar[i][j] < drawBarNo)
					minBar = techPaneBar[i][j];
				else
					minBar = drawBarNo;

				if ( techPaneName[i] == DEF_LTECH_TEXT[DEF_VOLUMEPLUS] )
				{
					for (var bar = startBarNo; bar < startBarNo + minBar; bar++)
					{
						volume = Math.abs(barData[bar].techPane[i][j]);  //create absolute values for volume plus chart
						
						barData[bar].chartTechPane[i][j] = ctx.canvas.height - offsetYS - offsetYY -
							(techPaneNo - i - 1) * offsetTS - float2int(offsetTB * 0.125) -
							float2int((volume - techMinLow[i]) / techYRatio[i]);
					}
				}
				else
				{
					for (var bar = startBarNo; bar < startBarNo + minBar; bar++)
					{
						barData[bar].chartTechPane[i][j] = ctx.canvas.height - offsetYS - offsetYY -
								(techPaneNo - i - 1) * offsetTS - float2int(offsetTB * 0.125) -
								float2int((barData[bar].techPane[i][j] - techMinLow[i]) / techYRatio[i]);
					}
				}
				
			}

			// Compute reference point of price 0
			if (techPaneName[i] == DEF_LTECH_TEXT[DEF_MACD])
				techZero = ctx.canvas.height - offsetYS - offsetYY - (techPaneNo -i - 1) * offsetTS -
					float2int(offsetTB * 0.125) - float2int((0 - techMinLow[i]) / techYRatio[i]);

			// Determine a proper scale to display
			var multiRatio;
			var multiScale;
			var rndMaxHigh;
			var rndMinLow;

			multiRatio = (techMaxHigh[i] - techMinLow[i]) / 3;
			multiScale = 0;
			rndMaxHigh = techMaxHigh[i];
			rndMinLow = techMinLow[i];
			while (float2int(multiRatio) < 1)
			{
				multiRatio *= 10;
				rndMaxHigh *= 10;
				rndMinLow *= 10;
				multiScale += 1;
				if (multiScale > 10)	// To prevent infinite loop
					break;
			}
			var count = 0;
			var currentScale;

			techFinalScale[i] = currentScale = 1;
			while (currentScale < multiRatio)
			{
				if (count == DEF_OPT_SCALE.length)
				{
					techFinalScale[i] *= 10;
					count = 0;
				}
				currentScale = techFinalScale[i] * DEF_OPT_SCALE[count++];
			}

			techFinalScale[i] = currentScale;
			techDrawMinLow[i] = float2int(rndMinLow) - ((float2int(rndMinLow)) % techFinalScale[i]);
			techDrawMaxHigh[i] = float2int(rndMaxHigh) - ((float2int(rndMaxHigh)) % techFinalScale[i]);

			for (var k = 0; k < multiScale; k++)
			{
				techFinalScale[i] /= 10;
				techDrawMinLow[i] /= 10;
				techDrawMaxHigh[i] /= 10;
			}

			techChartMinLow[i] = ctx.canvas.height - offsetYS - offsetYY - (techPaneNo - i - 1) * offsetTS -
				float2int(offsetTB * 0.125) - float2int((techDrawMinLow[i] - techDrawMinLow[i]) / techYRatio[i]);
			techChartMaxHigh[i] = ctx.canvas.height - offsetYS - offsetYY - (techPaneNo - i - 1) * offsetTS -
				float2int(offsetTB * 0.125) - float2int((techDrawMaxHigh[i] - techDrawMinLow[i]) / techYRatio[i]);
		}
	}

}

// Traditional(n)
// Summation of n-day close prices / n
function getTRAD(n1, n2, outData)
{
	var nDayHigh, nDayLow, h3, l3;

	if (n1 <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n1)
		return DEF_FAIL;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		h3 = l3 = nDayHigh = 0;
		nDayLow = Number.MAX_VALUE;

		for (j = bar; j < bar + n1	&& j < startExBarNo + drawExBarNo; j++)
		{
			//Stochastics will be calculated with VAPlus and VAMinus as high and low
			//if Modal Point method is used for calculation, as Prosticks considers
			//them as being more relevant statistics.
			if (chartCalcMethod == DEF_CALCBY_MP)
			{
				if (nDayHigh < barData[j].vap)
					nDayHigh = barData[j].vap;

				if (nDayLow > barData[j].vam)
					nDayLow = barData[j].vam;
			}
			else
			{
				if (nDayHigh < barData[j].h)
					nDayHigh = barData[j].h;

				if (nDayLow > barData[j].l)
					nDayLow = barData[j].l;
			}
		}

		for (i = bar; i < bar + n2	&& i < startExBarNo + drawExBarNo; i++)
		{
			h3 = h3 + (barData[i].calcPrice - nDayLow);
			l3 = l3 + (nDayHigh - nDayLow);
		}
		outData[bar] = h3 / l3 * 100;
	}
	return (drawExBarNo - n2 + 1);
}

// SMA(n)
// Summation of n-day close prices / n
function getSMA(n, inData, outData, onlypos)
{
	var count;
	var sum;

	if (n <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n)
		return DEF_FAIL;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
		outData[bar] = 0;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		count = 0;
		sum = 0;
		for (i = bar; i < bar + n; i++)
		{
			if (i >= startExBarNo + drawExBarNo)
				break;

			if (!onlypos || inData[i] > 0)
			{
				sum = sum + inData[i];
				count++;
			}
		}

		if (count == n)
			outData[bar] = sum / count;
		
		//console.log("getSMA : " + bar + "," + inData[bar] + "," + outData[bar]);
	}
	//console.log("getSMA "+n+" : return " + (drawExBarNo - n + 1) );

	return (drawExBarNo - n + 1);
}

// EMA(n)
// EMA(1) = SMA(1) = P(1)
// EMA(n) = (1 - 2 / (n + 1)) * EMA(n - 1) + (2 / (n + 1)) * P(n)
function getEMA(n, inData, outData, onlypos)
{
	var constEMA;

	if (n <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n)
		return DEF_FAIL;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
		outData[bar] = 0;

	constEMA = 2.0 / (n + 1);
	outData[startExBarNo + drawExBarNo - 1] = inData[startExBarNo + drawExBarNo - 1];

	// oldest bar : startExBarNo + drawExBarNo -1
	// latest bar : lastBarNo
	// end of all bars : startExBarNo
	for (bar = startExBarNo + drawExBarNo - 2; bar >= startExBarNo; bar--)
	{
		if (!onlypos || inData[bar] > 0)
			outData[bar] = constEMA * inData[bar] + (1 - constEMA) * outData[bar + 1];
	}

	return drawExBarNo;
}

// WiMA(n)
// WiMA(1) = SMA(1) = P(1)
// WiMA(n) = (P(n) + (n-1) * WiMA(n - 1)) / n
function getWiMA(n, inData, outData, onlypos)
{
	if (n <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n)
		return DEF_FAIL;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
		outData[bar] = 0;

	outData[startExBarNo + drawExBarNo - 1] = inData[startExBarNo + drawExBarNo - 1];
	for (bar = startExBarNo + drawExBarNo - 2; bar >= startExBarNo; bar--)
	{
		if (!onlypos || inData[bar] > 0)
			outData[bar] = (inData[bar] + (n-1) * outData[bar + 1]) / n;
	}

	return drawExBarNo;
}

//Weighted Moving Average (WMA)
function getWMA(n, inData, outData, onlypos)
{
	var count = 1;
	var num = 1;
	var temp = [];
	var top = 0;
	var bottom = 0;

	if (n <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n)
		return DEF_FAIL;


	for (var bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
		outData[bar] = 0;

	for (var bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		if (!onlypos || inData[bar] <= 0)
			continue;
				
		count = n;
		for (var j = bar; j < bar + n; j++)
		{
			if (j >= startExBarNo + drawExBarNo)
				break;

			temp[j] = inData[j] * count;
			count = count - 1;
		}
		top = 0;
		bottom = 0;
		num = 1;
		for (var k = bar; k < bar + n; k++)
		{
			if (k >= startExBarNo + drawExBarNo)
				break;

			top = top + temp[k];
			bottom = bottom + num;
			num = num + 1;
		}
		outData[bar] = top/bottom;
		//console.log("getWMA : " + bar + ", " + inData[bar] + ", " + outData[bar]);
	}
	
	return (drawExBarNo - n + 1);
}

//Bollinger Bands (n, sdn)
//Calculates the SMA of stock closing prices over a period of n days and
//   +/- (sdn) number of standard deviations above and below the average.
function getBollinger(n1, n2, to)
//n1 = period of calculation in days
//n2 = number of standard deviations to be calculated above and below the average
//to = techOverlay number
{
	//in the for loops where we store the calculated technical data points,
	//the upper limit of the loop index is (startExBarNo + returnno) so that
	//the chart displays neither the graphical line nor the actual values at those
	//points.
	if (n1 <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n1)
		return DEF_FAIL;

	//returnno is the number of bars to display on chart.
	var returnno = drawExBarNo - n1 + 1;

	var MA = [];		//moving averages; will be initialised by getSMA()
	var data = [];		//storage array for stock closing prices
	var sd = []			//temporary storage array for standard deviations

	// clear/initialise arrays
	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		//clearing old techPane values
		for (j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techOverlay[to][j] = 0;
			barData[bar].chartTechOverlay[to][j] = 0;
		}
		data[bar] = 0;
		sd[bar] = 0;
	}

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		data[bar] = barData[bar].calcPrice;
	}
	getSMA(n1, data, MA, true);

	//store SMA in 3rd overlay line.
	for (bar = startExBarNo; bar < startExBarNo + returnno; bar++)
	{
		barData[bar].techOverlay[to][2] = MA[bar];
	}

	var sum = 0.0;		//sum of data
	var ssq = 0.0;		//sum of squares of data

	//data collection for the oldest n days where we cannot yet calculate volatility.
	for (bar = startExBarNo + drawExBarNo - 1; bar > startExBarNo + drawExBarNo - 1 - n1; bar--)
	{
		sum += data[bar];
		ssq += data[bar] * data[bar];
	}
	sd[startExBarNo + drawExBarNo - n1] = Math.sqrt(ssq/n1 - (sum/n1)*(sum/n1));

	for (bar = startExBarNo + drawExBarNo - 1 - n1; bar >= startExBarNo; bar--)
	{
		sum = sum - data[bar+n1] + data[bar];
		ssq = ssq - (data[bar+n1]*data[bar+n1]) + (data[bar]*data[bar]);
		sd[bar] = Math.sqrt(ssq/n1 - (sum/n1)*(sum/n1));
	}

	//store Bollinger bands in 1st and 2nd overlay lines
	for (bar = startExBarNo; bar < startExBarNo + returnno; bar++)
	{
		if (MA[bar] > 0)
		{
			barData[bar].techOverlay[to][0] = MA[bar] + n2 * sd[bar];
			barData[bar].techOverlay[to][1] = MA[bar] - n2 * sd[bar];
		}
	}

	return (returnno);
}

function getParabolic(init, addit, limit, to)
{
	//init is initial acceleration factor
	//addit is additional acceleration factor
	//limit is the maximum acceleration factor
	//to is the techOverlay number

	//returnno is the number of bars to display on chart.
	var returnno = drawExBarNo - 1;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		//clearing old techPane values
		for (j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techOverlay[to][j] = 0;
			barData[bar].chartTechOverlay[to][j] = 0;
		}
	}

	var longPos	= true;
	var extreme	= barData[startExBarNo + drawExBarNo - 1].l;
	var nextsar	= barData[startExBarNo + drawExBarNo - 1].h;
	var sar = nextsar;
	var accel = init;
	var high, low;
	var mmax,mmin;
	var periodhigh, periodlow;

	barData[startExBarNo + drawExBarNo - 1].techOverlay[to][0] = nextsar;
	periodhigh = barData[startExBarNo + drawExBarNo - 1].h;
	periodlow = barData[startExBarNo + drawExBarNo - 1].l;

	for (bar=startExBarNo + drawExBarNo - 2;   bar>=0; bar--)
	{
		//Parabolic will be calculated with VAPlus and VAMinus as high and low
		//if Modal Point method is used for calculation, as Prosticks considers
		//them as being more relevant statistics.
		if (chartCalcMethod == DEF_CALCBY_MP)
		{
			high = barData[bar].vap;
			low = barData[bar].vam;

			mmax    =   Math.max(barData[bar].vap,  barData[bar+1].vap);
			mmin    =   Math.min(barData[bar].vam, barData[bar+1].vam);
		}
		else
		{
			high = barData[bar].h;
			low = barData[bar].l;

			mmax    =   Math.max(barData[bar].h, barData[bar+1].h);
			mmin    =   Math.min(barData[bar].l, barData[bar+1].l);
		}

		barData[bar].techOverlay[to][0] =   nextsar;
		sar = nextsar;

		if (high <= 0 || low <= 0)
			break;

		periodhigh = Math.max(periodhigh, high);
		periodlow  = Math.min(periodlow, low);

		if (longPos)
		{
			if (low < sar)
			{
				longPos		= false;
				accel		= init;
				sar			= periodhigh;
				periodhigh	= high;
				periodlow	= low;
				extreme		= periodlow;
				nextsar		= sar + accel * (extreme - sar);
			}
			else
			{
				if (high > extreme)
				{
					extreme	= high;
					accel	= Math.min(accel+addit, limit);
				}

				nextsar = Math.min(sar + accel * (extreme - sar), mmin);
			}
		}
		else
		{
			if (high > sar)
			{
				longPos		= true;
				accel		= init;
				sar			= periodlow;
				periodhigh	= high;
				periodlow	= low;
				extreme		= periodhigh;
				nextsar		= sar + accel * (extreme - sar);
			}
			else
			{
				if (low < extreme)
				{
					extreme	= low;
					accel	= Math.min(accel+addit, limit);
				}

				nextsar	= Math.max(sar + accel * (extreme - sar), mmax);
			}
		}
	}
	return (returnno);
}

//Moving Average Envelope
//SMA #days +/- %
function getMAE(n1, n2, to)
//n1 = period of calculation days
//n2 = percentage
//to = techOverlay numbers
{
	if (n1 <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n1)
		return DEF_FAIL;

	var returnno = drawExBarNo - n1 + 1;

	var MA = [];  //moving averages
	var data = [];  //input data

	//clear old techPane values
	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		for (j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techOverlay[to][j] = 0;
			barData[bar].chartTechOverlay[to][j] = 0;
		}
		data[bar] = 0;
	}

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		data[bar] = barData[bar].calcPrice;
	}

	getSMA(n1, data, MA, true);

	//store MA Envelope bands in overlay lines.
	for (bar = startExBarNo; bar < startExBarNo + returnno; bar++)
	{
		if (MA[bar] > 0)
		{
			barData[bar].techOverlay[to][0] = MA[bar] + ((MA[bar]*n2)/100);
			barData[bar].techOverlay[to][1] = MA[bar] - ((MA[bar]*n2)/100);
		}
	}
	return (returnno);
}

//Keltner Channels
//Centerline + and - ATR
function getKC(n, to)
//n = number of calculation days
{
	if (n <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n)
		return DEF_FAIL;

	var returnno = drawExBarNo - n + 1;

	var EMA = [];
	var typprice = [];
	var trange = [];
	var atr = [];

	var hl;
	var ch;
	var cl;

	//clear old techPane values
	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		for (j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techOverlay[to][j] = 0;
			barData[bar].chartTechOverlay[to][j] = 0;
		}
		typprice[bar] = (barData[bar].h + barData[bar].l + barData[bar].c) / 3;
	}

	getEMA(n, typprice, EMA, true);

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo-1; bar++)
	{
		hl = Math.abs(barData[bar].h - barData[bar].l);
		ch = Math.abs(barData[bar + 1].c - barData[bar].h);
		cl = Math.abs(barData[bar + 1].c - barData[bar].l);
		trange[bar] = Math.max(hl, Math.max(ch, cl));
	}

	getSMA(n, trange, atr, true);

	//store Kelner Channels in overlay lines
	for (bar = startExBarNo; bar < startExBarNo + returnno; bar++)
	{
		if (EMA[bar] > 0)
		{
			barData[bar].techOverlay[to][0] = EMA[bar];     //centerline
			barData[bar].techOverlay[to][1] = EMA[bar] + atr[bar];
			barData[bar].techOverlay[to][2] = EMA[bar] - atr[bar];
		}
	}
	return(returnno);
}

function getIKH(n1, n2, n3, n4, n5, to)
{
	var cl = [];		//moving averages; will be initialised by getSMA()
	var sl = [];		//storage array for stock closing prices
	var span1 = [];		//temporary storage array for standard deviations
	var span2 = [];
	var span3 = [];
	var highdata = [];
	var lowdata = [];
	var highestData = [];
	var lowestData = [];
	var tempRet = 0;

	if (n1 <= 0 || n2 <= 0 || n3 <= 0 || n4 <= 0 || n5 <= 0)
			return DEF_FAIL;

	if (drawExBarNo < n1 || drawExBarNo < n2 || drawExBarNo < n3 || drawExBarNo < n4 || drawExBarNo < n5)
		return DEF_FAIL;

	//console.log("IKH :" + n1 + "," + n2 + "," + n3 + "," + n4 + "," + n5);

	//returnno is the number of bars to display on chart.
	var returnno = drawExBarNo - n1 + 1;

	// clear/initialise arrays
	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		//clearing old techPane values
		for (j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techOverlay[to][j] = 0;
			barData[bar].chartTechOverlay[to][j] = 0;
		}
		cl[bar] = 0;
		sl[bar] = 0;
		span1[bar] = 0;
		span2[bar] = 0;
		span3[bar] = 0;
		highdata[bar] = 0;
		lowdata[bar] = 0;
		highestData[bar] = 0;
		lowestData[bar] = 0;
	}

	if (chartCalcMethod == DEF_CALCBY_MP)
	{
		for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
		{
			highdata[bar] = barData[bar].vap;
			lowdata[bar] = barData[bar].vam;
		}
	}
	else
	{
		for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
		{
			highdata[bar] = barData[bar].h;
			lowdata[bar] = barData[bar].l;
		}
	}

	// find change line
	tempRet = getHighest(n1, highdata, highestData);
	tempRet = getLowest(n1, lowdata, lowestData);
	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo - n1; bar++)
	{
		cl[bar] = (highestData[bar] + lowestData[bar]) / 2;
	}

	// find standard line
	tempRet = getHighest(n2, highdata, highestData);
	tempRet = getLowest(n2, lowdata, lowestData);
	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo - n2; bar++)
	{
		sl[bar] = (highestData[bar] + lowestData[bar]) / 2;
	}

	// find span1
	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo - n4; bar++)
	{
		span1[bar] = (cl[bar] + sl[bar]) / 2;
	}

	// find span2
	tempRet = getHighest(n3, highdata, highestData);
	tempRet = getLowest(n3, lowdata, lowestData);
	for (bar = startExBarNo; bar < startExBarNo + tempRet; bar++)
	{
		span2[bar] = (highestData[bar] + lowestData[bar]) / 2;
	}

	// find span3
	if (chartCalcMethod == DEF_CALCBY_MP)
	{
		for (bar = startExBarNo; bar < startExBarNo + drawExBarNo - n5; bar++)
		{
			span3[bar] = barData[bar].mp;
		}
	}
	else
	{
		for (bar = startExBarNo; bar < startExBarNo + drawExBarNo - n5; bar++)
		{
			span3[bar] = barData[bar].c;
		}
	}

	//store CL and BL in 1st and 2nd overlay lines
	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		barData[bar].techOverlay[to][0] = barData[bar].techOverlay[to][1] = barData[bar].techOverlay[to][2] = barData[bar].techOverlay[to][3] = barData[bar].techOverlay[to][4] = -1;
		if (barData[bar].c > 0)
		{
			barData[bar].techOverlay[to][0] = round(cl[bar],4);
			barData[bar].techOverlay[to][1] = round(sl[bar],4);
		}
		if (bar + n4 < startExBarNo + drawExBarNo && barData[bar+n4].c > 0)
			barData[bar].techOverlay[to][2] = round(span1[bar + n4],4);
		if (bar + n4 < startExBarNo + drawExBarNo && barData[bar+n4].c > 0)
			barData[bar].techOverlay[to][3] = round(span2[bar + n4],4);

		if (bar + n5 < startExBarNo + drawExBarNo && barData[bar+n5].c > 0)		// shift forward
			barData[bar].techOverlay[to][4] = round(span3[bar + n5],4);
		
		//console.log("bar " + bar + " IKH " + barData[bar].techOverlay[to]);
		/*
		if (getIKHLagSpanDispMode()==DEF_ID_IKH_LAG_FORWARD)			// Shift Forward
		{
			if (bar + n5 < startExBarNo + drawExBarNo && barData[bar+n5].last > 0)
				barData[bar].techOverlay[to][4] = round(span3[bar + n5],4);
		}
		else if (getIKHLagSpanDispMode()==DEF_ID_IKH_LAG_BACKWARD)		// Shift Backward
		{
			if (bar - n5 > startExBarNo)
				barData[bar].techOverlay[to][4] = round(span3[bar - n5],4);
		}
		else
			barData[bar].techOverlay[to][4]		= -1;		// Hide
		*/
	}

	return (returnno);
}

// find highest(n)
// highest price in n days
function getHighest(n, inData, outData)
{
	var count;
	var highest;

	if (n <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n)
		return DEF_FAIL;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
		outData[bar] = 0;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		count = 0;
		highest = 0;
		for (i = bar; i < bar + n; i++)
		{
			if (i >= startExBarNo + drawExBarNo)
				break;

			if (inData[i] > highest)
				highest = inData[i];
			count++;
		}

		if (count > 0)
			outData[bar] = highest;
	}

	return (drawExBarNo - n + 1);
}

// find lowest(n)
// lowest price in n days
function getLowest(n, inData, outData)
{
	var count;
	var lowest;

	if (n <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n)
		return DEF_FAIL;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
		outData[bar] = 0;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		count = 0;
		lowest = Number.MAX_VALUE;
		for (i = bar; i < bar + n; i++)
		{
			if (i >= startExBarNo + drawExBarNo)
				break;

			if (inData[i] < lowest && inData[i] > 0)
				lowest = inData[i];
			count++;
		}
			
		if (lowest == Number.MAX_VALUE)
			lowest = 0;

		if (count > 0)
			outData[bar] = lowest;
	}

	return (drawExBarNo - n + 1);
}

// RSI(n)
// Summation of price-up in all n price-up days /
// (Summation of price-up in all n price-up days + summation of price-down in all n price-down days)
function getRSI(n, tp)
{
	var sumUp = [];
	var sumDown = [];
	var avgSumUp = [];
	var avgSumDown = [];

	if (n <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n)
		return DEF_FAIL;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		barData[bar].techPane = [];
		barData[bar].techPane[tp] = [];
		barData[bar].chartTechPane = [];
		barData[bar].chartTechPane[tp] = [];
		
		for (j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techPane[tp][j] = 0;
			barData[bar].chartTechPane[tp][j] = 0;
		}
		sumUp[bar] = sumDown[bar] = 0;
		avgSumUp[bar] = avgSumDown[bar] = 0;
	}

	sumUp[startExBarNo + drawExBarNo - 1] = sumDown[startExBarNo + drawExBarNo - 1] = 0;
	for (bar = startExBarNo + drawExBarNo - 2; bar >= startExBarNo; bar--)
	{
		if (barData[bar].calcPrice > barData[bar + 1].calcPrice)
			sumUp[bar] = barData[bar].calcPrice - barData[bar + 1].calcPrice;
		else
			sumDown[bar] = barData[bar + 1].calcPrice - barData[bar].calcPrice;
	}

	if (lower == DEF_RSI)
	{
		getWiMA(n, sumUp, avgSumUp, false);
		getWiMA(n, sumDown, avgSumDown, false);
		/*
		if (rsiAveragingMethod.equals(labels.getString(DEF_EMA)))
		{
			getEMA(n, sumUp, avgSumUp, false);
			getEMA(n, sumDown, avgSumDown, false);
		}
		else if (rsiAveragingMethod.equals(labels.getString(DEF_WiMA)))
		{
			getWiMA(n, sumUp, avgSumUp, false);
			getWiMA(n, sumDown, avgSumDown, false);
		}
		else
		{
			getSMA(n, sumUp, avgSumUp, false);
			getSMA(n, sumDown, avgSumDown, false);
		}
		*/
	}

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo - n; bar++)
	{
		if (avgSumUp[bar] + avgSumDown[bar] > 0)
			barData[bar].techPane[tp][0] = (avgSumUp[bar] * 100 / (avgSumUp[bar] + avgSumDown[bar]));
	}

	return (drawExBarNo - n);
}

// STC(n1, n2, n3)
// Fast STC %K = (close price - n-day low) / (n-day high - n-day low) * 100
// Fast STC %D = MA(n2) of Fast STC %K
// Slow STC %K = Fast STC %D
// Slow STC %D = MA(n3) of Slow STC %K
function getStochastics(n1, n2, n3, tp)
{
	var nDayHigh, nDayLow, h3, l3;
	var fastK = [];
	var slowK = [];
	var slowD = [];
	var H3 = [];
	var L3 = [];

	if (n1 <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n1)
		return DEF_FAIL;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		for (j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techPane[tp][j] = 0;
			barData[bar].chartTechPane[tp][j] = 0;
		}

		H3[bar] = L3[bar] = fastK[bar] = slowK[bar] = slowD[bar] = 0;
	}

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		h3 = l3 = nDayHigh = 0;
		nDayLow = Number.MAX_VALUE;

		for (i = bar; i < bar + n1; i++)
		{
			if (i >= startExBarNo + drawExBarNo)
				break;

			//Stochastics will be calculated with VAPlus and VAMinus as high and low
			//if Modal Point method is used for calculation, as Prosticks considers
			//them as being more relevant statistics.
			if (chartCalcMethod == DEF_CALCBY_LAST)
			{
				if (nDayHigh < barData[i].h)
					nDayHigh = barData[i].h;

				if (nDayLow > barData[i].l)
					nDayLow = barData[i].l;
			}
			else if (chartCalcMethod == DEF_CALCBY_MP)
			{
				if (nDayHigh < barData[i].vap)
					nDayHigh = barData[i].vap;

				if (nDayLow > barData[i].vam)
					nDayLow = barData[i].vam;
			}
			else
			{
				if (nDayHigh < barData[i].h)
					nDayHigh = barData[i].h;

				if (nDayLow > barData[i].l)
					nDayLow = barData[i].l;
			}			
		}

		if (nDayHigh - nDayLow > 0)
			fastK[bar] = (barData[bar].calcPrice - nDayLow) / (nDayHigh - nDayLow) * 100;
		else
			fastK[bar] = 50;
	}

	// TRAD
	getTRAD(n1, n2, slowK);
	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
		barData[bar].techPane[tp][0] = slowK[bar];

	getSMA(n3, slowK, slowD, false);
	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
		barData[bar].techPane[tp][1] = slowD[bar];

	/*
	if (stcAveragingMethod.equals(labels.getString(DEF_TRAD)))
	{
		getTRAD(n1, n2, slowK);
		for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
			barData[bar].techPane[tp][0] = slowK[bar];

		getSMA(n3, slowK, slowD, false);
		for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
			barData[bar].techPane[tp][1] = slowD[bar];
	}
	else if (stcAveragingMethod.equals(labels.getString(DEF_SMA)))
	{
		getSMA(n2, fastK, slowK, false);
		for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
			barData[bar].techPane[tp][0] = slowK[bar];

		getSMA(n3, slowK, slowD, false);
		for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
			barData[bar].techPane[tp][1] = slowD[bar];
	}
	else
	{
		getEMA(n2, fastK, slowK, false);
		for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
			barData[bar].techPane[tp][0] = slowK[bar];

		getEMA(n3, slowK, slowD, false);
		for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
			barData[bar].techPane[tp][1] = slowD[bar];
	}
	*/

	return (drawExBarNo - n1);
}

//Momentum(n)
//Momentum = Current closing price - closing price n days ago
//This method calculates momentums and then returns two simple moving averages lines using
//sma1 and sma2 as the moving average periods.
function getMomentum(n, sma1, sma2, tp)
//n = calculation period in days
//sma1 = period for first stage of SMA smoothing
//sma2 = period for second stage of SMA smoothing
//tp = techPane number
{
	if (n <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n)
		return DEF_FAIL;

	//returnno is the number of bars to display on chart.
	var returnno = drawExBarNo - n;

	var momentum = [];

	//these will be initialised by getSMA()
	var momentum1 = [];
	var momentum2 = [];

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		//clearing old techPane values
		for (j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techPane[tp][j] = 0;
			barData[bar].chartTechPane[tp][j] = 0;
		}

		//storing new n-day momentums
		momentum[bar] = (bar < startExBarNo + drawExBarNo - n) ? (barData[bar].calcPrice - barData[bar+n].calcPrice) : 0;
	}

	getSMA(sma1, momentum, momentum1, false);
	getSMA(sma2, momentum1, momentum2, false);

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		barData[bar].techPane[tp][0] = momentum1[bar];
		barData[bar].techPane[tp][1] = momentum2[bar];
	}

	return (returnno);
}

// MACD(n1, n2, n3)
// MACD line = EMA(n1) - EMA(n2)
// Signal line = EMA(n3) of MACD line
// Strokes = MCAD line - Signal line
function getMACD(n1, n2, n3, tp)
{
	var macd = [];
	var ema1 = [];
	var ema2 = [];

	if (n1 <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n1)
		return DEF_FAIL;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		for (j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techPane[tp][j] = 0;
			barData[bar].chartTechPane[tp][j] = 0;
		}
	}

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		macd[bar] = barData[bar].calcPrice;
		ema1[bar] = ema2[bar] = 0;
	}

	getEMA(n1, macd, ema1, false);
	getEMA(n2, macd, ema2, false);

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		macd[bar] = ema1[bar] - ema2[bar];
		barData[bar].techPane[tp][0] = macd[bar];
		ema1[bar] = 0;
	}

	// Signal line
	getEMA(n3, macd, ema1, false);

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		barData[bar].techPane[tp][1] = ema1[bar];
		barData[bar].techPane[tp][2] = barData[bar].techPane[tp][0] - barData[bar].techPane[tp][1];
	}

	return (drawExBarNo - n1);
}

//ModalCount
//returns mc values from barData
function getModalCount(n1, tp)		//tp = techPane number
{
	//returnno is the number of bars to display on chart.
	var returnno = drawExBarNo;
	var mcBarNo = 0;
	var avgCount = float2int(getAverageMC(n1));

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		for (j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techPane[tp][j] = 0;
			barData[bar].chartTechPane[tp][j] = 0;
		}

		barData[bar].techPane[tp][0] = barData[bar].mc;
		barData[bar].techPane[tp][1] = avgCount;
	}

	return (returnno);
}

/**
 * Average MC
 *
 * @return Average MC
 */
function getAverageMC()
{
	return getAverageMC(0);
}

function getAverageMC(limit)
{
	var avgCount = 0;
	var mcBarNo = 0;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		if (barData[bar].mc >= 8)
		{
			avgCount += barData[bar].mc;
			mcBarNo++;
			
			if (limit > 0 && mcBarNo >= limit)
				break;
		}
	}

	if (mcBarNo > 0)
		avgCount /= mcBarNo;

	return (avgCount);
}


/**
 * Average Range
 *
 * @return Average Range
 */
function getAverageRange()
{
	var avgRange = 0;
	var barNo = 0;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		avgRange += Math.abs(barData[bar].h - barData[bar].w);
		if (Math.abs(barData[bar].h - barData[bar].w) > 0)
			barNo++;
	}

	if (barNo > 0)
		avgRange /= barNo;

	return (avgRange);
}


function getRange(n1, n2, tp)
{
	//returnno is the number of bars to display on chart.
	var returnno = drawExBarNo;
	var avgRange = 0;
	var barNo = 0;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		for (j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techPane[tp][j] = 0;
			barData[bar].chartTechPane[tp][j] = 0;
		}
		if (n2 == 1)
			barData[bar].techPane[tp][0] = Math.abs(barData[bar].vap - barData[bar].vam);
		else
			barData[bar].techPane[tp][0] = Math.abs(barData[bar].h - barData[bar].l);

		if (Math.abs(barData[bar].h - barData[bar].l) > 0 && barNo < n1)
		{
			avgRange += barData[bar].techPane[tp][0];
			barNo++;
		}
	}
		
	if (drawExBarNo > 0)
	{
		avgRange /= barNo;
		for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
			barData[bar].techPane[tp][1] = avgRange;
	}

	return (returnno);
}

function getADX(n, tp)
//n = period of calculation, in days
//tp = techPane number
{
	if (n < 0)
		return DEF_FAIL;

	if (drawExBarNo < n)
		return DEF_FAIL;

	//returnno is the number of bars to display on chart.
	var returnno = drawExBarNo - n;

	var TR;
	var pDM;
	var mDM;
	var pDI;
	var mDI;
	var DX;

	var TR14 = [];
	var pDM14 = [];
	var mDM14 = [];
	var ADX = [];
	//var ADXr =[];

	var EMAr = 2.0 / (n + 1.0);

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		for (j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techPane[tp][j] = 0;
			barData[bar].chartTechPane[tp][j] = 0;
		}

		TR14[bar] = 0;
		pDM14[bar] = 0;
		mDM14[bar] = 0;
	}

	ADX[startExBarNo + drawExBarNo - 1] = 0;
	//we cannot calculate values for bar = startExBarNo + drawExBarNo - 1, so leave it out of loop:
	for (bar = startExBarNo + drawExBarNo - 2; bar >= startExBarNo; bar--)
	{
		var r1, r2, r3;
		r1 = r2 = r3 = 0;

		//ADX will be calculated with VAPlus and VAMinus as high and low
		//if Modal Point method is used for calculation, as Prosticks considers
		//them as being more relevant statistics.

		//calculate the true range, which is the maximum of the following:
		//current high - current low,
		//current high - yesterday's close,
		//current low - yesterday's close.

		if (chartCalcMethod == DEF_CALCBY_MP)
		{
			r1 = Math.abs(barData[bar].vap - barData[bar].vam);
			r2 = Math.abs(barData[bar].vap - barData[bar+1].calcPrice);
			r3 = Math.abs(barData[bar].vam - barData[bar+1].calcPrice);
		}
		else
		{
			r1 = Math.abs(barData[bar].h - barData[bar].l);
			r2 = Math.abs(barData[bar].h - barData[bar+1].calcPrice);
			r3 = Math.abs(barData[bar].l - barData[bar+1].calcPrice);
		}

		TR = Math.max(r1, Math.max(r2, r3));

		//prevent division by zero errors later.
		if (TR == 0.0) TR = 0.0001;

		//calculate the directional movement indicators
		//using r1 and r2 as temp variables different from the usage above
		if (chartCalcMethod == DEF_CALCBY_MP)
		{
			r1 = barData[bar].vap - barData[bar+1].vap;
			r2 = barData[bar+1].vam - barData[bar].vam;
		}
		else
		{
			r1 = barData[bar].h - barData[bar+1].h;
			r2 = barData[bar+1].l - barData[bar].l;
		}

		//if r1 > r2 and r1 positive then +DM = r1 and -DM = 0
		//if r2 > r1 and r2 positive then +DM = 0 and -DM = r2
		//if r2 = r1 (otherwise) then +DM = -DM = 0
		pDM = (r1 > r2 && r1 > 0) ? r1 : 0;
		mDM = (r2 > r1 && r2 > 0) ? r2 : 0;

		TR14[bar]  = TR14[bar+1]  - (TR14[bar+1]  / n) + TR;
		pDM14[bar] = pDM14[bar+1] - (pDM14[bar+1] / n) + pDM;
		mDM14[bar] = mDM14[bar+1] - (mDM14[bar+1] / n) + mDM;

		if (TR14[bar] == 0)
			TR14[bar] = 0.0001;

		pDI = 100 * pDM14[bar] / TR14[bar];
		mDI = 100 * mDM14[bar] / TR14[bar];

		if ((pDI + mDI) == 0)
			DX = 100 * (pDI - mDI) / 0.0001;
		else
			DX = 100 * Math.abs(pDI - mDI) / (pDI + mDI);
		ADX[bar] = (ADX[bar+1] * (n - 1.0) + DX) / n;
		
		//console.log("bar " + bar + " ADX = " + ADX[bar]);

		barData[bar].techPane[tp][0] = ADX[bar];		// store ADX
		barData[bar].techPane[tp][1] = float2int(pDI * 10.0) / 10.0;		//+DI
		barData[bar].techPane[tp][2] = float2int(mDI * 10.0) / 10.0;		//-DI
		barData[bar].techPane[tp][3] = (ADX[bar] + ADX[bar + n]) / 2;		// ADXR
	}

	return (returnno);
}

function getVolume(tp)
{
	//returnno is the number of bars to display on chart.
	var returnno = drawExBarNo;
	
	if (drawExBarNo <= 0)
		return DEF_FAIL;

	for (var bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		for (var j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techPane[tp][j] = 0;
			barData[bar].chartTechPane[tp][j] = 0;
		}
	}
	
	for (var bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		if (barData[bar].volUnit == DEF_UNIT_K)
		{
			barData[bar].v *= 1000;
			barData[bar].volUnit = "";
		}

		barData[bar].techPane[tp][0] = barData[bar].v;
		barData[bar].volUnit = "";
	}

	return returnno;
}

function getVolumePlus(tp)
{
	//returnno is the number of bars to display on chart.
	var returnno = drawExBarNo;
	
	if (drawExBarNo <= 0)
		return DEF_FAIL;

	for (var bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		for (var j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techPane[tp][j] = 0;
			barData[bar].chartTechPane[tp][j] = 0;
		}
	}

	barData[startExBarNo + drawExBarNo-1].techPane[tp][0] = barData[startExBarNo + drawExBarNo-1].v;
	
	for (var bar = startExBarNo + drawExBarNo - 2; bar >= startExBarNo; bar--)
	{
		if (barData[bar].volUnit == DEF_UNIT_K)
		{
			barData[bar].v *= 1000;
			barData[bar].volUnit = "";
		}

		if (barData[bar].calcPrice > barData[bar+1].calcPrice)
			barData[bar].techPane[tp][0] = barData[bar].v;
		else
			barData[bar].techPane[tp][0] = -barData[bar].v;
		barData[bar].volUnit = "";
	}

	return returnno;
}

//On Balance Volume =
//Previous day's OBV + today's volume if today's close price > yesterday's close
//Previous day's OBV - today's volume if today's close price < yesterday's close
//Previous day's OBV if today's volume = yesterday's volume
//currently assuming that if previous day's OBV doesn't exist then OBV = today's volume
function getOBV(tp)
{
	//returnno is the number of bars to display on chart.
	var returnno = drawExBarNo;

	//clear oldest available bar's OBV and initialise to that day's volume.
	for (var j = 0; j < DEF_MAX_TECH_PARM; j++)
	{
		barData[startExBarNo + drawExBarNo - 1].techPane[tp][j] = 0;
		barData[startExBarNo + drawExBarNo - 1].chartTechPane[tp][j] = 0;
	}
	barData[startExBarNo + drawExBarNo - 1].techPane[tp][0] = barData[startExBarNo + drawExBarNo - 1].v;

	//calculation of OBVs begin from the second oldest bar available.
	for (var bar = startExBarNo + drawExBarNo - 2; bar >= startExBarNo; bar--)
	{
		//clearing old techPane values
		for (var j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techPane[tp][j] = 0;
			barData[bar].chartTechPane[tp][j] = 0;
		}

		//storing new OBVs
		if (barData[bar].calcPrice > barData[bar+1].calcPrice)
		{
			barData[bar].techPane[tp][0] = barData[bar+1].techPane[tp][0] + barData[bar].v;
		}
		else if (barData[bar].calcPrice < barData[bar+1].calcPrice)
		{
			barData[bar].techPane[tp][0] = barData[bar+1].techPane[tp][0] - barData[bar].v;
		}
		else
		{
			barData[bar].techPane[tp][0] = barData[bar+1].techPane[tp][0];
		}
	}

	return (returnno);
}

//Money Flow Index (n)
//MFI(n) = 100 * (positive money flow over n days) / (total of +ve and -ve) money flow over n days)
//+ve money flow for 1 day = avgPrice * volume if today's avgPrice > yesterday's avgPrice,
//and 0 otherwise.
//-ve money flow for 1 day = avgPrice * volume if today's avgPrice < yesterday's avgPrice
//and 0 otherwise.
//avgPrice for one day = (day high + day low + day close)/3
function getMoneyFlow(n, tp)
//n = period of calculation, in days
//tp = techPane number
{
	if (n <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n)
		return DEF_FAIL;

	//	The return statements depend on your point of view. Since the MFI
	// depends on a n-day SMA, it's debatable whether you consider the
	// first n bars to be valid data points or not.

	//returnno is the number of bars to display on chart.
	var returnno = drawExBarNo;

	var plusMF = [];
	var minusMF = [];
	var plusMFavg = [];
	var minusMFavg = [];
	var prevAvg = 0;
	var average = 0;

	for (var bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		//clearing old techPane values
		for (var j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techPane[tp][j] = 0;
			barData[bar].chartTechPane[tp][j] = 0;
		}

		//calculate MFI
		plusMF[bar] = 0;
		minusMF[bar] = 0;
	}

	//initialising arrays where not defined since previous dependent values are not available.
	//same values as given in previous chart technical program, but no reason given.
	plusMF[startExBarNo + drawExBarNo - 1] = 50000;
	minusMF[startExBarNo + drawExBarNo - 1] = 50000;

	//calculate +/- money flow.
	prevAvg = (barData[startExBarNo + drawExBarNo - 1].h + barData[startExBarNo + drawExBarNo - 1].l + barData[startExBarNo + drawExBarNo - 1].calcPrice)/3.0;
	for (var bar = startExBarNo + drawExBarNo - 2; bar >= startExBarNo; bar--)
	{
		if (chartCalcMethod == DEF_CALCBY_MP)
			average = (barData[bar].vap + barData[bar].vam + barData[bar].calcPrice)/3.0;
		else
			average = (barData[bar].h + barData[bar].l + barData[bar].calcPrice)/3.0;
		
		plusMF[bar] = (average > prevAvg) ? (barData[bar].v * average) : 0;
		minusMF[bar] = (average < prevAvg) ?  (barData[bar].v * average) : 0;
		prevAvg = average;

	}
	//take averages of +/- MF. the n in the denominator of the averages
	//will cancel out in the calculation of the Money Flow Index, so this is
	//effectively taking the sum of +/- money flow in the given period.
	getSMA(n, plusMF, plusMFavg, false);
	getSMA(n, minusMF, minusMFavg, false);

	for (var bar = startExBarNo; bar < startExBarNo + returnno; bar++)
	{
		//calculate MFI
		barData[bar].techPane[tp][0] = (plusMFavg[bar] + minusMFavg[bar] == 0) ? 0 : (100 * plusMFavg[bar] / (plusMFavg[bar] + minusMFavg[bar]));
	}

	return (returnno);
}

// Williams %R (n)
// [(highN - current close)/(highN - lowN)] * 100
// highN = highest high of the last n days
// lowN = lowest low of the last n days
function getPercentR(n, tp)
//n = period of calculation, in days
//tp = techPane number
{
	var highN=[];
	var lowN=[];

	if (n <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n)
		return DEF_FAIL;

	//returnno is the number of bars to display on chart.
	var returnno = drawExBarNo - n + 1;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		for (j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techPane[tp][j] = 0;
			barData[bar].chartTechPane[tp][j] = 0;
		}
		//set highN as current high and lowN as current low, necessary for reselection below
		if (chartCalcMethod == DEF_CALCBY_MP)
		{
			highN[bar] = barData[bar].vap;
			lowN[bar] = barData[bar].vam;
		}
		else
		{
			highN[bar] = barData[bar].h;
			lowN[bar] = barData[bar].l;
		}
	}

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo - n + 1; bar++)
	{
		//find highN and lowN for that particular bar
		for (i = 0; i < n; i++)
		{
			if (chartCalcMethod == DEF_CALCBY_MP)
			{
				if (barData[bar+i].vap > highN[bar])
					highN[bar] = barData[bar+i].vap;
				if (barData[bar+i].vam < lowN[bar])
					lowN[bar] = barData[bar+i].vam;
			}
			else
			{
				if (barData[bar+i].h > highN[bar])
					highN[bar] = barData[bar+i].h;
				if (barData[bar+i].l < lowN[bar])
					lowN[bar] = barData[bar+i].l;
			}
		}
		//calculate and store data
		if (highN[bar] != lowN[bar])
			barData[bar].techPane[tp][0] = -100 * (highN[bar] - barData[bar].calcPrice) / (highN[bar] - lowN[bar]);
		else
			barData[bar].techPane[tp][0] = -100;
	}

	return (returnno);
}

//Rate of change(n)
//(current closing price/ closing price n days ago) * 100
function getROC(n, tp)
//n = calculation period
//tp = techPane number
{
	if (n <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n)
		return DEF_FAIL;


	//returnno is the number of bars to display on chart.
	var returnno = drawExBarNo - n;

	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		//clearing old techPane values
		for (j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techPane[tp][j] = 0;
			barData[bar].chartTechPane[tp][j] = 0;
		}

		//storing new n-day momentums
		if (bar < startExBarNo + drawExBarNo - n)
		{
			barData[bar].techPane[tp][0] = 100 * barData[bar].calcPrice / barData[bar+n].calcPrice;
		}
	}

	return (returnno);
}

//Volatility(n)
//Estimated annual volatility from data over n trading days
//the data (x) to be measured is ln(current closing price/ previous closing price)
//Calculate variance = [Sum(x^2) - [(Sum(x))^2]/n]/n
//Therefore estimated annual variance = variance * 250 (based on 1 year = 250 trading days)
//Volatility = 100 * estimated annual standard deviation = 100 * sqrt(variance * 250)
//why 100? present in last version of source code, no idea otherwise.
function getVolatility(n, tp)
//n = period of calculation, in days
//tp = techPane number
{
	if (n <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n)
		return DEF_FAIL;

	//returnno is the number of bars to display on chart.
	var returnno = drawExBarNo - n;

	var annual_trading_days = 250.0;
	var data = [];

	// clear/initialise arrays
	for (bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		//clearing old techPane values
		for (j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techPane[tp][j] = 0;
			barData[bar].chartTechPane[tp][j] = 0;
		}
		data[bar] = 0;
	}

	for (bar = startExBarNo + drawExBarNo - 2; bar >= startExBarNo; bar--)
	{
		data[bar] = Math.log(barData[bar].calcPrice / barData[bar+1].calcPrice);
	}

	var sum = 0.0;		//sum of data
	var ssq = 0.0;		//sum of squares of data

	//data collection for the oldest n days where we cannot yet calculate volatility.
	for (bar = startExBarNo + drawExBarNo - 2; bar > startExBarNo + drawExBarNo - 2 - n; bar--)
	{
		sum += data[bar];
		ssq += data[bar] * data[bar];
	}
	barData[startExBarNo + drawExBarNo - 1 - n].techPane[tp][0] = 100.0 * Math.sqrt(annual_trading_days * (ssq/n - (sum/n)*(sum/n)));

	for (bar = startExBarNo + drawExBarNo - 2 - n; bar >= startExBarNo; bar--)
	{
		sum = sum - data[bar+n] + data[bar];
		ssq = ssq - (data[bar+n]*data[bar+n]) + (data[bar]*data[bar]);
		if (ssq * n > sum * sum)
			barData[bar].techPane[tp][0] = 100.0 * Math.sqrt(annual_trading_days * (ssq/n - (sum/n)*(sum/n)));
		else
			barData[bar].techPane[tp][0] = 0;
	}

	return (returnno);
}


//Volume Acculmation Oscillator (VAO)
//              (CL - L) - (H - CL)
//              -----------------------   * V
//VAO =          (H - L)
//             --------------------------------
//                        1000
function getVAO( tp)
{
	if (drawExBarNo <= 0)
		return DEF_FAIL;

	//returnno is the number of bars to display on chart.
	var returnno = drawExBarNo;

	//clear old techPane values
	for (var bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		for (var j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techPane[tp][j] = 0;
			barData[bar].chartTechPane[tp][j] = 0;
		}

		//storing new VAO values
		barData[bar].techPane[tp][0] = ((((barData[bar].calcPrice - barData[bar].l) - (barData[bar].h - barData[bar].calcPrice)) / (barData[bar].h -
			barData[bar].l)) * barData[bar].v) / 1000;
		
	}
	return (returnno);
}

//Commodity Channel Index (CCI)
//n = number of periods
function getCCI( n,  tp)
{
	if (n <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n)
		return DEF_FAIL;

	var returnno = drawExBarNo - n + 1;

	var MA = [];
	var TP = [];
	var MD = 0;

	for (var bar = startExBarNo; bar < startExBarNo + drawExBarNo; bar++)
	{
		for (var j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techPane[tp][j] = 0;
			barData[bar].chartTechPane[tp][j] = 0;
		}
		TP[bar] = (barData[bar].h + barData[bar].l + barData[bar].c)/3;  //calculates typical price
		barData[bar].techPane[tp][0] = TP[bar];
	}

	getSMA(n, TP, MA, true);

	for (var bar = startExBarNo + n - 1; bar < startExBarNo + drawExBarNo; bar++)
	{
		MD = 0;
		for (var i = n - 1; i > -1; i--)
			MD += Math.abs(TP[bar-i] - MA[bar-i]);
		MD = MD / n * .015;
		if (MD != 0)
			barData[bar - n + 1].techPane[tp][0] = (TP[bar-n+1] - MA[bar-n+1]) / MD;  //calculates CCI
		else
			barData[bar - n + 1].techPane[tp][0] = 0;
	}

	return (returnno);
}


//Average True Range (ATR)
function getATR( n, tp)
{
	if (n <= 0)
		return DEF_FAIL;

	if (drawExBarNo < n)
		return DEF_FAIL;

	var returnno = drawExBarNo - n + 1;

	var hl = [];
	var ch = [];
	var cl = [];
	var trange = [];
	var atr = [];

	for (var bar = startExBarNo; bar < startExBarNo + drawExBarNo - n + 1; bar++)
	{
		for (var j = 0; j < DEF_MAX_TECH_PARM; j++)
		{
			barData[bar].techPane[tp][j] = 0;
			barData[bar].chartTechPane[tp][j] = 0;
		}
	}

	for (var bar = startExBarNo; bar < startExBarNo + drawExBarNo-1; bar++)
	{
		hl[bar] = Math.abs(barData[bar].h - barData[bar].l);
		ch[bar] = Math.abs(barData[bar + 1].c - barData[bar].h);
		cl[bar] = Math.abs(barData[bar + 1].c - barData[bar].l);

		if (hl[bar] > ch[bar])
		{
			if (hl[bar] > cl[bar])
				trange[bar] = hl[bar];
		}
		if (ch[bar] > cl[bar])
		{
			if (ch[bar] > hl[bar])
				trange[bar] = ch[bar];
		}
		if (cl[bar] > hl[bar])
		{
			if (cl[bar] > ch[bar])
				trange[bar] = cl[bar];
		}
	}

	getSMA(n, trange, atr, false);

	for (var bar = startExBarNo; bar < startExBarNo + drawExBarNo - n + 1; bar++)
	{
		barData[bar].techPane[tp][0] = atr[bar];
	}

	return returnno;
}


// Compute pixel values of each bar
function compXScale(ctx)
{
	var preOffsetXS = offsetXS;	// Determine if offsetXS has changed or not

	// X scale width
	offsetXS = float2int(ctx.canvas.width * 0.1);	// 0.18 is chosen for your viewing pleasure

	if (offsetXS > DEF_MAX_OFFSET_XS)	// Exceed limit?
		offsetXS = DEF_MAX_OFFSET_XS;

	// Adjust font size
	var adjFontSize = 0;
	if (preOffsetXS != offsetXS)
	{
		// Approximately 35-pixel width of offsetXS is enough for font with size 10
		// For every change of 10-pixel width for offsetXS,
		// increment or decrement font size by 1
		adjFontSize = (offsetXS - 35) / 10;
		//setFont(new Font(DEF_CHART_FONT, Font.PLAIN, 10 + adjFontSize));
		//lastPriceLabel.setFont(DEF_CHART_FONT, Font.PLAIN, 10 + adjFontSize);
	}

	// Determine bar width
	var	drawWidth = ctx.canvas.width - offsetXS - offsetXX - offsetXM - offsetXG; //Drawable width

	//console.log("drawWidth = " + drawWidth + ", drawBarNo = " + drawBarNo + ", drawExBarNo = " + drawExBarNo);
		
	if ((drawBarNo > 0) && (drawExBarNo > 0))
	{
		var minWidth;
		var minBarWidth;
		var minBarHand;
		var maxBarWidth;
		var maxBarHand;

		switch (typeChart)
		{
			case DEF_CANDLE_CHART:
			case DEF_MCANDLE_CHART:
			case DEF_PCANDLE_CHART:
				//minBarWidth = 1;
				//minBarHand = 0;
				minBarWidth = DEF_MIN_PRO_BAR_WIDTH;
				minBarHand = DEF_MIN_PRO_BAR_HAND;
				maxBarWidth = DEF_MAX_PRO_BAR_WIDTH;
				maxBarHand = 0;
			break;
			case DEF_BAR_CHART:
			case DEF_BAR_MODAL_CHART:
			case DEF_BAR_MODAL_VOL_CHART:
				//minBarWidth = 1;
				//minBarHand = 0;
				minBarWidth = DEF_MIN_PRO_BAR_WIDTH;
				minBarHand = DEF_MIN_PRO_BAR_HAND;
				maxBarWidth = 3;
				maxBarHand = 3;
			break;
			case DEF_LINE_CHART:
			case DEF_MODAL_LINE_CHART:
			case DEF_MODAL_LINE_VOL_CHART:
				minBarWidth = 1;
				minBarHand = 0;
				maxBarWidth = 3;
				maxBarHand = 0;
			break;
			case DEF_PROSTICKS_CHART:
			case DEF_PROSTICKS_VOL_CHART:
				//minBarWidth = 1;
				//minBarHand = 0;
				minBarWidth = DEF_MIN_PRO_BAR_WIDTH;
				minBarHand = DEF_MIN_PRO_BAR_HAND;
				maxBarWidth = DEF_MAX_PRO_BAR_WIDTH;
				maxBarHand = DEF_MAX_PRO_BAR_HAND;
			break;
			default:
				minBarWidth = DEF_MIN_PRO_BAR_WIDTH;
				minBarHand = DEF_MIN_PRO_BAR_HAND;
				maxBarWidth = DEF_MAX_PRO_BAR_WIDTH;
				maxBarHand = DEF_MAX_PRO_BAR_HAND;
			break;
		}
			
		//console.log("minBarWidth = " + minBarWidth + ", minBarHand = " + minBarHand);
		//console.log("maxBarWidth = " + maxBarWidth + ", maxBarHand = " + maxBarHand);

		// Try the case with no spacing between two bars to see
		minWidth = minBarWidth + 2 * minBarHand;

		if (drawWidth < drawBarNo * (minWidth + DEF_MIN_BAR_SPACING))
		{
			if (drawBarNo > (float2int(drawWidth / minWidth)))
				drawBarNo = float2int(drawWidth / minWidth);
			barWidth = minBarWidth;
			barHand = minBarHand;
			barSpacing = 0;
			mpDiameter = DEF_MIN_PRO_MP_DIAMETER;
			mpRadius = DEF_MIN_PRO_MP_RADIUS;
		}
		else
		{
			minWidth = minBarWidth + 2 * minBarHand + DEF_MIN_BAR_SPACING;

			// To draw a bar, it requires at least DEF_MIN_PROSTICKS pixels.
			// Determine if this limit is exceeded
			if ((drawWidth >= drawBarNo * minWidth) &&
				(drawWidth < drawBarNo * (minWidth + 1)))
			{
				barWidth = minBarWidth;
				barHand = minBarHand;
				barSpacing = DEF_MIN_BAR_SPACING;
				mpDiameter = DEF_MIN_PRO_MP_DIAMETER;
				mpRadius = DEF_MIN_PRO_MP_RADIUS;
			}
			else
			{
				// Determine width for each bar
				// Prosticks
				var count = 3;
				var barNewWidth;
				var barNewHand;
				var barNewSpacing;
				var totalWidth;

				barNewWidth = minBarWidth;
				barNewHand = minBarHand + 0.5;
				barNewSpacing = DEF_MIN_BAR_SPACING;
				totalWidth = drawBarNo * float2int(barNewWidth + 2 * barNewHand + barNewSpacing);
					
				while (totalWidth <= drawWidth)
				{
					if (typeChart == DEF_CANDLE_CHART)
					{
						barWidth = float2int(barNewWidth);
						barHand = 0;
						barSpacing = float2int(barNewSpacing) + 2 * float2int(barNewHand);
					}
					else
					{
						barWidth = float2int(barNewWidth);
						barHand = float2int(barNewHand);
						barSpacing = float2int(barNewSpacing);
					}
					if (count % 3 == 0)
						barNewWidth = barNewWidth * 2;	// 1.4 is chosen by best viewing
					else if (count % 3 == 1)
						barNewHand = barNewHand * 2;	// 1.8 is chosen by best viewing
					else if (count % 3 == 2)
						barNewSpacing = barNewSpacing * 2;	// 1.5 is chosen by best viewing

					if (barNewWidth > maxBarWidth)
						barNewWidth = maxBarWidth;

					if (barNewHand > maxBarHand)
						barNewHand = maxBarHand;

					totalWidth = drawBarNo * (float2int(barNewWidth) + 2 * float2int(barNewHand) + float2int(barNewSpacing));
						
					count++;
				}

				if (drawWidth - (float2int(barWidth) + 2 * float2int(barHand) + float2int(barSpacing)) > 30)
					isRescale = true;
				else
					isRescale = false;
			} // end else block of: if ((drawWidth >= drawBarNo * minWidth) &&
				//                      (drawWidth < drawBarNo * (minWidth + 1)))
		} // end else block of: if (drawWidth < drawBarNo * (minWidth + DEF_MIN_BAR_SPACING))

		// By now, barWidth, barHand and barSpacing store optimized values for each bar
		mpDiameter = float2int(barWidth / 2);

		if (mpDiameter < DEF_MIN_PRO_MP_DIAMETER)
			mpDiameter = DEF_MIN_PRO_MP_DIAMETER;

		if (mpDiameter > DEF_MAX_PRO_MP_DIAMETER)
			mpDiameter = DEF_MAX_PRO_MP_DIAMETER;

		mpRadius = float2int(mpDiameter / 2);	// Compute radius

		if (mpRadius < DEF_MIN_PRO_MP_RADIUS)
			mpRadius = DEF_MIN_PRO_MP_RADIUS;
	}

	if (drawBarNo >= drawExBarNo - startBarNo)
		drawBarNo = drawExBarNo - startBarNo;
}

function compYScale(ctx)
{
	offsetYS = float2int(ctx.canvas.height * 0.1);

	if (offsetYS > DEF_MAX_OFFSET_YS)
		offsetYS = DEF_MAX_OFFSET_YS;

	if (techPaneNo > 0)
	{
		// offsetTS is the height of techPane
		offsetTS = float2int(ctx.canvas.height * (0.2 - techPaneNo * 0.02));

		if (offsetTS > DEF_MAX_OFFSET_TS)
			offsetTS = DEF_MAX_OFFSET_TS;

		// offsetTB is the height of techPaneBar
		offsetTB = float2int(offsetTS * 0.2);

		if (offsetTB > DEF_MAX_OFFSET_TB)
			offsetTB = DEF_MAX_OFFSET_TB;
	}
	else
		offsetTS = offsetTB = 0;

	if ((drawBarNo <= 0) || (drawExBarNo <= 0))
		return;

	// drawHeight is height of drawable area (Entire drawable height - total techPane height - margin offset)
	var	drawHeight = ctx.canvas.height - offsetYS - offsetYY - techPaneNo * offsetTS - offsetYT - offsetYM;	// Drawable height

	if (drawHeight <= 0)
		return;

	// Find maximum value and minimum on Y axis
	maxHigh = 0;
	minLow = Number.MAX_VALUE;
	yRatio = 0;	// yRatio is y-axis scale in pixels

	//console.log("startBarNo = "+startBarNo + ", drawBarNo = " + drawBarNo);

	// Find maxHigh and minLow of all data (not including overlay tech values)
	for (bar = startBarNo; bar < startBarNo + drawBarNo; bar++)	//
	{
		//console.log(bar + " : high = "+barData[bar].h + ", low = "+barData[bar].l);
		if (barData[bar].h > maxHigh)
			maxHigh = barData[bar].h;

		if (barData[bar].l > 0)
		{
			if (barData[bar].l < minLow)
				minLow = barData[bar].l;
		}
	}

	//console.log("minLow = "+minLow + ", maxHigh = "+maxHigh );

	var minBar = drawBarNo;	// minBar is the minimum of drawBarNo and tech bar no.

	// Including overlay tech values for maxHigh and minLow
	for (i = 0; i < techOverlayNo; i++)
	{
		for (j = 0; j < techOverlayBar[i].length; j++)
		{
			if (techOverlayBar[i][j] < drawBarNo)
				minBar = techOverlayBar[i][j];
			else
				minBar = drawBarNo;

			var startNo;
			startNo = startBarNo;
			for (var bar = startNo; bar < startBarNo + minBar; bar++)
			{
				if (bar >= (startExBarNo + techOverlayBar[i][j]) || barData[bar].techOverlay[i][j] <= 0)
					continue;

				if (barData[bar].techOverlay[i][j] > maxHigh)
					maxHigh = barData[bar].techOverlay[i][j];

				if (barData[bar].techOverlay[i][j] < minLow)
					minLow = barData[bar].techOverlay[i][j];
			}
		}
	}
	
	// Optimize Y scale
	var multiRatio;
	var multiScale;
	var rndMinLow;
	var rndMaxHigh;

	// Caution when minLow = 0
	if ((minLow > 0) || (minLow < 0))
		multiRatio = minLow / DEF_BASE_VALUE;
	else
		multiRatio = maxHigh / DEF_BASE_VALUE;
	multiScale = 0;
	rndMinLow = minLow;
	rndMaxHigh = maxHigh;

	if (multiRatio < 0)
		multiRatio *= -1;

	while ( float2int(multiRatio) < 1)
	{
		multiRatio *= 10;
		multiScale += 1;
		rndMinLow *= 10;
		rndMaxHigh *= 10;

		if (multiScale > 10)
				break;
	}

	var pixelScale = 20;
	var baseScale = 1;
	var rndScale;
	var currentScale;
	var count;

	while (true)
	{
		baseScale = float2int(drawHeight / pixelScale);

		// If no. of prices is greater than 10,
		// then choose a larger scale by having each scale i increase by 5 pixels
		if (baseScale > 10)
			pixelScale += 5;
		else
		{
			rndScale = float2int((rndMaxHigh - rndMinLow) / baseScale);
			count = 0;

			finalScale = currentScale = 1;
			while (currentScale < rndScale)
			{
				if (count == DEF_OPT_SCALE.length)
				{
					finalScale *= 10;
					count = 0;
				}

				currentScale = float2int(finalScale * DEF_OPT_SCALE[count++]);
			}
			finalScale = currentScale;
			break;
		}
	}

	drawMinLow = float2int(rndMinLow) - float2int(rndMinLow) % finalScale;
	drawMaxHigh = float2int(rndMaxHigh) - float2int(rndMaxHigh) % finalScale;

	for (i = 0; i < multiScale; i++)
	{
		drawMinLow /= 10;
		drawMaxHigh /= 10;
		finalScale /= 10;
	}

	if (drawMinLow > minLow)
		drawMinLow -= finalScale;

	if (drawMaxHigh < maxHigh)
		drawMaxHigh += finalScale;

	yRatio = (drawMaxHigh - drawMinLow) / drawHeight;

	if (yRatio > 0)
	{
		for (bar = startBarNo; bar < startBarNo + drawBarNo; bar++)
		{
			barData[bar].chartOpen		= float2int((drawMaxHigh - barData[bar].o)	/ yRatio + offsetYT + offsetYM);
			barData[bar].chartHigh		= float2int((drawMaxHigh - barData[bar].h)	/ yRatio + offsetYT + offsetYM);
			barData[bar].chartLow		= float2int((drawMaxHigh - barData[bar].l)	/ yRatio + offsetYT + offsetYM);
			barData[bar].chartLast		= float2int((drawMaxHigh - barData[bar].c)	/ yRatio + offsetYT + offsetYM);
			barData[bar].chartVaplus	= float2int((drawMaxHigh - barData[bar].vap)/ yRatio + offsetYT + offsetYM);
			barData[bar].chartVaminus	= float2int((drawMaxHigh - barData[bar].vam)/ yRatio + offsetYT + offsetYM);
			barData[bar].chartMp		= float2int((drawMaxHigh - barData[bar].mp)	/ yRatio + offsetYT + offsetYM);

			barData[bar].chartMOpen		= float2int((drawMaxHigh - barData[bar].mopen)	/ yRatio + offsetYT + offsetYM);
			barData[bar].chartMClose	= float2int((drawMaxHigh - barData[bar].mclose)	/ yRatio + offsetYT + offsetYM);
			barData[bar].chartPOpen		= float2int((drawMaxHigh - barData[bar].popen)	/ yRatio + offsetYT + offsetYM);
			barData[bar].chartPClose	= float2int((drawMaxHigh - barData[bar].pclose)	/ yRatio + offsetYT + offsetYM);

			if (barData[bar].ut > 0)
				barData[bar].chartUt	= float2int((drawMaxHigh - barData[bar].ut) / yRatio + offsetYT + offsetYM);
			if (barData[bar].lt > 0)
				barData[bar].chartLt	= float2int((drawMaxHigh - barData[bar].lt) / yRatio + offsetYT + offsetYM);
			
			//console.log("bar["+bar+"] : " + barData[bar].chartPOpen + "," + barData[bar].chartPClose);
		}

		//
		for (i= 0; i < techOverlayNo; i++)
		{
			//for (j = 0; j < techOverlayParm[i]; j++)
			for (j = 0; j < techOverlayBar[i].length; j++)
			{
				if (techOverlayBar[i][j] < drawBarNo)
					minBar = techOverlayBar[i][j];
				else
					minBar = drawBarNo;

				for (bar = startBarNo; bar < startBarNo + minBar; bar++)
				{
					barData[bar].chartTechOverlay[i][j] = float2int((drawMaxHigh - barData[bar].techOverlay[i][j]) / yRatio + offsetYT + offsetYM);
					//console.log(barData[bar].techOverlay[i][j] + " vs " + barData[bar].chartTechOverlay[i][j]);
				}
			}			
		}
		//

		chartMinLow = float2int((drawMaxHigh - drawMinLow) / yRatio + offsetYT + offsetYM);
		chartMaxHigh = float2int((drawMaxHigh - drawMaxHigh) / yRatio + offsetYT + offsetYM);
	}

	countFinalScaleDecPlaces = finalScale;
	scaleAdjustFactor = 1;

	while (Math.ceil(countFinalScaleDecPlaces) > countFinalScaleDecPlaces && scaleAdjustFactor < 10000)
	{
		countFinalScaleDecPlaces *= 10.0;
		scaleAdjustFactor *= 10.0;
	}
	//console.log("drawMinLow = "+drawMinLow + ", drawMaxHigh = "+drawMaxHigh);
	//console.log("barData[0].chartLast = " + barData[0].chartLast);
}

function drawAxis(ctx)
{
	//console.log("drawAxis...");
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	var x = ctx.canvas.width - offsetXS - offsetXX + 1;
	var y = ctx.canvas.height - offsetYS - offsetYY + 1;
	
	ctx.beginPath();
	ctx.strokeStyle = DEF_AXIS_COLOR;
	
	ctx.moveTo(x, y);
	ctx.lineTo(offsetXM, y);
	ctx.stroke();

	ctx.moveTo(x, y);
	ctx.lineTo(x, offsetYM);
	ctx.stroke();
	ctx.closePath();
}

function drawDebug(ctx, strText)
{
	//ctx.fillRect(2, 32, 50, 10);
	ctx.clearRect(2, 22, 50, 10);
	ctx.fillText(strText, 2, 32);
}

function updateTitle(ctx)
{
	ctx.clearRect(0, 0, ctx.canvas.width, offsetYM);
	drawTitle(ctx);
}

function drawAddOns(ctx)
{
	// supportMP / resistMP / latestMP / averageMC / latestMC
	var supportText;
	var resistText;
	var MPText;
	
	if (supportMP)
	{
		supportText = _lang.getStr("support") + " : " + supportMP.toFixed(dps);
		
		if (bullCode)
		{
			supportText += " ("+_lang.getStr("bull")+" : " + bullCode;
			if (bullCallLevel)
				supportText += " X" + bullCallLevel; 
			supportText += ")";
		}
			
		ctx.font = DEF_FONT;
		ctx.fillStyle = DEF_SUPPORT_COLOR;
		ctx.fillText(supportText, offsetXM, ctx.canvas.height - offsetYS - offsetYY - techPaneNo * offsetTS - 5);
	}
	
	if (resistMP)
	{
		resistText = _lang.getStr("resistance") + " : " + resistMP.toFixed(dps);

		if (bearCode)
		{
			resistText += " ("+_lang.getStr("bear")+" : " + bearCode;
			if (bearCallLevel)
				resistText += " X" + bearCallLevel; 
			resistText += ")";
		}

		ctx.font = DEF_FONT;
		ctx.fillStyle = DEF_RESISTANCE_COLOR;
		ctx.fillText(resistText, offsetXM, ctx.canvas.height - offsetYS - offsetYY - techPaneNo * offsetTS - 5 - 12);
	}

	if (latestMP)
	{
		MPText = _lang.getStr("latest_mp") + " : " + latestMP.toFixed(dps) + " ( " + latestMC + " / " + averageMC + " )";
		ctx.font = DEF_FONT;
		ctx.fillStyle = DEF_TITLE_COLOR;
		ctx.fillText(MPText, ctx.canvas.width - offsetXS - ctx.measureText(MPText).width - 20, ctx.canvas.height - offsetYS - offsetYY - techPaneNo * offsetTS - 5);
	}
}

function drawTitle(ctx)
{
	var textString;
	var date;

	if (activeBar <= DEF_MAX_RIGHT_SHIFT)
		activeBar = DEF_MAX_RIGHT_SHIFT;

	if (interval <= DEF_MONTH)
	{
		date = new Date(barData[activeBar].dt.toString().replace(
			    /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)$/,
			    "$2/$3/$1 $4:$5"
			));
		try
		{
			strDate = date.format(DEF_TITLE_DATE_FORMAT);
		}
		catch (err) { strDate = "" };
	}
	else
	{
		/*
		date = new Date(barData[activeBar].dt.toString().replace(
			    /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)$/,
			    "$2/$3/$1 $4:$5 GMT"
			));
		*/
		date = new Date(barData[activeBar].localtime.toString().replace(
			    /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)$/,
			    "$2/$3/$1 $4:$5"
			));
		try
		{
			strDate = date.format(DEF_TITLE_DATETIME_FORMAT);
		}
		catch (err) { strDate = "" };
	}
	
	textString = code + " " + DEF_INTERVAL_TEXT[interval] + " - " + strDate + " "+_lang.getStr("o")+" " + barData[activeBar].o + " "+_lang.getStr("h")+" " + barData[activeBar].h + " "+_lang.getStr("l")+" " + barData[activeBar].l + " "+_lang.getStr("c")+" " + barData[activeBar].c;
	if (typeChart == DEF_PROSTICKS_CHART || typeChart == DEF_BAR_MODAL_CHART || typeChart == DEF_MODAL_LINE_CHART)
		textString += " "+_lang.getStr("mpc")+" " + barData[activeBar].mp + "("+barData[activeBar].mc + ") "+_lang.getStr("ar")+" " + barData[activeBar].vam + " - " + barData[activeBar].vap;
	if (typeChart == DEF_PROSTICKS_VOL_CHART || typeChart == DEF_BAR_MODAL_VOL_CHART || typeChart == DEF_MODAL_LINE_VOL_CHART)
		textString += " "+_lang.getStr("mpc")+" " + barData[activeBar].mp + "(" + barData[activeBar].mc + ") "+_lang.getStr("ar")+" " + barData[activeBar].vam + " - " + barData[activeBar].vap;

	for (var i = 0; i < techOverlayNo; i++)
	{
		var techParamText, techValueText;
			
		techParamText = "";
		techValueText = "";
		/*
		techValueText = "(";
		for (var j = 0; j < techOverlayParm[i].length; j++)
		{
			if (techOverlayValue[i][j] > 0)
			{
				if (techValueText != "(")
					techValueText += ", ";
				techValueText += techOverlayParm[i][j];
			}
		}
		techValueText += ")";
		*/

		//console.log("activeBar = " + activeBar);

		if ( barData[activeBar].techOverlay && barData[activeBar].techOverlay[i][0] )
		{
			if (techOverlayName[i] == DEF_UTECH_TEXT[DEF_BOLL] || techOverlayName[i] == DEF_UTECH_TEXT[DEF_KC])
			{
				techValueText += (barData[activeBar].techOverlay[i][0]).toFixed(dps) + ", " + (barData[activeBar].techOverlay[i][1]).toFixed(dps) + ", " + (barData[activeBar].techOverlay[i][2]).toFixed(dps);
			}
			else if (techOverlayName[i] == DEF_UTECH_TEXT[DEF_MAE])
			{
				techValueText += (barData[activeBar].techOverlay[i][0]).toFixed(dps) + ", " + (barData[activeBar].techOverlay[i][1]).toFixed(dps);
			}
			else if (techOverlayName[i] == DEF_UTECH_TEXT[DEF_IKH])
			{
				techValueText += (barData[activeBar].techOverlay[i][0]).toFixed(dps) + ", " + (barData[activeBar].techOverlay[i][1]).toFixed(dps) + ", " + (barData[activeBar].techOverlay[i][2]).toFixed(dps)  + ", " + (barData[activeBar].techOverlay[i][3]).toFixed(dps) + ", " + (barData[activeBar].techOverlay[i][dps]).toFixed(dps);
			}
			else if (techOverlayName[i] == DEF_UTECH_TEXT[DEF_SAR])
			{
				techValueText += (barData[activeBar].techOverlay[i][0]).toFixed(dps);
			}
			else
			{
				// SMA, EMA, WMA
				console.log("here");
				for (var j = 0; j < techOverlayParm[i]; j++)
				{
					if (techOverlayValue[i][j] != 0 && barData[bar].techOverlay[i][j]>0)
						techValueText += "(" + (techOverlayValue[i][j]) + ") " +  (barData[bar].techOverlay[i][j]).toFixed(dps) + "  ";
				}
			}
			textString += "   " + _lang.getStr(techOverlayExName[i]) + " : " + techValueText;
		}
	}	
	
	ctx.font = DEF_FONT;
	ctx.fillStyle = DEF_TITLE_COLOR;
	ctx.fillText(textString,2,12);
}

function getLocalTime(strGMTTime)
{
	var date;
	date = new Date(strGMTTime.replace(
		    /^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)$/,
		    "$2/$3/$1 $4:$5 GMT"
		));
	return date.format(DEF_DATETIME_FORMAT);
}

function round(num, dps)
{
	return Math.round(num * Math.pow(10, dps)) / Math.pow(10, dps);
}

function float2int (value)
{
    return value | 0;
}

function CSVToArray(strData, strDelimiter)
{
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");
    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp((
    // Delimiters.
    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
    // Quoted fields.
    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
    // Standard fields.
    "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
    
    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];
    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;
    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[1];
        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push([]);
        }
        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[2]) {
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[2].replace(
            new RegExp("\"\"", "g"), "\"");
        } else {
            // We found a non-quoted value.
            var strMatchedValue = arrMatches[3];
        }
        // Now that we have our value string, let's add
        // it to the data array.
        arrData[arrData.length - 1].push(strMatchedValue);
    }
    // Return the parsed data.
    return (arrData);
}

function CSV2JSON(csv)
{
    var array = CSVToArray(csv);
    var objArray = [];
    for (var i = 1; i < array.length; i++) {
        objArray[i - 1] = {};
        for (var k = 0; k < array[0].length && k < array[i].length; k++) {
            var key = array[0][k];
            objArray[i - 1][key] = array[i][k]
        }
    }

    var json = JSON.stringify(objArray);
    //var str = json.replace(/},/g, "},\r\n");

    //return str;
    return json;
}

function initChartBar(resetActiveBar)
{
	startExBarNo = 0;
	startBarNo = DEF_MAX_RIGHT_SHIFT;
	drawExBarNo = barData.length;

	if (resetActiveBar)
	{
		activeBar = lastBarNo = startBarNo;
		//shiftBarNo = -22;
		shiftBarNo = 0;
	}

	//console.log("reset = " + resetActiveBar + ", shiftBarNo = " + shiftBarNo);
	shiftDrawBar(shiftBarNo, false);
	//drawBarNo = barData.length;
}


function shiftChart(mode)
{
	if (mode == 0)
		shiftDrawBar(DEF_SHIFT_DRAWBAR, true);
	else
		shiftDrawBar(-DEF_SHIFT_DRAWBAR, true);

	updateChart();
}

function shiftDrawBar(bar, updateShiftBarNo)
{
	//console.log("shiftDrawBar " + bar);
	if (bar > 0)	// Shift left
	{
		if (startBarNo + drawBarNo == startExBarNo + drawExBarNo)	// Reach the end
			return;

		//shiftLines(bar);
		//shiftTextBox(bar);

		startBarNo += bar;
		if (updateShiftBarNo)
			shiftBarNo += bar;

		if (startBarNo + drawBarNo >= startExBarNo + drawExBarNo)
			startBarNo = startExBarNo + drawExBarNo - drawBarNo;
	}
	else			// Shift right
	{
		if (startBarNo == 0)
			return;

		//shiftLines(bar);
		//shiftTextBox(bar);

		startBarNo += bar;	// Remember bar is a negative integer
		if (updateShiftBarNo)
			shiftBarNo += bar;

		if (startBarNo < startExBarNo)
			startBarNo = startExBarNo;
	}

	activeBar = (startBarNo > startExBarNo) ? startBarNo : startExBarNo;

	//console.log("startBarNo=" + startBarNo + ",drawBarNo=" + drawBarNo + ",startExBarNo=" + startExBarNo + ",drawBarNo=" + drawExBarNo );

	/*
	setActiveBar(activeBar);
	compYScale();
	compTechScale();

	mainChart.headPane.update(barData[activeBar],
		techOverlayName, techOverlayParm, techOverlayValue, techOverlayText, techOverlayColor);
	mainChart.statusPane.update(barData[activeBar], typeChart, code);

	repaint();
	*/
	
}


function zoomChart(mode)
{
	var e;
	e = document.getElementById('barno');
	var barno = parseInt(e.value);

	if (mode==0)
		barno += 30;
	else		
		barno -= 30;

	if (barno > 300)
		barno = 300;
	if (barno < 30)
		barno = 30;

	e.value = barno;
	
	if (mode==0)
		drawBarNo += 30;
	else
		drawBarNo -= 30;

	if (drawBarNo > 300)
		drawBarNo = 300;
	if (drawBarNo < 30)
		drawBarNo = 30;

	updateChart();
}

