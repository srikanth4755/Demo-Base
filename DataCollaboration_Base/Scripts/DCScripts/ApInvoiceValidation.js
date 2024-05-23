
function validation1() {

    var errMsg = '', TagDocumentDetail = [],
        // objFieldRules = jsonFieldRules.filter(x => x.IsVisible === true && x.IsMandatory === true && (x.ViewName_Refonly === "General" || x.ViewName_Refonly === "Vendors" || x.ViewName_Refonly === "Invoice" || x.ViewName_Refonly === "Payments"));
        objFieldRules = jsonFieldRules.filter(function (x) { return (x.IsVisible === true && x.IsMandatory === true && (x.ViewName_Refonly === "General" || x.ViewName_Refonly === "Vendors" || x.ViewName_Refonly === "Invoice" || x.ViewName_Refonly === "Payments")) });
    errMsg = validateFileds(objFieldRules);  //header validation
    if (errMsg !== "") {
        return isShowErrorMsg(errMsg);
    }
    errMsg = validateInvoiceDate();
    if (errMsg !== "") {
        return isShowErrorMsg(errMsg);
    }
    errMsg = validationConditions('');
    if (errMsg !== "") {
        return isShowErrorMsg(errMsg);
    }
    errMsg = validateDueDate();
    if (errMsg !== "") {
        return isShowErrorMsg(errMsg);
    }
    errMsg = validateAnyAccAssignRows();
    if (errMsg !== "") {
        return isShowErrorMsg(errMsg);
    }
    errMsg = clientSpecificCondition();
    if (errMsg !== "") {
        return isShowErrorMsg(errMsg);
    }
    return true;

};

function validationHeader1() {

    var errMsg = '',
        // objFieldRules = jsonFieldRules.filter(x => x.IsVisible === true && x.IsMandatory === true && (x.ViewName_Refonly === "General" || x.ViewName_Refonly === "Vendors" || x.ViewName_Refonly === "Invoice" || x.ViewName_Refonly === "Payments"));
        objFieldRules = jsonFieldRules.filter(function (x) {
            return x.IsVisible === true && x.IsMandatory === true &&
                (x.ViewName_Refonly === "General" || x.ViewName_Refonly === "Vendors" || x.ViewName_Refonly === "Invoice" || x.ViewName_Refonly === "Payments");
        });
    errMsg = validateFileds(objFieldRules);  //header validation
    if (errMsg !== "") {
        return isShowErrorMsg(errMsg);
    }
    errMsg = validateInvoiceDate();
    if (errMsg !== "") {
        return isShowErrorMsg(errMsg);
    }
    errMsg = validateDueDate();
    if (errMsg !== "") {
        return isShowErrorMsg(errMsg);
    }
    errMsg = validationConditions('');
    if (errMsg !== "") {
        return isShowErrorMsg(errMsg);
    }
    return true;
};

function validateFileds(objFieldRules, rowID) {

    var errMsg = '';
    objFieldRules.forEach(function (item, index) {
        var id = ((rowID || 0) == 0) ? item.ID : rowID + item.ID;
        if (item.ID !== "" && ($('#' + id).val() || "").trim() == '') {
            //errMsg += item.ErrorMsg + "<br>";
            errMsg = 'Required Fields Missing';
            $('#' + id).addClass("error");
        }
        else {
            $('#' + id).removeClass("error");
        }
    });
    return errMsg;
};

function validationDetail(objTagDocumentDetail, id) {

    var errMsg = '', //objFieldRules = jsonFieldRules.filter(x => x.IsVisible === true && x.IsMandatory === true && (x.ViewName_Refonly === "PODetails"));
        objFieldRules = jsonFieldRules.filter(function (x) { return x.IsVisible === true && x.IsMandatory === true && x.ViewName_Refonly === "PODetails"; });
    errMsg = validateFileds(objFieldRules, id);
    if (errMsg !== "") {
        return isShowErrorMsg(errMsg);
    }

    return true;
};

function validateForwardUser() {

    var errMsg = '', //objFieldRules = jsonFieldRules.filter(x => x.IsVisible === true && x.IsMandatory === true && (x.ViewName_Refonly === "Forward"));
        objFieldRules = jsonFieldRules.filter(function (x) { return x.IsVisible === true && x.IsMandatory === true && x.ViewName_Refonly === "Forward"; });
    errMsg = validateFileds(objFieldRules);
    if (errMsg !== "") {
        return isShowErrorMsg(errMsg);
    }
    errMsg = verifyForwardUser();
    if (errMsg !== "") {
        return isShowErrorMsg(errMsg);
    }
    return true;
};

