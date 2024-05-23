var baseUrl = '/DataCollaborationBase';


var utility = {

    init: function () {
        $(".allowCurrecyFormat").on('keyup', function (event) {
            utility.currencyFormat(event, this);
        });

        $(".allowNumbersOnly").on("keypress", function (evt) {

            var charCode = (typeof evt.which == "number") ? evt.which : evt.keyCode;
            var typedChar = String.fromCharCode(charCode);

            if (typedChar != "-" && evt.which != 8 && evt.which != 0 && evt.which != 49 && (evt.which < 48 || evt.which > 57)) {
                return false;
            }
            return validDecimal(evt, this, 0);
        }).blur(function () {
            if (this.value != "") {
                var num = parseFloat((this.value.length == 1 && this.value == ".") ? "0" : this.value);
                if (isNaN(num))
                    num = 0;
                $("#" + this.id).val(num.toFixed(0 + 0));
            }
        });

        $(".allowdecimalsOnly").on("keypress", function (evt) {

            var decimalPoint = 0;
            if ($(this).hasClass('allow2decimalsOnly')) {
                decimalPoint = 1;
            }
            if ($(this).hasClass('allow3decimalsOnly')) {
                decimalPoint = 2;
            }
            if ($(this).hasClass('allow5decimalsOnly')) {
                decimalPoint = 4;
            }
            if ($(this).hasClass('allow4decimalsOnly')) {
                decimalPoint = 3;
            }

            return validDecimal(evt, this, decimalPoint);
        }).blur(function () {

            var decimalPoint = 0;
            if ($(this).hasClass('allow2decimalsOnly')) {
                decimalPoint = 1;
            }
            if ($(this).hasClass('allow3decimalsOnly')) {
                decimalPoint = 2;
            }
            if ($(this).hasClass('allow5decimalsOnly')) {
                decimalPoint = 4;
            }
            if ($(this).hasClass('allow4decimalsOnly')) {
                decimalPoint = 3;
            }
            var num = 0;
            if (this.value || '' != '') {
                if (this.value.indexOf(",") != -1) {
                    num = parseFloat((this.value.length == 1 && this.value == ".") ? "0" : this.value.replace(/,/g, ""));
                    $("#" + this.id).val(num.toFixed(decimalPoint + 1));
                    var parts = this.value.replace(/,/g, "").split(".");
                    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    var amt = parts.join(".");
                    $("#" + this.id).val(amt);
                } else {
                    //if (this.value != "") {
                    num = parseFloat((this.value.length == 1 && this.value == ".") ? "0" : this.value);
                    if (isNaN(num))
                        num = 0;
                    $("#" + this.id).val(num.toFixed(decimalPoint + 1));
                }
            }
        });

        $(".restrictNagativeValue").on("keypress", function (e) {
            //restrict nagative values
            var inputKeyCode = e.keyCode ? e.keyCode : e.which;
            if (inputKeyCode != null) {
                if (inputKeyCode == 45) e.preventDefault();
            }
        }).blur(function (e) {
            //restrict nagative values
            var inputKeyCode = e.keyCode ? e.keyCode : e.which;
            if (inputKeyCode != null) {
                if (inputKeyCode == 45) e.preventDefault();
            }
        });
    },

    currencyFormat: function (event, obj) {
        var charCode = (event.which) ? event.which : event.keyCode;
        var ignoredKeys = [9, 37, 38, 39, 40];
        var dotpos = event.currentTarget.value.indexOf(".");
        if (ignoredKeys.indexOf(charCode) == -1) {

            var parts1 = obj.value.split(".");
            var oldLength = parts1[0].length;
            var pos = event.currentTarget.selectionStart;
            var parts = obj.value.replace(/,/g, "").split(".");
            // var oldLength = parts[0].length;
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            var amt = parts.join(".");
            $("#" + event.currentTarget.id).val(amt);
            //if (parts[0].lastIndexOf(',') == '-1' && parts[0].length > 3) {
            //    pos += 1;
            //}
            var newLength = parts[0].length;
            //if (parts[0].length > 3) {
            if (parts[0].length > 3 && oldLength < newLength) {

                if (dotpos != -1 && dotpos > pos) {

                } else
                    pos += 1;
            }
            if (parts[0].length > 3 && oldLength > newLength) {
                pos -= 1;
            }
            utility.setSelectionRange($("#" + event.currentTarget.id)[0], pos, pos);
        }
    },
    getDataFromControl: function (id) {
        if ($(id).prop('tagName') == 'INPUT') {
            if ($(id).attr('type') == 'checkbox')
                return $(id).is(':checked');
            else
                return $(id).val().trim();
        }
        else if ($(id).prop('tagName') == 'SELECT') {

            return $(id).val().trim();
        }
        else if ($(id).prop('tagName') == 'LABEL') {
            return $(id).text().trim();
        }
        else {
            return '';
        }
    },
    convertDataType: function (fieldValue, fieldDataType) {

        //if ((fieldValue || "") != "")
        switch (fieldDataType) {
            case "Date":
                return (fieldValue || "") == "" ? "" : new Date(formatDate(parseDate(fieldValue), 'M/d/yyyy'));
                break;
            case "Decimal":
                return parseFloat((parseFloat(fieldValue.replace(/,/g, "")) || 0).toFixed(2));
                break;
            case "Number":
                return parseInt(fieldValue || 0);
                break;
            default: return fieldValue != null || fieldValue != '' ? fieldValue.toString().toLowerCase() : fieldValue;
                break;
        }
    },

    displayCurrencyFormat: function (value, id) {
        if (value || '' != '') {
            var parts = value.replace(/,/g, "").split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            var amt = parts.join(".");
            $("#" + id).val(amt);
        }
    },

    getAmountWithOutCommas: function (id) {
        return $('#' + id).length > 0 ? (parseFloat($.isNumeric($('#' + id).val().replace(/,/g, "")) ? $('#' + id).val().replace(/,/g, "") : 0)) : 0;
    },
    getIsReadOnlyField: function (objPOGrid, fName) {
        var gridFieldObj = objPOGrid.filter(function (x) { return x.FieldName == fName && x.IsReadOnly == true; });
        if (gridFieldObj.length > 0)
            return false;
        else
            return true;
    },
    getIsVisibleField: function (objPOGrid, fName) {
        var gridFieldObj = objPOGrid.filter(function (x) { return x.FieldName == fName && x.IsVisible == true; });
        if (gridFieldObj.length > 0)
            return false;
        else
            return true;
    },
    getFieldLabelName: function (objPOGrid, fName) {
        var retVal = " ";
        var gridFieldObj = objPOGrid.filter(function (x) { return x.FieldName == fName; });
        if (gridFieldObj.length > 0) {
            retVal = gridFieldObj != null ? (gridFieldObj[0].FieldLabelValue != null ? gridFieldObj[0].FieldLabelValue : " ") : " ";
        }
        //else
        //    return " ";
        return retVal;
    },
    getDecimalPointLength: function (objPOGrid, fName) {
        var decimalPointsLength = 0, gridFieldObj = objPOGrid.filter(function (x) { return x.FieldName == fName; });

        if (gridFieldObj != null && gridFieldObj.length > 0) {
            if (gridFieldObj[0].ClassName != null) {
                if (gridFieldObj[0].ClassName.indexOf('allow5decimalsOnly') > -1)
                    decimalPointsLength = 5;
                if (gridFieldObj[0].ClassName.indexOf('allow4decimalsOnly') > -1)
                    decimalPointsLength = 4;
                if (gridFieldObj[0].ClassName.indexOf('allow3decimalsOnly') > -1)
                    decimalPointsLength = 3;
                if (gridFieldObj[0].ClassName.indexOf('allow2decimalsOnly') > -1)
                    decimalPointsLength = 2;
                if (gridFieldObj[0].ClassName.indexOf('allowNumbersOnly') > -1)
                    decimalPointsLength = 0;
            }
        }
        return decimalPointsLength;
    },
    getDecimalEntryLength: function (objPOGrid, fName) {
        var decimalPointsLength = 0;
        var gridFieldObj = objPOGrid.filter(function (x) { return x.FieldName == fName; });
        if (gridFieldObj != null && gridFieldObj.length > 0) {
            if (gridFieldObj[0].ClassName != null) {
                if (gridFieldObj[0].ClassName.indexOf('allow5decimalsOnly') > 0)
                    decimalPointsLength = 4;
                if (gridFieldObj[0].ClassName.indexOf('allow4decimalsOnly') > 0)
                    decimalPointsLength = 3;
                if (gridFieldObj[0].ClassName.indexOf('allow3decimalsOnly') > 0)
                    decimalPointsLength = 2;
                if (gridFieldObj[0].ClassName.indexOf('allow2decimalsOnly') > 0)
                    decimalPointsLength = 1;
                if (gridFieldObj[0].ClassName.indexOf('allowNumbersOnly') > 0)
                    decimalPointsLength = 0;
            }
        }
        return decimalPointsLength;
    },
    getCssClass: function (objPOGrid, fName) {
        var strClass = " ";
        var gridFieldObj = objPOGrid.filter(function (x) { return x.FieldName == fName; });
        strClass = gridFieldObj != null ? (gridFieldObj[0].ClassName != null ? " " + gridFieldObj[0].ClassName + " " : " ") : " ";
        return strClass;
    },
    getDCConfigValue: function (name) {
        var configValue = "";
        var objDCConfigurations = jsonDCConfigurations.filter(function (x) { return x.ConfigName.toLowerCase() == name.toLowerCase(); });
        if (objDCConfigurations != null && objDCConfigurations.length > 0) {
            if (objDCConfigurations[0] != null) {
                configValue = objDCConfigurations[0].ConfigValue;
            }
        }
        return configValue;
    },
    getDataFromControl: function (id) {
        //var val = $(id).val().trim();
        //val = ($(id).attr('type') == 'checkbox') ? $(id).is(':checked') : val;

        if ($(id).prop('tagName') == 'INPUT') {
            if ($(id).attr('type') == 'checkbox')
                return $(id).is(':checked');
            else
                return $(id).val().trim();
        }
        else if ($(id).prop('tagName') == 'SELECT') {
            return $(id).val().trim();
        }
        else if ($(id).prop('tagName') == 'LABEL') {
            return $(id).text().trim();
        }
        else {
            return '';
        }
    },

    isCheckEmpty: function (id) {
        var value = ($('#' + id).val() || "");
        return value;
    },

    setSelectionRange: function (input, selectionStart, selectionEnd) {
        if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(selectionStart, selectionEnd);
        } else if (input.createTextRange) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', selectionEnd);
            range.moveStart('character', selectionStart);
            range.select();
        }
    },
};

