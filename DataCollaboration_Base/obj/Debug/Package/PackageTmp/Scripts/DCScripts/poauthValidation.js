validationHeader1 =
    function validationHeader1() {
        //alert(jsonFieldRules);

        var objFieldRules = jsonFieldRules.filter(x => x.IsVisible == true);//jsonFieldRules;

        var errMsg = '';

        //header validation -start  

        if (objFieldRules.filter(x => x.FieldName.trim() == 'Company').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Co_Number').val() == '' || $('#IndexPivot_Co_Number').val() == '<select>' || $('#IndexPivot_Co_Number').val() == '0') {
                errMsg += "Please select company" + "<br>";
                $("#IndexPivot_Co_Number").addClass("error");
            }
            else {
                $("#IndexPivot_Co_Number").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'DivDept').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Div_Dept').val() == '' || $('#IndexPivot_Div_Dept').val() == '<select>' || $('#IndexPivot_Div_Dept').val() == '0') {
                errMsg += "Please select Department code" + "<br>";
                $("#IndexPivot_Div_Dept").addClass("error");
            }
            else {
                $("#IndexPivot_Div_Dept").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'PONumber').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_PO_Number').val() == '') {
                errMsg += "PO Number Required" + "<br>";
                $("#IndexPivot_PO_Number").addClass("error");
            }
            else { $("#IndexPivot_PO_Number").removeClass("error"); }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'PONumberDropdown').map(x => x.IsMandatory)[0]) {
            if ($('#ddlPONumber').val() == '' || $('#ddlPONumber').val() == '<select>' || $('#ddlPONumber').val() == '0') {
                errMsg += "PO Number Required" + "<br>";
                $("#ddlPONumber").addClass("error");
            }
            else { $("#ddlPONumber").removeClass("error"); }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'Description1').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Description1').val() == '') {
                errMsg += "Description Required" + "<br>";
                $("#IndexPivot_Description1").addClass("error");
            }
            else { $("#IndexPivot_Description1").removeClass("error"); }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'ContractNumber').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Contract_Number').val() == '') {
                errMsg += "Contract number Required" + "<br>";
                $("#IndexPivot_Contract_Number").addClass("error");
            }
            else { $("#IndexPivot_Contract_Number").removeClass("error"); }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'DocType').map(x => x.IsMandatory)[0]) {
            //IndexPivot.Doc_Type <select>
            if ($('#IndexPivot_Doc_Type').val() == '' || $('#IndexPivot_Doc_Type').val() == '<select>' || $('#IndexPivot_Doc_Type').val() == '0') {
                errMsg += "Please select Document type" + "<br>";
                $("#IndexPivot_Doc_Type").addClass("error");
            }
            else {
                $("#IndexPivot_Doc_Type").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'MICAuthor').map(x => x.IsMandatory)[0]) {
            if ($('#TagDocumentHeader_CommodityCode').is(':checked') == true) {
                if ($('#TagDocumentHeader_MICAuthor').val() == '' || $('#TagDocumentHeader_MICAuthor').val() == '0' || $('#TagDocumentHeader_MICAuthor').val() == 'Month Paid') {
                    errMsg += "Please select Prepaid month" + "<br>";
                    $("#TagDocumentHeader_MICAuthor").addClass("error");
                }
                else {
                    $("#TagDocumentHeader_MICAuthor").removeClass("error");
                }
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'VendorName').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Vendor_Name').val() == '' || $('#IndexPivot_Vendor_Name').val() == '<select>' || $('#IndexPivot_Vendor_Name').val() == '0') {
                errMsg += "Please select Vendor Name " + " <br> ";
                $("#IndexPivot_Vendor_Name").addClass("error");
            }
            else { $("#IndexPivot_Vendor_Name").removeClass("error"); }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'VendorNumber').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Vendor_Number').val() == '' || $('#IndexPivot_Vendor_Number').val() == '<select>' || $('#IndexPivot_Vendor_Number').val() == '0') {
                errMsg += "Please select Vendor Number  " + " <br> ";
                $("#IndexPivot_Vendor_Number").addClass("error");
            }
            else { $("#IndexPivot_Vendor_Number").removeClass("error"); }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'InvoiceCurrency').map(x => x.IsMandatory)[0]) {
            if ($('#TagDocumentHeader_InvoiceCurrency').val() == '') {
                errMsg += "Invoice Currency Required" + "<br>";
                $("#TagDocumentHeader_InvoiceCurrency").addClass("error");
            }
            else { $("#TagDocumentHeader_InvoiceCurrency").removeClass("error"); }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'RemitToAddress').map(x => x.IsMandatory)[0]) {
            if ($('#TagDocumentHeader_RemitToAddress').val() == '' || $('#TagDocumentHeader_RemitToAddress').val() == '<select>' || $('#TagDocumentHeader_RemitToAddress').val() == '0') {
                errMsg += "Please select RemitToAddress  " + " <br> ";
                $("#TagDocumentHeader_RemitToAddress").addClass("error");
            }
            else { $("#TagDocumentHeader_RemitToAddress").removeClass("error"); }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'InvoiceNumber').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Invoice_Number').val() == '') {
                errMsg += "Invoice Number Required" + "<br>";
                $("#IndexPivot_Invoice_Number").addClass("error");
            }
            else { $("#IndexPivot_Invoice_Number").removeClass("error"); }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'InvoiceDate').map(x => x.IsMandatory)[0]) {
            if (!isDate($('#IndexPivot_Invoice_Date').val(), 'M/d/yyyy')) {
                errMsg += "Invoice Date should be valide i.e M/d/yyyy" + " <br> ";
                $("#IndexPivot_Invoice_Date").addClass("error");
            } else { $("#IndexPivot_Invoice_Date").removeClass("error"); }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'InvoiceAmount').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Invoice_Amount').val() == '') {
                errMsg += "Invoice Amount Required" + " <br> ";
                $("#IndexPivot_Invoice_Amount").addClass("error");
            } else { $("#IndexPivot_Invoice_Amount").removeClass("error"); }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'DueDate').map(x => x.IsMandatory)[0]) {
            if (!isDate($('#IndexPivot_Due_Date').val(), 'M/d/yyyy')) {
                errMsg += "Due Date should be valide i.e M/d/yyyy" + " <br> ";
                $("#IndexPivot_Due_Date").addClass("error");
            } else { $("#IndexPivot_Due_Date").removeClass("error"); }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'AccountingDate').map(x => x.IsMandatory)[0]) {
            if ($('#TagDocumentHeader_AccountingDate').val() == '' || $('#TagDocumentHeader_AccountingDate').val() == '0' || $('#TagDocumentHeader_AccountingDate').val() == '<select>') {
                errMsg += "Please select Accounting Period" + "<br>";
                $("#TagDocumentHeader_AccountingDate").addClass("error");
            }
            else {
                $("#TagDocumentHeader_AccountingDate").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'Terms').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Terms').val() == '' || $('#IndexPivot_Terms').val() == '0' || $('#IndexPivot_Terms').val() == '<select>') {
                errMsg += "Please select Payment terms" + "<br>";
                $("#IndexPivot_Terms").addClass("error");
            }
            else {
                $("#IndexPivot_Terms").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'Rtng_Code').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Rtng_Code').val() == '') {
                errMsg += "Description Required" + "<br>";
                $("#IndexPivot_Rtng_Code").addClass("error");
            }
            else { $("#IndexPivot_Rtng_Code").removeClass("error"); }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'TaxAmount').map(x => x.IsMandatory)[0]) {
            if ($('#TagDocumentHeader_TaxAmount').val() == '') {
                errMsg += "HST Tax Amount Required" + " <br> ";
                $("#TagDocumentHeader_TaxAmount").addClass("error");
            }
            else { $("#TagDocumentHeader_TaxAmount").removeClass("error"); }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'FreightAmount').map(x => x.IsMandatory)[0]) {
            if ($('#TagDocumentHeader_FreightAmount').val() == '') {
                errMsg += "Freight Amount Required" + " <br> ";
                $("#TagDocumentHeader_FreightAmount").addClass("error");
            }
            else { $("#TagDocumentHeader_FreightAmount").removeClass("error"); }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'MiscAmount').map(x => x.IsMandatory)[0]) {
            if ($('#TagDocumentHeader_MiscAmount').val() == '') {
                errMsg += "Misc Amount Required" + " <br> ";
                $("#TagDocumentHeader_MiscAmount").addClass("error");
            }
            else { $("#TagDocumentHeader_MiscAmount").removeClass("error"); }
        }

        //header validation -end        
        //errMsg = errMsg + errExpAcc + errExpAmt + errExpDesc;

        if (errMsg != '') {
            errMsg = 'Required Fields Missing';
            $('.alert').hide();
            Notify(errMsg, null, null, 'danger');
            //$('#errMsg').append(errMsg);
            //$('#errDiv').show();
            return false
        }
        else {
            errMsg = validationConditions();
            if (errMsg != '') {
                $('.alert').hide();
                Notify(errMsg, null, null, 'danger');
                //$('#errMsg').append(errMsg);
                //$('#errDiv').show();
                return false
            }
        }
        return true;
    };