function validateRejectTo() {
    var errMsg = '',// objFieldRules = jsonFieldRules.filter(x => x.IsVisible === true && x.IsMandatory === true && (x.ViewName_Refonly === "Reject"));
        objFieldRules = jsonFieldRules.filter(function (x) { return x.IsVisible === true && x.IsMandatory === true && x.ViewName_Refonly === "Reject"; });
    errMsg = validateFileds(objFieldRules);
    if (errMsg !== "") {
        return isShowErrorMsg(errMsg);
    }
    return true;
};

function validationConditions(withNodeId) {

    var objValidationConditions = [], errMsg = '', objValidaionIds = [], objValidaionIdsDistincts = [], nodeIdValue = null;

    nodeIdValue = (withNodeId === "yes") ? nodeId : null;
    objValidationConditions = jsonValidationConditions.filter(function (x) { return x.NodeId == nodeIdValue; });
    objValidaionIds = $.map(objValidationConditions, function (val, i) { return { ValidationId: val.ValidationId } });

    $.each(objValidaionIds, function (i, item) {
        var items = $.grep(objValidaionIdsDistincts, function (e) {
            return item.ValidationId === e.ValidationId;
        });
        if (items.length === 0) {
            objValidaionIdsDistincts.push(item);
        }
    });
    for (var i = 0; i < objValidaionIdsDistincts.length; i++) {
        var itemObj = objValidationConditions.filter(m => m.ValidationId == objValidaionIdsDistincts[i].ValidationId);

        if (itemObj.length == 1) {
            var f1EntityName = itemObj[0].Field1EntityName != null && itemObj[0].Field1EntityName != undefined && itemObj[0].Field1EntityName.trim() != '' ? itemObj[0].Field1EntityName + '_' : '';
            var f2EntityName = itemObj[0].Field2EntityName != null && itemObj[0].Field2EntityName != undefined && itemObj[0].Field2EntityName.trim() != '' ? itemObj[0].Field2EntityName + '_' : '';
            if (evaluteExpression(itemObj[0].Operator.trim()
                , utility.getDataFromControl('#' + f1EntityName + itemObj[0].Field1)
                , itemObj[0].Field1DataType
                , utility.getDataFromControl('#' + f2EntityName + itemObj[0].Field2)
                , itemObj[0].Field2DataType)) {

                //console.log('true');

            } else {
                //console.log('false');
                errMsg += itemObj[0].ErrorMessage + ' ' + "<br>";
            }
        }
        else if (itemObj.length > 1) {

            var exprArr = [];
            var exp = '';

            for (var j = 0; j < itemObj.length; j++) {
                var f1EntityName = itemObj[j].Field1EntityName != null && itemObj[j].Field1EntityName != undefined && itemObj[j].Field1EntityName.trim() != '' ? itemObj[j].Field1EntityName + '_' : '';
                var f2EntityName = itemObj[j].Field2EntityName != null && itemObj[j].Field2EntityName != undefined && itemObj[j].Field2EntityName.trim() != '' ? itemObj[j].Field2EntityName + '_' : '';
                var res =
                    evaluteExpression(itemObj[j].Operator.trim()
                        , utility.getDataFromControl('#' + f1EntityName + itemObj[j].Field1)
                        , itemObj[j].Field1DataType
                        , utility.getDataFromControl('#' + f2EntityName + itemObj[j].Field2)
                        , itemObj[j].Field2DataType);

                exprArr.push(res);
                if (itemObj[j].Condition != null && itemObj[j].Condition != '')
                    exprArr.push(itemObj[j].Condition);
                else {
                    var k = 0;
                    do {
                        exp += ' ' + exprArr[k];
                        k++;
                    } while (k < exprArr.length);
                }
            }
           
        }
        if (eval(exp)) {
            errMsg += itemObj[0].ErrorMessage + ' ' + "<br>";
        }
    }

    return errMsg.trim();
};

