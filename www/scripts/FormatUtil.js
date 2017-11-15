/// <reference path="CommonUtil.js" />

var FormatUtils = new function () {
    var thisRef = this;

    thisRef.isTruncating = function (number, fractionDigits) {
        var hund = Math.pow(10, fractionDigits);
        return Math.round(number * hund) / hund != number;
    };

    thisRef.formatUSCurrencyWithSubpenny = function (value, fractionDigits, decimalSeparator, groupSeparator) {
        var precision = Math.round(Math.abs(value) * 10000) % 100 < 0.01 ? 2 : 4;
        fractionDigits = fractionDigits || (value < 1 ? 4 : 2);
        return thisRef.formatCurrency(value, Math.min(fractionDigits, precision), decimalSeparator, groupSeparator);
    };

    thisRef.formatCurrency = function (value, fractionDigits, decimalSeparator, groupSeparator) {
        /// <summary>Format given value to string in US number format.</summary>
        if (fractionDigits == null || isNaN(fractionDigits) || fractionDigits < 0) {
            fractionDigits = 2;
        }

        if (typeof (value) == "string") {
            if (value == "-" || value == "&ndash;" || value == "&mdash;")
                return "-";

            value = parseFloat(value);
        }

        if (value == null) {
            value = 0;
        }

        if (isNaN(value) || !isFinite(value)) {
            return "NaN";
        }

        if (decimalSeparator == null)
            decimalSeparator = ".";
        if (groupSeparator == null)
            groupSeparator = ",";

        var v = Math.abs(value);
        var t = v % 1;
        var fixed = t.toFixed(fractionDigits);
        var res = fixed.replace(".", decimalSeparator);
        res = res.substring(1, res.length);
        v = Math.floor(v);
        if (fixed >= 1.0) {
            v += 1;
        }

        while (v >= 1000) {
            t = v % 1000;

            res = t + res;
            if (t < 10) {
                res = "00" + res;
            }
            else if (t < 100) {
                res = "0" + res;
            }
            res = groupSeparator + res;

            v = Math.floor(v / 1000);
        }

        res = v.toString() + res;

        if (value < 0) {
            res = "-" + res;
        }

        return res;
    };

    thisRef.formatCurrencyFull = function (value) {
        /// <summary>Format given value to string in US number format. Uses ($10) format for negative values.</summary>
        var text = "$" + thisRef.formatCurrency(Math.abs(value));
        if (value < 0) text = "(" + text + ")";
        return text;
    };

    thisRef.formatCurrencyMinus = function (value) {
        /// <summary>Format given value to string in US number format. Uses minus for negative values.</summary>
        var text = "$" + thisRef.formatCurrency(Math.abs(value));
        if (value < 0) {
            text = "-" + text;
        }
        return text;
    };

    thisRef.formatFloatFixed = function (floatValue) {
        return floatValue.toFixed(2);
    };

    thisRef.formatInt = function (intValue) {
        /// <summary>Return string for given integer value.</summary>
        return intValue.toString();
    };

    thisRef.parseCurrency = function (textValue, precision) {
        /// <summary>Parse given string value to number. Precision is optional and by default equals 2.</summary>
        return parseFloat(thisRef.prepareCurrencyToParse(textValue, precision));
    };

    thisRef.prepareCurrencyToParse = function (textValue, precision) {
        /// <summary>Replace separators in given string and returns it. Precision is optional and by default equals 2.</summary>
        if (typeof (textValue) == "undefined") {
            return NaN;
        }
        if (typeof (textValue) == "number") {
            return textValue;
        }

        if (typeof (precision) != "number" || precision < 0) {
            precision = 2;
        }

        var preResult = textValue;
        preResult = preResult.replace(String.fromCharCode(160), "").replace(" ", "").replace(",", "");
        var dotIndex = preResult.indexOf('.');

        if (dotIndex != -1) {
            preResult = preResult.substring(0, dotIndex + 1 + precision);
            if (preResult.charAt(preResult.length - 1 - precision) != '.') {
                preResult = preResult + "0";
            }
        }

        return preResult;
    };

    //parse date in the form MM/DD/YYYY
    //returs:
    //	Date object containing date (hours, minutes, seconds, milliseconds set to 0)
    //	null if text does not contain valid date
    thisRef.parseDate = function (textValue) {
        /// <summary>Return date object fron given string.</summary>
        if (textValue.indexOf(" ") != -1)
            textValue = textValue.split(" ")[0];

        var vals = textValue.split("/");
        if (vals.length != 3) {
            return null;
        }
        var dat = new Date();
        dat.setMilliseconds(0);
        dat.setSeconds(0);
        dat.setMinutes(0);
        dat.setHours(0);
        var m = parseInt(vals[0], 10);
        if (m == null || isNaN(m) || m < 1 || m > 12) {
            return null;
        }

        var d = parseInt(vals[1], 10);
        if (d == null || isNaN(d) || d < 1 || d > 31) {
            return null;
        }

        var y = parseInt(vals[2], 10);
        if (y == null || isNaN(y) || y < 1970) {
            return null;
        }
        dat.setFullYear(y, m - 1, d);
        return dat;
    };

    //date1 - Date object representing the first date
    //date2  -Date object representing the second date
    //Return values:
    //	0 - date1 = date2
    //	1 - date1 > date2
    // -1 - date1 < date2
    thisRef.compareDates = function (date1, date2) {
        /// <summary>Compare two dates ignoring time part.</summary>
        //alert("year1="+date1.getFullYear()+"; month1="+date1.getMonth()+"; day1="+date1.getDate()+" year2="+date2.getFullYear()+"; month2="+date2.getMonth()+"; day2="+date2.getDate());
        if (date1.getFullYear() < date2.getFullYear()) {
            return -1;
        }
        else if (date1.getFullYear() > date2.getFullYear()) {
            return 1;
        }
        else {
            if (date1.getMonth() < date2.getMonth()) {
                return -1;
            }
            else if (date1.getMonth() > date2.getMonth()) {
                return 1;
            }
            else {
                if (date1.getDate() < date2.getDate()) {
                    return -1;
                }
                else if (date1.getDate() > date2.getDate()) {
                    return 1;
                }
                else {
                    return 0;
                }
            }
        }
    };

    thisRef.getURLParam = function (strParamName) {
        /// <summary>Return URL parameter value from its name.</summary>
        var strReturn = "";
        var strHref = window.location.href;
        if (strHref.indexOf("?") > -1) {
            var strQueryString = strHref.substr(strHref.indexOf("?")).toLowerCase();
            var aQueryString = strQueryString.split("&");
            for (var iParam = 0; iParam < aQueryString.length; iParam++) {
                if (aQueryString[iParam].indexOf(strParamName.toLowerCase() + "=") > -1) {
                    var aParam = aQueryString[iParam].split("=");
                    strReturn = aParam[1];
                    break;
                }
            }
        }
        return unescape(strReturn);
    };

    thisRef.formatDateHHmm = function (date) {
        /// <summary>Format given date to HH:mm format.</summary>
        if (date == null || !((date) instanceof (Date)))
            return "";

        var res = "";
        var h = date.getHours();
        var min = date.getMinutes();

        res += h + ":";
        if (min < 10)
            res += "0";
        res += min;

        return res;
    };

    thisRef.formatDateHHmmss = function (date) {
        /// <summary>Format given date to HH:mm:ss format.</summary>
        if (date == null || !((date) instanceof (Date)))
            return "";

        var res = "";
        var sec = date.getSeconds();
        if (sec < 10)
            res += "0";
        res += sec;
        return thisRef.formatDateHHmm(date) + ":" + res;
    };

    thisRef.formatTimeFromString = function (time) {
        /// <summary>Format given string in format HH:mm to hh:mm am/pm format.</summary>
        var arr = new String(time).split(":");
        var h = parseInt(arr[0], 10);
        var m = parseInt(arr[1], 10);

        var ampm = (h > 1 && h <= 12) ? "am" : "pm";
        return "{0}:{1} {2}".format((h > 12 ? h - 12 : h), (m >= 10 ? m : "0" + m), ampm);
    };

    thisRef.formatTimeFromFullDateString = function (date) {
        /// <summary>Format given string in format MM/dd/yyyy HH:mm:ss to hh:mm am/pm format.</summary>

        var arr0 = new String(date).split(" ");
        var d = arr0[0];
        var time = arr0[1];

        var arr = new String(time).split(":");
        var h = parseInt(arr[0], 10);
        var m = parseInt(arr[1], 10);
        var s = parseInt(arr[2], 10);

        var ampm = (h > 1 && h <= 12) ? "am" : "pm";
        return "{0}:{1} {2}".format((h > 12 ? h - 12 : h), (m >= 10 ? m : "0" + m), ampm);
    };

    thisRef.formatTodayMMDDYYYY = function (separator) {
        /// <summary>Format today date to MMDDYYYY format using given separator.</summary>
        var date = thisRef.getTodayDate();
        return thisRef.formatDateMMDDYYYY(date, separator);
    };

    thisRef.formatDateMMDDYYYY = function (date, separator) {
        /// <summary>Format given date to MMDDYYYY format using given separator.</summary>
        if (date == null || !((date) instanceof (Date)))
            return "";

        var addLeadingZeros = arguments.length == 3 ? arguments[2] : false;
        var res = "";
        if (addLeadingZeros && date.getMonth() < 9)
            res += "0";
        res += (date.getMonth() + 1).toString();
        res += separator;
        if (addLeadingZeros && date.getDate() < 10)
            res += "0";
        res += date.getDate();
        res += separator;
        res += date.getFullYear();

        return res;
    };

    thisRef.roundTo = function (value, digits) {
        /// <summary>Round given float to number with digits after dot.</summary>
        var power = Math.pow(10, digits);
        var temp = Math.round(value * power);
        return temp / power;
    };

    thisRef.daysBeetweenDates = function (sDate, eDate) {
        /// <summary>Calculate days count between dates.</summary>
        return (Math.abs(Math.ceil((sDate - eDate) / 86400000)) + 1);
    };

    thisRef.getTodayDate = function () {
        /// <summary>Returns today date object without time.</summary>
        var result = new Date();
        result.setHours(0, 0, 0, 0);
        return result;
    };

    // don't change this functions This functions returns Saturday Expiration
    thisRef.getExpirationDaysByDateSat = function (expString) {
        var expDate = thisRef.expDateToDate(expString);
        var today = thisRef.getTodayDate();
        return thisRef.daysBeetweenDatesSat(expDate, today);
    };

    thisRef.getDateByExpirationDaysSat = function (days) {
        var date = thisRef.getTodayDate();
        date.setDate(date.getDate() + days);
        return date;
    };

    thisRef.daysBeetweenDatesSat = function (sDate, eDate) {
        return (Math.round(Math.abs((sDate - eDate) / 86400000)));
    };

    thisRef.getDateByExpirationDays = function (days) {
        var date = thisRef.getTodayDate();
        date.setDate(date.getDate() + days - 1);
        return date;
    };

    thisRef.getExpirationDaysByDate = function (expString) {
        var expDate = thisRef.expDateToDate(expString);
        var today = thisRef.getTodayDate();
        return thisRef.daysBeetweenDates(expDate, today);
    };
};