utility.init();


function MakeAjaxCall(requestType, url, jsonString, onSuccessCallback, onFailureCallback, onErrorCallback, isAsync) {
    var asyncVal = (isAsync == undefined) ? true : isAsync;
    $.ajax({
        type: requestType,
        url: baseUrl + url,
        dataType: "json",
        headers: {
            "HeaderParams": JSON.stringify(jsonHeaderParams)
        },
        async: asyncVal,
        //data: jsonString !== null && jsonString !== '' ? "{ jsonValue: '" + (jsonString) + "'}" : null,
        data: jsonString !== null && jsonString !== '' ? JSON.stringify({ jsonValue: jsonString }) : null,
        //data: jsonString !== null && jsonString !== '' ? jsonString : null,

        //data: "{ jsonValue: '" + jsonString + "'}", 
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            onSuccessCallback(response);
        },
        failure: function (response) {
            console.log(response.responseText);
            onFailureCallback(response.responseText);
        },
        error: function (response) {
            console.log(response.responseText);
            onErrorCallback(response.responseText);
        }
    });
}

function MakeAjaxCallNew(requestType, url, jsonString, onSuccessCallback, onFailureCallback, onErrorCallback, isAsync) {
    var asyncVal = (isAsync == undefined) ? true : isAsync;
    $.ajax({
        type: requestType,
        url: baseUrl + url,
        dataType: "json",
        headers: {
            "HeaderParams": JSON.stringify(jsonHeaderParams)
        },
        async: asyncVal,
        data: jsonString,
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            onSuccessCallback(response);
        },
        failure: function (response) {
            console.log(response.responseText);
            onFailureCallback(response.responseText);
        },
        error: function (response) {
            console.log(response.responseText);
            onErrorCallback(response.responseText);
        }
    });
}