validation1 =
    function validation() {
        var objFieldRules = jsonFieldRules.filter(x => x.IsVisible == true);//jsonFieldRules;
        var errMsg = '';

        //header validation -start

        if (objFieldRules.filter(x => x.FieldName.trim() == 'SiteID').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Co_Number').val() == '' || $('#IndexPivot_Co_Number').val() == '<select>' || $('#IndexPivot_Co_Number').val() == '0') {
                errMsg += "Please select company" + "<br>";
                $("#IndexPivot_Co_Number").addClass("error");
            }
            else {
                $("#IndexPivot_Co_Number").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'DivDept').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Div_Dept').val() == '' || $('#IndexPivot_Div_Dept').val() == '<select>' || $('#IndexPivot_Div_Dept').val() == '0') {
                errMsg += "Please select Department code" + "<br>";
                $("#IndexPivot_Div_Dept").addClass("error");
            }
            else {
                $("#IndexPivot_Div_Dept").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'PONumber').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_PO_Number').val() == '') {
                errMsg += "PO Number Required" + "<br>";
                $("#IndexPivot_PO_Number").addClass("error");
            }
            else { $("#IndexPivot_PO_Number").removeClass("error"); }
        }


        if (objFieldRules.filter(x => x.FieldName.trim() == 'VendorName').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Vendor_Name').val() == '' || $('#IndexPivot_Vendor_Name').val() == '<select>' || $('#IndexPivot_Vendor_Name').val() == '0') {
                errMsg += "Please select Vendor Name " + " <br> ";
                $("#IndexPivot_Vendor_Name").addClass("error");
            }
            else { $("#IndexPivot_Vendor_Name").removeClass("error"); }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'VendorNumber').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Vendor_Number').val() == '' || $('#IndexPivot_Vendor_Number').val() == '<select>' || $('#IndexPivot_Vendor_Number').val() == '0') {
                errMsg += "Please select Vendor Number  " + " <br> ";
                $("#IndexPivot_Vendor_Number").addClass("error");
            }
            else { $("#IndexPivot_Vendor_Number").removeClass("error"); }
        }







        //header validation -end

        //details validation -start   

        var TagDocumentDetail = [];/*$('#ExpenseGrid tbody tr:has(td)').map(function (i, v) {
            var objTagDocDetail = {};
            var $td = $('td', this);
            return {//$td.eq(0).find(":nth-child(5)", this).val();//
                RowStatus: $td.eq(0).find(":nth-child(1)", this).val(),
                DocumentID: $("#docId").val(),//$td.eq(0).find(":nth-child(1)", this).val(),//$td.eq(1).find(":nth-child(3)", this).val(),
                TagDocumentDetailsID: $(this).closest('tr').attr("id"),
                ExpenseAccountNumber: $td.eq(1).text().trim(),
                ExpenseAccountDescription: $td.eq(2).text().trim(),
                ExpensedAmount: $td.eq(3).text().trim()
            }
        }).get();*/
        //details -new code start                       
        var totRow = 0;
        var TagObj = {};
        $('#ExpenseGrid').DataTable().columns().eq(0).each(function (index) {
            var column = $('#ExpenseGrid').DataTable().column(index);
            if (index == 0) {
                totRow = column.data().length;
                column.data().each(function (value, i) {
                    var html = $.parseHTML(value);
                    if (html != null && html != '') {
                        TagObj[i] = {};
                        TagObj[i].RowStatus = html[0].value;
                        if (html.length == 3) {
                            TagObj[i].DocumentID = html[1].value;
                            TagObj[i].TagDocumentDetailsID = html[2].value;
                        }
                        else {
                            TagObj[i].DocumentID = html[2].value;
                            TagObj[i].TagDocumentDetailsID = html[4].value;
                        }
                        /*if (html[0].value == 'Add')
                            TagObj[i].DocumentID = html[1].value;
                        else
                            TagObj[i].DocumentID = html[2].value;
                        if (html[0].value == 'Add')
                            TagObj[i].TagDocumentDetailsID = html[2].value;
                        else
                            TagObj[i].TagDocumentDetailsID = html[4].value;*/
                        TagObj[i].ExpenseAccountNumber = '';
                        TagObj[i].ExpenseAccountDescription = '';
                        TagObj[i].ExpensedAmount = '';
                    }
                });
            }
            if (index == 1) {
                column.data().each(function (value, i) {
                    var html = $.parseHTML(value);
                    if (html != null && html != '') {
                        if (html[0].innerText == undefined) {
                            TagObj[i].ExpenseAccountNumber = value;
                        } else {
                            TagObj[i].ExpenseAccountNumber = html[0].innerText;
                        }
                    }
                });
            }
            if (index == 2) {
                column.data().each(function (value, i) {
                    var html = $.parseHTML(value);
                    if (html != null && html != '') {
                        if (html[0].innerText == undefined) {
                            TagObj[i].ExpenseAccountDescription = value;
                        } else {
                            TagObj[i].ExpenseAccountDescription = html[0].innerText;
                        }
                    }
                });
            }
            if (index == 3) {
                column.data().each(function (value, i) {
                    var html = $.parseHTML(value);
                    if (html != null && html != '') {
                        if (html[0].innerText == undefined) {
                            TagObj[i].ExpensedAmount = value;
                        } else {
                            TagObj[i].ExpensedAmount = html[0].innerText;
                        }
                    }
                });
            }
        });
        if (totRow > 0) {
            var exObj = [];
            for (var j = 0; j < totRow; j++) {
                exObj.push({
                    RowStatus: TagObj[j].RowStatus,
                    DocumentID: TagObj[j].DocumentID,
                    TagDocumentDetailsID: TagObj[j].TagDocumentDetailsID,
                    ExpenseAccountNumber: TagObj[j].ExpenseAccountNumber,
                    ExpenseAccountDescription: TagObj[j].ExpenseAccountDescription,
                    ExpensedAmount: TagObj[j].ExpensedAmount
                });
            }
            if (exObj != null && exObj.length > 0)
                TagDocumentDetail = exObj;
        }
        //details -new code end

        var errExpAcc = '';
        var errExpAmt = '';
        var errExpDesc = '';
        if (TagDocumentDetail != null && TagDocumentDetail.length > 0) {
            for (var i = 0; i < TagDocumentDetail.length; i++) {
                if (TagDocumentDetail[i].RowStatus != 'Delete') {
                    if (objFieldRules.filter(x => x.FieldName.trim() == 'GridRowExpenseAccountNumber').map(x => x.IsMandatory)[0]) {
                        if (TagDocumentDetail[i].ExpenseAccountNumber == '') {
                            var rowNode = $('#ExpenseGrid').DataTable().row(i).node();
                            $(rowNode).find('td').eq(1).addClass('error');

                            if (errExpAcc == '')
                                errExpAcc = 'Expense AccountNumber required ' + " <br> ";
                        }
                        else {
                            var rowNode = $('#ExpenseGrid').DataTable().row(i).node();
                            if ($(rowNode).find('td').eq(1).hasClass('error'))
                                $(rowNode).find('td').eq(1).removeClass('error');
                        }
                    }
                    if (objFieldRules.filter(x => x.FieldName.trim() == 'GridRowExpenseAccountDescription').map(x => x.IsMandatory)[0]) {
                        if (TagDocumentDetail[i].ExpenseAccountDescription == '') {
                            var rowNode = $('#ExpenseGrid').DataTable().row(i).node();
                            $(rowNode).find('td').eq(2).addClass('error');

                            if (errExpDesc == '')
                                errExpDesc = 'Expense Account Description required ' + " <br> ";

                        }
                        else {
                            var rowNode = $('#ExpenseGrid').DataTable().row(i).node();
                            if ($(rowNode).find('td').eq(2).hasClass('error'))
                                $(rowNode).find('td').eq(2).removeClass('error');
                        }
                    }
                    if (objFieldRules.filter(x => x.FieldName.trim() == 'GridRowExpensedAmount').map(x => x.IsMandatory)[0]) {
                        if (!$.isNumeric(TagDocumentDetail[i].ExpensedAmount)) {
                            var rowNode = $('#ExpenseGrid').DataTable().row(i).node();
                            $(rowNode).find('td').eq(3).addClass('error');

                            if (errExpAmt == '')
                                errExpAmt = 'Expensed Amount is not valid';
                        }
                        else {
                            var rowNode = $('#ExpenseGrid').DataTable().row(i).node();
                            if ($(rowNode).find('td').eq(3).hasClass('error'))
                                $(rowNode).find('td').eq(3).removeClass('error');
                        }
                    }
                }
            }
        }

        //details validation -end


        errMsg = errMsg + errExpAcc + errExpAmt + errExpDesc;


        if (errMsg != '') {
            errMsg = 'Required Fields Missing';
            $('.alert').hide();
            Notify(errMsg, null, null, 'danger');
            //$('#errMsg').append(errMsg);
            //$('#errDiv').show();
            return false
        }
        else {
            errMsg = validationConditions();
            if (errMsg != '') {
                $('.alert').hide();
                Notify(errMsg, null, null, 'danger');
                //$('#errMsg').append(errMsg);
                //$('#errDiv').show();
                return false
            }
        }

        return true;
    };