function validateInvoiceDate() {

    $("#IndexPivot_Invoice_Date").removeClass("error");
    //var objFieldRules = jsonFieldRules.filter(x => x.IsVisible == true);
    var objFieldRules = jsonFieldRules.filter(function (x) { return x.IsVisible == true; });
    if (objFieldRules.filter(function (x) { return x.FieldName.trim() == 'InvoiceDate'; }).map(function (x) { return x.IsMandatory; })[0]) {
        var res = isInvoiceDateValidate($('#IndexPivot_Invoice_Date').val());
        if (res.length > 0 && res != undefined && res.trim() != "") {
            return res;
        }
    }
    return '';
};

function validateDueDate() {

    $("#IndexPivot_Due_Date").removeClass("error");
    // var objFieldRules = jsonFieldRules.filter(x => x.IsVisible == true);
    var objFieldRules = jsonFieldRules.filter(function (x) { return x.IsVisible == true; });
    if ($('#IndexPivot_SpecialHandling').length > 0 && $('#IndexPivot_Payment_Type').length > 0) {
        if ($('#IndexPivot_SpecialHandling').is(':checked') == false && $('#IndexPivot_Payment_Type').is(':checked') == false) {
            $('#IndexPivot_Due_Date').val('');
        }
    }
    if ((objFieldRules.filter(function (x) { return (x.FieldName.trim() == "DueDate"); }).map(function (x) { return ((x.IsMandatory)); })[0]) && ($("#IndexPivot_Due_Date").prop("readonly") == false)
        &&
        (objFieldRules.filter(function (x) { return (x.FieldName.trim() == "InvoiceDate"); }).map(function (x) { return ((x.IsMandatory)); })[0]) && ($("#IndexPivot_Invoice_Date").prop("readonly") == false)
    ) {
        var res = isDueDateValide($('#IndexPivot_Due_Date').val(), $("#IndexPivot_Invoice_Date").val());
        if (res.length > 0 && res != undefined && (res || "").trim() != "") {
            return res;
        }
    }
    return '';
};

function validateAnyAccAssignRows() {

    var invAmt = $("#IndexPivot_Invoice_Amount").length > 0 ? (parseFloat($("#IndexPivot_Invoice_Amount").val().replace(/,/g, "") != "" ? $("#IndexPivot_Invoice_Amount").val().replace(/,/g, "") : 0.00)) : 0;
    var taxAmt = $("#TagDocumentHeader_TaxAmount").length > 0 ? (parseFloat($("#TagDocumentHeader_TaxAmount").val().replace(/,/g, "") != "" ? $("#TagDocumentHeader_TaxAmount").val().replace(/,/g, "") : 0.00)) : 0;
    var FreAmt = $("#TagDocumentHeader_FreightAmount").length > 0 ? (parseFloat($("#TagDocumentHeader_FreightAmount").val().replace(/,/g, "") != "" ? $("#TagDocumentHeader_FreightAmount").val().replace(/,/g, "") : 0.00)) : 0;
    var misAmt = $("#TagDocumentHeader_MiscAmount").length > 0 ? (parseFloat($("#TagDocumentHeader_MiscAmount").val().replace(/,/g, "") != "" ? $("#TagDocumentHeader_MiscAmount").val().replace(/,/g, "") : 0.00)) : 0;
    if (invAmt - (taxAmt + FreAmt + misAmt) == 0) {
        //return 'The Total Tax and/or Freight Amount should not equal the full invoice amount';
        return 'Invoice amount must be greater than Zero';
    }
    return '';
};

function isInvoiceDateValidate(invoiceDate) {
    var data = {}, invoiceBackDateValidationCheck = true, result = false;
    data.invoiceDate = invoiceDate;
    invoiceBackDateValidationCheck = utility.getDCConfigValue("invoiceBackDateValidationCheck");

    data.invoiceBackDateValidationCheck = (invoiceBackDateValidationCheck || true);
    result = MakeAjaxCall2('GET', false, '/APInvoiceDC/ValidateInvoiceDate', data);
    return result;
};

function isDueDateValide(dueDate, invDate) {
    var data = {}, isDuedateValidation = true, result = false, objDCConfigDueDateWithCurrentDate = true;
    data.dueDate = dueDate;
    data.invoiceDate = invDate;
    isDuedateValidation = utility.getDCConfigValue("isDuedateValidation");
    objDCConfigDueDateWithCurrentDate = utility.getDCConfigValue("validateDueDateWithCurrentDate");

    data.isDuedateValidation = isDuedateValidation;
    data.validateDueDateWithCurrentDate = objDCConfigDueDateWithCurrentDate;

    result = MakeAjaxCall2('GET', false, '/APInvoiceDC/ValidateDueDate', data);
    return result;
};