function MakeAjaxCallNew_WithDependantSource(requestType, url, jsonString, onSuccessCallback, onFailureCallback, onErrorCallback, dependantSource) {
    $.ajax({
        type: requestType,
        url: baseUrl + url,
        dataType: "json",
        data: jsonString,
        headers: {
            "HeaderParams": JSON.stringify(jsonHeaderParams)
        },
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            onSuccessCallback(response, dependantSource);
        },
        failure: function (response) {
            console.log(response.responseText);
            onFailureCallback(response.responseText, dependantSource);
        },
        error: function (response) {
            console.log(response.responseText);
            onErrorCallback(response.responseText.dependantSource);
        }
    });
}

function MakeAjaxCall2(requestType, isAsync, url, jsonString, jsonFieldRules) {
    var result;
    $.ajax({
        type: requestType,
        url: baseUrl + url,
        dataType: "json",
        headers: {
            "HeaderParams": JSON.stringify(jsonHeaderParams)
        },
        async: false,
        data: jsonString,
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            result = response;
        },
        failure: function (response) {
            console.log(response.responseText);

        },
        error: function (response) {
            console.log(response.responseText);

        }
    });
    return result;
}

function MakeAjaxCall_WithDependantSource(requestType, url, jsonString, onSuccessCallback, onFailureCallback, onErrorCallback, dependantSource, isAsync) {
    var asyncVal = (isAsync == undefined) ? true : isAsync;
    $.ajax({
        type: requestType,
        url: baseUrl + url,
        dataType: "json",
        headers: {
            "HeaderParams": JSON.stringify(jsonHeaderParams)
        },
        async: asyncVal,
        // data: jsonString !== null && jsonString !== '' ? "{ jsonValue: '" + jsonString + "'}" : null,
        data: jsonString !== null && jsonString !== '' ? JSON.stringify({ jsonValue: jsonString }) : null,
        // data: jsonString !== null && jsonString !== '' ? jsonString : null,
        //data: "{ jsonValue: '" + jsonString + "'}",  
        contentType: "application/json; charset=utf-8",
        success: function (response) {
            onSuccessCallback(response, dependantSource);
        },
        failure: function (response) {
            console.log(response.responseText);
            onFailureCallback(response.responseText, dependantSource);
        },
        error: function (response) {
            console.log(response.responseText);
            onErrorCallback(response.responseText, dependantSource);
        }
    });
}