validationDetail =
    function validationDetail(objTagDocumentDetail) {
        var objFieldRules = jsonFieldRules.filter(x => x.IsVisible == true);//jsonFieldRules;
        var errMsg = '';

        if (objFieldRules.filter(x => x.FieldName.trim() == 'GridRowExpenseAccountNumber' || x.FieldName.trim() == 'ExpenseAccountNumber').map(x => x.IsMandatory)[0]) {
            if (objTagDocumentDetail.ExpenseAccountNumber == '') {
                errMsg += 'Expense AccountNumber required ' + " <br> ";
                if (objFieldRules.filter(x => x.FieldName.trim() == 'ExpenseAccountNumber').map(x => x.IsMandatory)[0])
                    $("#txtGLComboBox").addClass("error");
            }
            else {
                if (objFieldRules.filter(x => x.FieldName.trim() == 'ExpenseAccountNumber').map(x => x.IsMandatory)[0])
                    $("#txtGLComboBox").removeClass("error");

            }
        }
        if (objFieldRules.filter(x => x.FieldName.trim() == 'GridRowExpenseAccountDescription' || x.FieldName.trim() == 'ExpenseAccountDescription').map(x => x.IsMandatory)[0]) {
            if (objTagDocumentDetail.ExpenseAccountDescription == '') {
                errMsg += 'Expense Account Description required ' + " <br> ";
                if (objFieldRules.filter(x => x.FieldName.trim() == 'ExpenseAccountDescription').map(x => x.IsMandatory)[0])
                    $("#txtAccountDesc").addClass("error");
            }
            else {
                if (objFieldRules.filter(x => x.FieldName.trim() == 'ExpenseAccountDescription').map(x => x.IsMandatory)[0])
                    $("#txtAccountDesc").removeClass("error");
            }
        }
        if (objFieldRules.filter(x => x.FieldName.trim() == 'GridRowExpensedAmount' || x.FieldName.trim() == 'ExpensedAmount').map(x => x.IsMandatory)[0]) {
            if (!$.isNumeric(objTagDocumentDetail.ExpensedAmount)) {
                errMsg += 'Expensed Amount is not valid';
                if (objFieldRules.filter(x => x.FieldName.trim() == 'ExpensedAmount').map(x => x.IsMandatory)[0])
                    $("#txtExpensedamount").addClass("error");
            }
            else {
                if (objFieldRules.filter(x => x.FieldName.trim() == 'ExpensedAmount').map(x => x.IsMandatory)[0])
                    $("#txtExpensedamount").removeClass("error");
            }
        }

        if (errMsg != '') {
            $('#lblErrMsgDetails').html(errMsg);
            return false
        }
        else {
            errMsg = validationConditions();
            if (errMsg != '') {
                $('#lblErrMsgDetails').html(errMsg);
                return false
            }
        }

        return true;
    };

