var commonDc = {
    Init: function () {
        //onload events -start            

        if ($('#TagDocumentHeader_CommodityCode').is(':checked') == false) {
            $("#TagDocumentHeader_MICAuthor").attr('disabled', 'disabled');
        }       
        $('#IndexPivot_Due_Date').val($('#IndexPivot_Due_Date').val().split(' ')[0].trim());
        $('.dataTables_empty').closest('tr').remove();

       

        apinvoice.PopulateRejectDropDownList();

        //onload events -end


        $('#txtForwardTo').autocomplete({
            source: function (request, response) {
                var url = '/APInvoiceDC/GetForwardUsers?searchText=' + $('#txtForwardTo').val() + '&userDetailsID=' + userDetailsID + '';
                MakeAjaxCall_WithDependantSource(requestGET, url, null, apinvoice.BindAutocompleteTextbox, apinvoice.OnFailure_WithDependantSource, apinvoice.OnError_WithDependantSource, response);
            },
            select: function (a, b) {

            }
        });

        $('#txtSearch').keyup(function () {
            var searchText = $(this).val().toLowerCase();
            $.each($("#ExpenseGrid tbody tr"), function () {
                if ($(this).text().toLowerCase().indexOf(searchText) === -1)
                    $(this).hide();
                else
                    $(this).show();
            });
        });

        //onchange events -start

      

        $("#TagDocumentHeader_CommodityCode").change(function () {
            if ($('#TagDocumentHeader_CommodityCode').is(':checked') == false) {
                $("#TagDocumentHeader_MICAuthor").attr('disabled', 'disabled');
            }
            else {
                $("#TagDocumentHeader_MICAuthor").removeAttr('disabled');
            }
        });

        $("#IndexPivot_Vendor_Name").change(function () {
            $("#txtVendorAddress").val('');
            $("#IndexPivot_Vendor_Number").val($("#IndexPivot_Vendor_Name").val());
            if ($("#IndexPivot_Vendor_Number").val() != "" && $("#IndexPivot_Vendor_Number").val() != "<select>") {
                apinvoice.Dropdownlist_bind_AjaxGet("/APInvoiceDC/GetVendorAddress_ByVendorNoJson?vendorNo=" + $("#IndexPivot_Vendor_Number").val() + "", "#TagDocumentHeader_RemitToAddress", 'ListValue', 'ListText', '\'<select>\'');
            }
            else
                $('#TagDocumentHeader_RemitToAddress').empty().append($('<option>', { value: 0, text: '<select>' }));
        });

        $("#IndexPivot_Vendor_Number").change(function () {
            $("#txtVendorAddress").val('');
            $("#IndexPivot_Vendor_Name").val($("#IndexPivot_Vendor_Number").val());
            if ($("#IndexPivot_Vendor_Number").val() != "" && $("#IndexPivot_Vendor_Number").val() != "<select>")
                apinvoice.Dropdownlist_bind_AjaxGet("/APInvoiceDC/GetVendorAddress_ByVendorNoJson?vendorNo=" + $("#IndexPivot_Vendor_Number").val() + "", "#TagDocumentHeader_RemitToAddress", 'ListValue', 'ListText', '\'<select>\'');
            else
                $('#TagDocumentHeader_RemitToAddress').empty().append($('<option>', { value: 0, text: '<select>' }));
        });

        $("#TagDocumentHeader_RemitToAddress").change(function () {
            $("#txtVendorAddress").val('');
            var vendorNo = $("#IndexPivot_Vendor_Number").find("option:selected").val();
            if (vendorNo == "<select>" || vendorNo == "" || vendorNo == "New Address")
                return false;

            var addrCode = $("#TagDocumentHeader_RemitToAddress").find("option:selected").val();
            var addrText = '/' + $("#TagDocumentHeader_RemitToAddress").find("option:selected").text() + '/';
            var selectedText = $(this).find("option:selected").text();
            var selectedCode = $(this).val();

            if (selectedText == "<select>" || selectedText == "" || selectedText == "New Address")
                return false;

            $("#txtVendorAddress").val('');
            var url = '/APInvoiceDC/GetPopulateAddressTextJson?remitAddrTxt=' + $.trim(selectedText) + '&remitAddrCod=' + $.trim(selectedCode) + '&vendorNo=' + $.trim(vendorNo);
            MakeAjaxCall(requestGET, url, null, apinvoice.PopulateAddressTextbox, apinvoice.OnFailure, apinvoice.OnError);

        });

       

      

        //onchange events -end


        //click events -start

        $("#btnSmartList").click(function () {
            $("#SmartListGrid").DataTable().clear();
            var companyNumber = $('#IndexPivot_Co_Number').val();
            var vendorNumber = $('#IndexPivot_Vendor_Number').val();
            if (userDetailsID != '' && userDetailsID != undefined && companyNumber != '' && companyNumber != undefined && vendorNumber != '' && vendorNumber != undefined) {

                var url = '/APInvoiceDC/GetSmartListJson?userID=' + userDetailsID + '&companyNo=' + companyNumber + '&vendorID=' + vendorNumber;
                MakeAjaxCall(requestGET, url, null, apinvoice.BindSmartList, apinvoice.OnFailure, apinvoice.OnError);

            }
        });

        $("#btnOk").click(function () {

            var TagDocumentDetail = [];

            //details -new code start                       
            var totRow = 0;
            var TagObj = {};
            $('#SmartListGrid').DataTable().columns().eq(0).each(function (index) {

                var column = $('#SmartListGrid').DataTable().column(index);
                if (index == 0) {
                    column.data().each(function (value, i) {
                        TagObj[i] = {};
                        TagObj[i].ExpenseAccountNumber = '';
                        TagObj[i].ExpenseAccountDescription = '';
                        TagObj[i].ExpensedAmount = '';
                        TagObj[i].isSelected = false;
                        var html = $.parseHTML(value);
                        if (html != null && html != '') {
                            if (html[0].innerText == undefined) {
                                TagObj[i].ExpenseAccountNumber = value;
                            } else {
                                TagObj[i].ExpenseAccountNumber = html[0].innerText;
                            }
                        }
                        totRow++;
                    });
                }
                if (index == 1) {
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
                if (index == 2) {
                    column.data().each(function (value, i) {
                        var html = $.parseHTML(value);
                        if (html != null && html != '') {
                            if (html[0].innerText == undefined)
                                TagObj[i].ExpensedAmount = value;
                            else
                                TagObj[i].ExpensedAmount = html[0].innerText;
                        }
                    });
                }
                if (index == 3) {
                    column.data().each(function (value, i) {
                        var html = $.parseHTML(value);
                        if (html != null && html != '') {
                            TagObj[i].isSelected = html[0].checked;
                        }
                    });
                }
            });

            var objTotalRows = [];

            if (totRow > 0) {
                var objRow = [];
                var exObj = [];
                for (var j = 0; j < totRow; j++) {
                    if (TagObj[j].isSelected) {
                        exObj.push({
                            ExpenseAccountNumber: TagObj[j].ExpenseAccountNumber,
                            ExpenseAccountDescription: TagObj[j].ExpenseAccountDescription,
                            ExpensedAmount: TagObj[j].ExpensedAmount
                        });
                    }
                    objRow.push({
                        ExpenseAccountNumber: TagObj[j].ExpenseAccountNumber,
                        ExpenseAccountDescription: TagObj[j].ExpenseAccountDescription,
                        ExpensedAmount: TagObj[j].ExpensedAmount,
                        isSelected: TagObj[j].isSelected
                    });
                }
                if (exObj != null && exObj.length > 0)
                    TagDocumentDetail = exObj;

                if (objRow != null && objRow.length > 0)
                    objTotalRows = objRow;
            }
            //details -new code end

            if (objTotalRows.length > 0) {

                var objArr = objTotalRows.filter(function (m) { return m.isSelected == true && m.ExpensedAmount == ''; });
                $('#lblSmartlistAmountErr').text('');
                if (objArr.length > 0) {
                    var rowNo = 0;
                    $.each(objTotalRows, function () {
                        if (objTotalRows[rowNo].isSelected == true && objTotalRows[rowNo].ExpensedAmount == '') {
                            var rowNode = $('#SmartListGrid').DataTable().row(rowNo).node();
                            $(rowNode).find('td').eq(2).addClass('error');
                        }
                        else {
                            var rowNode = $('#SmartListGrid').DataTable().row(rowNo).node();
                            if ($(rowNode).find('td').eq(2).hasClass('error'))
                                $(rowNode).find('td').eq(2).removeClass('error');
                        }
                        rowNo++;
                    });
                    $('#lblSmartlistAmountErr').text('Required Field Missing');
                }
                else {
                    $.each(TagDocumentDetail, function () {
                        if (this['ExpenseAccountNumber'] != '' && this['ExpenseAccountDescription'] != '' && this['ExpensedAmount'] != '') {
                            var obj = {};
                            obj.DocumentID = $('#HdnDocumentID').val();
                            obj.ExpenseAccountNumber = this['ExpenseAccountNumber'];
                            obj.ExpenseAccountDescription = this['ExpenseAccountDescription'];
                            obj.ExpensedAmount = this['ExpensedAmount'];
                            obj.RowStatus = 'Add';

                            obj.UserID = userDetailsID;
                            obj.CompanyNo = obj.VendorNo = '';
                            if ($('#IndexPivot_Co_Number').val() != 0 && $('#IndexPivot_Co_Number').val() != '<select>') {
                                obj.CompanyNo = $('#IndexPivot_Co_Number').val();
                            }
                            if ($('#IndexPivot_Vendor_Number').val() != 0 && $('#IndexPivot_Vendor_Number').val() != '<select>') {
                                obj.VendorNo = $('#IndexPivot_Vendor_Number').val();
                            }

                            //apinvoice.SaveHeaderDetail(obj, 'Add', '', 'no',null);
                            apinvoice.AddHeaderDetail(obj);
                        }
                        /*else {
                            var markup = apinvoice.String_format(apinvoice.templateRow(), '', this['ExpenseAccountNumber'], this['ExpenseAccountDescription'],
                                '', $('#HdnDocumentID').val(), 'Add');
                            //$("#ExpenseGrid tbody").append(markup);                    
                            var jRow = $("#ExpenseGrid tbody").append(markup);
                            var t = $('#ExpenseGrid').DataTable();
                            t.row.add(jRow[0].rows[jRow[0].rows.length - 1]).draw();
                        }*/
                    });

                    $('#smartlistPopup').dialog('close');
                }
            }
            else {
                $('#smartlistPopup').dialog('close');
            }
            //$('#smartlistPopup').dialog('close');
        });

        $("#btnCancel").click(function () {
            $('#smartlistPopup').dialog('close');
        });

        $("#btnSubmit").click(function () {
            apinvoice.SaveApInvoice('Approve');
            //if ($("#btnSubmit").text() == "Submit / Approve")
            //    apinvoice.SaveApInvoice('Approve');
            //else if ($("#btnSubmit").text() == "Forward To") {
            //    apinvoice.ForwardToBtn_Click();
            //}
            //else if ($("#btnSubmit").text() == "Reject") {
            //    apinvoice.RejectToBtn_Click();
            //}
        });

        $("#btnForwardTo").click(function () {
            apinvoice.ForwardToBtn_Click();
            //if ($("#btnSubmit").text() == "Submit / Approve")
            //    apinvoice.SaveApInvoice('Approve');
            //else if ($("#btnSubmit").text() == "Forward To") {
            //    apinvoice.ForwardToBtn_Click();
            //}
            //else if ($("#btnSubmit").text() == "Reject") {
            //    apinvoice.RejectToBtn_Click();
            //}
        });

        $("#btnReject").click(function () {
            apinvoice.RejectToBtn_Click();
            //if ($("#btnSubmit").text() == "Submit / Approve")
            //    apinvoice.SaveApInvoice('Approve');
            //else if ($("#btnSubmit").text() == "Forward To") {
            //    apinvoice.ForwardToBtn_Click();
            //}
            //else if ($("#btnSubmit").text() == "Reject") {
            //    apinvoice.RejectToBtn_Click();
            //}
        });

        $("#btnSave").click(function () {
            apinvoice.SaveApInvoice();
            //if ($("#btnSubmit").text() == "Submit / Approve")
            //    apinvoice.SaveApInvoice();
            //else if ($("#btnSubmit").text() == "Forward To") {
            //    apinvoice.ForwardToBtn_Click();
            //}
            //else if ($("#btnSubmit").text() == "Reject") {
            //    apinvoice.RejectToBtn_Click();
            //}
        });

        $("#hrefHeaderGeneral").click(function () {

            if ($("#hrefAccountAssignment").hasClass('active'))
                $("#hrefAccountAssignment").removeClass('active');
            if ($("#hrefRejects").hasClass('active'))
                $("#hrefRejects").removeClass('active');
            if ($("#hrefForward").hasClass('active'))
                $("#hrefForward").removeClass('active');

            //$('#btnSubmit').text('Submit / Approve');
            //if (!$('#btnSubmit').hasClass('btn btn-success')) {
            //    if ($('#btnSubmit').hasClass('btn btn-danger'))
            //        $('#btnSubmit').removeClass('btn btn-danger');
            //    $('#btnSubmit').addClass('btn btn-success');
            //}
            $('#btnSubmit').show();
            $('#btnForwardTo').hide();
            $('#btnReject').hide();
            $('#btnSave').show();
        });

        $("#hrefAccountAssignment").click(function () {

            if ($("#hrefForward").hasClass('active'))
                $("#hrefForward").removeClass('active');
            if ($("#hrefHeaderGeneral").hasClass('active'))
                $("#hrefHeaderGeneral").removeClass('active');
            if ($("#hrefRejects").hasClass('active'))
                $("#hrefRejects").removeClass('active');

            apinvoice.AssignLabelData('AccountAssignment');
            if (!$("#hrefAccountAssignment").hasClass('active')) {
                //$('#lblAccAssgnmentInvoiceAmount').text($("#IndexPivot_Invoice_Amount").val());
                //$('#lblAccAssgnmentInvoiceDate').text($("#IndexPivot_Invoice_Date").val());
                //$('#lblAccAssgnmentInvoiceNo').text($("#IndexPivot_Invoice_Number").val());
                //$('#lblAccAssgnmentPONumber').text($("#IndexPivot_PO_Number").val());
                //$('#lblAccAssgnmentVendor').text($("#IndexPivot_Vendor_Name option:selected").text());
                //$('#lblAccAssgnmentCompanyNo').text($("#IndexPivot_Co_Number").val());
                apinvoice.calculateUnAlocatedBal();
                if (!$("#btnSubmit").is(":disabled"))
                    apinvoice.SaveHeaderOnly();
            }

            //$('#btnSubmit').text('Submit / Approve');
            //if (!$('#btnSubmit').hasClass('btn btn-success')) {
            //    if ($('#btnSubmit').hasClass('btn btn-danger'))
            //        $('#btnSubmit').removeClass('btn btn-danger');
            //    $('#btnSubmit').addClass('btn btn-success');
            //}
            $('#btnSubmit').show();
            $('#btnForwardTo').hide();
            $('#btnReject').hide();
            $('#btnSave').show();
        });

        $("#hrefForward").click(function () {

            if ($("#hrefHeaderGeneral").hasClass('active'))
                $("#hrefHeaderGeneral").removeClass('active');
            if ($("#hrefAccountAssignment").hasClass('active'))
                $("#hrefAccountAssignment").removeClass('active');
            if ($("#hrefRejects").hasClass('active'))
                $("#hrefRejects").removeClass('active');

            apinvoice.AssignLabelData('Forward');

            //$('#btnSubmit').text('Forward To');
            //if (!$('#btnSubmit').hasClass('btn btn-success')) {
            //    if ($('#btnSubmit').hasClass('btn btn-danger'))
            //        $('#btnSubmit').removeClass('btn btn-danger');
            //    $('#btnSubmit').addClass('btn btn-success');
            //}
            $('#btnSubmit').hide();
            $('#btnForwardTo').show();
            $('#btnReject').hide();
            $('#btnSave').hide();
        });

        $("#hrefRejects").click(function () {

            if ($("#hrefHeaderGeneral").hasClass('active'))
                $("#hrefHeaderGeneral").removeClass('active');
            if ($("#hrefAccountAssignment").hasClass('active'))
                $("#hrefAccountAssignment").removeClass('active');
            if ($("#hrefForward").hasClass('active'))
                $("#hrefForward").removeClass('active');

            apinvoice.AssignLabelData('Reject');

            //$('#btnSubmit').text('Reject');
            //if (!$('#btnSubmit').hasClass('btn btn-danger')) {
            //    $('#btnSubmit').removeClass('btn btn-success')
            //    $('#btnSubmit').addClass('btn btn-danger');
            //}
            $('#btnSubmit').hide();
            $('#btnForwardTo').hide();
            $('#btnReject').show();
            $('#btnSave').hide();
        });

        $("#btnSearch").click(function () {
            
            var keyValue = $('input[name=chkVendorInfo]:checked').val();
            var serText = $('#searchText').val();
            if (serText != '') {
                $("#txtVendorAddress").val('');

                var ddlVendorName = $('#IndexPivot_Vendor_Name');
                ddlVendorName.empty().append('<option selected="selected" value="0" disabled="disabled">Loading.....</option>');
                var ddlVendorNumber = $('#IndexPivot_Vendor_Number');
                //if ($('#IndexPivot_VendorNameDBA').length > 0) {
                //    ddlVendorName = $('#IndexPivot_VendorNameDBA');
                //}
                ddlVendorNumber.empty().append('<option selected="selected" value="0" disabled="disabled">Loading.....</option>');
                var ddlRemitTo = $("#TagDocumentHeader_RemitToAddress");
                //ddlRemitTo.empty().append('<option selected="selected" value="0">\'<select>\'</option>');
                ddlRemitTo.empty().append($('<option>', { value: 0, text: '<select>' }));

               

                var url = '/APInvoiceDC/GetSearchValue?searchkey=' + keyValue.toLowerCase() + '&searchValue=' + serText.toLowerCase();
                var dependantObj = {};
                dependantObj.ddlVendorName = ddlVendorName;
                dependantObj.ddlVendorNumber = ddlVendorNumber;

                MakeAjaxCall_WithDependantSource(requestGET, url, null, apinvoice.BindVendorDropdownlist, apinvoice.OnFailure_WithDependantSource, apinvoice.OnError_WithDependantSource, dependantObj);

            }
        });

        $('#btnPONumberSearch').click(function () {
            var keyValue = 'shortname';
            var serText = $('#pONumbersearchText').val();
            if (serText != '') {

                var ddlPONumber = $('#ddlPONumber');
                ddlPONumber.empty().append('<option selected="selected" value="0" disabled="disabled">Loading.....</option>');

                var url = '/APInvoiceDC/GetSearchValue_PONumber?searchValue=' + serText.toLowerCase();
                var dependantObj = {};
                dependantObj.currentDropdownlist = ddlPONumber;
                dependantObj.currentDropdownlistValue = 'Value';
                dependantObj.currentDropdownlistText = 'Text';

                MakeAjaxCall_WithDependantSource(requestGET, url, null, apinvoice.BindPONumberDropdownlist, apinvoice.OnFailure_WithDependantSource, apinvoice.OnError_WithDependantSource, dependantObj);
            }
        });
        s
        $(document).on("click", '.delbtn', function (event) {
            var selectedRowIndex = $('#ExpenseGrid').DataTable().row($(this).closest('tr')).index();
            //alert('Row index: ' + selectedRowIndex);

            if (confirm('Confirm Delete')) {
                $(this).closest('tr').find("td:first").children()[0];
                if ($(this).closest('tr').find("td:first").children()[0].value == "Add") {
                    if ($(this).closest('tr')[0].cells[3].innerText == '')
                        $(this).closest('tr')[0].cells[3].innerText = '0';
                    $('#lblBalanceH').text(
                        parseFloat($('#lblBalanceH').text()) - (-parseFloat($(this).closest('tr')[0].cells[3].innerText))
                    );
                    $('#ExpenseGrid').DataTable().row(selectedRowIndex).remove().draw(false);
                }
                else {
                    var obj = {};
                    if ($(this).closest('tr').find("td:first").children().length == 3) {
                        obj.TagDocumentDetailsID = $(this).closest('tr').find("td:first").children()[2].value;
                    }
                    else {
                        obj.TagDocumentDetailsID = $(this).closest('tr').attr("id");
                    }
                    obj.DocumentID = $(this).closest('tr').find("td:first").children()[1].value;
                    obj.ExpenseAccountNumber = '';
                    obj.ExpenseAccountDescription = '';
                    obj.ExpensedAmount = '';
                    obj.RowStatus = 'Delete';
                    obj.UserID = userDetailsID;
                    obj.CompanyNo = obj.VendorNo = '';
                    if ($('#IndexPivot_Co_Number').val() != 0 && $('#IndexPivot_Co_Number').val() != '<select>') {
                        obj.CompanyNo = $('#IndexPivot_Co_Number').val();
                    }
                    if ($('#IndexPivot_Vendor_Number').val() != 0 && $('#IndexPivot_Vendor_Number').val() != '<select>') {
                        obj.VendorNo = $('#IndexPivot_Vendor_Number').val();
                    }
                    //apinvoice.SaveHeaderDetail(obj, 'Delete', selectedRowIndex, 'no',null);
                    apinvoice.DeleteHeaderDetail(obj, selectedRowIndex);
                }
            }
        });

        $(document).on("click", '#btnAdd', function (event) {
            /*$('#lblErrMsgDetails').text('');
    
            var erMsg = '';
            if ($('#txtGLComboBox').val() == "") {
                erMsg += 'ExpenseAccountNumber required ' + '<br>';
                $("#txtGLComboBox").addClass("error");//css({ "background-color": "PapayaWhip" });
            }
            else
                $("#txtGLComboBox").removeClass("error");
    
            if ($('#txtAccountDesc').val() == "") {
                erMsg += 'ExpenseAccountDescription required ' + '<br>';
                $("#txtAccountDesc").addClass("error");//css({ "background-color": "PapayaWhip" });
            }
            else
                $("#txtAccountDesc").removeClass("error");
    
            if (!$.isNumeric($('#txtExpensedamount').val())) {
                erMsg += 'ExpensedAmount should be valide';
                $("#txtExpensedamount").addClass("error");//css({ "background-color": "PapayaWhip" });
            }
            else
                $("#txtExpensedamount").removeClass("error");
    
            if (erMsg != '') {
                $('#lblErrMsgDetails').html(erMsg);
                return false;
            }*/
            var obj = {};
            obj.DocumentID = $('#HdnDocumentID').val();
            //obj.TagDocumentDetailsID = '';
            obj.ExpenseAccountNumber = $('#txtGLComboBox').val();
            obj.ExpenseAccountDescription = $('#txtAccountDesc').val();
            obj.ExpensedAmount = parseFloat($('#txtExpensedamount').val()).toFixed(2);
            obj.RowStatus = $('#HdnRowStatus').val();

            obj.UserID = userDetailsID;
            obj.CompanyNo = obj.VendorNo = '';
            if ($('#IndexPivot_Co_Number').val() != 0 && $('#IndexPivot_Co_Number').val() != '<select>') {
                obj.CompanyNo = $('#IndexPivot_Co_Number').val();
            }
            if ($('#IndexPivot_Vendor_Number').val() != 0 && $('#IndexPivot_Vendor_Number').val() != '<select>') {
                obj.VendorNo = $('#IndexPivot_Vendor_Number').val();
            }

            //apinvoice.SaveHeaderDetail(obj, 'Add', '', 'no',null);
            apinvoice.AddHeaderDetail(obj);
        });

        $(document).on("click", "#ExpenseGrid tbody tr td", function (event) {

            var selectedRowIndex = $('#ExpenseGrid').DataTable().row(this).index();
            //alert('Row index: ' + selectedRowIndex);
            curentTr = $(this).closest('tr');
            curentTr.addClass("rowheight");
            /************************
            prevVal = $(this).closest('tr')[0].cells[3].innerText;
            if ($(this).closest('tr')[0].cells[3].innerText!='')
                prevValstored = $(this).closest('tr')[0].cells[3].innerText;
    
            if ($(this).closest('tr')[0].cells[3].innerText == '' || $(this).closest('tr')[0].cells[3].innerText == undefined || $(this).closest('tr')[0].cells[3].innerText == null) {
                if ($(this).closest('.unbindClick').prevObject.children()[0] != undefined) {
                    if ($.isNumeric($(this).closest('.unbindClick').prevObject.children()[0].value)) {
                        prevVal = $(this).closest('.unbindClick').prevObject.children()[0].value
                    }
                }
            }
            alert(prevValstored);
            ************************/

            var TDID = $(this).attr("id");

            if (TDID.indexOf('td1') > -1 || TDID.indexOf('td3') > -1) {
                var activeElement = $(this);
                var descElement = $(this).parent().children(":eq(2)");
                var OriginalContent = $(this).text();
                if (OriginalContent != '' || OriginalContent == '') {

                    activeElement.html("<input type='text' onfocus='this.select();' value='" + OriginalContent.trim() + "' id='in" + TDID + "' class='form-control input-sm expenseacctnum' style='width: 100%;height: 23px' />");

                    $(this).children().first().focus();

                    //TO allow only numerics in Expense amount
                    $(this).children().first().keypress(function (evt) {

                        if (TDID.indexOf('td1') > -1) {

                        }
                        else {
                            evt = (evt) ? evt : window.event;
                            var charCode = (evt.which) ? evt.which : evt.keyCode;
                            if (charCode == 8 || charCode == 37) {
                                return true;
                            } else if (charCode == 46 && $(this).val().indexOf('.') != -1) {
                                return false;
                            } else if (charCode > 31 && charCode != 46 && (charCode < 48 || charCode > 57)) {
                                return false;
                            }
                            return true;
                        }
                    });

                    $(this).children().first().keydown(function (e) {

                        if (e.which == 9) { //for tab key
                            //  alert('hi');
                            e.preventDefault();
                            var newContent = $(this).val();
                            $(this).blur();
                        }


                        if (e.which == 13) {

                            if (TDID.indexOf('td1') > -1 || TDID.indexOf('td3') > -1) {
                                $(this).parent().text(newContent);
                                apinvoice.UpdateData(selectedRowIndex, curentTr);
                            }
                            else {
                                $(this).parent().text(newContent);
                            }

                        }

                    });

                    $(this).children().first().blur(function () {

                        if (TDID.indexOf('td1') > -1) {
                            var splitVal = activeElement.children().first().val().split("---");
                            if (splitVal.length > 1) {
                                if (typeof splitVal[1] === "undefined") {
                                    activeElement.text(OriginalContent);
                                    $('#lblMessage').text("Invalid GL Account entered");
                                    $('#lblMessage').show();
                                }
                                else {
                                    activeElement.text(splitVal[0]);
                                    descElement.text(splitVal[1]);
                                    // activeElement1.text();
                                    $('#lblMessage').hide();
                                    apinvoice.UpdateData(selectedRowIndex, curentTr);//$(this).closest('tr'));                                                                     
                                }
                            }
                            else {
                                activeElement.text(OriginalContent);
                            }
                        }
                        else {
                            activeElement.text(activeElement.children().first().val());
                            apinvoice.UpdateData(selectedRowIndex, curentTr);//selectedRowIndex, $(this).closest('tr')[0].cells[1].innerText, $(this).closest('tr')[0].cells[2].innerText, $(this).closest('tr')[0].cells[3].innerText);                                                               
                        }

                    });
                }

                //TSS Kiran to auto generate GL account in edit mode
                if (TDID.indexOf('td1') > -1) {
                    $('#in' + TDID).autocomplete({
                        source: function (request, response) {
                            var url = "/APInvoiceDC/GetGLAccountsJson?PreText=" + request.term;
                            MakeAjaxCall_WithDependantSource(requestGET, url, null, apinvoice.BindAutocompleteTextbox, apinvoice.OnFailure_WithDependantSource, apinvoice.OnError_WithDependantSource, response);
                        },
                        select: function (a, b) {
                            //var splitVal = b.item.value.split("---");

                            //$('#txtGLComboBox').val(splitVal[0].trim());
                            //$('#txtAccountDesc').val(splitVal[1].trim());
                        }
                    });
                }


            }
        });

        $(document).on("click", "#SmartListGrid tbody tr td", function (event) {

            var TDID = $(this).attr("id");
            var selectedRowIndex = $('#SmartListGrid').DataTable().row(this).index();
            var thisTr = $(this).closest('tr');

            if (TDID.indexOf('td3') > -1) {
                var activeElement = $(this);
                var descElement = $(this).parent().children(":eq(2)");
                var OriginalContent = $(this).text();
                if (OriginalContent != '' || OriginalContent == '') {
                    activeElement.html("<input type='text' onfocus='this.select();' value='" + OriginalContent.trim() + "' id='in" + TDID + "' class='form-control input-sm expenseacctnum' style='width: 100%;height: 23px' />");
                    $(this).children().first().focus();
                    $(this).children().first().keypress(function (evt) {

                        if (TDID.indexOf('td3') > -1) {
                            evt = (evt) ? evt : window.event;
                            var charCode = (evt.which) ? evt.which : evt.keyCode;
                            if (charCode == 8 || charCode == 37) {
                                return true;
                            } else if (charCode == 46 && $(this).val().indexOf('.') != -1) {
                                return false;
                            } else if (charCode > 31 && charCode != 46 && (charCode < 48 || charCode > 57)) {
                                return false;
                            }
                            return true;
                        }
                    });
                    $(this).children().first().keydown(function (e) {

                        if (e.which == 9) { //for tab key                        
                            e.preventDefault();
                            var newContent = $(this).val();
                            $(this).blur();
                        }

                        if (e.which == 13) {

                            if (TDID.indexOf('td3') > -1) {
                                $(this).parent().text(newContent);
                                var temp = $('#SmartListGrid').DataTable().row(selectedRowIndex).data();
                                if (thisTr[0].cells[2].innerText != undefined && thisTr[0].cells[2].innerText != '')
                                    temp[2] = parseFloat(thisTr[0].cells[2].innerText).toFixed(2);
                                else
                                    temp[2] = thisTr[0].cells[2].innerText;
                                $('#SmartListGrid').dataTable().fnUpdate(temp, selectedRowIndex, undefined, false);
                            }
                            else {
                                $(this).parent().text(newContent);
                            }
                        }
                    });
                    $(this).children().first().blur(function () {

                        if (TDID.indexOf('td3') > -1) {
                            var expncedAmt = activeElement.children().first().val();
                            if (expncedAmt != undefined) {
                                var temp = $('#SmartListGrid').DataTable().row(selectedRowIndex).data();
                                if (expncedAmt != '')
                                    temp[2] = parseFloat(expncedAmt).toFixed(2);
                                else
                                    temp[2] = expncedAmt;

                                if ($.isNumeric(temp[2]))
                                    temp[3] = '<input type="checkbox" checked="checked">';
                                $('#SmartListGrid').dataTable().fnUpdate(temp, selectedRowIndex, undefined, false);
                            }
                        }
                        //else {
                        //    activeElement.text(activeElement.children().first().val());
                        //    //UpdateData(selectedRowIndex);//selectedRowIndex, $(this).closest('tr')[0].cells[1].innerText, $(this).closest('tr')[0].cells[2].innerText, $(this).closest('tr')[0].cells[3].innerText);
                        //    //calculateUnAlocatedBal();                           
                        //}

                    });
                }
            }

            if (TDID.indexOf('td4') > -1) {
                var temp = $('#SmartListGrid').DataTable().row(selectedRowIndex).data();
                if (temp[3].indexOf('checked') == -1) {
                    temp[3] = '<input type="checkbox" checked="checked">'
                }
                else {
                    temp[3] = '<input type="checkbox">'
                }

                $('#SmartListGrid').dataTable().fnUpdate(temp, selectedRowIndex, undefined, false);
            }
        });

        $(document).on("click", '#btnAddNotes', function (event) {

            var erMsg = '';
            if ($('#txtAddNotes').val() == "") {
                erMsg += 'Please enter some Notes before adding it' + ' <br>';
                $("#txtAddNotes").addClass("error");
            }
            else
                $("#txtAddNotes").removeClass("error");

            if ($('#HdnDocumentID').val() == "") {
                erMsg += 'DocumentID required <br>';
            }
            if (userDetailsID == "") {
                erMsg += 'userDetailsID required';
            }

            if (erMsg != '') {
                Notify(erMsg, null, null, "danger");
            }
            else {
                var obj = {};
                obj.DocumentID = $('#HdnDocumentID').val();
                obj.UserDetailsID = userDetailsID;
                obj.Note = $('#txtAddNotes').val();

                var jsonString = JSON.stringify(obj);

                var url = '/APInvoiceDC/SaveWorkFlowNotes';
                var dependantObj = {};
                dependantObj.successMsg = 'Note has been saved successfully';
                dependantObj.warningMsg = 'Note is already exists';
                dependantObj.failureMsg = 'Note has not been saved successfully';
                dependantObj.errorMsg = 'Note has not been saved successfully';

                MakeAjaxCall_WithDependantSource(requestPOST, url, jsonString, apinvoice.OnSuccessWorkFlowNotesPOST, apinvoice.OnFailureWorkFlowNotesPOST, apinvoice.OnErrorWorkFlowNotesPOST, dependantObj);

            }
        });

        $(document).on("dblclick", '#txtForwardTo', function (event) {
            prevSelectedForwardUser = $('#txtForwardTo').val();
            $('#txtForwardTo').removeAttr("readonly");
        });

        $('#txtForwardTo').blur(function () {
            $("#txtForwardTo").removeClass("error");
            if ($('#txtForwardTo').val() == '' || verifyForwardUser() != '') {
                $('#txtForwardTo').val(prevSelectedForwardUser);
            }

            $('#txtForwardTo').attr("readonly", "readonly");
            //css("@readonly", "readonly");
        });

        $(".allowdecimalsOnly").on("keypress keyup blur", function (event) {
            //this.value = this.value.replace(/[^0-9\.]/g,'');
            $(this).val($(this).val().replace(/[^0-9\.]/g, ''));
            if ((event.which != 46 || $(this).val().indexOf('.') != -1) && (event.which < 48 || event.which > 57)) {
                event.preventDefault();
            }
        });

        //click events -end


    },
}



$('#btnUploadFile').click(function () {
    //var filepath = $('#fileToUpload').val();
    //var formData = new window.FormData(); 
    //var fileData = fileInput.prop("files")[0]; 
    //formData.append("file", fileData); 
    alert("Hi");
    //var fileInput = $('#fileToUpload');
    //var fileData = fileInput.prop("files")[0];   // Getting the properties of file from file field
    //var formData = new window.FormData();                  // Creating object of FormData class

    //formData.append("file", fileData);
    //formData.append("Uploadfolder", $("#UploadFolder").val());
    //formData.append("DocumentName", $("#Documentname").val());
    //formData.append("ParentDocumentname", $("#txtInvoiceAmount").val());
    //formData.append("ScanDate", $("#ScanDate").val());
    //$.ajax({
    //    url: "RelatedDocuments/UploadDocument",
    //    type: "POST",
    //    contentType: false,
    //    processData: false,
    //    data: formData,
    //    success: function (result) {

    //        if (result.indexOf('Potential') > -1) {
    //            ddiToast('error', '"Potential duplicate. The file has already been uploaded."', 'Duplicate File');
    //            return;
    //        }

    //        if (result.indexOf('Err') > -1) {

    //            ddiToast('error', 'Error confirming upload', 'Upload Error');
    //            return;
    //        }


    //        ddiToast('success', 'File Uploaded Successfully.', 'Upload Successful')
    //        $("#UploadInvoiceFile").css('display', 'none');

    //        // FOR ie browsers 
    //        var isIE = /*@cc_on!@*/false || !!document.documentMode;
    //        // alert(isIE);
    //        if (isIE) {
    //            var fileopen = $("input[type='file']"),
    //                clone = fileopen.clone(true);
    //            fileopen.replaceWith(clone);
    //        }
    //        else {
    //            //other browsers
    //            $("input[type='file']").val('');
    //        }
    //    }
    //    });
});