function MakeAjaxCall_WithDependantSourceUpload(requestType, url, data, onSuccessCallback, onFailureCallback, onErrorCallback, dependantSource) {

    $.ajax({
        type: requestType,
        url: baseUrl + url,
        data: data,
        headers: {
            "HeaderParams": JSON.stringify(jsonHeaderParams)
        },
        contentType: false,
        processData: false,
        success: function (response) {
            onSuccessCallback(response, dependantSource);
        },
        failure: function (response) {
            console.log(response.responseText);
            onFailureCallback(response.responseText, dependantSource);
        },
        error: function (response) {
            console.log(response.responseText);
            onErrorCallback(response.responseText, dependantSource);
        }
    });
}


function ValidNumber(e) {
    var charCode = (e.which) ? e.which : e.keyCode;
    if (charCode == 13 || (charCode > 31 && (charCode < 48 || charCode > 57)))
        return false;
}

function validDecimal_old(evt, element, decimallength) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    var ignoredKeys = [8, 9, 37, 38, 40, 46];
    var pos = element.value.indexOf(".");
    // var dd = element.value.substring(element.selectionStart, element.selectionEnd);
    if (charCode == 46 && element.value.indexOf(".") != -1)
        return false;
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
        return false;

    if ($(element).closest('td').hasClass('allowNegativeValues'))
        ignoredKeys.push(45);

    if (evt.key == "-" && ignoredKeys.indexOf(charCode) >= 0) {

        if ($(element).val().indexOf('-') > -1) {
            return false;
        }
        if ($(element).val().indexOf('-') <= -1) {
            if (element.selectionStart != 0)
                return false;
        }
    }
    if (decimallength == 0) {
        var charCodeN = (typeof evt.which == "number") ? evt.which : evt.keyCode;
        var typedCharN = String.fromCharCode(charCodeN);

        //if the letter is not digit then display error and don't type anything
        if (typedCharN != "-" && evt.which != 8 && evt.which != 0 && evt.which != 49 && (evt.which < 48 || evt.which > 57)) {
            return false;
        }
    }
    if (evt.key != "." && ignoredKeys.indexOf(charCode) >= 0) {
        return true;
    }
    if ($(element).val().trim().length > 9 && $(element).val().indexOf('.') == -1 && charCode != 46) {
        return false;
    }
    if ($(element).val().indexOf('.') == -1) {
        var lengthafterDecimal = $(element).val().trim().split('.');
        var x = element.selectionStart;
        if ((lengthafterDecimal[1] || "").length > decimallength) {
            if (lengthafterDecimal[0].length > 9) {
                return false;
            } else if (x > pos) {
                return false;
            }
        }
    }
    return true;
}

