validationConditions =
    function validationConditions() {
        var objValidationConditions = jsonValidationConditions;
        var errMsg = '';

        var objValidaionIds = $.map(objValidationConditions, function (val, i) { return { ValidationId: val.ValidationId } });
        var objValidaionIdsDistincts = [];
        $.each(objValidaionIds, function (i, item) {
            var items = $.grep(objValidaionIdsDistincts, function (e) {
                return item.validationId === e.validationId;
            });
            if (items.length === 0) {
                objValidaionIdsDistincts.push(item);
            }
        });

        for (var i = 0; i < objValidaionIdsDistincts.length; i++) {
            var itemObj = objValidationConditions.filter(m => m.validationId == objValidaionIdsDistincts[i].validationId);
            var expr = expression(itemObj);
            if (eval(expr)) {
                //console.log('true');
            } else {
                //console.log('false');
                errMsg += itemObj[i].ErrorMessage + ' ' + "<br>";
            }
        }

        return errMsg;
    };

validateForwardUser =
    function validateForwardUser() {

        var objFieldRules = jsonFieldRules.filter(x => x.IsVisible == true);//jsonFieldRules;
        var errMsg = '';

        if (objFieldRules.filter(x => x.FieldName.trim() == 'ForwardTo').map(x => x.IsMandatory)[0]) {
            if ($('#txtForwardTo').val() == '') {
                errMsg += "Please enter a forward User" + "<br>";
                $("#txtForwardTo").addClass("error");
            }
            else {
                $("#txtForwardTo").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'AddNotes').map(x => x.IsMandatory)[0]) {
            if ($('#txtAddNotes').val() == '') {
                errMsg += "Please enter a forward Note" + "<br>";
                $("#txtAddNotes").addClass("error");
            }
            else {
                $("#txtAddNotes").removeClass("error");
            }
        }

        if (errMsg != '') {
            errMsg = 'Required Fields Missing';
            $('.alert').hide();
            Notify(errMsg, null, null, 'danger');
            return false
        }
        else {
            errMsg = verifyForwardUser();
            if (errMsg != '') {
                $('.alert').hide();
                Notify(errMsg, null, null, 'danger');
                //$('#errMsg').append(errMsg);
                //$('#errDiv').show();
                return false
            }
        }

        return true;
    };

