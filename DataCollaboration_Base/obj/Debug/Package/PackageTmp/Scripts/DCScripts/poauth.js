var prevSelectedForwardUser,
    prevValstored,
    prevVal,
    curentTr,
    requestGET = "GET",
    requestPOST = "POST",
    approverObj,
    approverList,
    baseUrlPOAuth = '',
    vendorAddress = '',
    RemitVal = "",
    oldForwardText = '',
    oldProjectNumber = '',
    oldSiteId = '',
    RejectNotePrefix = '';

var poauth = {

    Init: function () {
        //onload events -start           
        $('#spnSpendCategory').hide();
        RemitVal = $('#IndexPivot_RemitToAddress').val();
        oldProjectNumber = $('#IndexPivot_PANumber').val();
        oldSiteId = $('#IndexPivot_SiteID').val();

        if ($('#TagDocumentHeader_CommodityCode').is(':checked') == false) {
            $("#TagDocumentHeader_MICAuthor").attr('disabled', 'disabled');
        }
        poauth.PopulateRejectDropDownList();
        //onload events -end
        $('#txtForwardTo').autocomplete({
            source: function (request, response) {
                var url = '/poauthDC/GetForwardUsers?searchText=' + $('#txtForwardTo').val() + '&userDetailsID=' + userDetailsID + '&workflowID=' + workFlowId + '&documentID=' + $("#docId").val() + '';
                MakeAjaxCall_WithDependantSource(requestGET, url, null, poauth.bindAutocompleteTextbox, poauth.OnFailure_WithDependantSource, poauth.OnError_WithDependantSource, response);
            },
            select: function (a, b) {
                oldForwardText = b.item.value;
            }
        });
        $('#IndexPivot_PANumber').autocomplete({
            source: function (request, response) {
                if ($('#IndexPivot_PANumber').val().trim() != '') {
                    var url = '/poauthDC/GetActivePANumbers?pANumber=' + $('#IndexPivot_PANumber').val().trim() + '&isSelected=' + false;
                    MakeAjaxCall_WithDependantSource(requestGET, url, null, poauth.bindAutocompletePANumberTextbox, poauth.OnFailure_WithDependantSource, poauth.OnError_WithDependantSource, response);
                }
            },
            select: function (a, b) {

                $("#tblPADetails tr:eq(1)").remove();
                var data = b.item.data;
                var total = parseFloat(data.Jan) + parseFloat(data.Feb) + parseFloat(data.Mar) + parseFloat(data.Apr) + parseFloat(data.May) + parseFloat(data.Jun) + parseFloat(data.Jul) + parseFloat(data.Aug) + parseFloat(data.Sep) + parseFloat(data.Oct) + parseFloat(data.Nov) + parseFloat(data.Dec);
                var tr;
                tr = $('<tr/>');
                tr.append("<td style='padding: 10px;'>" + data.PANumber + "</td>");
                tr.append("<td style='padding: 10px;'>" + data.BudgetAmount + "</td>");
                tr.append("<td style='padding: 10px;'>" + data.CurrentSpend + "</td>");
                tr.append("<td style='padding: 10px;'>" + data.Year + "</td>");
                tr.append("<td style='padding: 10px;'>" + data.MultiYear + "</td>");
                tr.append("<td style='padding: 10px;'>" + data.Jan + "</td>");
                tr.append("<td style='padding: 10px;'>" + data.Feb + "</td>");
                tr.append("<td style='padding: 10px;'>" + data.Mar + "</td>");
                tr.append("<td style='padding: 10px;'>" + data.Apr + "</td>");
                tr.append("<td style='padding: 10px;'>" + data.May + "</td>");
                tr.append("<td style='padding: 10px;'>" + data.Jun + "</td>");
                tr.append("<td style='padding: 10px;'>" + data.Jul + "</td>");
                tr.append("<td style='padding: 10px;'>" + data.Aug + "</td>");
                tr.append("<td style='padding: 10px;'>" + data.Sep + "</td>");
                tr.append("<td style='padding: 10px;'>" + data.Oct + "</td>");
                tr.append("<td style='padding: 10px;'>" + data.Nov + "</td>");
                tr.append("<td style='padding: 10px;'>" + data.Dec + "</td>");
                tr.append("<td style='padding: 10px;'>" + total + "</td>");

                $('#tblPADetails').append(tr);

            }
        });

        $('#txtForwardTo').blur(function () {
            poauth.blurForwardTo();
           
        });
        $('#IndexPivot_PANumber').blur(function () {
            poauth.blurPANumber();
        });

        //onchange events -start
        $("#IndexPivot_CompCode").change(function () {
            poauth.changeCompCode();
        });
        $("#IndexPivot_SiteID").change(function () {
            poauth.changeSiteID();
        });
        $("#IndexPivot_Vendor_Name").change(function () {

            poauth.changeVendor_Name();
        });
        $("#IndexPivot_Vendor_Number").change(function () {
            poauth.changeVendor_Number();
        });
        $("#IndexPivot_RemitToAddress").change(function () {
            poauth.changeRemitToAddress();
        });
        $("#IndexPivot_Capex").change(function () {
            poauth.changeCapex();
        });

        //onclick events
        $('#btnView').click(function () {
            poauth.btnViewClick();
        });
        $('#btnViewSpendCatBudget').click(function () {
            poauth.btnViewSpendCatBudgetClick();
        });
        $("#ApprovepanelPopup").dialog({
            autoOpen: false,
            modal: true,
            title: "Please select an Approver",
            width: "80%",
            maxWidth: "668px"
        });
        $("#btnSubmit").click(function () {
            poauth.savePOAuthInfo('Approve');
        });
        $("#btnForwardTo").click(function () {
            poauth.btnForwardToClick();
        });
        $("#btnReject").click(function () {
            poauth.btnRejectClick();
        });
        $('#btnSendToApprover').click(function () {

            poauth.btnSendToApproverClick();
        });
        $('#btnClose').click(function () {
            poauth.btnCloseClick();
        });
        $("#btnSave").click(function () {
            poauth.savePOAuthInfo();
        });
        $("#btnSearch").click(function () {
            poauth.btnSearchClick();
        });
        $('#btnPONumberSearch').click(function () {
            poauth.btnPONumberSearchClick();
        });
        $("#btnReplyToSender").click(function () {
            poauth.btnReplyToSenderClick();
        });

        $("#hrefHeaderGeneral").click(function () {
            poauth.hrefHeaderGeneralClick();
            
        });
        $("#hrefAccountAssignment").click(function () {

            poauth.hrefAccountAssignmentClick();
        });
        $("#hrefForward").click(function () {
            poauth.hrefForwardClick();
            
        });
        $("#hrefRejects").click(function () {
            poauth.hrefRejectsClick(); 
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

                var url = '/POAuthDC/SaveWorkFlowNotes';
                var dependantObj = {};
                dependantObj.successMsg = 'Note has been saved successfully';
                dependantObj.warningMsg = 'Note is already exists';
                dependantObj.failureMsg = 'Note has not been saved successfully';
                dependantObj.errorMsg = 'Note has not been saved successfully';

                MakeAjaxCall_WithDependantSource(requestPOST, url, jsonString, poauth.OnSuccessWorkFlowNotesPOST, poauth.OnFailureWorkFlowNotesPOST, poauth.OnErrorWorkFlowNotesPOST, dependantObj);

            }
        });
        $(document).on("click", '#txtForwardTo', function (event) {
            prevSelectedForwardUser = $('#txtForwardTo').val();
            $('#txtForwardTo').removeAttr("readonly");
        });

        //click events -end

        if ($('#IndexPivot_CompCode').val() == "") {
            $('#IndexPivot_CompCode').prop('selectedIndex', 1);
            if ($("#IndexPivot_SiteID").val() == "<select>" || $("#IndexPivot_SiteID").val() == "") {
                $('#IndexPivot_CompCode').trigger("change");
            }
        }
        $('#IndexPivot_BillAddress1').val("P.O. Box 60009 \nCity of Industry, CA  91716");
        $("#chkVendorInfo").prop("checked", true);

        if ($("#IndexPivot_RemitToAddress").val().length > 0) {
            $('#divRemitToAddress').css('display', 'block');
        } else {
            $('#divRemitToAddress').css('display', 'none');
        }

        if ($('#lblPONumber').text().substring(0, 2) == "DA") {
            $('#IndexPivot_POOrigin').val('DA');
            $('#IndexPivot_Unit_Number').attr('disabled', 'disabled');
            $('#IndexPivot_POType').val('Standard');

        } else {
            $('#IndexPivot_POOrigin').val('DOS');
            $('#IndexPivot_Capex').val('NonCAPEX');
            $('#IndexPivot_Capex').attr('disabled', 'disabled');
        }

        if ($('#IndexPivot_PANumber').val().trim().length > 0) {
            $('#IndexPivot_PANumber').trigger("blur");
        }
        if ($('#IndexPivot_Vendor_Name > option').length >= 3) {
            $("#IndexPivot_Vendor_Name").prop('selectedIndex', 1)
        }
        $('#IndexPivot_Vendor_Name').trigger("change");

        $('#IndexPivot_SiteID').change(function () {
            poauth.chargeSiteID();
        });
        if (!$("#IndexPivot_SiteID").is(":disabled")) {
            if ($('#IndexPivot_SiteID').length > 0) {
                if ($('#IndexPivot_SiteID').val() == '100') {
                    $('#IndexPivot_DeptCode').removeAttr('disabled');
                }
                else {
                    $("#IndexPivot_DeptCode option:contains(<select>)").prop('selected', true);
                    $('#IndexPivot_DeptCode').attr('disabled', 'disabled');
                }
            }
        };

        
        $('#IndexPivot_SiteID').trigger("change");
        $('#IndexPivot_Capex').trigger("change");

        var objRejectNotePrefix = jsonDCConfigurations.filter(x => x.ConfigName == 'RejectNotePrefix');
        if (objRejectNotePrefix != null && objRejectNotePrefix.length > 0) {
            if (objRejectNotePrefix[0] != null) {
                RejectNotePrefix = objRejectNotePrefix[0].ConfigValue;
            }
        }

    },

    //functions -start

    assignLabelData: function (partial) {

        $("div[id='" + partial + "'] label[id='lblAccAssgnmentCompanyNo']").text($("#IndexPivot_CompCode option:selected").text() == '<select>' ? '' : $("#IndexPivot_CompCode option:selected").text());
        $("div[id='" + partial + "'] label[id='lblAccAssgnmentSiteID']").text($("#IndexPivot_SiteID option:selected").text() == '<select>' ? '' : $("#IndexPivot_SiteID option:selected").text());
        $("div[id='" + partial + "'] label[id='lblAccAssgnmentVendor']").text($("#IndexPivot_Vendor_Name option:selected").text() == '<select>' ? '' : $("#IndexPivot_Vendor_Name option:selected").text());

        $("div[id='" + partial + "'] label[id='lblAccAssgnmentPONumber']").text($('#lblPONumber').text());
        $("div[id='" + partial + "'] label[id='lblAccAssgnmentPANumber']").text($("#IndexPivot_PANumber").val());
        $("div[id='" + partial + "'] label[id='lblAccAssgnmentPaymentTerms']").text($("#IndexPivot_PaymentTerms").val());

        $("div[id='" + partial + "'] label[id='lblAccAssgnmentVendorNumber']").text($("#IndexPivot_Vendor_Number option:selected").text() == '<select>' ? '' : $("#IndexPivot_Vendor_Number option:selected").text());
        $("div[id='" + partial + "'] label[id='lblAccAssgnmentVendorAddress']").text($("#txtVendorAddress").text());
    },

    bindPaymentTerms: function (data) {
        $("#IndexPivot_PaymentTerms").val(data);
    },

    bindModelPopupPANumber: function (data) {

        if (data.length == 0) {
            $('#spnModal').text('Project budget details not found'); $('#tblPADetails').hide();
            $('#spnModal').text('Project budget details not found');
        } else {
            $('#spnModal').text('');
            $('#tblPADetails').show();
            $("#tblPADetails tr:eq(1)").remove();

            $('#IndexPivot_PADescription').val(data[0].PADescription);

            $.map(data, function (item) {
                var tr;
                var total = parseFloat(item.Jan) + parseFloat(item.Feb) + parseFloat(item.Mar) + parseFloat(item.Apr) + parseFloat(item.May) + parseFloat(item.Jun) + parseFloat(item.Jul) + parseFloat(item.Aug) + parseFloat(item.Sep) + parseFloat(item.Oct) + parseFloat(item.Nov) + parseFloat(item.Dec)

                tr = $('<tr/>');
                tr.append("<td style='padding: 10px;'>" + item.PANumber + "</td>");
                tr.append("<td style='padding: 10px;'>" + item.BudgetAmount + "</td>");
                tr.append("<td style='padding: 10px;'>" + item.CurrentSpend + "</td>");
                tr.append("<td style='padding: 10px;'>" + item.Year + "</td>");
                tr.append("<td style='padding: 10px;'>" + item.MultiYear + "</td>");
                tr.append("<td style='padding: 10px;'>" + item.Jan + "</td>");
                tr.append("<td style='padding: 10px;'>" + item.Feb + "</td>");
                tr.append("<td style='padding: 10px;'>" + item.Mar + "</td>");
                tr.append("<td style='padding: 10px;'>" + item.Apr + "</td>");
                tr.append("<td style='padding: 10px;'>" + item.May + "</td>");
                tr.append("<td style='padding: 10px;'>" + item.Jun + "</td>");
                tr.append("<td style='padding: 10px;'>" + item.Jul + "</td>");
                tr.append("<td style='padding: 10px;'>" + item.Aug + "</td>");
                tr.append("<td style='padding: 10px;'>" + item.Sep + "</td>");
                tr.append("<td style='padding: 10px;'>" + item.Oct + "</td>");
                tr.append("<td style='padding: 10px;'>" + item.Nov + "</td>");
                tr.append("<td style='padding: 10px;'>" + item.Dec + "</td>");
                tr.append("<td style='padding: 10px;'>" + total + "</td>");

                $('#tblPADetails').append(tr);
            });
        }
        $('#myModal').modal({ show: true });

    },

    bindModelPopupspendCatagoryBudget: function bindModelPopupspendCatagoryBudget(data) {
        var decimalpointsClass = 'allow2decimalsOnly';
        $("#tblSpendCategoryBudget tbody").remove();

        if (data.length == 0) {
            $('#spnModalSpendCategory').text('Spend catagory budget details not found'); $('#tblSpendCategoryBudget').hide();
            $('#spnModalSpendCategory').text('Spend catagory budget details not found');
        } else {
            $('#spnModalSpendCategory').text('');
            $('#tblSpendCategoryBudget').show();

            $('#spnTotalPendingPOs').text(poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, data[0].TotalPendingPOs)));            

            var tbody = $('<tbody/>');

            var budgetTr = $('<tr/>');
            var spentTr = $('<tr/>');

            var objBudget = data.find(m => m.SpendType.trim() == 'Budget');
            var objSpent = data.find(m => m.SpendType.trim() == 'Approved POs + Current PO');

            if (objBudget != null) {

                budgetTr.append("<td style='padding: 8px;'>" + objBudget.SpendType + "</td>");
                budgetTr.append("<td class='allowCurrecyFormat' style='padding: 10px 4px 0px 0px; text-align: right;'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objBudget.YTD)) + "</td>");

                budgetTr.append("<td class='allowCurrecyFormat' style='padding: 10px 4px 0px 0px; text-align: right;'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objBudget.Jan)) + "</td>");
                budgetTr.append("<td class='allowCurrecyFormat' style='padding: 10px 4px 0px 0px; text-align: right;'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objBudget.Feb)) + "</td>");
                budgetTr.append("<td class='allowCurrecyFormat' style='padding: 10px 4px 0px 0px; text-align: right;'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objBudget.Mar)) + "</td>");
                budgetTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objBudget.Apr)) + "</td>");

                budgetTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objBudget.May)) + "</td>");
                budgetTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objBudget.Jun)) + "</td>");
                budgetTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objBudget.Jul)) + "</td>");
                budgetTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objBudget.Aug)) + "</td>");

                budgetTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objBudget.Sep)) + "</td>");
                budgetTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objBudget.Oct)) + "</td>");
                budgetTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objBudget.Nov)) + "</td>");
                budgetTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objBudget.Dec)) + "</td>");

                tbody.append(budgetTr);
            }

            if (objSpent != null) {

                spentTr.append("<td style='padding: 8px;'>" + objSpent.SpendType + "</td>");

                var ytdColor = objSpent.YTD <= objBudget.YTD ? "color: green;" : objSpent.YTD > objBudget.YTD ? "color: red;" : "";
                spentTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;" + ytdColor + "'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objSpent.YTD)) + "</td>");

                var janColor = objSpent.Jan <= objBudget.Jan ? "color: green;" : objSpent.Jan > objBudget.Jan ? "color: red;" : "";
                spentTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;" + janColor + "'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objSpent.Jan)) + "</td>");

                var febColor = objSpent.Feb <= objBudget.Feb ? "color: green;" : objSpent.Feb > objBudget.Feb ? "color: red;" : "";
                spentTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;" + febColor + "'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objSpent.Feb)) + "</td>");

                var marColor = objSpent.Mar <= objBudget.Mar ? "color: green;" : objSpent.Mar > objBudget.Mar ? "color: red;" : "";
                spentTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;" + marColor + "'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objSpent.Mar)) + "</td>");

                var aprColor = objSpent.Apr <= objBudget.Apr ? "color: green;" : objSpent.Apr > objBudget.Apr ? "color: red;" : "";
                spentTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;" + aprColor + "'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objSpent.Apr)) + "</td>");


                var mayColor = objSpent.May <= objBudget.May ? "color: green;" : objSpent.May > objBudget.May ? "color: red;" : "";
                spentTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;" + mayColor + "'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objSpent.May)) + "</td>");

                var junColor = objSpent.Jun <= objBudget.Jun ? "color: green;" : objSpent.Jun > objBudget.Jun ? "color: red;" : "";
                spentTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;" + junColor + "'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objSpent.Jun)) + "</td>");

                var julColor = objSpent.Jul <= objBudget.Jul ? "color: green;" : objSpent.Jul > objBudget.Jul ? "color: red;" : "";
                spentTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;" + julColor + "'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objSpent.Jul)) + "</td>");

                var augColor = objSpent.Aug <= objBudget.Aug ? "color: green;" : objSpent.Aug > objBudget.Aug ? "color: red;" : "";
                spentTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;" + augColor + "'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objSpent.Aug)) + "</td>");


                var sepColor = objSpent.Sep <= objBudget.Sep ? "color: green;" : objSpent.Sep > objBudget.Sep ? "color: red;" : "";
                spentTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;" + sepColor + "'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objSpent.Sep)) + "</td>");

                var octColor = objSpent.Oct <= objBudget.Oct ? "color: green;" : objSpent.Oct > objBudget.Oct ? "color: red;" : "";
                spentTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;" + octColor + "'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objSpent.Oct)) + "</td>");

                var novColor = objSpent.Nov <= objBudget.Nov ? "color: green;" : objSpent.Nov > objBudget.Nov ? "color: red;" : "";
                spentTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;" + novColor + "'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objSpent.Nov)) + "</td>");

                var decColor = objSpent.Dec <= objBudget.Dec ? "color: green;" : objSpent.Dec > objBudget.Dec ? "color: red;" : "";
                spentTr.append("<td style='padding: 10px 4px 0px 0px; text-align: right;" + decColor + "'>" + poauth.GetDisplayCurrencyFormat(poauth.GetFormattedNumber(decimalpointsClass, objSpent.Dec)) + "</td>");

                tbody.append(spentTr);
            }
            $('#tblSpendCategoryBudget').append(tbody);            
        }
        $('#PopupSpendCategoryBudget').modal({ show: true });
    },

    bindPANumberDesc: function (data) {
        if (data.length > 0) {
            var projectNumber = $('#IndexPivot_PANumber').val();
            var res = data.filter(function (item, index) {
                if (projectNumber == item.PANumber) {
                    return item.PADescription
                };
            });
            if (res.length > 0) {
                $('#IndexPivot_PADescription').val(res[0].PADescription);
                $('#IndexPivot_PANumber').removeClass("error");
            } else {
                $('#IndexPivot_PADescription').val('');
                $('#IndexPivot_PANumber').addClass("error");
            }
        } else {
            $('#IndexPivot_PANumber').addClass("error");
        }
    },

    bindPONumberDropdownlist: function (data, dependantObj) {
        dependantObj.currentDropdownlist.empty();
        $.each(data, function () {
            dependantObj.currentDropdownlist.append($('<option>', { value: this[dependantObj.currentDropdownlistValue], text: this[dependantObj.currentDropdownlistText] }));
        });
    },

    bindVendorDropdownlist: function (data, dependantObj) {
        dependantObj.ddlVendorName.empty().append($('<option>', { value: 0, text: '<select>' }));
        dependantObj.ddlVendorNumber.empty().append($('<option>', { value: 0, text: '<select>' }));
        $.each(data, function () {
            dependantObj.ddlVendorName.append($("<option></option>").val(this['Number']).html(this['Name']));
            dependantObj.ddlVendorNumber.append($("<option></option>").val(this['Number']).html(this['Number']));
        });
    },

    bindAutocompleteTextbox: function (data, dependantSource) {
        dependantSource($.map(data, function (item) {
            return {
                label: item.GlCodeWithDesc,
                value: item.GlCode,
                desc: item.Description
            }
        }));
        window.scrollTo(0, document.body.scrollHeight);
    },

    bindAutocompletePANumberTextbox: function (data, dependantSource) {
        dependantSource($.map(data, function (item) {
            return {
                value: item.PANumber,
                label: item.PANumber,
                data: item
            }
        }));
    },

    bindCurrentDropdownlist: function (data, dependantObj) {

        dependantObj.currentDropdownlist.empty().append($('<option>', { value: '<select>', text: '<select>' }));

        $.each(data, function () {
            dependantObj.currentDropdownlist.append($("<option></option>").val(this[dependantObj.currentDropdownlistValue]).html(this[dependantObj.currentDropdownlistText]));
        });

        if (dependantObj.IsRemitAddress) {
            var isNewAddress;
            var objDCConfigurations = jsonDCConfigurations.filter(x => x.ConfigName == 'IsVendorMaintenanceRequired');
            if (objDCConfigurations[0] != null) {
                isNewAddress = objDCConfigurations[0].ConfigValue;
            }

            var locationCount = 2;
            if (isNewAddress == 'false') {
                locationCount = 1;
            } else {
                locationCount = 2;
            }

            if (data.length > locationCount) {
                $('#divRemitToAddress').css('display', 'block');
                $('#IndexPivot_RemitToAddress :nth-child(2)').prop('selected', true);
                $('#IndexPivot_RemitToAddress').trigger('change');
            }
            else {
                $('#divRemitToAddress').css('display', 'none');
                $("#txtVendorAddress").val(data[0].AddressText);
            }
        }
        if (dependantObj.IsRemitAddress == true && data.length > 1) {
            dependantObj.currentDropdownlist.find('option[value="' + RemitVal + '"]').attr('selected', 'selected');
            dependantObj.currentDropdownlist.trigger("change");
        }

    },


    blurForwardTo: function () {
        $("#txtForwardTo").removeClass("error");
        if ($('#txtForwardTo').val() == '' || verifyForwardUser() != '') {
            $('#txtForwardTo').val(prevSelectedForwardUser);
        }
        $('#txtForwardTo').attr("readonly", "readonly");
    },

    blurPANumber: function () {
        var response = [];
        if ($('#IndexPivot_PANumber').val().trim() != '') {
            var url = '/poauthDC/GetActivePANumbers?pANumber=' + $('#IndexPivot_PANumber').val().trim() + '&isSelected=' + true;
            MakeAjaxCall_WithDependantSource(requestGET, url, null, poauth.bindPANumberDesc, poauth.OnFailure_WithDependantSource, poauth.OnError_WithDependantSource, response);
        }
        else {
            $('#IndexPivot_PADescription').val('');
            $('#IndexPivot_PANumber').removeClass("error");
        }

        if ($('#IndexPivot_PANumber').val() != oldProjectNumber) {
            poauth.checkisChangeProjectNumberorSiteID("Project Number");
        }
    },


    changeCompCode: function () {
        $('#IndexPivot_ShiptoAddress1').val('');
        if ($("#IndexPivot_CompCode").val() != "" && $("#IndexPivot_CompCode").val() != "<select>") {
            poauth.Dropdownlist_bind_AjaxGet("/POAuthDC/GetSiteByCompany?companyId=" + $("#IndexPivot_CompCode").val() + "", "#IndexPivot_SiteID", 'SiteID', 'SiteDesc', '\'<select>\'');
        }
        else
            $('#IndexPivot_SiteID').empty().append($('<option>', { value: '<select>', text: '<select>' }));
    },

    changeSiteID: function () {
        $('#IndexPivot_ShiptoAddress').val('');
        if (!($('#IndexPivot_SiteID').val() == '' || $('#IndexPivot_SiteID').val() == '<select>' || $('#IndexPivot_SiteID').val() == '0')) {
            MakeAjaxCall(requestGET, '/POAuthDC/GetShipAddressBySiteID?siteID=' + $('#IndexPivot_SiteID').val(), null, poauth.BindShiptoAddress, poauth.OnFailure_WithDependantSource, poauth.onErrorCallback);
        }
        poauth.checkisChangeProjectNumberorSiteID("Site/Location");

    },

    changeVendor_Name: function () {
        $("#txtVendorAddress").val('');
        $("#IndexPivot_Vendor_Number").val($("#IndexPivot_Vendor_Name").val());
        if ($("#IndexPivot_Vendor_Number").val() != "" && $("#IndexPivot_Vendor_Number").val() != "<select>") {
            poauth.Dropdownlist_bind_AjaxGet("/POAuthDC/GetVendorAddress_ByVendorNoJson?vendorNo=" + $("#IndexPivot_Vendor_Number").val() + "", "#IndexPivot_RemitToAddress", 'ListValue', 'ListText', '\'<select>\'');
            MakeAjaxCall(requestGET, "/POAuthDC/GetPaymentTermsByVendorNoJson?vendorNo=" + $("#IndexPivot_Vendor_Number").val() + "", null, poauth.bindPaymentTerms, poauth.OnFailure, poauth.OnError);
        }
        else {
            $('#IndexPivot_RemitToAddress').empty().append($('<option>', { value: 0, text: '<select>' }));
            $('#txtVendorAddress').val('');
            $("#IndexPivot_PaymentTerms").val('');
        }
    },

    changeVendor_Number: function () {
        $("#txtVendorAddress").val('');
        $("#IndexPivot_Vendor_Name").val($("#IndexPivot_Vendor_Number").val());
        if ($("#IndexPivot_Vendor_Number").val() != "" && $("#IndexPivot_Vendor_Number").val() != "<select>") {
            poauth.Dropdownlist_bind_AjaxGet("/POAuthDC/GetVendorAddress_ByVendorNoJson?vendorNo=" + $("#IndexPivot_Vendor_Number").val() + "", "#IndexPivot_RemitToAddress", 'ListValue', 'ListText', '\'<select>\'');
            MakeAjaxCall(requestGET, "/POAuthDC/GetPaymentTermsByVendorNoJson?vendorNo=" + $("#IndexPivot_Vendor_Number").val() + "", null, poauth.bindPaymentTerms, poauth.OnFailure, poauth.OnError);
        } else {
            $('#IndexPivot_RemitToAddress').empty().append($('<option>', { value: 0, text: '<select>' }));
            $('#txtVendorAddress').val('');
            $("#IndexPivot_PaymentTerms").val('');
        }
    },

    changeRemitToAddress: function () {
        $("#txtVendorAddress").val('');
        $("#txtVendorAddress").val($("#IndexPivot_RemitToAddress").val());

        var vendorNo = $("#IndexPivot_Vendor_Number").find("option:selected").val();
        if (vendorNo == "<select>" || vendorNo == "" || vendorNo == "New Address")
            return false;

        var addrCode = $("#IndexPivot_RemitToAddress").find("option:selected").val();
        var addrText = '/' + $("#IndexPivot_RemitToAddress").find("option:selected").text() + '/';
        var selectedText = $(this).find("option:selected").text();
        var selectedCode = $(this).val();

        if (selectedText == "<select>" || selectedText == "" || selectedText == "New Address")
            return false;

        $("#txtVendorAddress").val('');

        var data = {};
        data.remitAddrTxt = $.trim(selectedText);
        data.remitAddrCod = $.trim(selectedCode);
        data.vendorNo = $.trim(vendorNo);
        var url = '/POAuthDC/GetPopulateAddressTextJson';
        MakeAjaxCallNew(requestGET, url, data, poauth.PopulateAddressTextbox, poauth.OnFailure, poauth.OnError);

    },
    changeCapex: function () {
        $('#IndexPivot_PANumber').removeClass("error");
        if (this.value == "NonCAPEX") {
            $('#btnView').hide();
            $('#IndexPivot_PANumber').val('');
            $('#IndexPivot_PANumber').removeClass("error");
            $('#IndexPivot_PANumber').prop('readonly', 'readonly');
        } else {
            $('#btnView').show();
            if ($('#hdn_isenbleIndexPivotPANumber').val() != "True") {
                $('#IndexPivot_PANumber').prop('readonly', '');
            }
        }

        if (this.value == "BudgetedCAPEX") {
            if ($('#hdn_isenbleIndexPivotPANumber').val() != "True") {
                Notify(name + "Please enter Project #", null, null, 'warning', 5000);
            }
        }

        if (this.value == "" || this.value == "BudgetedCAPEX" || this.value == "UnbudgetedCAPEX") {
            $('#IndexPivot_SpendCategory').val('');
            $('#IndexPivot_SpendCategory').removeClass("error");
            $('#IndexPivot_SpendCategory').prop('disabled', 'disabled');
            $('#spnSpendCategory').hide();
        } else {
            if ($('#hdn_isenbleSpendCategory').val() != "True") {
                $('#IndexPivot_SpendCategory').prop('disabled', '');
            }
            $('#spnSpendCategory').show();
        }
    },

    btnViewClick: function () {
        var response = [];
        if ($('#IndexPivot_PANumber').val().trim() != '') {
            var url = '/poauthDC/GetProjectBudgetDetails?pANumber=' + $('#IndexPivot_PANumber').val().trim() + '&isSelected=' + true;
            MakeAjaxCall_WithDependantSource(requestGET, url, null, poauth.bindModelPopupPANumber, poauth.OnFailure_WithDependantSource, poauth.OnError_WithDependantSource, response);

            if ($('#tblPADetails').eq(0).find("td:first").html() == $('#IndexPivot_PANumber').val()) {
                $('#spnModal').text('');
                $('#tblPADetails').show();
            } else {
                $('#tblPADetails').hide();
                $('#spnModal').text('Project budget details not found');
            }
        }
    },
    btnViewSpendCatBudgetClick: function () {
        $('#spnSpendCategoryName').text('');
        var response = [];
        if ($('#IndexPivot_SiteID').val().trim() != '' && $('#IndexPivot_SpendCategory').val().trim()) {
            var url = '/poauthDC/GetSpendCategoryBudget'
            var objData = {};
            objData.siteID = $('#IndexPivot_SiteID').val().trim();
            objData.spendCatagoryName = $('#IndexPivot_SpendCategory').val().trim();
            objData.currentPOAmount = parseFloat($('#txtTotal').val());

            MakeAjaxCallNew_WithDependantSource(requestGET, url, objData, poauth.bindModelPopupspendCatagoryBudget, poauth.OnFailure_WithDependantSource, poauth.OnError_WithDependantSource, response);
        }
        if ($('#IndexPivot_SpendCategory').val().trim() != '')
            $('#spnSpendCategoryName').text($('#IndexPivot_SpendCategory').val().trim());
        $('#spnCurrntPO').text(poauth.GetDisplayCurrencyFormat($('#txtTotal').val()));
    },


    checkisChangeProjectNumberorSiteID: function (name) {
        var isCheck = true;
        //if ($("#jqGrid").jqGrid('getGridParam', 'data') || 0 > 0 && $("#jqGrid").jqGrid('getGridParam', 'data').length > 0) {
        if ($("#jqGrid").jqGrid('getGridParam', 'data') || 0 > 0) {

            if (oldProjectNumber == '') {
                if (oldSiteId == '') {
                    isCheck = false;
                } else if ($("#IndexPivot_SiteID").val() == oldSiteId) {
                    isCheck = false;
                }
            }

            if (isCheck == true && $("#jqGrid").jqGrid('getGridParam', 'data').length > 0) {
                $('.alert').hide();
                Notify(name + " changed. Verify GL coding", null, null, 'warning');
            }
        }
    },

    checkValidGlCode: function (data, dependantSource) {

        if (data.length > 0) {
            var res = data.filter(function (item, index) {
                var val = '';
                if (item.indexOf('---') !== -1) {
                    val = item.split('---')[0].trim();
                } else {
                    val = item;
                }
                if (val == dependantSource.glCode) {
                    return item
                };
            });
            if (res.length == 0) {
                if (dependantSource.Id != "footerGlCode") {
                    $('#' + dependantSource.Id).addClass("error");
                } else {
                    $('#footerGlCode').addClass("error");
                }
            } else {
                if (dependantSource.Id != "footerGlCode") {
                    isCellValidate(dependantSource.val, 'ExpenseAccountNumber');
                } else {
                    if (dependantSource.methodName == "Add") {
                        addRowNew();
                    }
                }
            }
        } else {
            $('#' + dependantSource.Id).addClass("error");
        }
    },

    Dropdownlist_bind_AjaxGet: function (url, dropdownlist_id, codeVal, textVal, defaultText) {

        var ddl = $(dropdownlist_id);
        ddl.empty().append('<option selected="selected" value="0" disabled="disabled">Loading.....</option>');
        var dependantObj = {};
        dependantObj.currentDropdownlist = ddl;
        dependantObj.currentDropdownlistValue = codeVal;
        dependantObj.currentDropdownlistText = textVal;
        dependantObj.defaultText = defaultText;

        if (dropdownlist_id.toLowerCase() == '#IndexPivot_RemitToAddress'.toLowerCase()) {
            dependantObj.IsRemitAddress = true;
        }
        MakeAjaxCall_WithDependantSource(requestGET, url, null, poauth.BindCurrentDropdownlist, poauth.OnFailure_WithDependantSource, poauth.OnError_WithDependantSource, dependantObj);
    },

    Get_Description: function (value) {
        if (value != "") {
            var splitVal = value.split("---");
            document.getElementById('txtGLComboBox').value = splitVal[0].trim();
            document.getElementById('txtAccountDesc').value = splitVal[1].trim();
        }
    },

    isValidEditRow: function (lastSelection) {
        var isError = false;
        var row = $('#jqGrid').jqGrid('getRowData', lastSelection);

        var quantity = ($("#" + lastSelection + "_Quantity").val());
        var unitPrice = ($("#" + lastSelection + "_UnitPrice").val());
        var itemNumber = $("#" + lastSelection + "_ItemNumber").val();
        var expenseAccountNumber = $("#" + lastSelection + "_ExpenseAccountNumber").val();
        var itemDescription = $("#" + lastSelection + "_ItemDescription").val();

        if ($("tr#" + lastSelection).attr("editable") === "1") {
            if (parseInt(row.TagdocumentPOAuthDetailsID || 0) == 0) {
                if (quantity.length > 0 || unitPrice.length > 0 || itemNumber.length > 0 || expenseAccountNumber.length > 0 || itemDescription.length > 0) {
                    $('.editable.inline-edit-cell').each(function () {
                        if ($(this).val().length == 0 && this.disabled == false) {
                            $(this).addClass("error");
                        } else {
                            $(this).removeClass("error");
                        }
                    });
                    isError = true;
                }
            } else {
                if (quantity.length == 0 || unitPrice.length == 0 || itemNumber.length == 0 || expenseAccountNumber.length == 0 || itemDescription.length == 0) {
                    $('.editable.inline-edit-cell').each(function () {
                        if ($(this).val().length == 0 && this.disabled == false) {
                            $(this).addClass("error");
                        } else {
                            $(this).removeClass("error");
                        }
                    });
                    isError = true;
                }
            }
        }

        if (isError) {
            errMsg = 'Required Fields Missing';
            $('.alert').hide();
            Notify(errMsg, null, null, 'danger');
            return false
        }
        else {
            errMsg = '';
            if (errMsg != '') {
                $('.alert').hide();
                Notify(errMsg, null, null, 'danger');
                return false
            }
        }
        return true;
    },

    saveReplyToSender: function () {
        var obj = {};
        obj.DocumentID = $("#docId").val();
        obj.CurrentNodeID = nodeId;
        obj.WorkflowID = workFlowId;
        obj.ReplyNote = $('#txtReplyNote').val();
        var jsonString = JSON.stringify(obj);

        var url = "/APInvoiceDC/SendToReply";
        MakeAjaxCall_WithDependantSource(requestPOST, url, jsonString, poauth.OnSuccessPOST, poauth.OnFailure, poauth.OnError, "ReplyToSender");
    },

    savePOAuthInfo: function (submitAction, checkValidation) {
        var isValid = true;
        if (checkValidation != false) {
            isValid = poauth.ValidationPOAuthHearder();
        }
        if (isValid) {


            var gridLength = $("#jqGrid").jqGrid('getGridParam', 'data').length;
            var rowid = $('.inline-edit-cell').parent().parent().prop('id');

            if (poauth.isValidEditRow(rowid)) {
                var obj = {};
                obj.DocId = $("#docId").val();
                obj.SiteID = ($("#IndexPivot_SiteID option:selected").val() != "" || $("#IndexPivot_SiteID option:selected").val() != "<select>") ? $("#IndexPivot_SiteID option:selected").val().split('$@$')[0] : "";
                obj.POType = $("#IndexPivot_POType").val();
                obj.DAPONumber = $('#lblPONumber').text();
                obj.Capex = $("#IndexPivot_Capex option:selected").val();
                obj.PANumber = $("#IndexPivot_PANumber").val().trim();
                obj.CompCode = $("#IndexPivot_CompCode option:selected").val();
                obj.Div_Dept = $("#IndexPivot_DeptCode option:selected").val();
                obj.PaymentTerms = $("#IndexPivot_PaymentTerms").val();
                var shipAddress = $("#IndexPivot_ShiptoAddress").val().split("\n");
                obj.ShiptoAddress1 = shipAddress[0] != undefined ? shipAddress[0] : "";
                obj.ShiptoAddress2 = shipAddress[1] != undefined ? shipAddress[1] : "";
                obj.BilltoAddress1 = $("#IndexPivot_BillAddress1").val();
                obj.Vendor_Name = $("#IndexPivot_Vendor_Name option:selected").text() == '<select>' ? '' : $("#IndexPivot_Vendor_Name option:selected").text();
                obj.Vendor_Number = $("#IndexPivot_Vendor_Number").val();

                var address = $("#txtVendorAddress").val().split("\n");
                obj.VendorAddress1 = address[0] != undefined ? address[0] : "";
                obj.VendorAddress2 = address[1] != undefined ? address[1] : "";

                obj.VendorContactName = $("#IndexPivot_VendorContactName").val();
                obj.VendorContactNumber = $("#IndexPivot_VendorContactNumber").val();
                obj.RequestedBy = $("#IndexPivot_RequestedBy").val();
                obj.Unit_Number = $("#IndexPivot_Unit_Number").val();
                obj.Notes = $("#IndexPivot_Notes").val();
                obj.SpendCategory = $("#IndexPivot_SpendCategory").val();
                obj.POOrigin = $("#IndexPivot_POOrigin").val();
                obj.DeliveryDate = $("#IndexPivot_DeliveryDate").val();

                if ($('#IndexPivot_RemitToAddress').children('option').length >= 3) {
                    obj.RemitToAddress = $("#IndexPivot_RemitToAddress").val();
                } else {
                    obj.RemitToAddress = "";
                }

                obj.Discount = $("#txtDiscount").val() || 0;
                obj.SubTotal = $("#txtSubtotal").val() || 0;
                obj.SalesTax = $("#txtSalesTax").val() || 0;
                obj.Freight = $("#txtFreight").val() || 0;
                obj.Others = $("#txtOther").val() || 0;
                obj.Total = $("#txtTotal").val() || 0;

                obj.UserID = userDetailsID;
                obj.WorkFlowID = workFlowId;
                obj.NodeID = nodeId;
                obj.NodeText = $('#NodeText').val();

                obj.TagDocumentPOAuthDetail = [];
                obj.SubmitAction = null;

                var jsonString = JSON.stringify(obj);
                var url = "/POAuthDC/SavePOAuthInfo";
                if (submitAction == "Approve") {
                    var lineTotal = parseFloat($('#txtLineTotal').val() || 0);
                    if (lineTotal > 0) {
                        var result = MakeAjaxCall2(requestPOST, false, url, JSON.stringify({ jsonValue: jsonString }));
                        if (result == "Data Saved") {
                            obj.SubmitAction = submitAction;
                            jsonString = JSON.stringify(obj);
                            var maskfileCheck = this.GetMaskFileCheckApplicable(obj.WorkFlowID, obj.NodeID);
                            if (maskfileCheck.IsMaskFileCheck === true) {

                                obj.SMD_CurrentNodeID = maskfileCheck.SMD_CurrentNodeId;
                                obj.SMD_Dynamic = maskfileCheck.SMD_Dynamic;
                                var appListJson = this.GetApproversList(obj.DocId, obj.WorkFlowID, maskfileCheck.MaskfileType, obj.CompCode, obj.Total, nodeId, maskfileCheck.SMD_CurrentNodeId);
                                var appCount = appListJson.length;
                                obj.IsLoggedInUserExcludedFromApprovalList = false;
                                if (appCount == 1) {
                                    obj.NextUserDetailsID = appListJson[0].UserdetailsID;
                                    obj.SMD_NextNodeID = appListJson[0].SMD_NextNodeID;
                                    obj.IsApproverSelected = true;
                                    jsonString = JSON.stringify(obj);
                                    if (this.IsCanApprove()) {
                                        MakeAjaxCall_WithDependantSource(requestPOST, url, jsonString, poauth.OnSuccessPOST, poauth.OnFailure, poauth.OnError, "Approve");
                                    }
                                }
                                else if (appCount > 1) {
                                    /*****************/
                                    $("#ddlApprove").empty().append($('<option>', { value: '<select>', text: '<select>' }));
                                    $('#txtNote').empty();
                                    $.each(appListJson, function (key, value) {
                                        if (obj.UserID == value.UserdetailsID) {
                                            obj.IsLoggedInUserExcludedFromApprovalList = true;
                                        }
                                        else {
                                            $("#ddlApprove").append($('<option>', { value: value.UserdetailsID, text: value.ApproverDesc }));
                                        }
                                    });
                                    approverObj = obj;
                                    approverList = appListJson;
                                    $('#ApprovepanelPopup').html();
                                    $('#ApprovepanelPopup').dialog('open');
                                }
                                else {
                                    $('.alert').hide();
                                    Notify('No Approvers configured', null, null, 'warning');
                                }
                            }
                            else {
                                if (this.IsCanApprove()) {
                                    MakeAjaxCall_WithDependantSource(requestPOST, url, jsonString, poauth.OnSuccessPOST, poauth.OnFailure, poauth.OnError, "Approve");
                                }
                            }
                        }
                    }
                    else {
                        Notify("Linetotal must be greater than $0 to submit.", null, null, 'danger');
                        return false
                    }
                }
                else {
                    MakeAjaxCall(requestPOST, url, jsonString, poauth.OnSuccessPOST, poauth.OnFailure, poauth.OnError);
                }
            }
        }
    },

    SaveHeaderOnly: function () {
        if (poauth.ValidationPOAuthHearder()) {
            var obj = {};
            obj.DocId = $("#docId").val();
            obj.SiteID = ($("#IndexPivot_SiteID option:selected").val() != "" || $("#IndexPivot_SiteID option:selected").val() != "<select>") ? $("#IndexPivot_SiteID option:selected").val().split('$@$')[0] : "";
            obj.POType = $("#IndexPivot_POType").val();
            obj.DAPONumber = $('#lblPONumber').text();
            obj.Capex = $("#IndexPivot_Capex option:selected").val();
            obj.PANumber = $("#IndexPivot_PANumber").val().trim();
            obj.CompCode = $("#IndexPivot_CompCode option:selected").val();
            obj.Div_Dept = $("#IndexPivot_DeptCode option:selected").val();
            obj.PaymentTerms = $("#IndexPivot_PaymentTerms").val();

            var shipAddress = $("#IndexPivot_ShiptoAddress").val().split("\n");
            obj.ShiptoAddress1 = shipAddress[0] != undefined ? shipAddress[0] : "";
            obj.ShiptoAddress2 = shipAddress[1] != undefined ? shipAddress[1] : "";

            obj.BilltoAddress1 = $("#IndexPivot_BillAddress1").val();
            obj.Vendor_Name = $("#IndexPivot_Vendor_Name option:selected").text();
            obj.Vendor_Number = $("#IndexPivot_Vendor_Number").val();

            var address = $("#txtVendorAddress").val().split("\n");
            obj.VendorAddress1 = address[0] != undefined ? address[0] : "";
            obj.VendorAddress2 = address[1] != undefined ? address[1] : "";

            obj.VendorContactName = $("#IndexPivot_VendorContactName").val();
            obj.VendorContactNumber = $("#IndexPivot_VendorContactNumber").val();
            obj.UserID = userDetailsID;
            obj.WorkFlowID = workFlowId;
            obj.NodeID = nodeId;
            obj.TagDocumentPOAuthDetail = [];
            var jsonString = JSON.stringify(obj);
            var url = "/POAuthDC/SavePOAuthInfo";
            MakeAjaxCall(requestPOST, url, jsonString, poauth.OnSuccessPOST, poauth.OnFailure, poauth.OnError);
        }
    },

    btnForwardToClick: function () {
        if (validateForwardUser()) {
            var user = $('#txtForwardTo').val();
            var nextUserDetailsId = user.substring(user.indexOf("[") + 1, user.indexOf("]"));

            var obj = {};
            obj.DocumentID = $("#docId").val();
            obj.CurrentNodeID = nodeId;
            obj.CurrentUserDetailsID = userDetailsID;
            obj.NextUserDetailsID = nextUserDetailsId;
            obj.WorkflowID = workFlowId;
            obj.Note = $('#txtAddNotes').val();
            obj.NodeText = $('#NodeText').val();

            var jsonString = JSON.stringify(obj);
            var url = "/POAuthDC/ForwardToUser";
            MakeAjaxCall_WithDependantSource(requestPOST, url, jsonString, poauth.OnSuccessPOST, poauth.OnFailure, poauth.OnError, "Forward");
        }
    },

    PopulateRejectDropDownList: function () {
        var CurrentWorkFlowNodeID = nodeId;
        var ddl = $('#ddlRejectTo');
        ddl.empty().append($('<option>', { value: '<select>', text: '<select>' }));
        if (CurrentWorkFlowNodeID == '164')
            ddl.append($('<option>', { value: 'Delete Invoice Inbox', text: 'Delete Invoice Inbox' }));
        else
            ddl.append($('<option>', { value: 'A/P Payment Processing Inbox', text: 'A/P Payment Processing Inbox' }));
    },

    btnRejectClick: function () {
        if (validateRejectTo()) {
            var obj = {};
            obj.UserDetailsID = userDetailsID;
            obj.DocumentID = $("#docId").val();
            obj.Note = RejectNotePrefix != '' ? RejectNotePrefix + ' ' + $('#txtReasonRejection').val().trim() : $('#txtReasonRejection').val().trim();
            obj.CurrentNodeID = nodeId;
            obj.WorkflowID = workFlowId;
            obj.NodeText = $('#NodeText').val();
            var jsonString = JSON.stringify(obj);

            var url = '/POAuthDC/RejectTo';
            MakeAjaxCall_WithDependantSource(requestPOST, url, jsonString, poauth.OnSuccessPOST, poauth.OnFailure, poauth.OnError, "Reject");
        }
    },

    btnSendToApproverClick: function () {
        var errMsg = '';
        if ($('#ddlApprove').val() == '' || $('#ddlApprove').val() == '<select>' || $('#ddlApprove').val() == '0') {
            errMsg += "Please select approver" + "<br>";
            $("#ddlApprove").addClass("error");
        }
        else {
            $("#ddlApprove").removeClass("error");
        }

        if (errMsg == '') {

            var obj = approverObj;
            var appListJson = approverList;

            var filterObj = appListJson.filter(m => m.UserdetailsID == $("option:selected", $("#ddlApprove")).val() && m.ApproverDesc == $("option:selected", $("#ddlApprove")).text());
            obj.NextUserDetailsID = filterObj[0].UserdetailsID;
            obj.SMD_NextNodeID = filterObj[0].SMD_NextNodeID;
            obj.IsApproverSelected = true;
            var jsonString = JSON.stringify(obj);
            if (poauth.IsCanApprove()) {
                var url = "/POAuthDC/SavePOAuthInfo";
                MakeAjaxCall_WithDependantSource(requestPOST, url, jsonString, poauth.OnSuccessPOST, poauth.OnFailure, poauth.OnError, "Approve");
            }
            approverObj = null;
            approverList = null;
            $('#ApprovepanelPopup').dialog('close');
            return true;
        }
        else {

            approverObj = null;
            approverList = null;

            errMsg = 'Required Fields Missing';
            $('.alert').hide();
            Notify(errMsg, null, null, 'danger');
            return false;
        }
    },

    btnCloseClick: function () {
        approverObj = null;
        approverList = null;
        $('#ApprovepanelPopup').dialog('close');
    },
    btnSearchClick: function () {
        var keyValue = $('input[name=chkVendorInfo]:checked').val();
        var serText = $('#searchText').val();
        if (serText != '') {
            $("#txtVendorAddress").val('');
            $("#divRemitToAddress").hide();

            var ddlVendorName = $('#IndexPivot_Vendor_Name');
            ddlVendorName.empty().append('<option selected="selected" value="0" disabled="disabled">Loading.....</option>');
            var ddlVendorNumber = $('#IndexPivot_Vendor_Number');
            ddlVendorNumber.empty().append('<option selected="selected" value="0" disabled="disabled">Loading.....</option>');
            var ddlRemitTo = $("#IndexPivot_RemitToAddress");
            ddlRemitTo.empty().append($('<option>', { value: 0, text: '<select>' }));

            var url = '/POAuthDC/GetSearchValue?searchkey=' + keyValue.toLowerCase() + '&searchValue=' + serText.toLowerCase();
            var dependantObj = {};
            dependantObj.ddlVendorName = ddlVendorName;
            dependantObj.ddlVendorNumber = ddlVendorNumber;

            MakeAjaxCall_WithDependantSource(requestGET, url, null, poauth.bindVendorDropdownlist, poauth.OnFailure_WithDependantSource, poauth.OnError_WithDependantSource, dependantObj);

        }
    },

    btnPONumberSearchClick: function () {
        var keyValue = 'shortname';
        var serText = $('#pONumbersearchText').val();
        if (serText != '') {

            var ddlPONumber = $('#ddlPONumber');
            ddlPONumber.empty().append('<option selected="selected" value="0" disabled="disabled">Loading.....</option>');

            var url = '/POAuthDC/GetSearchValue_PONumber?searchValue=' + serText.toLowerCase();
            var dependantObj = {};
            dependantObj.currentDropdownlist = ddlPONumber;
            dependantObj.currentDropdownlistValue = 'Value';
            dependantObj.currentDropdownlistText = 'Text';

            MakeAjaxCall_WithDependantSource(requestGET, url, null, poauth.bindPONumberDropdownlist, poauth.OnFailure_WithDependantSource, poauth.OnError_WithDependantSource, dependantObj);
        }
    },

    btnReplyToSenderClick: function () {
        if ($('#txtReplyNote').val().trim() != '') {
            $("#txtReplyNote").removeClass("error");
            poauth.saveReplyToSender();
        }
        else {
            $("#txtReplyNote").addClass("error");
            $('.alert').hide();
            Notify('Required Fields Missing', null, null, 'danger');
        }
    },
    hrefAccountAssignmentClick: function () {
        if ($("#hrefAccountAssignment").hasClass('active'))
            $("#hrefAccountAssignment").removeClass('active');
        if ($("#hrefRejects").hasClass('active'))
            $("#hrefRejects").removeClass('active');
        if ($("#hrefForward").hasClass('active'))
            $("#hrefForward").removeClass('active');

        $('#btnSubmit').show();
        $('#btnForwardTo').hide();
        $('#btnReject').hide();
        $('#btnSave').show();
    },
    hrefHeaderGeneralClick: function () {
        if ($("#hrefAccountAssignment").hasClass('active'))
            $("#hrefAccountAssignment").removeClass('active');
        if ($("#hrefRejects").hasClass('active'))
            $("#hrefRejects").removeClass('active');
        if ($("#hrefForward").hasClass('active'))
            $("#hrefForward").removeClass('active');

        $('#btnSubmit').show();
        $('#btnForwardTo').hide();
        $('#btnReject').hide();
        $('#btnSave').show();
    },
    hrefForwardClick: function () {
        if ($("#hrefHeaderGeneral").hasClass('active'))
            $("#hrefHeaderGeneral").removeClass('active');
        if ($("#hrefAccountAssignment").hasClass('active'))
            $("#hrefAccountAssignment").removeClass('active');
        if ($("#hrefRejects").hasClass('active'))
            $("#hrefRejects").removeClass('active');

        poauth.assignLabelData('Forward');
        if ($("#btnSubmit").length > 0) {
            if (!$("#btnSubmit").is(":disabled")) {
                poauth.savePOAuthInfo("Save", false);
            }
        }
        $('#btnSubmit').hide();
        $('#btnForwardTo').show();
        $('#btnReject').hide();
        $('#btnSave').hide();
    },
    hrefRejectsClick: function () {
        if ($("#hrefHeaderGeneral").hasClass('active'))
            $("#hrefHeaderGeneral").removeClass('active');
        if ($("#hrefAccountAssignment").hasClass('active'))
            $("#hrefAccountAssignment").removeClass('active');
        if ($("#hrefForward").hasClass('active'))
            $("#hrefForward").removeClass('active');

        poauth.assignLabelData('Reject');
        if ($("#btnSubmit").length > 0) {
            if (!$("#btnSubmit").is(":disabled")) {
                poauth.savePOAuthInfo("Save", false);
            }
        }
        $('#btnSubmit').hide();
        $('#btnForwardTo').hide();
        $('#btnReject').show();
        $('#btnSave').hide();
    },
    chargeSiteID: function () {
        if (($('#IndexPivot_SiteID').val() || '' != '') && $('#IndexPivot_SiteID').val().trim() == '100') {
            if ($('#hdn_isenbleIndexPivotDeptCode').val() != "True")
                $('#IndexPivot_DeptCode').removeAttr('disabled');
        }
        else {
            $("#IndexPivot_DeptCode option:contains(<select>)").prop('selected', true);
            $('#IndexPivot_DeptCode').attr('disabled', 'disabled');
        }
    },






    //ajax callback methods start

    PopulateAddressTextbox: function (data) {
        $("#txtVendorAddress").val(data.AddressText);
    },

    OnFailure: function (response) {
        //console.log(response);
    },

    OnError: function (response) {
        //console.log(response);
    },

    OnFailure_WithDependantSource: function (response, dependantObj) {
        //console.log(response);
    },

    OnError_WithDependantSource: function (response, dependantObj) {
        //console.log(response);
    },

    OnSuccessPOST: function OnSuccessPOST(response, dependantSource) {
        $('.alert').hide();
        Notify(response, null, null, "success");
        if (dependantSource != null && dependantSource != undefined) {
            if (dependantSource == 'Approve' || dependantSource == 'Reject' || dependantSource == 'Forward' || dependantSource == 'ReplyToSender') {
                window.location.href = $('#hdnInboxlink').val();//"https://www.tutorialrepublic.com/";
            }
        }
    },

    OnSuccessWorkFlowNotesPOST: function (response, dependantSource) {
        if (response > 0) {
            $('.alert').hide();
            Notify(dependantSource.successMsg, null, null, "success");
        }
        else {
            $('.alert').hide();
            Notify(dependantSource.warningMsg, null, null, "warning");
        }
    },

    OnFailureWorkFlowNotesPOST: function (response, dependantSource) {
        $('.alert').hide();
        Notify(dependantSource.failureMsg, null, null, "danger");
    },

    OnErrorWorkFlowNotesPOST: function (response, dependantSource) {
        $('.alert').hide();
        Notify(dependantSource.errorMsg, null, null, "danger");
    },

    //ajax callback methods end

    //functions -end

    ValidationPOAuthHearder: function () {

        var objFieldRules = jsonFieldRules.filter(x => x.IsVisible == true && (x.ViewName_Refonly == 'POAuth-POHeader'));
        var errMsg = '';
        var isError = false;

        if (objFieldRules.filter(x => x.FieldName.trim() == 'SiteID').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_SiteID').val() == '' || $('#IndexPivot_SiteID').val() == '<select>' || $('#IndexPivot_SiteID').val() == '0') {
                errMsg += "Please select company" + "<br>";
                $("#IndexPivot_SiteID").addClass("error");
            }
            else {
                $("#IndexPivot_SiteID").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'HeadUsr3').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_POType').val() == '' || $('#IndexPivot_POType').val() == '<select>' || $('#v').val() == '0') {
                errMsg += "Please select company" + "<br>";
                $("#IndexPivot_POType").addClass("error");
            }
            else {
                $("#IndexPivot_POType").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'POAuthPaymentTerms').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_PaymentTerms').val() == '' || $('#IndexPivot_PaymentTerms').val() == '<select>' || $('#IndexPivot_PaymentTerms').val() == '0') {
                errMsg += "Please select company" + "<br>";
                $("#IndexPivot_PaymentTerms").addClass("error");
            }
            else {
                $("#IndexPivot_PaymentTerms").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'ShiptoAddress1').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_ShiptoAddress').val() == '' || $('#IndexPivot_ShiptoAddress').val() == '<select>' || $('#IndexPivot_ShiptoAddress').val() == '0') {
                errMsg += "Please select company" + "<br>";
                $("#IndexPivot_ShiptoAddress").addClass("error");
            }
            else {
                $("#IndexPivot_ShiptoAddress").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'Capex').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Capex').val() == '' || $('#IndexPivot_Capex').val() == '<select>' || $('#IndexPivot_Capex').val() == '0') {
                errMsg += "Please select Capex" + "<br>";
                $("#IndexPivot_Capex").addClass("error");
            }
            else {

                if ($('#IndexPivot_Capex').val() == "BudgetedCAPEX") {
                    if ($('#IndexPivot_PANumber').val() == '' || $('#IndexPivot_PANumber').val() == '<select>' || $('#IndexPivot_PANumber').val() == '0') {
                        errMsg += "Please enter Project Number" + "<br>";
                        $("#IndexPivot_PANumber").addClass("error");
                    }
                    else {
                        $("#IndexPivot_PANumber").removeClass("error");
                    }
                }
                if ($('#IndexPivot_Capex').val() == "NonCAPEX") {
                    if ($('#IndexPivot_SpendCategory').val() == '' || $('#IndexPivot_SpendCategory').val() == '<select>' || $('#IndexPivot_SpendCategory').val() == '0') {
                        errMsg += "Please select SpendCategory" + "<br>";
                        $("#IndexPivot_SpendCategory").addClass("error");
                    }
                    else {
                        $("#IndexPivot_SpendCategory").removeClass("error");
                    }

                }

                $("#IndexPivot_Capex").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'ProjectNumber').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_PANumber').val() == '' || $('#IndexPivot_PANumber').val() == '<select>' || $('#IndexPivot_PANumber').val() == '0') {
                errMsg += "Please enter Project Number" + "<br>";
                $("#IndexPivot_PANumber").addClass("error");
            }
            else {
                $("#IndexPivot_PANumber").removeClass("error");
            }
        }


        if (objFieldRules.filter(x => x.FieldName.trim() == 'CompCode').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_CompCode').val() == '' || $('#IndexPivot_CompCode').val() == '<select>' || $('#IndexPivot_CompCode').val() == '0') {
                errMsg += "Please select company" + "<br>";
                $("#IndexPivot_CompCode").addClass("error");
            }
            else {
                $("#IndexPivot_CompCode").removeClass("error");
            }
        }

        if ($('#IndexPivot_SiteID').length > 0 && $('#IndexPivot_SiteID').val() == '100') {

            if (objFieldRules.filter(x => x.FieldName.trim() == 'DeptCode').map(x => x.IsMandatory)[0]) {
                if ($('#IndexPivot_DeptCode').val() == '' || $('#IndexPivot_DeptCode').val() == '<select>' || $('#IndexPivot_DeptCode').val() == '0') {
                    errMsg += "Please select Dept Code" + "<br>";
                    $("#IndexPivot_DeptCode").addClass("error");
                }
                else {
                    $("#IndexPivot_DeptCode").removeClass("error");
                }
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'BilltoAddress1').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_BillAddress1').val() == '' || $('#IndexPivot_BillAddress1').val() == '<select>' || $('#IndexPivot_BillAddress1').val() == '0') {
                errMsg += "Please enter BilltoAddress1" + "<br>";
                $("#IndexPivot_BillAddress1").addClass("error");
            }
            else {
                $("#IndexPivot_BillAddress1").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'VendorNumber').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Vendor_Number').val() == '' || $('#IndexPivot_Vendor_Number').val() == '<select>' || $('#IndexPivot_Vendor_Number').val() == '0') {
                errMsg += "Please select VendorNumber" + "<br>";
                $("#IndexPivot_Vendor_Number").addClass("error");
            }
            else {
                $("#IndexPivot_Vendor_Number").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'VendorName').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Vendor_Name').val() == '' || $('#IndexPivot_Vendor_Name').val() == '<select>' || $('#IndexPivot_Vendor_Name').val() == '0') {
                errMsg += "Please select VendorName" + "<br>";
                $("#IndexPivot_Vendor_Name").addClass("error");
            }
            else {
                $("#IndexPivot_Vendor_Name").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'VendorAddress').map(x => x.IsMandatory)[0]) {
            if ($('#txtVendorAddress').val() == '' || $('#txtVendorAddress').val() == '<select>' || $('#txtVendorAddress').val() == '0') {
                errMsg += "Please enter VendorAddress" + "<br>";
                $("#txtVendorAddress").addClass("error");
            }
            else {
                $("#txtVendorAddress").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'POAuthVendorContactName').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_VendorContactName').val() == '' || $('#IndexPivot_VendorContactName').val() == '<select>' || $('#IndexPivot_VendorContactName').val() == '0') {
                errMsg += "Please enter Vendor Contact Name" + "<br>";
                $("#IndexPivot_VendorContactName").addClass("error");
            }
            else {
                $("#IndexPivot_VendorContactName").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'POAuthVendorContactNumber').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_VendorContactNumber').val() == '' || $('#IndexPivot_VendorContactNumber').val() == '<select>' || $('#IndexPivot_VendorContactNumber').val() == '0') {
                errMsg += "Please enter Vendor Contact Number" + "<br>";
                $("#IndexPivot_VendorContactNumber").addClass("error");
            }
            else {
                $("#IndexPivot_VendorContactNumber").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'RequestedBy').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_RequestedBy').val() == '' || $('#IndexPivot_RequestedBy').val() == '<select>' || $('#IndexPivot_RequestedBy').val() == '0') {
                errMsg += "Please enter RequestedBy" + "<br>";
                $("#IndexPivot_RequestedBy").addClass("error");
            }
            else {
                $("#IndexPivot_RequestedBy").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'UnitNumber').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Unit_Number').val() == '' || $('#IndexPivot_Unit_Number').val() == '<select>' || $('#IndexPivot_Unit_Number').val() == '0') {
                errMsg += "Please enter Unit Number" + "<br>";
                $("#IndexPivot_Unit_Number").addClass("error");
            }
            else {
                $("#IndexPivot_Unit_Number").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'Notes').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_Notes').val() == '' || $('#IndexPivot_Notes').val() == '<select>' || $('#IndexPivot_Notes').val() == '0') {
                errMsg += "Please enter Notes" + "<br>";
                $("#IndexPivot_Notes").addClass("error");
            }
            else {
                $("#IndexPivot_Notes").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'RemitToAddress').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_RemitToAddress').val() == '' || $('#IndexPivot_RemitToAddress').val() == '<select>' || $('#IndexPivot_RemitToAddress').val() == '0') {
                errMsg += "Please select Remit To Address" + "<br>";
                $("#IndexPivot_RemitToAddress").addClass("error");
            }
            else {
                $("#IndexPivot_RemitToAddress").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'SpendCategory').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_SpendCategory').val() == '' || $('#IndexPivot_SpendCategory').val() == '<select>' || $('#IndexPivot_SpendCategory').val() == '0') {
                errMsg += "Please select SpendCategory" + "<br>";
                $("#IndexPivot_SpendCategory").addClass("error");
            }
            else {
                $("#IndexPivot_SpendCategory").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'PADescription').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_PADescription').val() == '' || $('#IndexPivot_PADescription').val() == '<select>' || $('#IndexPivot_PADescription').val() == '0') {
                errMsg += "Please enter PADescription" + "<br>";
                $("#IndexPivot_PADescription").addClass("error");
            }
            else {
                $("#IndexPivot_PADescription").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'POOrgin').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_POOrigin').val() == '' || $('#IndexPivot_POOrigin').val() == '<select>' || $('#IndexPivot_POOrigin').val() == '0') {
                errMsg += "Please select PO Orgin" + "<br>";
                $("#IndexPivot_POOrigin").addClass("error");
            }
            else {
                $("#IndexPivot_POOrigin").removeClass("error");
            }
        }

        if (objFieldRules.filter(x => x.FieldName.trim() == 'DeliveryDate').map(x => x.IsMandatory)[0]) {
            if ($('#IndexPivot_DeliveryDate').val() == '' || $('#IndexPivot_DeliveryDate').val() == '<select>' || $('#IndexPivot_DeliveryDate').val() == '0') {
                errMsg += "Please enter Delivery Date" + "<br>";
                $("#IndexPivot_DeliveryDate").addClass("error");
            }
            else {
                $("#IndexPivot_DeliveryDate").removeClass("error");
            }
        }

        if ($('#IndexPivot_RemitToAddress').length > 0 && $("#IndexPivot_RemitToAddress").is(":visible")) {

            if ($('#IndexPivot_RemitToAddress').val() == '' || $('#IndexPivot_RemitToAddress').val() == '<select>' || $('#IndexPivot_RemitToAddress').val() == '0') {
                errMsg += "Please select Remit To Address" + "<br>";
                $("#IndexPivot_RemitToAddress").addClass("error");
            }
            else {
                $("#IndexPivot_RemitToAddress").removeClass("error");
            }
        }

        if (errMsg != '') {
            errMsg = 'Required Fields Missing';
            $('.alert').hide();
            Notify(errMsg, null, null, 'danger');
            return false;
        }
        else {
            if (!($('#IndexPivot_DeliveryDate').length > 0 && $('#IndexPivot_DeliveryDate').prop('readonly'))) {
                errMsg = poauth.validateDeliveryDate();
            }

            if ($('#IndexPivot_PANumber').length > 0 && $('#IndexPivot_PANumber').val() || '' != '') {
                var url = '/poauthDC/GetActivePANumbers?pANumber=' + $('#IndexPivot_PANumber').val().trim() + '&isSelected=' + true;
                var data = MakeAjaxCall2(requestPOST, false, url, '');

                if (data.length > 0) {
                    var projectNumber = $('#IndexPivot_PANumber').val();
                    var res = data.filter(function (item, index) {
                        if (projectNumber == item.PANumber) {
                            return item.PADescription
                        };
                    });
                    if (res.length == 0) {
                        errMsg += "Please enter valid Project Number" + "<br>";
                        $('#IndexPivot_PANumber').addClass("error");
                    }
                } else {
                    errMsg += "Please enter valid Project Number" + "<br>";
                    $('#IndexPivot_PANumber').addClass("error");
                }
            }

            if (errMsg != '') {
                $('.alert').hide();
                Notify(errMsg, null, null, 'danger');
                return false;
            }
            else {
                errMsg = poauth.validationConditions();
                if (errMsg != '') {
                    $('.alert').hide();
                    Notify(errMsg, null, null, 'danger');
                    return false;
                }
            }

            if (objFieldRules.filter(x => x.FieldName.trim() == 'VendorNumber').map(x => x.IsMandatory)[0]) {
                errMsg = poauth.IsVendorActive();
                if (errMsg != '') {
                    $('.alert').hide();
                    Notify(errMsg, null, null, 'danger');
                    return false;
                }
            }
        }
        return true;
    },

    FieldRequired: function (fieldName, id, type) {

        id = $('#' + id);
        if (objFieldRules.filter(x => x.FieldName.trim() == fieldName).map(x => x.IsMandatory)[0]) {
            if (type == 'textbox')
                (id.val() == '') ? id.addClass("error") : id.removeClass("error");
            else if (type == 'select')
                (id.val() == '' || id.val() == '<select>' || id.val() == '0') ? id.addClass("error") : id.removeClass("error");
        }
    },

    GetMaskFileCheckApplicable: function (workflowId, nodeId) {
        var data = {};
        data.workflowId = workflowId;
        data.nodeId = nodeId;

        var res = MakeAjaxCall2(requestGET, false, '/Approvers/IsMaskfileCheckApplicable', data);
        return res;
    },

    GetApproversList: function (docId, workflowId, maskfileType, company, invoiceAmount, currentNodeid, SMD_CurrentNodeId) {
        var data = {};
        data.docId = docId;
        data.workflowId = workflowId;
        data.maskfileType = maskfileType;
        data.company = company;
        data.invoiceAmount = invoiceAmount;
        data.currentNodeid = currentNodeid;
        data.smdCurrentNodeId = SMD_CurrentNodeId;
        return MakeAjaxCall2(requestGET, false, '/Approvers/GetApproversList', data);
    },

    IsCanApprove: function () {
        var ermsg = '';
        ermsg = validateApprover();
        if (ermsg != '') {
            $('.alert').hide();
            Notify(ermsg, null, null, "danger");
            return false;
        }
        else
            return true;
    },

    GetCurrentUserCanApprove: function () {
        var data = {};
        data.documentId = nodeId;
        data.workflowId = workFlowId;
        data.invoiceAmount = parseFloat($('#txtTotal').val()).toFixed(2);

        var res = MakeAjaxCall2(requestGET, false, '/Approvers/IsCurrentUserCanApprove', data);
        return res;
    },

    BindShiptoAddress: function (data) {
        $('#IndexPivot_ShiptoAddress').val(data);
    },

    validateDeliveryDate: function () {
        $("#IndexPivot_DeliveryDate").removeClass("error");
        var objFieldRules = jsonFieldRules.filter(x => x.IsVisible == true);
        if (objFieldRules.filter(x => x.FieldName.trim() == 'DeliveryDate').map(x => x.IsMandatory)[0]) {
            var res = poauth.IsDeliveryDateValide($('#IndexPivot_DeliveryDate').val());
            if (res.trim() != "") {
                return res;
            }
        }
        return '';
    },

    IsDeliveryDateValide: function (invoiceDate) {
        var data = {};
        data.invoiceDate = invoiceDate;
        var result = MakeAjaxCall2('GET', false, '/POAuthDC/ValidateDeliveryDate', data);
        return result;
    },

    validationConditions: function () {
        var objValidationConditions = jsonValidationConditions.filter(x => x.NodeId == null);
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

            if (itemObj.length == 1) {
                var f1EntityName = itemObj[0].Field1EntityName != null && itemObj[0].Field1EntityName != undefined && itemObj[0].Field1EntityName.trim() != '' ? itemObj[0].Field1EntityName + '_' : '';
                var f2EntityName = itemObj[0].Field2EntityName != null && itemObj[0].Field2EntityName != undefined && itemObj[0].Field2EntityName.trim() != '' ? itemObj[0].Field2EntityName + '_' : '';
                if (EvaluteExpression(itemObj[0].Operator.trim()
                    , getDataFromControl('#' + f1EntityName + itemObj[0].Field1)
                    , itemObj[0].Field1DataType
                    , getDataFromControl('#' + f2EntityName + itemObj[0].Field2)
                    , itemObj[0].Field2DataType)) {
                } else {
                    errMsg += itemObj[i].ErrorMessage + ' ' + "<br>";
                }
            }
            else if (itemObj.length > 1) {

                var exprArr = [];
                var exp = '';

                for (var i = 0; i < itemObj.length; i++) {
                    var f1EntityName = itemObj[i].Field1EntityName != null && itemObj[i].Field1EntityName != undefined && itemObj[i].Field1EntityName.trim() != '' ? itemObj[i].Field1EntityName + '_' : '';
                    var f2EntityName = itemObj[i].Field2EntityName != null && itemObj[i].Field2EntityName != undefined && itemObj[i].Field2EntityName.trim() != '' ? itemObj[i].Field2EntityName + '_' : '';
                    var res =
                        EvaluteExpression(itemObj[i].Operator.trim()
                            , getDataFromControl('#' + f1EntityName + itemObj[i].Field1)
                            , itemObj[i].Field1DataType
                            , getDataFromControl('#' + f2EntityName + itemObj[i].Field2)
                            , itemObj[i].Field2DataType);

                    exprArr.push(res);
                    if (itemObj[i].Condition != null && itemObj[i].Condition != '')
                        exprArr.push(itemObj[i].Condition);
                    else {
                        var k = 0;
                        do {
                            exp += ' ' + exprArr[k];
                            k++;
                        } while (k < exprArr.length);
                    }
                }
                if (eval(exp)) {
                } else {
                    errMsg = itemObj[0].ErrorMessage + ' ' + "<br>";
                }
            }
        }
        return errMsg;
    },
    IsVendorActive: function () {
        if ($("#IndexPivot_Vendor_Number").val() != "New Vendor" && $("#IndexPivot_Vendor_Name").val() != "New Vendor" && $("#IndexPivot_RemitToAddress").val() != "New Address") {
            var count = 0;
            var url = "/APInvoiceDC/CheckIsVendorActive?vendorNo=" + $("#IndexPivot_Vendor_Number").val().trim();
            count = MakeAjaxCall2(requestGET, false, url, '');
            if (count == 0) {
                return "Vendor is not Active";
            }
        }
        return ''
    },

    getCurrentMonthShortName: function getCurrentMonthShortName() {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dat = new Date();
        return monthNames[dat.getMonth()];
    },

    GetFormattedNumber: function GetFormattedNumber(cssClass, data) {
        if (cssClass.indexOf("allow3decimalsOnly") > -1)
            return parseFloat(data).toFixed(3);
        else if (cssClass.indexOf("allow2decimalsOnly") > -1)
            return parseFloat(data).toFixed(2);
        else if (cssClass.indexOf("allowNumbersOnly") > -1)
            return parseFloat(data).toFixed(0);
        else
            return parseFloat(data).toFixed(0);
    },

    GetDisplayCurrencyFormat: function GetDisplayCurrencyFormat(value) {

        if (value || '' != '') {
            var parts = value.replace(/,/g, "").split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            var amt = parts.join(".");
            return amt;
        }
    }
}

poauth.Init();