//function validDecimal(evt, element, decimallength) {

//    var charCode = (evt.which) ? evt.which : evt.keyCode;
//    var ignoredKeys = [8, 9, 37, 38, 40, 46];
//    var pos = element.value.indexOf(".");
//    var dd = element.value.substring(element.selectionStart, element.selectionEnd);

//    if (dd.indexOf('.') > -1) {
//        return true;
//    }
//    if ($(element).val().indexOf('.') != -1 && pos < element.selectionStart && dd.length > 0) {
//        if ((charCode > 31 && charCode < 48 || charCode > 57))
//            return false;
//        else
//            return true;
//    }

//    if (dd.length > 0 && (element.value == dd || dd == "-")) {
//        return true;
//    }

//    if ($(element).hasClass('allowNegativeValues'))
//        ignoredKeys.push(45);

//    if (evt.key == "-" && ignoredKeys.indexOf(charCode) >= 0) {

//        if ($(element).val().indexOf('-') > -1) {
//            return false;
//        }

//        if ($(element).val().indexOf('-') <= -1) {
//            if (element.selectionStart != 0)
//                return false;
//        }
//    }

//    if (decimallength == 0) {
//        var charCodeN = (typeof evt.which == "number") ? evt.which : evt.keyCode;
//        var typedCharN = String.fromCharCode(charCodeN);

//        //if the letter is not digit then display error and don't type anything
//        if (typedCharN != "-" && evt.which != 8 && evt.which != 0 && evt.which != 49 && (evt.which < 48 || evt.which > 57)) {
//            return false;
//        }
//    }

//    if (evt.key != "." && ignoredKeys.indexOf(charCode) >= 0) {
//        return true;
//    }

//    if (
//        //(charCode != 45 || $(element).val().indexOf('-') != -1) &&      // “-” CHECK MINUS, AND ONLY ONE.
//        (charCode != 46 || $(element).val().indexOf('.') != -1) &&      // “.” CHECK DOT, AND ONLY ONE.
//        (charCode > 31 && charCode < 48 || charCode > 57))
//        return false;

//    if ($(element).val().replace(/,/g, "").trim().length > 9 && $(element).val().indexOf('.') == -1 && charCode != 46) {
//        return false;
//    }
//    if ($(element).val().indexOf('.') != -1) {
//        var lengthafterDecimal = $(element).val().trim().split('.');
//        var x = element.selectionStart;
//        //var pos = element.value.indexOf(".");

//        if (lengthafterDecimal[1].length > decimallength) {
//            if (lengthafterDecimal[0].replace(/,/g, "").length > 9) {
//                return false;
//            } else if (x > pos) {
//                return false;
//            }
//        }
//    }

//    return true;
//}