verifyForwardUser =
    function verifyForwardUser() {
        var ermsg = '';
        if ($('#txtForwardTo').val().indexOf("[") != -1) {
            //var  verify = "true";
            $("#txtForwardTo").removeClass("error");
        }
        else {
            ermsg += 'Please enter a forward User';
            //var verify = "false";
            $("#txtForwardTo").addClass("error");
        }
        return ermsg;
    };

validateRejectTo =
    function validateRejectTo() {

        var objFieldRules = jsonFieldRules.filter(x => x.IsVisible == true);//jsonFieldRules;
        var errMsg = '';

        if (objFieldRules.filter(x => x.FieldName.trim() == 'RejectTo').map(x => x.IsMandatory)[0]) {
            if ($('#ddlRejectTo').val() == '<select>' || $('#ddlRejectTo').val() == '0' || $('#ddlRejectTo').val() == '') {
                errMsg += "Please select a Node to Reject" + "<br>";
                $("#ddlRejectTo").addClass("error");
            }
            else {
                $("#ddlRejectTo").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'ReasonForRejection').map(x => x.IsMandatory)[0]) {
            if ($('#txtReasonRejection').val() == '') {
                errMsg += "Please Enter Reject Reason" + "<br>";
                $("#txtReasonRejection").addClass("error");
            }
            else {
                $("#txtReasonRejection").removeClass("error");
            }
        }

        if (errMsg != '') {
            errMsg = 'Required Fields Missing';
            $('.alert').hide();
            Notify(errMsg, null, null, 'danger');
            return false
        }

        return true;
    };