function verifyForwardUser() {
    var ermsg = '';
    if ($('#txtForwardTo').val() != oldForwardText) {
        ermsg = "Please select an appropriate User from Forward list" + "<br>";
        $("#txtForwardTo").addClass("error");
    }
    else if ($('#txtForwardTo').val().indexOf("[") != -1) {
        $("#txtForwardTo").removeClass("error");
    }
    else {
        ermsg += 'Please enter a forward User';
        $("#txtForwardTo").addClass("error");
    }
    return ermsg;
};

function isVendorActive() {

    if ($("#IndexPivot_Vendor_Number").val() != "New Vendor" && $("#IndexPivot_Vendor_Name").val() != "New Vendor" && $("#TagDocumentHeader_RemitToAddress").val() != "New Address") {
        var count = 0;
        var url = "/APInvoiceDC/CheckIsVendorActive?vendorNo=" + $("#IndexPivot_Vendor_Number").val().trim();
        count = MakeAjaxCall2(REQUESTGET, false, url, '');
        if (count == 0) {
            return "Vendor is not Active";
        }
    }
    return ''
}

// TSS Durga (06202019) Added for Discount Amount and Discount Date Validation
function validateDiscountAmount() {

    var discountAmount = $("#TagDocumentHeader_InvoiceDiscountAmount").val();
    var discountDate = validateDate($("#TagDocumentHeader_DiscountDate").val()) ? $("#TagDocumentHeader_DiscountDate").val() : "";

    if ((discountAmount != "" && discountDate != "") || (discountAmount == "" && discountDate == "")) {
        errMsg = "";
    } else if (discountAmount == "" && discountDate != "") {
        errMsg = "Discount Amount should not be empty";
    }
    else if (discountAmount != "" && discountDate == "") {
        errMsg = "Discount Due Date should not be empty";
    }

    if (discountDate != "") {

        const discDate = new Date(discountDate);
        const currdate = new Date();
        const diffTime = Math.abs(discDate.getTime() - currdate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 90)
            errMsg = "Discount Due Date should not be greater than 90 days from current date.";
    }

    return errMsg;
}

function validateDate(dtValue) {
    var dtRegex = new RegExp(/\b\d{1,2}[\/-]\d{1,2}[\/-]\d{4}\b/);
    return dtRegex.test(dtValue);
}

function checkisEmptyValue(fieldName, id, msg) {

    var errMsg = '', // objFieldRules = jsonFieldRules.filter(x => x.IsVisible == true);//jsonFieldRules;   
        objFieldRules = jsonFieldRules.filter(function (x) { return (x.IsVisible == true); });
    if (objFieldRules.filter(function (x) { return (x.FieldName.trim() == fieldName); }).map(function (x) { return ((x.IsMandatory)); })[0]) {
        if ($('#' + id).val().trim() == '') {
            errMsg += msg + "<br>";
            $('#' + id).addClass("error");
        }
        else {
            $('#' + id).removeClass("error");
        }
    }
    return errMsg;
}

function isShowErrorMsg(errMsg) {
    var isValid = true;
    if (errMsg != '') {
        $('.alert').hide();
        Notify(errMsg, null, null, 'danger');
        isValid = false;
    }
    return isValid;
}
function evaluteExpression(operator, operand1, operand1Type, operand2, operand2Type) {

    //var defValue = "";
    //defalutValue = (operand1Type == "Decimal" || operand2Type == "Decimal") ? 0 : defalutValue;
    var obj1 = utility.convertDataType(operand1, operand1Type);
    var obj2 = utility.convertDataType(operand2, operand2Type);
    switch (operator) {
        case "==":
            if (obj1 !== "" && obj2 !== "") {
                return eval(obj1 == obj2);
            }
            return true;

            //return eval(convertDataType(operand1, operand1Type) == convertDataType(operand2, operand2Type))
            break;
        case "!=":
            if (obj1 !== "" && obj2 !== "") {
                return eval(obj1 != obj2);
            }
            return true;
            //return eval(convertDataType(operand1, operand1Type) != convertDataType(operand2, operand2Type))
            break;
        case ">":
            if (obj1 !== "" && obj2 !== "") {
                return eval(obj1 > obj2);
            }
            return true;
            //return eval(convertDataType(operand1, operand1Type) > convertDataType(operand2, operand2Type))
            break;
        case ">=":
            if (obj1 !== "" && obj2 !== "") {
                return eval(obj1 >= obj2);
            }
            return true;
            //return eval(convertDataType(operand1, operand1Type) >= convertDataType(operand2, operand2Type))
            break;
        case "<":
            if (obj1 !== "" && obj2 !== "") {
                return eval(obj1 < obj2);
            }
            return true;
            //return eval(convertDataType(operand1, operand1Type) < convertDataType(operand2, operand2Type))
            break;
        case "<=":
            if (obj1 !== "" && obj2 !== "") {
                return eval(obj1 <= obj2);
            } else
                return true;
            //return eval(convertDataType(operand1, operand1Type) <= convertDataType(operand2, operand2Type))
            break;

        default: return eval(operand1 + ' ' + operator + ' ' + operand2);
            break;
    }
};