function ValidDecimalNew(evt, element, decimallength) {

    var charCode = (evt.which) ? evt.which : evt.keyCode;
    var ignoredKeys = [8, 9, 37, 38, 40, 46];
    var pos = element.value.indexOf(".");
    var dd = element.value.substring(element.selectionStart, element.selectionEnd);

    //added on 6-7-2019 by venkat --- on issue alowing -ve values
    if (!$(element).closest('td').hasClass('allowNegativeValues') && charCode == 45) {
        return false;
    }

    if ($(element).val().indexOf('.') != -1 && pos < element.selectionStart && dd.length > 0) {
        if ((charCode > 31 && charCode < 48 || charCode > 57))
            return false;
        else
            return true;
    }
    if (dd.length > 0 && (element.value == dd || dd == "-")) {
        return true;
    }
    if ($(element).closest('td').hasClass('allowNegativeValues'))
        ignoredKeys.push(45);

    if (evt.key == "-" && ignoredKeys.indexOf(charCode) >= 0) {

        if ($(element).val().indexOf('-') > -1) {
            return false;
        }
        if ($(element).val().indexOf('-') <= -1) {
            if (element.selectionStart != 0)
                return false;
        }
    }

    if (decimallength == 0) {
        var charCodeN = (typeof evt.which == "number") ? evt.which : evt.keyCode;
        var typedCharN = String.fromCharCode(charCodeN);

        //if the letter is not digit then display error and don't type anything
        if (typedCharN != "-" && evt.which != 8 && evt.which != 0 && evt.which != 49 && (evt.which < 48 || evt.which > 57)) {
            return false;
        }
    }

    if (evt.key != "." && ignoredKeys.indexOf(charCode) >= 0) {
        return true;
    }
    if (
        //(charCode != 45 || $(element).val().indexOf('-') != -1) &&      // “-” CHECK MINUS, AND ONLY ONE.
        (charCode != 46 || $(element).val().indexOf('.') != -1) &&      // “.” CHECK DOT, AND ONLY ONE.
        (charCode > 31 && charCode < 48 || charCode > 57))
        return false;

    if ($(element).val().trim().length > 9 && $(element).val().indexOf('.') == -1 && charCode != 46) {
        return false;
    }
    if ($(element).val().indexOf('.') != -1) {
        var lengthafterDecimal = $(element).val().trim().split('.');
        var x = element.selectionStart;
        if (lengthafterDecimal[1].length > decimallength) {
            if (lengthafterDecimal[0].length > 9) {
                return false;
            } else if (x > pos) {
                return false;
            }
        }
    }
    return true;
}



function validDecimal(evt, element, decimallength) {

    var charCode = (evt.which) ? evt.which : evt.keyCode;
    var ignoredKeys = [8, 9, 37, 38, 40, 46];
    var pos = element.value.indexOf(".");
    var dd = element.value.substring(element.selectionStart, element.selectionEnd);


    if ($(element).val().indexOf('.') != -1 && pos < element.selectionStart && dd.length > 0) {
        if ((charCode > 31 && charCode < 48 || charCode > 57))
            return false;
        else
            return true;
    }
    if (dd.length > 0 && (element.value == dd || dd == "-")) {
        return true;
    }
    if ($(element).hasClass('allowNegativeValues'))
        ignoredKeys.push(45);

    if (evt.key == "-" && ignoredKeys.indexOf(charCode) >= 0) {

        if ($(element).val().indexOf('-') > -1) {
            return false;
        }
        if ($(element).val().indexOf('-') <= -1) {
            if (element.selectionStart != 0)
                return false;
        }
    }

    if (decimallength == 0) {
        var charCodeN = (typeof evt.which == "number") ? evt.which : evt.keyCode;
        var typedCharN = String.fromCharCode(charCodeN);

        //if the letter is not digit then display error and don't type anything
        if (typedCharN != "-" && evt.which != 8 && evt.which != 0 && evt.which != 49 && (evt.which < 48 || evt.which > 57)) {
            return false;
        }
    }

    if (evt.key != "." && ignoredKeys.indexOf(charCode) >= 0) {
        return true;
    }
    if (
        //(charCode != 45 || $(element).val().indexOf('-') != -1) &&      // “-” CHECK MINUS, AND ONLY ONE.
        (charCode != 46 || $(element).val().indexOf('.') != -1) &&      // “.” CHECK DOT, AND ONLY ONE.
        (charCode > 31 && charCode < 48 || charCode > 57))
        return false;

    if ($(element).val().trim().length > 9 && $(element).val().indexOf('.') == -1 && charCode != 46) {
        return false;
    }
    if ($(element).val().indexOf('.') != -1) {
        var lengthafterDecimal = $(element).val().trim().split('.');
        var x = element.selectionStart;
        if (lengthafterDecimal[1].length > decimallength) {
            if (lengthafterDecimal[0].length > 9) {
                return false;
            } else if (x > pos) {
                return false;
            }
        }
    }
    return true;
}