expression =
    function expression(obj) {
        if (obj.length > 1) {
            var expr = '';
            for (var i = 0; i < obj.length; i++) {
                expr += '(' + "'" + $('#' + obj[i].Field1EntityName + '_' + obj[i].Field1).val().trim() + "'" + ' ' + obj[i].Operator.trim() + ' ' + "'" + $('#' + obj[i].Field2EntityName + '_' + obj[i].Field2).val().trim() + "'" + ')';
                if (obj[i].Condition != null && obj[i].Condition != '')
                    expr += ' ' + obj[i].Condition + ' ';
            }
            if (expr != '')
                return expr;
        }
        else {
            return '(' + "'" + $('#' + obj[0].Field1EntityName + '_' + obj[0].Field1).val().trim() + "'" + ' ' + obj[0].Operator.trim() + ' ' + "'" + $('#' + obj[0].Field2EntityName + '_' + obj[0].Field2).val().trim() + "'" + ')';
        }
        //alert(obj);
        return true;
    }

validateApprover =
    function validateApprover() {
        var objValidationConditions = jsonValidationConditions.filter(x => x.NodeId == userDetailsID);
        var errMsg = '';

        var objValidaionIds = $.map(objValidationConditions, function (val, i) { return { ValidationId: val.ValidationId } });
        var objValidaionIdsDistincts = [];
        $.each(objValidaionIds, function (i, item) {
            var items = $.grep(objValidaionIdsDistincts, function (e) {
                return item.validationId === e.validationId;
            });
            if (items.length === 0) {
                objValidaionIdsDistincts.push(item);
            }
        });

        for (var i = 0; i < objValidaionIdsDistincts.length; i++) {
            var itemObj = objValidationConditions.filter(m => m.validationId == objValidaionIdsDistincts[i].validationId);
            var expr = expression(itemObj);
            if (eval(expr)) {
                //console.log('true');
            } else {
                //console.log('false');
                errMsg += itemObj[i].ErrorMessage + ' ' + "<br>";
            }
        }

        return errMsg.trim();
    };