function clientSpecificCondition() {

    var errMsg = '', // objFieldRules = jsonFieldRules.filter(x => x.IsVisible === true && x.IsMandatory === true);
        objFieldRules = jsonFieldRules.filter(function (x) { return x.IsVisible === true && x.IsMandatory === true; });
    if ($("#IndexPivot_SpecialHandling").length > 0) {
        // if ($("#IndexPivot_SpecialHandling").val() == "true" && (objFieldRules.filter(x => x.FieldName.trim() == "SpecialHandlingInstructions").map(x => x.IsVisible)[0] == true)) {
        if ($("#IndexPivot_SpecialHandling").val() == "true" && objFieldRules.filter(function (x) { return x.FieldName.trim() == "SpecialHandlingInstructions"; }).map(function (x) { return x.IsVisible; })[0] == true) {
            $("#IndexPivot_SpecialHandlingInstructions").removeClass("error");
            //if (objFieldRules.filter(x => x.FieldName.trim() == 'SpecialHandlingInstructions').map(x => x.IsMandatory)[0]) {
            if (objFieldRules.filter(function (x) { return x.FieldName.trim() == 'SpecialHandlingInstructions'; }).map(function (x) { return x.IsMandatory; })[0]) {
                if ($('#IndexPivot_SpecialHandlingInstructions').val() == '' && !$('#IndexPivot_SpecialHandlingInstructions').is(":disabled")) {
                    errMsg += "Please Enter Special Handling Instructions" + "<br>";
                    $("#IndexPivot_SpecialHandlingInstructions").addClass("error");
                }
                else {
                    $("#IndexPivot_SpecialHandlingInstructions").removeClass("error");
                }
            }
        } else {
            if (errMsg.includes("Due Date should be valid i.e M/d/yyyy <br> "))
                errMsg = errMsg.replace("Due Date should be valid i.e M/d/yyyy <br> ", "");
            $("#IndexPivot_Due_Date").removeClass("error");
        }
    }

    if (objFieldRules.filter(function (x) { return (x.FieldName.trim() == "VendorNumber"); }).map(function (x) { return ((x.IsMandatory)); })[0]) {
        errMsg = isVendorActive();
        if (errMsg !== "") {
            return isShowErrorMsg(errMsg);
        }
    }

    if ((objFieldRules.filter(function (x) { return (x.FieldName.trim() == "GridRowPODetailPONumber"); }).map(function (x) { return ((x.IsMandatory)); })[0]) && ($('#IndexPivot_Invoice_Type').val() == "po")) {
        errMsg = isAnyPOEmpty();
        if (errMsg !== "") {
            return isShowErrorMsg(errMsg);
        }
    }

    //TSS Durga(06212019) Added for DiscountAmount Validation.

    if ($("#TagDocumentHeader_InvoiceDiscountAmount").length > 0) {
        errMsg = validateDiscountAmount();
        if (errMsg !== "") {
            return isShowErrorMsg(errMsg);
        }
    }

    return errMsg;
}


function isPOIssues() {
        var data = {};
        var result = '';
         data.documentID = parseInt($("#docId").val());
         data.isWriteWFNotes = false;      
        result = MakeAjaxCall2('GET', false, '/APInvoiceDC/IsPOIssues', data);
        return result;

    }

