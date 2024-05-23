
var prevSelectedForwardUser
    , prevValstored
    , prevVal
    , curentTr
    , curentPOTr
    , editorPODetail
    , approverObj
    , approverList
    , oldForwardText = ''
    , dbVendorName = ""
    , dbRemit = ""
    , dbProjectNumber = ""
    , dbPaymentTerms = ""
    , dbPaymentMethod = ""
    , dbSeparatePayment = ""
    , gLCodePrefix = " "
    , isVendorMntcRequired = ""
    , isVendorMntcRequired = 2
    , projectNumberOnload = ""
    , AccountAssignmentDefault = ""
    , IsPONumberWFStatusCheck = 'false'
    , IsDetailCountGreaterThanZero = 'false'
    , IsFirstTimeLoad = 'true'
    , IsRejectConfirmationMessageShow = 'false'
    , FieldRulesCustomColumn = ''
    , RejectNotePrefix = ''
    , ToleranceAmount=0
    , isNewAddress = 'true'
    , showVendorBasedonPO = false
    , dbDueDate = ''
    , VendorDefaultLen = 0
    , constToleranceValue = 0, constToleranceNegativeValue = 0
    , flagReplyToSender = 0, flagSubmit = 0, flagForwardTo = 0, flagReject = 0, flagSave = 0;

const REQUESTGET = "GET", REQUESTPOST = "POST";

var apinvoice = {

    Init: function () {

        apinvoice.assignOldValuesToGlobalVaribles()
        apinvoice.loadDCConfigValue();
        apinvoice.populateRejectDropDownList();  // we are loading data while reject tabclick also        
        //apinvoice.loadCustomChanges();              


        //---events

        $('#IndexPivot_PANumber').blur(function () {
            apinvoice.blurPANumber();
        });
        $('#IndexPivot_Invoice_Date').blur(function () {
            apinvoice.clearInvalidDate(this);
            var terms = $("#IndexPivot_Terms").length > 0 ? $("#IndexPivot_Terms").val().trim() : '';
            if (terms != "") {
                $("#IndexPivot_Terms").trigger('change');
            }
        });
        $('#IndexPivot_Due_Date').blur(function () {
            apinvoice.clearInvalidDate(this);
        });
        $('#IndexPivot_PANumber').autocomplete({
            source: function (request, response) {
                if ($('#IndexPivot_PANumber').val().trim() != '') {
                    var url = '/poauthDC/GetActivePANumbers?pANumber=' + $('#IndexPivot_PANumber').val().trim() + '&isSelected=' + false;
                    MakeAjaxCall_WithDependantSource(REQUESTGET, url, null, apinvoice.bindAutocompletePANumberTextbox, apinvoice.onFailure_WithDependantSource, apinvoice.onError_WithDependantSource, response);
                }
            },
            select: function (a, b) {
                $('.ui-menu').scrollTop(0);
            }
        });
        $('#txtForwardTo').autocomplete({
            source: function (request, response) {
                var url = '/APInvoiceDC/GetForwardUsers?searchText=' + $('#txtForwardTo').val() + '&userDetailsID=' + userDetailsID + '&workflowID=' + workFlowId + '&documentID=' + $("#docId").val() + '';
                MakeAjaxCall_WithDependantSource(REQUESTGET, url, null, apinvoice.bindAutocompleteForwardTextbox, apinvoice.onFailure_WithDependantSource, apinvoice.onError_WithDependantSource, response);
            },
            select: function (a, b) {
                oldForwardText = b.item.value;
                $('.ui-menu').scrollTop(0);
            }
        });

        $("#smartlistPopup").dialog({
            autoOpen: false,
            modal: true,
            title: "Smartlist",
            width: "60%",
            maxWidth: "668px"
        });
        $("#ApprovepanelPopup").dialog({
            autoOpen: false,
            modal: true,
            title: "Please select an Approver",
            width: "80%",
            maxWidth: "668px"
        });
        $("#smartlistPODetailPopup").dialog({
            autoOpen: false,
            modal: true,
            title: "Smart List",
            width: "80%",
            maxWidth: "668px",
            position: { my: "center", at: "top:30" }
        });

        $("#SmartListGrid").DataTable({ "ordering": false, "pageLength": 5, "lengthChange": false }).clear();
        $('#SmartListHeaderGrid').DataTable({
            "bAutoWidth": false,
            columns: [
                {
                    className: "header_frst_column",
                    width: '20px',
                    title: "",
                    render: function (val, type, full, meta) {
                        return '<input type="radio" name="rdbtn" class="radioDocId" value="' + val + '">';
                    },
                    "ordering": false
                },
                { title: "Document Id", type: 'string' },
                { title: "Invoice Date", type: 'string' },
                { title: "Invoice Amount", type: 'decimal' }
            ],
            fnDrawCallback: function () {
                //$("input:radio[name=rdbtn]").click(function () {
                //    var documentID = $(this).val();
                //    apinvoice.GetSmartListDetail(documentID);
                //});
            },
            //paging: false,
            //searching: false,
            //bInfo: false,
            filter: false,
            //sort: false,
            //"ordering": false,
            "pageLength": 2, "lengthChange": false
        }).clear();
        $("#SmartListDetailGrid").DataTable({
            //createdRow: function (row, data, dataIndex) {
            //    $(row).attr('id', 'someID');
            //},
            "bAutoWidth": false,
            columnDefs: [
                {
                    targets: 0,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('id', 'tdCheckbox');
                    }
                },
                {
                    targets: 1,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('id', 'tdAccNo');
                    }
                },
                {
                    targets: 2,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).attr('id', 'tdAccDesc');
                    }
                },
                {
                    targets: 3,
                    createdCell: function (td, cellData, rowData, row, col) {

                        $(td).attr('id', 'tdAmount' + row);
                    }
                }
            ],
            fnCreatedRow: function (nRow, aData, iDataIndex) {
                $(nRow).attr('id', 'trSmartList' + iDataIndex);
            },
            columns: [
                {
                    className: "header_frst_column",
                    width: '20px',
                    title: "",
                    render: function (val, type, full, meta) {
                        if (val == true) {
                            return '<input type="checkbox" checked="checked" value="' + val + '" >';
                        }
                        else {
                            return '<input type="checkbox" value="' + val + '" >';
                        }
                    },
                    "ordering": false
                },
                { width: '220px', title: "Expense Account Number", type: 'string' },
                { width: '220px', title: "Expense Account Description", type: 'string' },
                { className: "clsAmount", title: "Amount" }
            ],
            //sort: false,            
            //"ordering": false,
            "pageLength": 5, "lengthChange": false,
            "rowCallback": function (row, data, dataIndex) {
                var tblTds = $('>td', row);

                //if ($.isNumeric(data)) {
                //    tblTds[0].innerHTML = '<td><input type="checkbox" checked="checked" /></td>';                    
                //}
                //else {
                //    tblTds[0].innerHTML = '<td><input type="checkbox"  /></td>';
                //}

                //
                //// Get row ID
                //var rowId = data[0];

                //// If row ID is in the list of selected row IDs
                //if ($.inArray(rowId, rows_selected) !== -1) {
                //    $(row).find('input[type="checkbox"]').prop('checked', true);
                //    $(row).addClass('selected');
                //}
            }
        }).clear();

        // $("#chkVendorInfo").prop("checked", true);

        $("#IndexPivot_SpecialHandling").change(function () {
            apinvoice.changeSpecialHandling();
        });
        $("#IndexPivot_Co_Number").change(function () {
            apinvoice.changeCompanyNo(this);
        });
        $("#TagDocumentHeader_CommodityCode").change(function () {
            apinvoice.changeCommodityCode();
        });
        $("#IndexPivot_Vendor_Name").change(function () {
            apinvoice.changeVendorName();
        });
        $("#IndexPivot_Vendor_Number").change(function () {
            apinvoice.changeVendorNumber();
        });
        $("#TagDocumentHeader_RemitToAddress").change(function () {
            apinvoice.changeRemitToAddress(this);
        });

        $('#TagDocumentHeader_DiscountDate').change(function () {
            apinvoice.chnageDiscountDate();
        }); //TSS DURGA (07/31/2019) Added for validate Discount date.


        $('#IndexPivot_Terms').change(function () {
            apinvoice.changeindexPivot_Terms();
        });
        $('#ddlPONumber').change(function () {
            apinvoice.changePONumber();
        });
        $('#IndexPivot_SiteID').change(function () {
            apinvoice.changeindexPivot_SiteID();
        });
        $("#btnPODetailSmartList").on('click', function () {
            apinvoice.btnClickPODetailSmartList();

        });
        $('#btnPODetailsReLoad').on('click', function () {
            apinvoice.btnClickPODetailsReLoad();
        });
        $("#btnPODetailOk").on('click', function () {

            apinvoice.btnClickPODetailOk(this);
        });
        $("#btnPODetailCancel").on('click', function () {
            apinvoice.btnClickPODetailCancel();
        });
        $("#btnSmartList").on('click', function () {
            apinvoice.btnClickSmartList();
        });
        $("#btnOk").on('click', function () {
            apinvoice.btnClickOk();
        });
        $("#btnCancel").on('click', function () {
            apinvoice.btnClickCancel();
        });
        $("#btnSave").on('click', function () {
            apinvoice.btnClickSave();
        });
        $("#btnSubmit").on('click', function () {
            apinvoice.btnClickSubmit();
        });
        $("#btnForwardTo").on('click', function () {
            apinvoice.btnClickForwardTo();
        });
        $("#btnReject").on('click', function () {
            apinvoice.btnClickReject();
        });
        $("#btnReplyToSender").on('click', function () {
            apinvoice.btnClickReplyToSender();
        });
        $("#btnSearch").on('click', function () {
            apinvoice.btnClickSearch();
        });
        $('#btnPONumberSearch').on('click', function () {
            apinvoice.btnClickPONumberSearch();
        });
        $('#btnSendToApprover').on('click', function () {
            apinvoice.btnClickSendToApprover();

        });
        $('#btnCloseApprover').on('click', function () {
            apinvoice.btnClickClose();
        });
        $("#btnCloseRelatedDoc").on('click', function () {
            apinvoice.btnClickCloseRelatedDoc();
        });
        $('#btnGLFileUploads').click(function () {
            apinvoice.btnGLFileUploads();
        });

        $("#hrefHeaderGeneral").on('click', function () {
            apinvoice.hrefClickHeaderGeneral(this);
        });
        $("#hrefAccountAssignment").on('click', function () {
            apinvoice.hrefClickAccountAssignment(this);
        });
        $("#hrefForward").on('click', function () {
            apinvoice.hrefClickForward(this);
        });
        $("#hrefRejects").on('click', function () {
            apinvoice.hrefClickRejects(this);
        });
        $("#hrefRelatedDocuments").on('click', function () {
            apinvoice.hrefClickRelatedDocuments(this);
        });
        $('#TagDocumentHeader_HeadUsr5').on('click', function () {
            apinvoice.clickTagDocumentHeader_HeadUsr5();
        })

        $(document).on("click", "#SmartListGrid tbody tr td", function (event) {
            apinvoice.smartGridClickTbodyTrTd(this);

        });
        $(document).on("click", "#SmartListDetailGrid tbody tr td", function (event) {
            apinvoice.clickSmartListDetailGrid(this);
        });

        $(document).on("click", '#btnAddNotes', function (event) {
            apinvoice.btnClickAddNotes(this);
        });
        $(document).on("click", '#txtForwardTo', function (event) {
            apinvoice.txtClickForwardTo();
        });


        apinvoice.loadCustomChanges();

    },

    activeTab: function (tabName, id) {
        isErrorGridLine = false;
        var isSaveHeader = false;

        if ($("#hrefHeaderGeneral").hasClass('active'))
            isSaveHeader = true;

        $("#tab> a").each(function () {
            if (this.id != id) {
                $('#' + this.id).removeClass('active');
            }
        });
        apinvoice.assignLabelData(tabName);
        if ($("#btnSubmit").length > 0 && isSaveHeader === true) {
            if (!$("#btnSubmit").is(":disabled")) {
                apinvoice.saveHeaderOnly(false);
            }
        }
        if (id === 'hrefAccountAssignment') {
            // apinvoice.updateJqGrid();
            $("#jqGrid").trigger("resize");
            if (FieldRulesCustomColumn != '') {
                apinvoice.getRefreshFieldRules();
                apinvoice.refreshPODetailsGrid();
            }
            apinvoiceDetails.calculateUnAllocatedBalanceJqGrid();
            var wf = (jsonHeaderParams.WF || "").toLowerCase();
            if (wf == "yes" && utility.getIsVisibleField(fieldRules, 'GridRowPODetailAddButton') == false)
                apinvoiceDetails.setUnallocatedBalancetoLastRow();
        }
    },
    addHeaderDetailJqGrid: function (obj) {

        var jsonString = "", dependantObj = {}, url = '/APInvoiceDC/SaveTagDocumentDetail_PODetail'
        //if (validationDetail(obj,id)) {
        obj.workFlowId = workFlowId;
        obj.nodeId = nodeId;
        jsonString = JSON.stringify(obj);
        dependantObj.obj = obj;
        MakeAjaxCall_WithDependantSource(REQUESTPOST, url, jsonString, apinvoice.onSuccessAddDetailJqGrid, apinvoice.onFailure_WithDependantSource, apinvoice.onError_WithDependantSource, dependantObj);
        //}
    },
    assignLabelData: function (partial) {

        $("div[id='" + partial + "'] label[id='lblAccAssgnmentCompanyNo']").text($("#IndexPivot_Co_Number").val());
        //$("div[id='" + partial + "'] label[id='lblAccAssgnmentSiteID']").text($("#IndexPivot_SiteID").val());
        $("div[id='" + partial + "'] label[id='lblAccAssgnmentSiteID']").text(($('#IndexPivot_SiteID Option:selected').text() == '<select>' || $('#IndexPivot_SiteID Option:selected').text() == '') ? '' : $('#IndexPivot_SiteID Option:selected').text());
        $("div[id='" + partial + "'] label[id='lblAccAssgnmentVendor']").text(($("#IndexPivot_Vendor_Name option:selected").text() == '<select>' || $("#IndexPivot_Vendor_Name option:selected").text() == '') ? '' : $("#IndexPivot_Vendor_Name option:selected").text());
        $("div[id='" + partial + "'] label[id='lblAccAssgnmentVendorNumber']").text($("#IndexPivot_Vendor_Number option:selected").text().trim().toLowerCase() != '<select>' && $("#IndexPivot_Vendor_Number option:selected").text().trim().toLowerCase() != '' ? $("#IndexPivot_Vendor_Number option:selected").text() : '');
        $("div[id='" + partial + "'] label[id='lblAccAssgnmentVendorAddress']").text($("#txtVendorAddress").val());
        var ponumber = $("#IndexPivot_PO_Number").val() != undefined ? $("#IndexPivot_PO_Number").val() : $("#ddlPONumber option:selected").val().trim().toLowerCase() != '<select>' && $("#ddlPONumber option:selected").val().trim().toLowerCase() != '' ? $("#ddlPONumber option:selected").val().trim() : '';
        $("div[id='" + partial + "'] label[id='lblAccAssgnmentPONumber']").text(ponumber);
        $("div[id='" + partial + "'] label[id='lblAccAssgnmentInvoiceNo']").text($("#IndexPivot_Invoice_Number").val());
        $("div[id='" + partial + "'] label[id='lblAccAssgnmentInvoiceDate']").text($("#IndexPivot_Invoice_Date").val());
        $("div[id='" + partial + "'] label[id='lblAccAssgnmentInvoiceAmount']").text($("#IndexPivot_Invoice_Amount").val());

    },
    assignOldValuesToGlobalVaribles: function () {

        dbVendorName = $('#IndexPivot_Vendor_Number').val();
        dbRemit = $('#TagDocumentHeader_RemitToAddress').val();
        dbProjectNumber = $('#IndexPivot_PANumber').val();
        dbPaymentTerms = $('#IndexPivot_Terms').val();
        dbPaymentMethod = $('#TagDocumentHeader_HeadUsr2').val();
        dbSeparatePayment = $('#IndexPivot_SeparatePayment').is(':checked');
        dbDueDate = $('#IndexPivot_Due_Date').val();
        projectNumberOnload = dbProjectNumber;
    },


    bindJqGridData: function (dataToLoad) {
        var grid = jQuery("#jqGrid");
        grid.jqGrid('clearGridData');
        dataToLoad = dataToLoad || [];
        dataToLoad.forEach(function (item, i) {
            item.rowid = i + 1;
        });
        grid.jqGrid('setGridParam', { data: dataToLoad });
        grid.trigger('reloadGrid');

        apinvoiceDetails.calculateUnAllocatedBalanceJqGrid();

        var wf = (jsonHeaderParams.WF || "").toLowerCase();
        if (wf == "yes" && utility.getIsVisibleField(fieldRules, 'GridRowPODetailAddButton') == false)
            apinvoiceDetails.addEmptyRow();
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
    bindPANumberDesc: function (data) {
        var projectNumber = "", res = [];
        if (data.length > 0) {
            projectNumber = $('#IndexPivot_PANumber').val();
            res = data.filter(function (item, index) {
                if (projectNumber == item.PANumber) {
                    return item.PADescription
                };
            });

            if (res.length > 0) {
                $('#IndexPivot_PADescription').val(res[0].PADescription);
            } else {
                $('#IndexPivot_PADescription,#IndexPivot_PANumber').val('');
            }
        }
    },
    bindDropdownRemitAddress_InvoiceCurrency: function () {
        if (dbRemit == '') {
            var vendorNumber = encodeURIComponent($("#IndexPivot_Vendor_Number").val());
            if ($("#IndexPivot_Vendor_Number").val() != "" && $("#IndexPivot_Vendor_Number").val() != "<select>") {
                apinvoice.dropdownlist_bind_AjaxGet("/APInvoiceDC/GetVendorAddress_ByVendorNoJson?vendorNo=" + vendorNumber + "" + "&documentID=" + $("#HdnDocumentID").val(), "#TagDocumentHeader_RemitToAddress", 'ListValue', 'ListText', '\'<select>\'', true);
                var showPaymentMethodBasedonVendor = false;
                var objDCConfigShowPaymentMethodByVendorNumber = jsonDCConfigurations.filter(function (x) { return x.ConfigName == 'PaymentmethodList'; });
                //var objDCConfigShowPaymentMethodByVendorNumber = jsonDCConfigurations.filter(x => x.ConfigName == 'PaymentmethodList');

                if (objDCConfigShowPaymentMethodByVendorNumber[0] || '' != '') {
                    showPaymentMethodBasedonVendor = objDCConfigShowPaymentMethodByVendorNumber[0].ConfigValue;
                    if (showPaymentMethodBasedonVendor == "true")
                        apinvoice.dropdownlist_bind_AjaxGet("/APInvoiceDC/GetPaymentMethodByVendorNoJson?vendorNo=" + vendorNumber, "#TagDocumentHeader_HeadUsr2", 'Type', 'Description', '\'<select>\'', false);

                    //apinvoice.dropdownlist_bind_AjaxGet("/APInvoiceDC/GetPaymentMethodByVendorNoJson?vendorNo=" + $("#IndexPivot_Vendor_Number").val(), "#TagDocumentHeader_HeadUsr2", 'PaymentType', 'Description', '\'<select>\'');                  
                }
                MakeAjaxCall(REQUESTGET, "/APInvoiceDC/GetPaymentTermsByVendorNoJson?vendorNo=" + vendorNumber + "", null, apinvoice.bindPaymentTerms, apinvoice.onFailure, apinvoice.onError);

            }
            else {
                $('#TagDocumentHeader_RemitToAddress').empty().append($('<option>', { value: "", text: '<select>' }));
                $('#TagDocumentHeader_InvoiceCurrency').val('');

                if (dbPaymentTerms == '') {
                    $("#IndexPivot_Terms").val('');
                    $("#IndexPivot_Terms").trigger('change');
                }

                if (dbPaymentMethod == '')
                    $("#TagDocumentHeader_HeadUsr2").val('');

                if ($("#IndexPivot_Vendor_Number").val() == "") {
                    $('#TagDocumentHeader_HeadUsr2').empty().append($('<option>', { value: "", text: '<select>' }));
                }
                if (dbSeparatePayment != true) {
                    $('#IndexPivot_SeparatePayment').prop('checked', false);
                }
            }
        } else {
            dbRemit = '';
        }

        if (dbPaymentTerms != '')
            dbPaymentTerms = '';
        if (dbPaymentMethod != '')
            dbPaymentMethod = '';
        if (dbSeparatePayment != true)
            dbSeparatePayment = '';
    },
    bindPaymentTerms: function (data) {
        if (dbPaymentTerms == '')
            $("#IndexPivot_Terms").val(data.PaymentTerms);
        else
            dbPaymentTerms = '';

        if ($("#IndexPivot_Terms").val() == null) {
            $("#IndexPivot_Terms").val('');
        }
        if (dbPaymentMethod == '')
            $("#TagDocumentHeader_HeadUsr2").val(data.PaymentMethod);
        else
            dbPaymentMethod = '';

        if (dbSeparatePayment != true) {
            if (data.SeparatePayment == 1) {
                $('#IndexPivot_SeparatePayment').prop('checked', true);
            } else {
                $('#IndexPivot_SeparatePayment').prop('checked', false);
            }
        } else
            dbSeparatePayment = '';

        $("#IndexPivot_New_Vendor_Name").val(data.VendorCategory);

        $("#TagDocumentHeader_RemitToAddress").val(data.RemitToAddress);
        $("#TagDocumentHeader_RemitToAddress").trigger('change');
        $("#IndexPivot_Terms").trigger('change');
    },
    bindPaymentMethod: function (data) {
        if (dbPaymentMethod == '')
            $("#TagDocumentHeader_HeadUsr2").val(data);
        else
            dbPaymentMethod = '';
    },
    bindAutocompleteTextbox: function (data, dependantSource) {
        dependantSource($.map(data, function (item) {
            return { value: item }
        }));
    },
    bindAutocompleteTextboxAdd: function (data, dependantSource) {
        dependantSource($.map(data, function (item) {
            return {
                label: item.GlCodeWithDesc,
                value: item.GlCode,
                desc: item.Description
            }
        }));
        window.scrollTo(0, document.body.scrollHeight);
    },
    bindAutocompleteForwardTextbox: function (data, dependantSource) {
        if (data != 0) {
            dependantSource($.map(data, function (item) {
                return { value: item }
            }));
        }
    },
    bindCurrentDropdownlist: function (data, dependantObj) {

        dependantObj.currentDropdownlist.empty().append($('<option>', { value: '', text: '<select>' }));
        $.each(data, function () {
            dependantObj.currentDropdownlist.append($("<option></option>").val(this[dependantObj.currentDropdownlistValue]).html(this[dependantObj.currentDropdownlistText]));

        });
        if (dependantObj.IsInvoiceCurrency == true && data.length >= 1) {
            apinvoice.setInvoiceCurrencyTextBox(data[0].VendorCurrencyCode);
        }

        if (dependantObj.IsRemitAddress == true && data.length >= 1) {

            if (dbRemit == '') {
                dependantObj.currentDropdownlist.find('option[value="' + data[0]['ListValue'] + '"]').attr('selected', 'selected');
                dependantObj.currentDropdownlist.trigger("change");
            }
            else {
                dependantObj.currentDropdownlist.find('option[value="' + dbRemit + '"]').attr('selected', 'selected');
                if (dbRemit != "New Address")
                    dependantObj.currentDropdownlist.trigger("change");
            }
        }
        else if (dependantObj.IsRemitAddress == true && data.length == 1) {
            if ($('#IndexPivot_Vendor_Name').val() == '' || $('#IndexPivot_Vendor_Name').val() == '<select>' || $('#IndexPivot_Vendor_Name').val() == '0'
                || $('#IndexPivot_Vendor_Number').val() == '' || $('#IndexPivot_Vendor_Number').val() == '<select>' || $('#IndexPivot_Vendor_Number').val() == '0') {
                dependantObj.currentDropdownlist.find('option[value=\'' + '' + '\']').attr('selected', 'selected');
            }
            else {
                dependantObj.currentDropdownlist.find('option[value=\'' + 'New Address' + '\']').attr('selected', 'selected');
            }
        }
    },
    bindPONumberDropdownlist: function (data, dependantObj) {
        dependantObj.currentDropdownlist.empty().append($('<option>', { value: '', text: '<select>' }));
        $.each(data, function () {
            dependantObj.currentDropdownlist.append($('<option>', { value: this[dependantObj.currentDropdownlistValue], text: this[dependantObj.currentDropdownlistText] }));
        });
    },
    bindVendorDropdownlist: function (data, dependantObj) {
        dependantObj.ddlVendorName.empty().append($('<option>', { value: "", text: '<select>' }));
        dependantObj.ddlVendorNumber.empty().append($('<option>', { value: "", text: '<select>' }));
        $.each(data, function () {

            if ($('#IndexPivot_VendorNameDBA').length > 0) {
                dependantObj.ddlVendorName.append($("<option></option>").val(this['Number']).html(this['DBAs']));
            }
            else {
                dependantObj.ddlVendorName.append($("<option></option>").val(this['Number']).html(this['Name']));
            }
            dependantObj.ddlVendorNumber.append($("<option></option>").val(this['Number']).html(this['Number']));
        });
    },
    bindVendorDropdownlistByPONumber: function (data, dependantObj) {

        dependantObj.ddlVendorName.empty().append($('<option>', { value: '', text: '<select>' }));
        dependantObj.ddlVendorNumber.empty().append($('<option>', { value: '', text: '<select>' }));
        var selectedVendor = 'No';
        $.each(data, function () {
            dependantObj.ddlVendorName.append($("<option></option>").val(this['Number']).html(this['Name']));
            dependantObj.ddlVendorNumber.append($("<option></option>").val(this['Number']).html(this['Number']));
        });
        if (selectedVendor != 'No') {
            dependantObj.ddlVendorName.find('option[value="' + selectedVendor + '"]').attr('selected', 'selected');
            dependantObj.ddlVendorNumber.find('option[value="' + selectedVendor + '"]').attr('selected', 'selected');
        }
        if (data.length >= 1) {
            $('#IndexPivot_Vendor_Name')[0].selectedIndex = 1;
            $('#IndexPivot_Vendor_Number')[0].selectedIndex = 1;
            if (dbVendorName == '') {
                $('#IndexPivot_Vendor_Name').trigger("change");
                $('#IndexPivot_Vendor_Number').trigger("change");
                dbVendorName = '';
            }
        }
    },
    bindSmartList: function (data, dependantObj) {
        $.each(data, function () {
            var markup = apinvoice.stringFormat(apinvoice.templateRowSmartlist(), '', this['ExpenseAccountNumber'], this['ExpenseAccountDescription'],
                '', $('#HdnDocumentID').val(), 'Add');
            var jRow = $("#SmartListGrid tbody").append(markup);
            var t = $('#SmartListGrid').DataTable();
            t.row.add(jRow[0].rows[jRow[0].rows.length - 1]).draw();
        });
        $('#smartlistPopup').html();
        $('#smartlistPopup').dialog('open');

    },
    bindSmartListHeader: function (data, dependantObj) {
        var tblSmartListHeader = $('#SmartListHeaderGrid').DataTable();
        $.each(data, function () {
            tblSmartListHeader.row.add([this['DocumentID'], this['DocumentID'], this['Invoice_Date'], this['Invoice_Amount']]).draw();
        });
        $('#smartlistPODetailPopup').html();
        $('#smartlistPODetailPopup').dialog('open');
    },
    bindSmartListDetail: function (data, dependantObj) {
        var tblSmartListDetail = $('#SmartListDetailGrid').DataTable();
        $("#SmartListDetailGrid").DataTable().clear().draw();
        $.each(data, function () {
            tblSmartListDetail.row.add([false, this['ExpenseAccountNumber'], this['ExpenseAccountDescription'], '']).draw();
        });
    },
    bindProjectNumber: function (data) {
        $("#IndexPivot_PANumber").val(data);
        $('#hdn_IndexPivot_PANumber').val(data);
        $('#IndexPivot_PANumber').trigger("blur");
    },
    blurPANumber: function () {
        var response = [], url = "";
        if ($('#IndexPivot_PANumber').val().trim() != '') {
            url = '/poauthDC/GetActivePANumbers?pANumber=' + $('#IndexPivot_PANumber').val().trim() + '&isSelected=' + true;
            MakeAjaxCall_WithDependantSource(REQUESTGET, url, null, apinvoice.bindPANumberDesc, apinvoice.onFailure_WithDependantSource, apinvoice.onError_WithDependantSource, response);
        }
        else {
            $('#IndexPivot_PADescription').val('');
        }

        if (projectNumberOnload.trim() != ($('#IndexPivot_PANumber').val() || "").trim()) {

            if ($('#jqGrid').length > 0) {
                if (parseInt(jQuery("#jqGrid").jqGrid('getGridParam', 'records')) > 0) {
                    $('.alert').hide();
                    Notify('Project Number changed. Verify GL coding', null, null, 'danger');
                }
            }
        }
    },

    btnClickPODetailSmartList: function () {
        var companyNumber = "", vendorNumber = "", invoiceDate = "", invoiceAmount = "", documentID = "", url = "";
        $("#SmartListHeaderGrid").DataTable().clear().draw();
        $("#SmartListDetailGrid").DataTable().clear().draw();
        $('#lblSmartlistPODetailAmountErr').text('');
        $("div[id='SmartListDetailGrid_filter'] > label > input[type='search']").val('');

        companyNumber = $('#IndexPivot_Co_Number').length > 0 ? $('#IndexPivot_Co_Number').val() : $('#IndexPivot_SiteID').val();
        vendorNumber = $('#IndexPivot_Vendor_Number').val();
        invoiceDate = $('#IndexPivot_Invoice_Date').val();
        invoiceAmount = $('#IndexPivot_Invoice_Amount').val();
        documentID = $('#HdnDocumentID').val();

        //if (userDetailsID != '' && userDetailsID != undefined
        //    && companyNumber != '' && companyNumber != undefined
        //    && vendorNumber != '' && vendorNumber != undefined
        //    && invoiceDate != '' && invoiceDate != undefined
        //    && invoiceAmount != '' && invoiceAmount != undefined) {
        if (userDetailsID != "" && companyNumber != "" && vendorNumber != "" && invoiceDate != "" && invoiceAmount != "") {
            url = '/APInvoiceDC/GetSmartListHeader?companyNo=' + companyNumber + '&vendorID=' + vendorNumber + '&documentID=' + documentID;
            MakeAjaxCall(REQUESTGET, url, null, apinvoice.bindSmartListHeader, apinvoice.onFailure, apinvoice.onError);
        }
    },
    btnClickPODetailsReLoad: function () {
        var documentId = parseInt($("#docId").val()), url = "", data = [];
        if ((documentId || '') != '') {
            url = '/APInvoiceDC/ReloadPODetails?documentId=' + documentId;
            data = MakeAjaxCall2('GET', false, url, '');
            if (data.length > 0) {
                apinvoice.bindJqGridData(data);
            }
        }
    },
    btnClickPODetailOk: function (objThis) {

        //details -new code start                       
        var totRow = 0, TagObj = {};

        $('#SmartListDetailGrid').DataTable().columns().eq(0).each(function (index) {

            var column = $('#SmartListDetailGrid').DataTable().column(index);
            if (index == 0) {
                column.data().each(function (value, i) {
                    TagObj[i] = {};
                    TagObj[i].DocumentID = $('#HdnDocumentID').val();
                    TagObj[i].RowStatus = 'Add';
                    TagObj[i].IsPORow = false;
                    TagObj[i].ExpenseAccountNumber = '';
                    TagObj[i].POItemDescription = '';
                    TagObj[i].POQty = '0';
                    TagObj[i].POPrice = '0';
                    TagObj[i].ExtendedCost = '0';
                    TagObj[i].ReceivingQty = '1';
                    TagObj[i].InvoiceQty = '1';
                    TagObj[i].InvoicePrice = '0';
                    TagObj[i].POExtendedPrice = '0';
                    TagObj[i].Difference = '0';
                    //TagObj[i].DetTaxAmount = false;
                    //TagObj[i].DetFreightAmount = false;
                    //TagObj[i].DetMiscAmount = false;
                    TagObj[i].InvoiceDate = $('#IndexPivot_Invoice_Date').val();
                    TagObj[i].InvoiceAmount = $('#IndexPivot_Invoice_Amount').val().replace(/,/g, "");

                    //TagObj[i].DetMiscAmount = false;

                    TagObj[i].UserID = userDetailsID;
                    TagObj[i].CompanyNo = TagObj[i].VendorNo = '';
                    TagObj[i].RowId = i;
                    if ($('#IndexPivot_Co_Number').val() != 0 && $('#IndexPivot_Co_Number').val() != '<select>') {
                        TagObj[i].CompanyNo = $('#IndexPivot_Co_Number').val();
                    }
                    if ($('#IndexPivot_Vendor_Number').val() != 0 && $('#IndexPivot_Vendor_Number').val() != '<select>') {
                        TagObj[i].VendorNo = $('#IndexPivot_Vendor_Number').val();
                    }
                    TagObj[i].isSelected = false;
                    if (value != null && value != '')
                        TagObj[i].isSelected = value;

                    totRow++;
                });
            }
            if (index == 1) {
                column.data().each(function (value, i) {
                    TagObj[i].ExpenseAccountNumber = value;
                });
            }
            if (index == 2) {
                column.data().each(function (value, i) {
                    TagObj[i].POItemDescription = value;
                });
            }
            if (index == 3) {
                column.data().each(function (value, i) {
                    TagObj[i].InvoicePrice = value;
                    TagObj[i].POExtendedPrice = TagObj[i].InvoiceQty * TagObj[i].InvoicePrice;
                });
            }
        });

        var objTotalRows = [];

        if (totRow > 0) {
            for (var j = 0; j < totRow; j++) {
                if (TagObj[j].isSelected) {
                    objTotalRows.push(TagObj[j]);
                }
            }
        }
        //details -new code end


        if (objTotalRows.length > 0) {

            //var objArr = objTotalRows.filter(m => m.isSelected == true && m.InvoicePrice == '');
            var objArr = objTotalRows.filter(function (m) { return m.isSelected == true && m.InvoicePrice == ''; });
            $('#lblSmartlistPODetailAmountErr').text('');
            if (objArr.length > 0) {
                var rowNo = 0;
                $.each(objTotalRows, function () {
                    if (objTotalRows[rowNo].isSelected == true && objTotalRows[rowNo].InvoicePrice == '') {
                        var rowNode = $('#SmartListDetailGrid').DataTable().row(objTotalRows[rowNo].RowId).node();
                        $(rowNode).find('td').eq(3).addClass('error');
                    }
                    else {
                        var rowNode = $('#SmartListDetailGrid').DataTable().row(objTotalRows[rowNo].RowId).node();
                        if ($(rowNode).find('td').eq(3).hasClass('error'))
                            $(rowNode).find('td').eq(3).removeClass('error');
                    }
                    rowNo++;
                });
                $('#lblSmartlistPODetailAmountErr').text('Required Field Missing');
            }
            else {
                var cnt = 0;
                $.each(objTotalRows, function () {
                    if (this['ExpenseAccountNumber'] != '' && this['ExpenseAccountDescription'] != '' && this['InvoicePrice'] != '') {

                        apinvoice.addHeaderDetailJqGrid(objTotalRows[cnt]);
                    }
                    cnt++;
                });
                $('#smartlistPODetailPopup').dialog('close');
            }
        }
        else {
            $('#smartlistPODetailPopup').dialog('close');
        }
    },
    btnClickPODetailCancel: function () {
        $('#smartlistPODetailPopup').dialog('close');
    },
    btnClickSmartList: function () {
        var companyNumber = ($('#IndexPivot_Co_Number').val() || "")
            , vendorNumber = ($('#IndexPivot_Vendor_Number').val() || "")
            , url = "";

        $("#SmartListGrid").DataTable().clear();

        if ((userDetailsID || "") != "" && companyNumber != "" && vendorNumber != "") {
            url = '/APInvoiceDC/GetSmartListJson?userID=' + userDetailsID + '&companyNo=' + companyNumber + '&vendorID=' + vendorNumber;
            MakeAjaxCall(REQUESTGET, url, null, apinvoice.bindSmartList, apinvoice.onFailure, apinvoice.onError);

        }
    },
    btnClickOk: function () {

        var TagDocumentDetail = [], totRow = 0, TagObj = {};

        //details -new code start                       


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

            //var objArr = objTotalRows.filter(m => m.isSelected == true && m.ExpensedAmount == '');
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
                        obj.IsPORow = false;

                        obj.UserID = userDetailsID;
                        obj.CompanyNo = '';
                        obj.VendorNo = '0';
                        if ($('#IndexPivot_Co_Number').val() != 0 && $('#IndexPivot_Co_Number').val() != '<select>') {
                            obj.CompanyNo = $('#IndexPivot_Co_Number').val();
                        }
                        if ($('#IndexPivot_Vendor_Number').val() != 0 && $('#IndexPivot_Vendor_Number').val() != '<select>' && $('#IndexPivot_Vendor_Number').val() != 'New Vendor') {
                            obj.VendorNo = $('#IndexPivot_Vendor_Number').val();
                        }

                        //apinvoice.SaveHeaderDetail(obj, 'Add', '', 'no',null);
                        apinvoice.AddHeaderDetail(obj, 'APDetails');
                    }
                    /*else {
                        var markup = apinvoice.stringFormat(apinvoice.templateRow(), '', this['ExpenseAccountNumber'], this['ExpenseAccountDescription'],
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
    },
    btnClickCancel: function () {
        $('#smartlistPopup').dialog('close');
    },
    btnClickSave: function () {
        flagSave++;
        $('#btnSave').attr('disabled', 'disabled');
        if (flagSave == 1) {
            setTimeout(function () {
                apinvoice.saveApInvoice();
                $('#btnSave').removeAttr('disabled', 'disabled');
                flagSave = 0;
            }, 2000);
        }
    },
    btnClickSubmit: function () {
        flagSubmit++;
        $('#btnSubmit').attr('disabled', 'disabled');
        if (flagSubmit == 1) {
            setTimeout(function () {

                if ($("#IndexPivot_Terms").length > 0 && $("#IndexPivot_Terms").val() == '') {
                    // jsonFieldRules.filter(x => x.FieldName == "DueDate")[0].IsMandatory = true;
                    jsonFieldRules.filter(function (x) { return x.FieldName == "DueDate"; })[0].IsMandatory = true;
                }
                apinvoice.saveApInvoice('Approve');
                $('#btnSubmit').removeAttr('disabled', 'disabled');
                flagSubmit = 0;
            }, 2000);
        }
    },
    btnClickForwardTo: function () {
        flagForwardTo++;
        $('#btnForwardTo').attr('disabled', 'disabled');
        if (flagForwardTo == 1) {
            setTimeout(function () {
                apinvoice.forwardToBtn_Click();
                $('#btnForwardTo').removeAttr('disabled', 'disabled');
                flagForwardTo = 0;
            }, 2000);
        }
    },
    btnClickReject: function () {
        flagReject++;
        $('#btnReject').attr('disabled', 'disabled');
        if (flagReject == 1) {
            setTimeout(function () {
                apinvoice.rejectToBtn_Click();
                $('#btnReject').removeAttr('disabled', 'disabled');
                flagReject = 0;
            }, 2000);

        }
    },
    btnClickReplyToSender: function () {
        flagReplyToSender++;
        $('#btnReplyToSender').attr('disabled', 'disabled');
        if (flagReplyToSender == 1) {
            setTimeout(function () {
                if ($('#txtReplyNote').val().trim() != '') {
                    $("#txtReplyNote").removeClass("error");
                    apinvoice.saveReplyToSender();
                }
                else {
                    $("#txtReplyNote").addClass("error");
                    $('.alert').hide();
                    Notify('Required Fields Missing', null, null, 'danger');
                }

                $('#btnReplyToSender').removeAttr('disabled', 'disabled');
                flagReplyToSender = 0;

            }, 2000);
        }
    },
    btnClickSearch: function () {
        dbRemit = '';
        var keyValue = $('input[name=chkVendorInfo]:checked').val();
        var serText = $('#searchText').val();
        if (serText.trim() != '') {
            $("#txtVendorAddress").val('');
            $("#IndexPivot_New_Vendor_Name").val('');
            $("#TagDocumentHeader_InvoiceCurrency").length > 0 ? $("#TagDocumentHeader_InvoiceCurrency").val('') : '';
            $("#IndexPivot_Terms").length > 0 ? $("#IndexPivot_Terms").val('') : '';

            var ddlVendorName = $('#IndexPivot_Vendor_Name');
            ddlVendorName.empty().append('<option selected="selected" value="" disabled="disabled">Loading.....</option>');
            var ddlVendorNumber = $('#IndexPivot_Vendor_Number');
            ddlVendorNumber.empty().append('<option selected="selected" value="" disabled="disabled">Loading.....</option>');
            var ddlRemitTo = $("#TagDocumentHeader_RemitToAddress");
            ddlRemitTo.empty().append($('<option>', { value: "", text: '<select>' }));
            var dependantObj = {};
            dependantObj.ddlVendorName = ddlVendorName;
            dependantObj.ddlVendorNumber = ddlVendorNumber;

            var paramData = {};
            paramData.searchkey = keyValue.toLowerCase();
            paramData.searchValue = serText.toLowerCase();
            var url = '/APInvoiceDC/GetSearchValue';
            MakeAjaxCallNew_WithDependantSource(REQUESTGET, url, paramData, apinvoice.bindVendorDropdownlist, apinvoice.onFailure_WithDependantSource, apinvoice.onError_WithDependantSource, dependantObj);
        }
        else {
            $('#searchText').val('');
        }
    },
    btnClickPONumberSearch: function () {
        if (!$("#ddlPONumber").is(":disabled")) {
            $('#searchText').removeAttr('disabled', 'disabled');
            $('#IndexPivot_Vendor_Name').removeAttr('disabled', 'disabled');
            $('#IndexPivot_Vendor_Number').removeAttr('disabled', 'disabled');
            $('#btnSearch').removeAttr('disabled', 'disabled');
        }
        var keyValue = 'shortname';
        var serText = $('#pONumbersearchText').val();
        if (serText.trim() != '') {

            dbVendorName = '';
            dbRemit = '';
            dbProjectNumber = ''
            dbPaymentTerms = '';
            dbPaymentMethod = '';
            dbSeparatePayment = '';
            dbVendorCategory = '';
            IsFirstTimeLoad = false;

            $('#IndexPivot_PANumber,#hdn_IndexPivot_PANumber').val('');

            //var showVendorBasedonPO = false;
            //if (objDCConfigShowVendorBasedonPO[0] || '' != '') {
            //    showVendorBasedonPO = objDCConfigShowVendorBasedonPO[0].ConfigValue;
            //}

            if (showVendorBasedonPO == 'true') {

                $('#IndexPivot_PADescription').val('');
                $("#txtVendorAddress").val('');
                $("#IndexPivot_New_Vendor_Name").val('');
                $("#TagDocumentHeader_InvoiceCurrency").length > 0 ? $("#TagDocumentHeader_InvoiceCurrency").val('') : '';
                $("#IndexPivot_Terms").length > 0 ? $("#IndexPivot_Terms").val('') : '';
                $('#IndexPivot_Vendor_Name').empty().append($('<option>', { value: '', text: '<select>' }));
                $('#IndexPivot_Vendor_Number').empty().append($('<option>', { value: '', text: '<select>' }));
                $('#TagDocumentHeader_RemitToAddress').empty().append($('<option>', { value: '', text: '<select>' }));

                if (isNewAddress == 'true') {
                    $('#IndexPivot_Vendor_Name').append($('<option>', { value: 'New Vendor', text: 'New Vendor' }));
                    $('#IndexPivot_Vendor_Number').append($('<option>', { value: 'New Vendor', text: 'New Vendor' }));
                    $('#TagDocumentHeader_RemitToAddress').append($('<option>', { value: 'New Address', text: 'New Address' }));
                }

                if ($('#IndexPivot_PANumber').length > 0) {
                    $('#IndexPivot_PANumber').val('');
                    $('#hdn_IndexPivot_PANumber').val('');
                }
            }
            var ddlPONumber = $('#ddlPONumber');
            ddlPONumber.empty().append('<option selected="selected" value="" disabled="disabled">Loading.....</option>');

            var url = '/APInvoiceDC/GetSearchValue_PONumber?searchValue=' + serText.toLowerCase() + '&isHeaderPObasedSearch=true';
            var dependantObj = {};
            dependantObj.currentDropdownlist = ddlPONumber;
            dependantObj.currentDropdownlistValue = 'Value';
            dependantObj.currentDropdownlistText = 'Text';

            MakeAjaxCall_WithDependantSource(REQUESTGET, url, null, apinvoice.bindPONumberDropdownlist, apinvoice.onFailure_WithDependantSource, apinvoice.onError_WithDependantSource, dependantObj);
            apinvoice.updateJqGrid();
        }
        else {
            $('#pONumbersearchText').val('');
        }
    },
    btnClickSendToApprover: function () {
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
            var filterObj;
            if (nodeId == "2001")
                //  filterObj = appListJson.filter(m => m.UserdetailsID == $("option:selected", $("#ddlApprove")).val() && m.ApproverDesc.split("__")[0] == $("option:selected", $("#ddlApprove")).text());
                filterObj = appListJson.filter(function (m) { return m.UserdetailsID == $("option:selected", $("#ddlApprove")).val() && m.ApproverDesc.split("__")[0] == $("option:selected", $("#ddlApprove")).text(); });
            else
                //filterObj = appListJson.filter(m => m.UserdetailsID == $("option:selected", $("#ddlApprove")).val() && m.ApproverDesc == $("option:selected", $("#ddlApprove")).text());
                filterObj = appListJson.filter(function (m) { return m.UserdetailsID == $("option:selected", $("#ddlApprove")).val() && m.ApproverDesc == $("option:selected", $("#ddlApprove")).text(); });
            obj.NextUserDetailsID = filterObj[0].UserdetailsID;
            obj.SMD_NextNodeID = filterObj[0].SMD_NextNodeID;
            obj.IsApproverSelected = true;
            var jsonString = JSON.stringify(obj);
            if (apinvoice.isCanApprove()) {
                var url = "/APInvoiceDC/SaveAPInvoiceInfo";
                MakeAjaxCall_WithDependantSource(REQUESTPOST, url, jsonString, apinvoice.onSuccessPOST, apinvoice.onFailure, apinvoice.onError, "Approve");
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
    btnClickClose: function () {
        approverObj = null;
        approverList = null;
        $('#btnSubmit').removeAttr('disabled', '');
        flagSubmit = 0;
        $('#ApprovepanelPopup').dialog('close');

    },
    btnClickCloseRelatedDoc: function () {
        $("#hrefHeaderGeneral").trigger('click').addClass('active');
    },
    btnClickAddNotes: function (objThis) {
        var erMsg = '', jsonString = "", obj = {}, dependantObj = {}, url = '/APInvoiceDC/SaveWorkFlowNotes';
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
            obj = {};
            objThis.DocumentID = $('#HdnDocumentID').val();
            objThis.UserDetailsID = userDetailsID;
            objThis.Note = $('#txtAddNotes').val();

            jsonString = JSON.stringify(obj);

            url = '/APInvoiceDC/SaveWorkFlowNotes';
            dependantObj = {};
            dependantObj.successMsg = 'Note has been saved successfully';
            dependantObj.warningMsg = 'Note is already exists';
            dependantObj.failureMsg = 'Note has not been saved successfully';
            dependantObj.errorMsg = 'Note has not been saved successfully';

            MakeAjaxCall_WithDependantSource(REQUESTPOST, url, jsonString, apinvoice.onSuccessWorkFlowNotesPOST, apinvoice.onFailureWorkFlowNotesPOST, apinvoice.onErrorWorkFlowNotesPOST, dependantObj);

        }
    },
    btnGLFileUploads: function () {
        //Reference the FileUpload element.
        var fileUpload = $("#btnGLFileUpload")[0];

        //Validate whether File is valid Excel file.
        var regex = /^([a-zA-Z0-9\s_\\.\-:()])+(.xls|.xlsx)$/;
        if (regex.test(fileUpload.value.toLowerCase())) {
            $('#divLoader').removeClass('hideLoader');
            $("#btnGLFileUpload").removeClass("error");
            if (typeof (FileReader) != "undefined") {
                $("#btnGLFileUpload").removeClass("error");
                var reader = new FileReader();

                //For Browsers other than IE.
                if (reader.readAsBinaryString) {
                    reader.onload = function (e) {
                        apinvoice.glFileUpload(e.target.result);
                    };
                    reader.readAsBinaryString(fileUpload.files[0]);
                } else {
                    //For IE Browser.
                    reader.onload = function (e) {
                        var data = "";
                        var bytes = new Uint8Array(e.target.result);
                        for (var i = 0; i < bytes.byteLength; i++) {
                            data += String.fromCharCode(bytes[i]);
                        }
                        apinvoice.glFileUpload(data);
                    };
                    reader.readAsArrayBuffer(fileUpload.files[0]);
                }
            } else {
                $('.alert').hide();
                Notify('This browser does not support HTML5.', null, null, 'danger');
                //  alert("This browser does not support HTML5.");
            }
        } else {
            $('.alert').hide();
            Notify('Please select a file.', null, null, 'danger');
            //alert("Please upload a valid Excel file.");
        }
    },

    checkPONumberWFStatus: function () {
        var returnVal = true, data = {}, res = "";

        if (IsPONumberWFStatusCheck.toLowerCase() == 'true') {
            var pONumber = $("#IndexPivot_PO_Number").val() != undefined ? $("#IndexPivot_PO_Number").val() : $("#ddlPONumber option:selected").val().trim().toLowerCase() != '<select>' && $("#ddlPONumber option:selected").val().trim().toLowerCase() != '' ? $("#ddlPONumber option:selected").val().trim() : '';
            if (pONumber != '') {
                data = {};
                data.pONumber = pONumber;
                res = MakeAjaxCall2(REQUESTGET, false, '/APInvoiceDC/GetPOAuthDocumentStatusByPONumber', data);

                if (res == '') {
                    returnVal = false;
                }
                else {
                    if (res.toLowerCase() != 'end')
                        returnVal = false;
                }
            }
        }
        return returnVal;
    },
    checkDetailGridCount: function () {
        var returnVal = true;
        if (IsDetailCountGreaterThanZero == 'true') {
            if (parseInt(jQuery("#jqGrid").jqGrid('getGridParam', 'records')) <= 0) {
                $('.alert').hide();
                returnVal = false;
            }
        }
        return returnVal;
    },
    clearHeaderDeatil: function () {
        $('#txtGLComboBox').val('');
        $('#txtAccountDesc').val('');
        $('#txtReceivedQuantity').val(AccountAssignmentDefault);
        $('#txtInvoiceQuantity').val(AccountAssignmentDefault);
        $('#txtPOQuantity').val('0');
        $('#txtPOUnitPrice').val('0');
        $('#txtExtendedCost').val('0');
        $('#txtInvoiceAmount').val('');
        $('#txtExtendedPrice').val('0');
        $('#txtDifference').val('0');
    },
    changeDueDate: function (termVal, dueDate) {
        var newDate = new Date(formatDate(parseDate($('#IndexPivot_Invoice_Date').val().split(' ')[0]), 'M/d/yyyy'));
        var DueDateVal = '';
        switch (termVal) {
            case "2% 10/Net 30":
                newDate.setDate(newDate.getDate() + 30);
                break;
            case "2% EOM/Net 15th":
                newDate.setDate(newDate.getDate() + 15);
                break;
            case "2% EOM/Net 30":
                newDate.setDate(newDate.getDate() + 30);
                break;
            case "3% 15th/Net 30":
                newDate.setDate(newDate.getDate() + 30);
                break;
            case "C.O.D.":
                newDate.setDate(newDate.getDate());
                break;
            case "Due 10th":
                newDate.setDate(newDate.getDate() + 10);
                break;
            case "Due 20th":
                newDate.setDate(newDate.getDate() + 20);
            case "Due upon Receipt":
                newDate.setDate(newDate.getDate());
                break;
            case "NET":
                newDate.setDate(newDate.getDate());
                break;

            case "NET05":
                newDate.setDate(newDate.getDate() + 5);
                break;

            case "NET 10":
                newDate.setDate(newDate.getDate() + 10);
                break;
            case "NET14":
                newDate.setDate(newDate.getDate() + 14);
                break;
            case "NET 15":
                newDate.setDate(newDate.getDate() + 15);
                break;
            case "NET 20":
                newDate.setDate(newDate.getDate() + 20);
                break;
            case "NET 30":
                newDate.setDate(newDate.getDate() + 30);
                break;
            case "NET 40":
                newDate.setDate(newDate.getDate() + 40);
                break;
            case "NET 45":
                newDate.setDate(newDate.getDate() + 45);
                break;
            case "NET 55":
                newDate.setDate(newDate.getDate() + 55);
                break;
            case "NET 60":
                newDate.setDate(newDate.getDate() + 60);
                break;
            case "NET99":
                newDate.setDate(newDate.getDate() + 99);
                break;
            case "NET 7":
                newDate.setDate(newDate.getDate() + 7);
                break;
            case "Prepayment":
                newDate.setDate(newDate.getDate());
                break;


            case "NET":
                newDate.setDate(newDate.getDate());
                break;
            case "NET10":
                newDate.setDate(newDate.getDate() + 10);
                break;
            case "NET15":
                newDate.setDate(newDate.getDate() + 15);
                break;
            case "NET20":
                newDate.setDate(newDate.getDate() + 20);
                break;
            case "NET21":
                newDate.setDate(newDate.getDate() + 21);
                break;
            case "NET25":
                newDate.setDate(newDate.getDate() + 25);
                break;
            case "NET30":
                newDate.setDate(newDate.getDate() + 30);
                break;
            case "Net40":
                newDate.setDate(newDate.getDate() + 40);
                break;
            case "NET45":
                newDate.setDate(newDate.getDate() + 45);
                break;
            case "NET60":
                newDate.setDate(newDate.getDate() + 60);
                break;
            case "NET7":
                newDate.setDate(newDate.getDate() + 7);
                break;
            case "NET90":
                newDate.setDate(newDate.getDate() + 90);
                break;

            case "NXT05":
                //newDate = new Date();
                newDate = newDate;
                newDate.setDate(5);
                newDate.setMonth(newDate.getMonth() + 1)
                // newDate.setDate(5);
                break;

            case "NXT10":
                //newDate = new Date();
                newDate = newDate;
                newDate.setDate(10);
                newDate.setMonth(newDate.getMonth() + 1)
                //newDate.setDate(10);
                break;

            case "NXT14":
                //newDate = new Date();
                newDate = newDate;
                newDate.setDate(14);
                newDate.setMonth(newDate.getMonth() + 1)
                //newDate.setDate(14);
                break;


            case "NXT15":
                //newDate = new Date();
                newDate = newDate;
                newDate.setDate(15);
                newDate.setMonth(newDate.getMonth() + 1)
                //newDate.setDate(15);
                break;

            case "NXT19":
                //newDate = new Date();
                newDate = newDate;
                newDate.setDate(19);
                newDate.setMonth(newDate.getMonth() + 1)
                // newDate.setDate(19);
                break;


            case "NXT20":
                //newDate = new Date();
                newDate = newDate;
                newDate.setDate(20);
                newDate.setMonth(newDate.getMonth() + 1)
                // newDate.setDate(20);
                break;

            default: newDate.setDate(newDate.getDate());
                break;
        }
        $('#IndexPivot_Due_Date').val(formatDate(newDate, 'M/d/yyyy'));
    },
    changeSpecialHandling: function () {
        if ($('#IndexPivot_SpecialHandling').is(':checked') == false && $('#IndexPivot_Payment_Type').is(':checked') == false) {
            $('#IndexPivot_SpecialHandling,#IndexPivot_Payment_Type').val(false);
            $("#IndexPivot_SpecialHandlingInstructions,#IndexPivot_Due_Date").val('');
            $("#splHndlInstrDiv").hide();
            //$("#duedateDiv").hide();
            $("#IndexPivot_SpecialHandlingInstructions").removeClass("error");
        }
        else {
            $('#IndexPivot_SpecialHandling').val(true);
            $("#splHndlInstrDiv").show();
            //$("#duedateDiv").show();
        }
    },
    changeCompanyNo: function (objThis) {
        var selectedText = $(objThis).find("option:selected").text();
        var selectedValue = $(objThis).val();
        if ($(objThis).val() > 0) {
            apinvoice.dropdownlist_bind_AjaxGet("/APInvoiceDC/GetActiveDepartments_BycompCodeJson?compCode=" + selectedValue + "", "#IndexPivot_Div_Dept", 'DeptCode', 'DeptDescription', '\'<select>\'');
            apinvoice.dropdownlist_bind_AjaxGet("/APInvoiceDC/GetSiteByCompany?companyId=" + $("#IndexPivot_Co_Number").val() + "", "#IndexPivot_SiteID", 'SiteID', 'SiteDesc', '\'<select>\'');
        }
        else {
            apinvoice.dropdownlist_bind_AjaxGet("/APInvoiceDC/GetActiveDepartmentsJson", "#IndexPivot_Div_Dept", 'DeptCode', 'DeptDescription', '\'<select>\'');
            $('#IndexPivot_SiteID').empty().append($('<option>', { value: '', text: '<select>' }));
        }
    },
    changeCommodityCode: function () {
        if ($('#TagDocumentHeader_CommodityCode').is(':checked') == false) {
            $("#TagDocumentHeader_MICAuthor").attr('disabled', 'disabled');
        }
        else {
            $("#TagDocumentHeader_MICAuthor").removeAttr('disabled');
        }
    },
    changeVendorName: function () {
        if (dbRemit == '') {
            $("#txtVendorAddress").val('');
            $("#IndexPivot_New_Vendor_Name").val('');
        }
        $("#IndexPivot_Vendor_Number").val($("#IndexPivot_Vendor_Name").val());
        apinvoice.bindDropdownRemitAddress_InvoiceCurrency();
    },
    changeVendorNumber: function () {
        if (dbRemit == '') {
            $("#txtVendorAddress").val('');
            $("#IndexPivot_New_Vendor_Name").val('');
        }
        $("#IndexPivot_Vendor_Name").val($("#IndexPivot_Vendor_Number").val());
        apinvoice.bindDropdownRemitAddress_InvoiceCurrency();
    },
    changeRemitToAddress: function (obj) {
        var data = {}, url = "", vendorNo = "", selectedText = "", selectedCode = "";
        $("#txtVendorAddress").val('');
        vendorNo = $("#IndexPivot_Vendor_Number").find("option:selected").val();
        if (vendorNo == "" || vendorNo == "New Address")
            return false;

        //var addrCode = $("#TagDocumentHeader_RemitToAddress").find("option:selected").val();
        //var addrText = '/' + $("#TagDocumentHeader_RemitToAddress").find("option:selected").text() + '/';
        selectedText = $(obj).find("option:selected").text();
        selectedCode = $(obj).val();

        if (selectedText == "<select>" || selectedText == "" || selectedText == "New Address")
            return false;

        //$("#txtVendorAddress").val('');
        data = {};
        data.remitAddrTxt = $.trim(selectedText);
        data.remitAddrCod = $.trim(selectedCode);
        data.vendorNo = $.trim(vendorNo);
        data.documentID = $('#HdnDocumentID').val();
        url = '/APInvoiceDC/GetPopulateAddressTextJson';
        MakeAjaxCallNew(REQUESTGET, url, data, apinvoice.populateAddressTextbox, apinvoice.onFailure, apinvoice.onError, false);
    },
    chnageDiscountDate: function () {
        if (!isDate($('#TagDocumentHeader_DiscountDate').val(), 'M/d/yyyy')) {
            $('#TagDocumentHeader_DiscountDate').val('');
        }
    },
    changeindexPivot_Terms: function () {
        if ($('#IndexPivot_Terms').val() == '') {
            $('#IndexPivot_Due_Date').val('');
            $('#IndexPivot_Due_Date').removeAttr('disabled');
        } else {
            $('#IndexPivot_Due_Date').attr('disabled', 'disabled');
            var tmdays = $("#IndexPivot_Terms").find('option:selected').attr("data-tmdays");
            if (isDate($('#IndexPivot_Invoice_Date').val(), 'M/d/yyyy'))
                apinvoice.changeDueDate(tmdays, $('#IndexPivot_Invoice_Date').val());
            //apinvoice.changeDueDate($('#IndexPivot_Terms').val(), $('#IndexPivot_Invoice_Date').val());
        }

    },
    changePONumber: function () {
        //var showVendorBasedonPO = false;        
        if (showVendorBasedonPO == 'true') {
            let poNumber = ($('#ddlPONumber').val().trim().length > 0) ? $('#ddlPONumber').val().toLowerCase() : 0;
            //if ($("#ddlPONumber").val() != "") {

            if (isPOSelection == 'true') {
                $('#searchText,#IndexPivot_Vendor_Name,#IndexPivot_Vendor_Number,#btnSearch').attr('disabled', 'disabled');
            }
            if (IsFirstTimeLoad != 'true') {
                // var result = confirm("Are you sure you Want to delete PO based grid items?");
                // if (result == true) {
                apinvoice.updateJqGrid();
                apinvoice.saveHeaderOnly();
                //}
            }
            IsFirstTimeLoad = 'false';

            var url = '/APInvoiceDC/GetVendorDetails?pOnumber=' + poNumber;
            var dependantObj = {};
            dependantObj.ddlVendorName = $('#IndexPivot_Vendor_Name');
            dependantObj.ddlVendorNumber = $('#IndexPivot_Vendor_Number');

            if (dbVendorName == '') {
                MakeAjaxCall_WithDependantSource(REQUESTGET, url, null, apinvoice.bindVendorDropdownlistByPONumber, apinvoice.onFailure_WithDependantSource, apinvoice.onError_WithDependantSource, dependantObj);
            }
            else {
                dbVendorName = ''
            }

            if (dbProjectNumber == '') {
                if ($('#IndexPivot_PANumber').length > 0) {
                    $('#IndexPivot_PANumber,#hdn_IndexPivot_PANumber').val('');
                    MakeAjaxCall(REQUESTGET, '/APInvoiceDC/GetProjectNumber_ByPONumberJson?pONumber=' + $('#ddlPONumber').val().toLowerCase(), null, apinvoice.bindProjectNumber, apinvoice.onFailure, apinvoice.onError);
                }
            } else {
                dbProjectNumber = '';
            }

            if (poNumber == 0) {
                if (!$("#ddlPONumber").is(":disabled")) {
                    $('#searchtext,#indexpivot_vendor_name,#indexpivot_vendor_number,#btnsearch').removeattr('disabled', 'disabled');
                }
                $('#indexpivot_panumber,#hdn_indexpivot_panumber,#indexpivot_padescription,#txtvendoraddress,#tagdocumentheader_invoicecurrency,#indexpivot_terms').val('');
                $('#indexpivot_vendor_name,#indexpivot_vendor_number,#tagdocumentheader_remittoaddress').empty().append($('<option>', { value: '', text: '<select>' }));

                if (isnewaddress == 'true') {
                    $('#indexpivot_vendor_name').append($('<option>', { value: 'new vendor', text: 'new vendor' }));
                    $('#indexpivot_vendor_number').append($('<option>', { value: 'new vendor', text: 'new vendor' }));
                    $('#tagdocumentheader_remittoaddress').append($('<option>', { value: 'new address', text: 'new address' }));
                }
            }

            //}
            //else {
            //    if (!$("#ddlPONumber").is(":disabled")) {
            //        $('#searchText,#IndexPivot_Vendor_Name,#IndexPivot_Vendor_Number,#btnSearch').removeAttr('disabled', 'disabled');
            //    }
            //    $('#IndexPivot_PANumber,#hdn_IndexPivot_PANumber,#IndexPivot_PADescription,#txtVendorAddress,#TagDocumentHeader_InvoiceCurrency,#IndexPivot_Terms').val('');
            //    $('#IndexPivot_Vendor_Name,#IndexPivot_Vendor_Number,#TagDocumentHeader_RemitToAddress').empty().append($('<option>', { value: '', text: '<select>' }));

            //    if (isNewAddress == 'true') {
            //        $('#IndexPivot_Vendor_Name').append($('<option>', { value: 'New Vendor', text: 'New Vendor' }));
            //        $('#IndexPivot_Vendor_Number').append($('<option>', { value: 'New Vendor', text: 'New Vendor' }));
            //        $('#TagDocumentHeader_RemitToAddress').append($('<option>', { value: 'New Address', text: 'New Address' }));
            //    }
            //}
        }
    },
    changeindexPivot_SiteID: function () {
        if ($('#IndexPivot_SiteID').val().trim() == '100') {
            $('#IndexPivot_Div_Dept').removeAttr('disabled');
        }
        else {
            $("#IndexPivot_Div_Dept option:contains(<select>)").prop('selected', true);
            $('#IndexPivot_Div_Dept').attr('disabled', 'disabled');
        }
    },
    clickSmartListDetailGrid: function (objThis) {
        var TDID = $(objThis).attr("id");
        var selectedRowIndex = $('#SmartListDetailGrid').DataTable().row(objThis).index();
        var thisTr = $(objThis).closest('tr');

        if (TDID.indexOf('tdAmount') > -1) {
            var activeElement = $(objThis);
            var descElement = $(objThis).parent().children(":eq(2)");
            var OriginalContent = $(objThis).text();
            if (OriginalContent != '' || OriginalContent == '') {
                var grdClassInvoiceAmount = ' ';
                // var objFieldRules_APpodetails = jsonFieldRules.filter(x => x.IsVisible == true);
                var objFieldRules_APpodetails = jsonFieldRules.filter(function (x) { return x.IsVisible == true; });
                if (apinvoice.getIsVisibleField(objFieldRules_APpodetails, 'GridRowPODetailInvoiceAmount') == true) {
                    grdClassInvoiceAmount = apinvoice.getIsReadOnlyField(objFieldRules_APpodetails, 'GridRowPODetailInvoiceAmount');
                }
                if ($("#in" + TDID).length > 0) {
                    OriginalContent = $("#in" + TDID).val();
                }

                activeElement.html("<input type='text'  value='" + OriginalContent.trim() + "' id='in" + TDID + "' class='form-control input-grid-textbox " + grdClassInvoiceAmount + "'   />");
                $(objThis).children().first().focus();
                $(objThis).children().first().keypress(function (e) {

                    if (TDID.indexOf('tdAmount') > -1) {
                        /*evt = (evt) ? evt : window.event;
                        var charCode = (evt.which) ? evt.which : evt.keyCode;
                        if (charCode == 8 || charCode == 37) {
                            return true;
                        } else if (charCode == 46 && $(this).val().indexOf('.') != -1) {
                            return false;
                        } else if (charCode > 31 && charCode != 46 && (charCode < 48 || charCode > 57)) {
                            return false;
                        }
                        return true;*/




                        var decimallength = 0;
                        if (grdClassInvoiceAmount.indexOf('allow5decimalsOnly') > -1) {
                            decimallength = 4
                        }
                        if (grdClassInvoiceAmount.indexOf('allow4decimalsOnly') > -1) {
                            decimallength = 3
                        }
                        if (grdClassInvoiceAmount.indexOf('allow3decimalsOnly') > -1) {
                            decimallength = 2
                        }
                        else if (grdClassInvoiceAmount.indexOf('allow2decimalsOnly') > -1) {
                            decimallength = 1
                        }
                        else if (grdClassInvoiceAmount.indexOf('allowNumbersOnly') > -1) {
                            decimallength = 0
                        }
                        return validDecimal(e, this, decimallength);
                    }
                });
                $(objThis).children().first().keydown(function (e) {

                    if (e.which == 9) { //for tab key                        
                        e.preventDefault();
                        var newContent = $(objThis).val();
                        $(objThis).blur();
                    }

                    if (e.which == 13) {

                        if (TDID.indexOf('tdAmount') > -1) {
                            $(objThis).parent().text(newContent);
                            var temp = $('#SmartListDetailGrid').DataTable().row(selectedRowIndex).data();
                            if (thisTr[0].cells[3].innerText != undefined && thisTr[0].cells[3].innerText != '')
                                temp[3] = parseFloat(thisTr[0].cells[3].innerText).toFixed(2);
                            else
                                temp[3] = thisTr[0].cells[3].innerText;
                            $('#SmartListDetailGrid').dataTable().fnUpdate(temp, selectedRowIndex, undefined, false);
                        }
                        else {
                            $(objThis).parent().text(newContent);
                        }
                    }
                });
                $(objThis).children().first().blur(function () {

                    if (objThis.value != "") {
                        // var num = parseFloat((this.value.length == 1 && this.value == ".") ? "0" : this.value);
                        $("#" + objThis.id).val(parseFloat(objThis.value));
                    }
                    if (TDID.indexOf('tdAmount') > -1) {
                        var expncedAmt = activeElement.children().first().val();
                        if (expncedAmt != undefined) {
                            var temp = $('#SmartListDetailGrid').DataTable().row(selectedRowIndex).data();
                            if (expncedAmt != '')
                                temp[3] = parseFloat(expncedAmt).toFixed(5);
                            else
                                temp[3] = expncedAmt;

                            if ($.isNumeric(temp[3])) {
                                thisTr.find('input[type="checkbox"]').prop('checked', true);
                                temp[0] = true;
                            }
                            else {
                                //thisTr.find('input[type="checkbox"]').prop('checked', false);
                                //temp[0] = false;
                            }
                            $('#SmartListDetailGrid').dataTable().fnUpdate(temp, selectedRowIndex, undefined, false);
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

        if (TDID.indexOf('tdCheckbox') > -1) {
            var temp = $('#SmartListDetailGrid').DataTable().row(selectedRowIndex).data();
            if (temp[0] == true) {
                thisTr.find('input[type="checkbox"]').prop('checked', false);
                temp[0] = false;
                $("#" + objThis.parentElement.cells[3].id).removeClass('error');
                $("#" + objThis.parentElement.cells[3].id).empty();
                temp[3] = "";
            }
            else {
                thisTr.find('input[type="checkbox"]').prop('checked', true);
                temp[0] = true;
            }
            $('#SmartListDetailGrid').dataTable().fnUpdate(temp, selectedRowIndex, undefined, false);
        }
    },
    clickTagDocumentHeader_HeadUsr5: function () {
        if ($("#TagDocumentHeader_HeadUsr5").is(':checked')) {
            $('#IndexPivot_PTY,#IndexPivot_Payment_Type').prop('checked', true);
        }
    },
    changeIsWire: function () {

        if ($("#TagDocumentHeader_HeadUsr5").is(':checked')) {
            $('#IndexPivot_BlanketApproval').prop('checked', true);
            $('#IndexPivot_Payment_Type').prop('checked', true);
            // $('#IndexPivot_BlanketApproval,#IndexPivot_Payment_Type').attr('disabled', 'disabled');
        } else {
            // $('#IndexPivot_BlanketApproval,#IndexPivot_Payment_Type').removeAttr('disabled', 'disabled');
            $('#IndexPivot_BlanketApproval').prop('checked', false);
            $('#IndexPivot_Payment_Type').prop('checked', false);
        }
    },
    checkIsNull: function (id) {
        return ($('#' + id).length > 0 && $('#' + id).val() != '') ? true : false;
    },
    clearInvalidDate: function (thisObj) {
        var str = thisObj.value;
        var m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (m == null) {
            thisObj.value = "";
        }
    },
    btnShowGetPOCharges_ByPONumber: function () {
        var url = "", data = [], pONumber = $('#ddlPONumber').val();
        if ((pONumber || '') != '') {
            url = '/APInvoiceDC/GetPOCharges_ByPONumber?pONumber=' + pONumber;
            data = MakeAjaxCall2('GET', false, url, '');
            $('#divPochargs thead').empty();
            $('#divPochargs tbody').empty();
            if (data.length > 0) {
                apinvoice.bindJqGridDataGetPOCharges_ByPONumber(data);
            }
        }
    },
    bindJqGridDataGetPOCharges_ByPONumber: function (dataToLoad) {
        var th = "<tr><th style='width:6%;'>PO Line Seq</th><th style='width:6.3%;'>Charge Line Seq</th><th style='width:5.4%;'>Charge Type</th><th style='width:15%;'>Charge Description</th><th style='width:7%;'>Estimated Charge</th><th style='width:17%;'>Expense Account number</th></tr>";
        $('[id*="tblPOChargesHeader"]').append(th).html("");
        var tr = $('[id*="tblPOChargesBody"]').html("");
        $.each(dataToLoad, function (i, value) {
            tr += "<tr><td style='width:6%; text-align: right;'>" + dataToLoad[i].LINSEQ + "</td><td style='width:6.3%; text-align: right;'>" + dataToLoad[i].CHGSEQ + "</td><td style='width:5.4%;'>" + dataToLoad[i].CHGTYP + "</td><td style='width:15%;'>" + dataToLoad[i].CHGDSC + "</td><td style='text-align: right; width:7%;'>" + (dataToLoad[i].CHGEST).toFixed(2) + "</td><td style='width:17%;'>" + dataToLoad[i].CHGACC + "</td></tr>";

        });
        $('[id*="tblPOChargesHeader"]').append(th);
        $('[id*="tblPOChargesBody"]').append(tr);
    },

    dropdownlist_bind_AjaxGet: function (url, dropdownlist_id, codeVal, textVal, defaultText, isAsync) {
        var dependantObj = {}, ddl = $(dropdownlist_id);
        ddl.empty().append('<option selected="selected" value="" disabled="disabled">Loading.....</option>');
        dependantObj.currentDropdownlist = ddl;
        dependantObj.currentDropdownlistValue = codeVal;
        dependantObj.currentDropdownlistText = textVal;
        dependantObj.defaultText = defaultText;
        if ($('#TagDocumentHeader_InvoiceCurrency').length > 0) {
            dependantObj.IsInvoiceCurrency = true;
        }
        if (dropdownlist_id.toLowerCase() == '#TagDocumentHeader_RemitToAddress'.toLowerCase()) {
            dependantObj.IsRemitAddress = true;
        }
        if ($('#TagDocumentHeader_HeadUsr2').length > 0) {
            dependantObj.PaymentMethod = true;
        }



        MakeAjaxCall_WithDependantSource(REQUESTGET, url, null, apinvoice.bindCurrentDropdownlist, apinvoice.onFailure_WithDependantSource, apinvoice.onError_WithDependantSource, dependantObj, isAsync);
    },

    forwardToBtn_Click: function () {
        var user = "", obj = {}, jsonString = "", url = "";
        if (validateForwardUser()) {
            user = $('#txtForwardTo').val();
            var nextUserDetailsId = user.substring(user.indexOf("[") + 1, user.indexOf("]"));
            obj = {};
            obj.DocumentID = $("#docId").val();
            obj.CurrentNodeID = nodeId;
            //obj.NextNodeID = allUserNodeID;
            obj.CurrentUserDetailsID = userDetailsID;
            obj.NextUserDetailsID = nextUserDetailsId;
            obj.WorkflowID = workFlowId;
            obj.Note = $('#txtAddNotes').val().trim();
            obj.NodeText = $('#NodeText').val();
            jsonString = JSON.stringify(obj);
            url = "/APInvoiceDC/ForwardToUser";
            MakeAjaxCall_WithDependantSource(REQUESTPOST, url, jsonString, apinvoice.onSuccessPOST, apinvoice.onFailure, apinvoice.onError, "Forward");
        }
        else {
            $('#btnForwardTo').removeAttr('disabled', '');
        }
    },

    getRefreshFieldRules: function () {
        var data = {};
        data.workflowId = workFlowId;
        data.nodeId = nodeId;
        data.IsForwardActual = isForwardActual;
        //data.custColumnVal = '';
        var res = MakeAjaxCall2(REQUESTGET, false, '/APInvoiceDC/GetRefreshFieldRules', data);
        fieldRules = res;
        jsonFieldRules = res;
        return res;
    },
    getFormattedNumber: function (cssClass, data) {
        if (cssClass.indexOf("allow5decimalsOnly") > 0)
            return parseFloat(data).toFixed(5);
        if (cssClass.indexOf("allow4decimalsOnly") > 0)
            return parseFloat(data).toFixed(4);
        if (cssClass.indexOf("allow3decimalsOnly") > 0)
            return parseFloat(data).toFixed(3);
        else if (cssClass.indexOf("allow2decimalsOnly") > 0)
            return parseFloat(data).toFixed(2);
        else if (cssClass.indexOf("allowNumbersOnly") > 0)
            return parseFloat(data).toFixed(0);
        else
            return parseFloat(data).toFixed(0);
    },
    getIsReadOnlyField: function (objPOGrid, fName) {
        // var gridFieldObj = objPOGrid.filter(x => x.FieldName == fName);

        var gridFieldObj = objPOGrid.filter(function (x) { return x.FieldName == fName; });
        var cls = gridFieldObj != null ? (gridFieldObj[0].ClassName != null ? gridFieldObj[0].ClassName : " ") : " ";
        return gridFieldObj != null ? (gridFieldObj[0].IsReadOnly ? "GridEvents-Off " + cls : " " + cls) : " " + cls;
    },
    getIsVisibleField: function (objPOGrid, fName) {
        //  var gridFieldObj = objPOGrid.filter(x => x.FieldName == fName && x.IsVisible == true);

        var gridFieldObj = objPOGrid.filter(function (x) { return x.FieldName == fName && x.IsVisible == true; });
        if (gridFieldObj.length > 0)
            return true;
        else
            return false;
    },
    getMaskFileCheckApplicable: function (workflowId, nodeId) {
        var data = {}, res = false
        data.workflowId = workflowId;
        data.nodeId = nodeId;
        res = MakeAjaxCall2(REQUESTGET, false, '/Approvers/IsMaskfileCheckApplicable', data);
        return res;
    },
    getApproversList: function (docId, workflowId, maskfileType, company, invoiceAmount, currentNodeid, SMD_CurrentNodeId) {
        var data = {};
        data.docId = docId;
        data.workflowId = workflowId;
        data.maskfileType = maskfileType;
        data.company = company;
        data.invoiceAmount = invoiceAmount;
        data.currentNodeid = currentNodeid;
        data.smdCurrentNodeId = SMD_CurrentNodeId;
        return MakeAjaxCall2(REQUESTGET, false, '/Approvers/GetApproversList', data);
    },
    getFirstRowGLNoFromJQGrid: function (glPosition) {

        var returnval = '';
        //var row = jQuery("#jqGrid").jqGrid('getRowData', 1);
        var row = jQuery("#jqGrid").jqGrid('getGridParam', 'data')[0];

        if (row != null && row != '') {
            var glCode = row.ExpenseAccountNumber;
            //Company   - Division  -  Department   - Account
            //001 – 000 – 000 – 00000
            if (glCode != null) {
                var arr = glCode.split('-');
                if (arr.length > 0) {
                    if (arr[arr.length - glPosition] != null) {
                        returnval = arr[arr.length - glPosition];
                    }
                }
            }
        }
        return returnval;
    },

    getGLPrefix: function () {
        var value = '';
        if (gLCodePrefix.trim() != null && gLCodePrefix.trim() != undefined && gLCodePrefix.trim() != '') {
            var glColArr = gLCodePrefix.split(',');
            if (glColArr.length == 1) {
                return $('#' + gLCodePrefix.trim()).val();
            }
            else if (glColArr.length > 1) {
                var glCols = '';
                for (var col = 0; col < glColArr.length; col++) {
                    if (col == (glColArr.length - 1)) {
                        glCols = glCols + $('#' + glColArr[col].trim()).val();
                    } else {
                        glCols = glCols + $('#' + glColArr[col].trim()).val() + '.';
                    }
                }
                return glCols;
            }
        }
        return value = '';
    },
    getBypassPotentialDuplicate: function (obj) {
        var bypasspotentialduplicate = "no";
        //var difference = obj.Invoice_Amount - invoiceAmount_Existing;
        var vendorNumber = (obj.Vendor_Number || "") == "" ? "" : obj.Vendor_Number.trim().toLowerCase();

        if ((vendorNumber != vendorNo_Existing.trim().toLowerCase() ||
            obj.Invoice_Number.toLowerCase() != invoiceNo_Existing.toLowerCase()
            //|| obj.Invoice_Date.toLowerCase() != invoiceDate_Existing.toLowerCase()) || (difference != 0)
        )) {

            bypasspotentialduplicate = "no";
        }
        else
            bypasspotentialduplicate = "yes";

        return bypasspotentialduplicate;

    },
    getSmartListDetail: function (documentID) {
        var url = "";
        $("#SmartListDetailGrid").DataTable().clear();
        url = '/APInvoiceDC/GetSmartListDetail?documentID=' + documentID;
        MakeAjaxCall(REQUESTGET, url, null, apinvoice.bindSmartListDetail, apinvoice.onFailure, apinvoice.onError);
    },
    getHeaderTabData: function myfunction() {
        var obj = {};
        obj.DocId = $("#docId").val();
        obj.Immediate = $("#TagDocumentHeader_Immediate").is(':checked');
        obj.CommodityCode = $("#TagDocumentHeader_CommodityCode").is(':checked');
        obj.MICAuthor = $("#TagDocumentHeader_MICAuthor").val();
        obj.RemitToAddress = $("#TagDocumentHeader_RemitToAddress").val();
        obj.AccountingDate = $("#TagDocumentHeader_AccountingDate").val();
        obj.CO_Number = $("#IndexPivot_Co_Number").val();
        obj.Div_Dept = $("#IndexPivot_Div_Dept").val();
        obj.SiteID = $("#IndexPivot_SiteID").val();
        obj.PO_Number = $("#IndexPivot_PO_Number").val() != undefined ? $("#IndexPivot_PO_Number").val() : $("#ddlPONumber option:selected").val().trim().toLowerCase() != '<select>' && $("#ddlPONumber option:selected").val().trim().toLowerCase() != '' ? $("#ddlPONumber option:selected").val().trim() : '';
        obj.Doc_Type = $("#IndexPivot_Doc_Type").val();
        obj.Vendor_Name = $("#IndexPivot_Vendor_Name option:selected").text() != '<select>' ? $("#IndexPivot_Vendor_Name option:selected").text() : '';
        obj.Vendor_Number = $("#IndexPivot_Vendor_Number").val();
        obj.Invoice_Number = $("#IndexPivot_Invoice_Number").val();
        obj.Invoice_Date = $("#IndexPivot_Invoice_Date").val();
        obj.Invoice_Amount = $("#IndexPivot_Invoice_Amount").val().replace(/,/g, "");
        obj.Due_Date = $("#IndexPivot_Due_Date").val();
        obj.TagHeaderRowstatus = $("#tagDocHeaderRowstatus").val();
        obj.Terms = $("#IndexPivot_Terms").val();
        obj.Rtng_Code = $("#IndexPivot_Rtng_Code").val();
        obj.Description1 = $("#IndexPivot_Description1").val();
        obj.Contract_Number = $("#IndexPivot_Contract_Number").val();
        obj.InvoiceCurrency = $("#TagDocumentHeader_InvoiceCurrency").val();
        obj.TaxAmount = $("#TagDocumentHeader_TaxAmount").val();
        obj.FreightAmount = $("#TagDocumentHeader_FreightAmount").val();
        obj.MiscAmount = $("#TagDocumentHeader_MiscAmount").val();
        obj.PANumber = $("#IndexPivot_PANumber").val();
        obj.NewVendorName = $("#IndexPivot_New_Vendor_Name").val();
        //obj.PaymentMessage = $("#TagDocumentHeader_PaymentMessage").length > 0 ? $("#TagDocumentHeader_PaymentMessage").val().trim() : $("#TagDocumentHeader_PaymentMessage").val();
        obj.PaymentMessage = ($("#TagDocumentHeader_PaymentMessage").val() || "").trim();
        obj.Originator = $("#IndexPivot_Originator").val();

        //obj.POType = $("#TagDocumentHeader_HeadUsr3").val() == '<select>' ? '' : $("#TagDocumentHeader_HeadUsr3").val();
        obj.HeadUsr3 = $("#TagDocumentHeader_HeadUsr3").val();

        if ($('#IndexPivot_SeparatePayment').prop('type') == "checkbox")
            obj.SeparatePayment = $("#IndexPivot_SeparatePayment").is(':checked') == true ? "Yes" : "No";
        else
            obj.SeparatePayment = $("#IndexPivot_SeparatePayment").val() != '' ? $("#IndexPivot_SeparatePayment").val() : '';

        //obj.ShopPOReviewNotes = $("#ShopPOReviewNotes").length > 0 ? $("#ShopPOReviewNotes").val() : '';
        obj.ShopPOReviewNotes = $("#ShopPOReviewNotes").val();

        //obj.DeptCode = apinvoice.getFirstRowGLNoFromJQGrid();
        //obj.AccountingCode = apinvoice.getFirstRowGLNoPart2FromJQGrid();

        //Company   - Division  -  Department   - Account
        //001 – 000 – 000 – 00000
        obj.DeptCode = apinvoice.getFirstRowGLNoFromJQGrid(2);
        obj.AccountingCode = apinvoice.getFirstRowGLNoFromJQGrid(1);



        //obj.Invoice_Type = $("#IndexPivot_Invoice_Type").length > 0 ? $("#IndexPivot_Invoice_Type").val() : "";
        obj.Invoice_Type = ($("#IndexPivot_Invoice_Type").val() || "");

        //obj.InvoiceDiscountAmount = $("#TagDocumentHeader_InvoiceDiscountAmount").length > 0 ? $("#TagDocumentHeader_InvoiceDiscountAmount").val() : "";
        obj.InvoiceDiscountAmount = $("#TagDocumentHeader_InvoiceDiscountAmount").val() || "";
        //  obj.DiscountDueDate = $("#TagDocumentHeader_DiscountDate").length > 0 ? $("#TagDocumentHeader_DiscountDate").val().replace(/,/g, "") : "";
        obj.DiscountDueDate = ($("#TagDocumentHeader_DiscountDate").val() || "").replace(/,/g, "");
        obj.PaymentMethod = $("#TagDocumentHeader_HeadUsr2").val() || "";

        obj.UserID = userDetailsID;
        obj.WorkFlowID = workFlowId;
        obj.NodeID = nodeId;
        obj.NodeText = $('#NodeText').val();

        if ($("#IndexPivot_SpecialHandling").length > 0)
            obj.SpecialHandling = $("#IndexPivot_SpecialHandling").is(':checked') == true ? "Yes" : "No";
        if ($("#IndexPivot_SpecialHandlingInstructions").length > 0)
            obj.SpecialHandlingInstructions = $("#IndexPivot_SpecialHandlingInstructions").val().trim();
        if ($("#IndexPivot_ProcurementInstructions").length > 0)
            obj.ProcurementInstructions = $("#IndexPivot_ProcurementInstructions").val().trim();
        if ($("#IndexPivot_Payment_Type").length > 0)
            obj.Payment_Type = $("#IndexPivot_Payment_Type").is(':checked') == true ? "Yes" : "No";

        if ($("#IndexPivot_Appr").length > 0)
            obj.UserAppr = $("#IndexPivot_Appr").is(":checked") == true ? "Yes" : "No";

        if ($("#IndexPivot_PTY").length > 0)
            obj.PTY = $("#IndexPivot_PTY").is(':checked') == true ? "Yes" : "No";

        if ($("#TagDocumentHeader_HeadUsr4").length > 0)
            obj.HeadUsr4 = $("#TagDocumentHeader_HeadUsr4").is(':checked') == true ? "Yes" : "No";

        if ($("#TagDocumentHeader_HeadUsr5").length > 0)
            obj.HeadUsr5 = $("#TagDocumentHeader_HeadUsr5").is(':checked') == true ? "Yes" : "No";

        obj.HeadUsr6 = $("#TagDocumentHeader_HeadUsr6").val();

        //obj.HeadUsr5 = apinvoice.GetPOHeaderDetailPOType();

        apinvoice.vendorAddressSave(obj);
        //BypassPotentialDuplicate

        obj.TagDocumentDetail = {};
        obj.SubmitAction = null;

        if ($("#TagDocumentHeader_UserXDB6").length > 0)
            obj.UserXDB6 = $("#TagDocumentHeader_UserXDB6").is(':checked') == true ? "Yes" : "No";
        //return JSON.stringify(obj);
        return obj;
    },
    glFileUpload: function (data) {
        var excelRows = [], invalidGls = [], dataValue = ["GL", "Description", "ReceivedQty", "InvoiceQty", "InvoicePrice"];
        //Read the Excel File data.
        var workbook = XLSX.read(data, {
            type: 'binary'
        });

        //Fetch the name of First Sheet.
        var firstSheet = workbook.SheetNames[0];

        //Read all rows from First Sheet into an JSON array.
        excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
        if (excelRows.length == 0) {
            //$("#btnGLFileUpload")[0].value = "";
            $('.alert').hide();
            Notify("No records found.", null, null, 'danger');
            $('#divLoader').addClass('hideLoader');
            return false;
        }

        var headers = [];
        for (var i = 0; i < 5; i++) {
            headers.push(workbook.Strings[i].h);
        }
        if (JSON.stringify(headers) == JSON.stringify(dataValue)) {
            invalidGls = apinvoiceDetails.addGridRowDetails(excelRows);
            if ((invalidGls || []).length > 0) {

                // EXTRACT VALUE FOR HTML HEADER. 
                var col = [];
                for (var i = 0; i < invalidGls.length; i++) {
                    for (var key in invalidGls[i]) {
                        if (col.indexOf(key) === -1) {
                            col.push(key);
                        }
                    }
                }

                // CREATE DYNAMIC TABLE.
                var table = document.createElement("table");
                table.setAttribute('class', 'table table-bordered');

                // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

                var tr = table.insertRow(-1);                   // TABLE ROW.

                for (var i = 0; i < col.length; i++) {
                    var th = document.createElement("th");      // TABLE HEADER.
                    th.innerHTML = col[i];
                    tr.appendChild(th);
                }

                // ADD JSON DATA TO THE TABLE AS ROWS.
                for (var i = 0; i < invalidGls.length; i++) {

                    tr = table.insertRow(-1);

                    for (var j = 0; j < col.length; j++) {
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerHTML = (invalidGls[i][col[j]] || "");

                        var tabCellStyle = isNaN(tabCell.innerHTML) ? 'text-align: left; padding-left: 5px;' : 'text-align: right; padding-right: 5px;';
                        tabCell.setAttribute('style', tabCell);

                        //if (j > 0) {
                        //    tabCell.setAttribute('style', 'text-align: right;');
                        //}
                    }
                }

                // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
                var divContainer = document.getElementById("showData");
                divContainer.innerHTML = "";
                divContainer.appendChild(table);

                // $('#myModal').modal('show');
                $("#myModal").modal({
                    backdrop: 'static',
                    keyboard: false
                });
            }
            if (invalidGls != undefined && excelRows != undefined) {
                var msg = "The following " + invalidGls.length + " records failed to import. out of " + excelRows.length + " records " + (excelRows.length - invalidGls.length) + " successfully imported.";
                $('#exceluploadMsg').text(msg);
                $('.alert').hide();
                Notify("Details Uploaded successfully", null, null, 'success');
            }

            $("#btnGLFileUpload")[0].value = "";
            apinvoice.updateJqGrid();
            apinvoiceDetails.calculateUnAllocatedBalanceJqGrid();
            apinvoiceDetails.setUnallocatedBalancetoLastRow();

        } else {
            $('.alert').hide();
            Notify('Invalid header columns', null, null, 'danger');
            $('#divLoader').addClass('hideLoader');
            return false;
        }
        $('#divLoader').addClass('hideLoader');
        //  invalidGls = apinvoiceDetails.addGridRowDetails(excelRows, headers);
        //if ((invalidGls || []).length == 0) {
        //    $('.alert').hide();
        //    Notify('Invalid header columns', null, null, 'danger');
        //    $('#divLoader').addClass('hideLoader');
        //    return false;
        //}


    },
    glFileUpload_Old: function (data) {
        var excelRows = [], invalidGls = [];
        //Read the Excel File data.
        var workbook = XLSX.read(data, {
            type: 'binary'
        });

        //Fetch the name of First Sheet.
        var firstSheet = workbook.SheetNames[0];

        //Read all rows from First Sheet into an JSON array.
        excelRows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[firstSheet]);
        if (excelRows.length == 0) {
            //$("#btnGLFileUpload")[0].value = "";
            $('.alert').hide();
            Notify("No records found.", null, null, 'danger');
            $('#divLoader').addClass('hideLoader');
            return false;
        }

        var headers = [];
        for (var i = 0; i < 5; i++) {
            headers.push(workbook.Strings[i].h);
        }

        invalidGls = apinvoiceDetails.addGridRowDetails(excelRows, headers);
        //if ((invalidGls || []).length == 0) {
        //    $('.alert').hide();
        //    Notify('Invalid header columns', null, null, 'danger');
        //    $('#divLoader').addClass('hideLoader');
        //    return false;
        //} 

        $('#divLoader').addClass('hideLoader');

        if ((invalidGls || []).length > 0) {

            // EXTRACT VALUE FOR HTML HEADER. 
            var col = [];
            for (var i = 0; i < invalidGls.length; i++) {
                for (var key in invalidGls[i]) {
                    if (col.indexOf(key) === -1) {
                        col.push(key);
                    }
                }
            }

            // CREATE DYNAMIC TABLE.
            var table = document.createElement("table");
            table.setAttribute('class', 'table table-bordered');

            // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

            var tr = table.insertRow(-1);                   // TABLE ROW.

            for (var i = 0; i < col.length; i++) {
                var th = document.createElement("th");      // TABLE HEADER.
                th.innerHTML = col[i];
                tr.appendChild(th);
            }

            // ADD JSON DATA TO THE TABLE AS ROWS.
            for (var i = 0; i < invalidGls.length; i++) {

                tr = table.insertRow(-1);

                for (var j = 0; j < col.length; j++) {
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerHTML = (invalidGls[i][col[j]] || "");
                    if (j > 0) {
                        tabCell.setAttribute('style', 'text-align: right;');
                    }
                }
            }

            // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
            var divContainer = document.getElementById("showData");
            divContainer.innerHTML = "";
            divContainer.appendChild(table);

            // $('#myModal').modal('show');
            $("#myModal").modal({
                backdrop: 'static',
                keyboard: false
            });
        }
        if (invalidGls != undefined && excelRows != undefined) {
            var msg = "The following " + invalidGls.length + " records failed to import. out of " + excelRows.length + " records " + (excelRows.length - invalidGls.length) + " successfully imported.";
            $('#exceluploadMsg').text(msg);
            $('.alert').hide();
            Notify("Details Uploaded successfully", null, null, 'success');
        }

        $("#btnGLFileUpload")[0].value = "";
        apinvoice.updateJqGrid();
        apinvoiceDetails.calculateUnAllocatedBalanceJqGrid();
        apinvoiceDetails.setUnallocatedBalancetoLastRow();
    },
    hrefClickHeaderGeneral: function (objThis) {

        var errMsg = '', TagDocumentDetail = [],
            // objFieldRules = jsonFieldRules.filter(x => x.IsVisible === true && x.IsMandatory === true && (x.ViewName_Refonly === "General" || x.ViewName_Refonly === "Vendors" || x.ViewName_Refonly === "Invoice" || x.ViewName_Refonly === "Payments"));
            objFieldRules = jsonFieldRules.filter(function (x) { return x.IsVisible === true && x.IsMandatory === true && (x.ViewName_Refonly === "General" || x.ViewName_Refonly === "Vendors" || x.ViewName_Refonly === "Invoice" || x.ViewName_Refonly === "Payments"); });

        errMsg = validateFileds(objFieldRules);  //header validation

        apinvoice.activeTab('', objThis.id);
        $('#btnForwardTo,#btnReject').hide();
        $('#btnSubmit,#btnSave').show();
    },
    hrefClickAccountAssignment: function (thisObj) {
        $("#Forward select, input, textarea").removeClass("error");
        $('#lblErrMsgDetails').text('');
        apinvoice.activeTab('AccountAssignment', thisObj.id);
        $('#btnForwardTo,#btnReject').hide();
        $('#btnSubmit,#btnSave').show();
        // $("#btnGLFileUpload")[0].value = "";
        $("input[name=btnGLFileUpload]").val('');
        apinvoice.btnShowGetPOCharges_ByPONumber();
    },
    hrefClickForward: function (thisObj) {
        $("#Forward select, input, textarea").removeClass("error");
        $('#txtForwardTo,#txtAddNotes').val('');
        apinvoice.activeTab('Forward', thisObj.id);
        $('#btnSubmit,#btnReject,#btnSave').hide();
        $('#btnForwardTo').show();

    },
    hrefClickRejects: function (thisObj) {
        $("#Reject select, input, textarea").removeClass("error");
        apinvoice.populateRejectDropDownList();
        $('#txtReasonRejection').val('');
        apinvoice.activeTab('Reject', thisObj.id);
        $('#btnSubmit,#btnForwardTo,#btnSave').hide();
        $('#btnReject').show();
    },
    hrefClickRelatedDocuments: function (thisObj) {
        $("#hrefHeaderGeneral").removeClass('active');
        apinvoice.activeTab('', thisObj.id);
    },

    isCanApprove: function () {
        var ermsg = '', isValid = true;
        ermsg = validationConditions('yes');
        if (ermsg != '') {
            var arr = $.unique(ermsg.split('<br>'));
            ermsg = arr.join("<br>");
            $('.alert').hide();
            Notify(ermsg, null, null, "danger");
            isValid = false;
        }
        return isValid;
    },

    loadDCConfigValue: function () {

        isNewAddress = utility.getDCConfigValue('IsVendorMaintenanceRequired');
        isPOSelection = utility.getDCConfigValue('IsVendorInfoDisableOnPOSelection');
        showVendorBasedonPO = utility.getDCConfigValue('ShowVendorBasedonPO');
        gLCodePrefix = utility.getDCConfigValue('GLCodePrefix');
        isVendorMntcRequired = utility.getDCConfigValue('IsVendorMaintenanceRequired');
        AccountAssignmentDefault = utility.getDCConfigValue('AccountAssignmentDefault1');
        IsPONumberWFStatusCheck = utility.getDCConfigValue('IsPONumberWFStatusCheck');
        IsDetailCountGreaterThanZero = utility.getDCConfigValue('IsDetailCountGreaterThanZero');
        IsRejectConfirmationMessageShow = utility.getDCConfigValue('IsRejectConfirmationMessageShow');
        FieldRulesCustomColumn = utility.getDCConfigValue('FieldRulesCustomColumn');
        RejectNotePrefix = utility.getDCConfigValue('RejectNotePrefix');
        //ToleranceAmount = utility.getDCConfigValue('ToleranceAmount');
        //ToleranceNegativeValue = utility.getDCConfigValue('ToleranceNegativeValue');
        constToleranceType = utility.getDCConfigValue('ToleranceType');
        constToleranceValue = utility.getDCConfigValue('ToleranceAmount');
        constToleranceNegativeValue = utility.getDCConfigValue('ToleranceNegativeValue');
        $('#hdnToleranceValue').val(constToleranceValue);
        $('#hdnToleranceNegativeValue').val(constToleranceNegativeValue);
        
        
    },

    loadCustomChanges: function () {

        if (($('#TagDocumentHeader_AccountingDate').val() || "").trim() == "") {
            let d = new Date();
            let currDate = d.toLocaleString('default', { month: 'short' }) + '-' + d.getFullYear()
            $('#TagDocumentHeader_AccountingDate').val(currDate);
        }
        if ($('#TagDocumentHeader_CommodityCode').is(':checked') == false) {
            $("#TagDocumentHeader_MICAuthor").attr('disabled', 'disabled');
        }
        if (isVendorMntcRequired.toUpperCase() == 'TRUE')
            VendorDefaultLen = 3;

        if ($("#IndexPivot_SpecialHandling").length > 0 && $("#IndexPivot_Payment_Type").length > 0) {
            if ($("#IndexPivot_SpecialHandling").is(':checked') == false && $("#IndexPivot_Payment_Type").is(':checked') == false) {
                $('#IndexPivot_SpecialHandling,#IndexPivot_Payment_Type').val(false);
                $("#splHndlInstrDiv").hide();
                //$("#duedateDiv").hide();
            } else {
                $("#splHndlInstrDiv").show();
            }
        }

        $('#SmartListHeaderGrid')
            .on('page.dt', function () {
                $("#SmartListDetailGrid").DataTable().clear().draw();
                $('input:radio[name=rdbtn]:checked').prop('checked', false);
                console.log('Page');
            })
            .dataTable();


        $('#SmartListHeaderGrid').on('click', 'input:radio[name=rdbtn]', function () {
            $('#lblSmartlistPODetailAmountErr').text('');
            $("div[id='SmartListDetailGrid_filter'] > label > input[type='search']").val('');
            var documentID = $(this).val();
            apinvoice.getSmartListDetail(documentID);
        });

        if ($('#IndexPivot_Due_Date').length > 0) {
            if ($('#IndexPivot_Due_Date').val() != '' && isDate($('#IndexPivot_Due_Date').val(), 'M/d/yyyy hh:mm:ss'))
                $('#IndexPivot_Due_Date').val($('#IndexPivot_Due_Date').val().split(' ')[0].trim());
        }
        if ($('#IndexPivot_Co_Number').val() == "") {
            $("#IndexPivot_Co_Number").prop('selectedIndex', 1);
            $('#IndexPivot_Co_Number').trigger("change");
        }

        $('.dataTables_empty').closest('tr').remove();
        $("#chkVendorInfo").prop("checked", true);

        if ($('#IndexPivot_Vendor_Name').length > 0) {
            if ($('#IndexPivot_Vendor_Name').val() != "" && $('#IndexPivot_Vendor_Number').val() != "" && $('#TagDocumentHeader_RemitToAddress').val() == "") {
                $('#IndexPivot_Vendor_Number').trigger("change");
            }
        };
        if (!$("#IndexPivot_SiteID").is(":disabled")) {
            if ($('#IndexPivot_SiteID').length > 0) {
                if ($('#IndexPivot_SiteID').val() == '100') {
                    $('#IndexPivot_Div_Dept').removeAttr('disabled');
                }
                else {
                    $("#IndexPivot_Div_Dept option:contains(<select>)").prop('selected', true);
                    $('#IndexPivot_Div_Dept').attr('disabled', 'disabled');
                }
            }
        };
        if ($('#IndexPivot_PANumber').length > 0) {
            if ($('#IndexPivot_PANumber').val().trim().length > 0) {
                $('#IndexPivot_PANumber').trigger("blur");
            }
        }

        if ($('#IndexPivot_Vendor_Name > option').length >= VendorDefaultLen) {
            $("#IndexPivot_Vendor_Name").prop('selectedIndex', 1);
            $('#IndexPivot_Vendor_Name').trigger("change");
        }

        if ($('#ddlPONumber').val() != "") {
            dbVendorName = $('#IndexPivot_Vendor_Number').val();
            $('#ddlPONumber').trigger("change");
        }

        if (apinvoice.checkIsNull('IndexPivot_Terms')) {
            $('#IndexPivot_Terms').trigger('change');
        }
    },

    onFailure: function (response) {
        console.log(response);
    },
    onError: function (response) {
        console.log(response);
    },
    onFailure_WithDependantSource: function (response, dependantObj) {
        //console.log(response);
    },
    onError_WithDependantSource: function (response, dependantObj) {
        //console.log(response);
    },
    onFailureWorkFlowNotesPOST: function (response, dependantSource) {
        $('.alert').hide();
        Notify(dependantSource.failureMsg, null, null, "danger");
    },
    onErrorWorkFlowNotesPOST: function (response, dependantSource) {
        $('.alert').hide();
        Notify(dependantSource.errorMsg, null, null, "danger");
    },

    onSuccessPOST: function (response, dependantSource) {
        $('.alert').hide();
        Notify(response, null, null, "success");
        if (dependantSource != null && dependantSource != undefined) {
            if (dependantSource == 'Approve' || dependantSource == 'Reject' || dependantSource == 'Forward' || dependantSource == 'ReplyToSender') {
                window.location.href = $('#hdnInboxlink').val();
            }
        }
    },
    onSuccessWorkFlowNotesPOST: function (response, dependantSource) {
        if (response > 0) {
            $('.alert').hide();
            Notify(dependantSource.successMsg, null, null, "success");
        }
        else {
            $('.alert').hide();
            Notify(dependantSource.warningMsg, null, null, "warning");
        }
    },
    onSuccessAddDetailJqGrid: function (response, dependantSource) {
        if (response > 0) {

            var grid = $("#jqGrid");
            dependantSource.obj.TagDocumentDetailsID = response;
            var id = dependantSource.currentRowIndex;
            //var row = generateNewRow();

            var grdiData = jQuery("#jqGrid").jqGrid('getGridParam', 'data');
            var gridlength = grdiData.length;

            var newRowId = gridlength;
            var row = {};
            row = grdiData[gridlength - 1];

            if (row.TagDocumentDetailsID != "") {
                row = apinvoiceDetails.newrow();
                //newRowId = row.rowid;
            }

            row.IsPORow = false;

            grid.jqGrid('setCell', newRowId, 'ExpenseAccountNumber', dependantSource.obj.ExpenseAccountNumber);
            grid.jqGrid('setCell', newRowId, 'POItemDescription', dependantSource.obj.POItemDescription.replace(/"/g, ''));
            grid.jqGrid('setCell', newRowId, 'POQty', dependantSource.obj.POQty);
            grid.jqGrid('setCell', newRowId, 'POPrice', dependantSource.obj.POPrice);
            grid.jqGrid('setCell', newRowId, 'ExtendedCost', dependantSource.obj.ExtendedCost);
            grid.jqGrid('setCell', newRowId, 'ReceivingQty', dependantSource.obj.ReceivingQty);
            grid.jqGrid('setCell', newRowId, 'InvoiceQty', dependantSource.obj.InvoiceQty);
            grid.jqGrid('setCell', newRowId, 'InvoicePrice', dependantSource.obj.InvoicePrice);
            grid.jqGrid('setCell', newRowId, 'POExtendedPrice', dependantSource.obj.POExtendedPrice);
            grid.jqGrid('setCell', newRowId, 'Difference', dependantSource.obj.Difference);
            grid.jqGrid('setCell', newRowId, 'TagDocumentDetailsID', response);

            row.InvoiceDate = $('#IndexPivot_Invoice_Date').val();
            row.InvoiceAmount = $('#IndexPivot_Invoice_Amount').val();

            grid.jqGrid('saveRow', newRowId, false, 'clientArray');
            grid.trigger('reloadGrid');
            apinvoiceDetails.calculateUnAllocatedBalanceJqGrid();
            $('.ui-pg-button').trigger('click');
            apinvoiceDetails.addEmptyRow();
        }
    },
    onSuccessJqGrid: function (response) {
        apinvoice.bindJqGridData(response);
    },
    onSuccessGridLinesRefresh: function (response) {

    },

    populateRejectDropDownList: function () {
        var CurrentWorkFlowNodeID = nodeId;
        var ddl = $('#ddlRejectTo');
        ddl.empty().append($('<option>', { value: '', text: '<select>' }));
        if (CurrentWorkFlowNodeID == '164' || CurrentWorkFlowNodeID == '172')
            ddl.append($('<option>', { value: 'Delete Invoice Inbox', text: 'Delete Invoice Inbox' }));
        else if (CurrentWorkFlowNodeID == '407' || CurrentWorkFlowNodeID == '460') {
            ddl.append($('<option>', { value: 'Initiators-Vincent', text: 'Initiators-Vincent' }));
        }
        else
            ddl.append($('<option>', { value: 'A/P Payment Processing Inbox', text: 'A/P Payment Processing Inbox' }));
    },
    populateAddressTextbox: function (data) {
        $("#txtVendorAddress").val(data.AddressText);
        $('#hdnVendorAddressObj').val(JSON.stringify(data));
    },

    rejectToBtn_Click: function () {
        var res = true, jsonString = "", url = "", obj = {};
        if (validateRejectTo()) {
            if (IsRejectConfirmationMessageShow == 'true' && nodeId == 230) {
                res = confirm("Are you sure you Want to delete?");
            }
            if (res) {

                obj.UserDetailsID = userDetailsID;
                obj.DocumentID = $("#docId").val();
                obj.Note = RejectNotePrefix != '' ? RejectNotePrefix + ' ' + $('#txtReasonRejection').val().trim() : $('#txtReasonRejection').val().trim();
                obj.CurrentNodeID = nodeId;
                obj.WorkflowID = workFlowId;
                obj.NodeText = $('#NodeText').val();

                jsonString = JSON.stringify(obj);
                url = '/APInvoiceDC/RejectTo';
                MakeAjaxCall_WithDependantSource(REQUESTPOST, url, jsonString, apinvoice.onSuccessPOST, apinvoice.OnFailure, apinvoice.OnError, "Reject");
            }
        }
        $('#btnReject').removeAttr('disabled', '');

    },
    returnblank: function (item) {
        if (item == null) {
            return "";
        } else {
            return item;
        }
    },
    refreshPODetailsGrid: function () {
        apinvoiceDetails.init();
        $("#jqGrid").trigger("resize");
        apinvoice.updateJqGrid();
        apinvoice.clearHeaderDeatil();
    },

    stringFormat: function () {
        // The string containing the format items (e.g. "{0}")
        // will and always has to be the first argument.
        var theString = arguments[0];

        // start with the second argument (i = 1)
        for (var i = 1; i < arguments.length; i++) {
            // "gm" = RegEx options for Global search (more than one instance)
            // and for Multiline search
            var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
            theString = theString.replace(regEx, arguments[i]);
        }

        return theString;
    },
    saveReplyToSender: function () {
        var obj = {}, url = "/APInvoiceDC/SendToReply";
        obj.DocumentID = $("#docId").val();
        obj.CurrentNodeID = nodeId;
        obj.WorkflowID = workFlowId;
        obj.ReplyNote = $('#txtReplyNote').val();
        var jsonString = JSON.stringify(obj);
        MakeAjaxCall_WithDependantSource(REQUESTPOST, url, jsonString, apinvoice.onSuccessPOST, apinvoice.OnFailure, apinvoice.OnError, "ReplyToSender");

    },
    saveHeaderOnly: function (checkValidation) {

        var obj = {}, jsonString = "", result = "", url = "/APInvoiceDC/SaveAPInvoiceInfo";
        if (checkValidation) {
            return validationHeader1();
        }
        obj = apinvoice.getHeaderTabData();
        jsonString = JSON.stringify(obj);
        MakeAjaxCall(REQUESTPOST, url, jsonString, apinvoice.onSuccessPOST, apinvoice.OnFailure, apinvoice.OnError);


    },
    saveApInvoice: function (submitAction) {
        var obj = {}, jsonString = "", url = "/APInvoiceDC/SaveAPInvoiceInfo";
        $('#hdnIsPONumberApproved').val(apinvoice.checkPONumberWFStatus());
        apinvoiceDetails.calculateUnAllocatedBalanceJqGrid();
        apinvoice.setToleranceValue();
        
        let isValid = true;
        let Vendor_Number = $("#IndexPivot_Vendor_Number").val();
        //if (Vendor_Number != 'New Vendor') {   
        if (nodeId != '168' && Vendor_Number != 'New Vendor') {            
            isValid = validation1();
        }
        //if (validation1()) {
        if (isValid) {
            obj = apinvoice.getHeaderTabData();
            jsonString = JSON.stringify(obj);

            if (submitAction == "Approve") {

                $('#hdnIsDetailGridCountValid').val(apinvoice.checkDetailGridCount());
               // apinvoiceDetails.calculateUnAllocatedBalanceJqGrid();
                result = MakeAjaxCall2(REQUESTPOST, false, url, JSON.stringify({ jsonValue: jsonString }));

                if (result == "Data Saved") {

                    // let Vendor_Number = $("#IndexPivot_Vendor_Number").val();
                    if ((nodeId == 164 || nodeId == 172) && Vendor_Number != 'New Vendor') {
                        let poissueMsg = isPOIssues();
                        if (poissueMsg != '') {
                            $('.alert').hide();
                            //Notify("Po Issues are not resolved. Please check workflow notes.", null, null, 'danger', 1200000);
                            Notify(poissueMsg, null, null, 'danger', 1200000);
                            return false;
                        }

                    }


                    obj.SubmitAction = submitAction;
                    obj.BypassPotentialDuplicate = this.getBypassPotentialDuplicate(obj);

                    var vendorMaintenance = "no";
                    if (obj.Vendor_Name === "New Vendor" || obj.RemitToAddress === "New Address") {
                        vendorMaintenance = "yes";
                    }
                    $("#hdnIsVendorMaintenance").val(vendorMaintenance);
                    jsonString = JSON.stringify(obj);
                    var maskfileCheck = this.getMaskFileCheckApplicable(obj.WorkFlowID, obj.NodeID);

                    // Durga(05/08/2019) Added for Validate from AP PO General Inbox.
                    if (($('#IndexPivot_Appr').length > 0 && $('#IndexPivot_Appr').prop("checked") == true) || ($('#IndexPivot_Appr').length > 0 && $("#IndexPivot_Invoice_Type").val() == 'npo')) {
                        maskfileCheck.IsMaskFileCheck = false;
                    }
                    if (($('#IndexPivot_PTY').length > 0 && $('#IndexPivot_PTY').prop("checked") == true)) {
                        maskfileCheck.IsMaskFileCheck = false;
                    }
                    if (vendorMaintenance === "no" && maskfileCheck.IsMaskFileCheck === true) {
                        obj.SMD_CurrentNodeID = maskfileCheck.SMD_CurrentNodeId;
                        obj.SMD_Dynamic = maskfileCheck.SMD_Dynamic;
                        var appListJson = '';
                        appListJson = this.getApproversList(obj.DocId, obj.WorkFlowID, maskfileCheck.MaskfileType, obj.CO_Number, obj.Invoice_Amount, nodeId, maskfileCheck.SMD_CurrentNodeId);
                        var appCount = appListJson.length;
                        obj.IsLoggedInUserExcludedFromApprovalList = false;
                        if (appCount == 1) {

                            obj.NextUserDetailsID = appListJson[0].UserdetailsID;
                            obj.SMD_NextNodeID = appListJson[0].SMD_NextNodeID;
                            obj.IsApproverSelected = true;
                            jsonString = JSON.stringify(obj);
                            if (apinvoice.isCanApprove()) {
                                MakeAjaxCall_WithDependantSource(REQUESTPOST, url, jsonString, apinvoice.onSuccessPOST, apinvoice.OnFailure, apinvoice.OnError, "Approve", false);
                            }
                        }
                        else if (appCount > 1) {

                            /*****************/
                            $("#ddlApprove").empty().append($('<option>', { value: '', text: '<select>' }));
                            $('#txtNote').empty();
                            $.each(appListJson, function (key, value) {

                                if (obj.UserID == value.UserdetailsID) {
                                    obj.IsLoggedInUserExcludedFromApprovalList = true;
                                }
                                else {
                                    if (nodeId == "2001")
                                        $("#ddlApprove").append($('<option>', { value: value.UserdetailsID, text: value.ApproverDesc.split("__")[0] }));
                                    else
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
                        if (apinvoice.isCanApprove()) {
                            MakeAjaxCall_WithDependantSource(REQUESTPOST, url, jsonString, apinvoice.onSuccessPOST, apinvoice.OnFailure, apinvoice.OnError, "Approve", false);
                        }
                    }
                }
            }
            else {
                MakeAjaxCall(REQUESTPOST, url, jsonString, apinvoice.onSuccessPOST, apinvoice.OnFailure, apinvoice.OnError, false);
            }
        }
    },
    setToleranceValue() {
        
        let toleranceValue = constToleranceValue, toleranceNegativeValue = constToleranceNegativeValue;
        let invoiceAmount = utility.getAmountWithOutCommas('IndexPivot_Invoice_Amount');
        let taxAmount = utility.getAmountWithOutCommas('TagDocumentHeader_TaxAmount');
        let freightAmt = utility.getAmountWithOutCommas('TagDocumentHeader_FreightAmount');
        let miscAmt = utility.getAmountWithOutCommas('TagDocumentHeader_MiscAmount');
        let headerAmount = (invoiceAmount - taxAmount - freightAmt - miscAmt);
       
        if (constToleranceType == 'percentage') {
            toleranceValue = headerAmount * (constToleranceValue / 100);
            toleranceNegativeValue = headerAmount * (constToleranceNegativeValue / 100);
        }
        $('#hdnToleranceValue').val(toleranceValue);
        $('#hdnToleranceNegativeValue').val(toleranceNegativeValue);
    },
    setInvoiceCurrencyTextBox: function (code) {
        $('#TagDocumentHeader_InvoiceCurrency').val(code);
    },
    smartGridClickTbodyTrTd: function (objThis) {

        var TDID = $(objThis).attr("id");
        var selectedRowIndex = $('#SmartListGrid').DataTable().row(objThis).index();
        var thisTr = $(objThis).closest('tr');

        if (TDID.indexOf('td3') > -1) {
            var activeElement = $(objThis);
            var descElement = $(objThis).parent().children(":eq(2)");
            var OriginalContent = $(objThis).text();
            if (OriginalContent != '' || OriginalContent == '') {
                activeElement.html("<input type='text' onfocus='this.select();' value='" + OriginalContent.trim() + "' id='in" + TDID + "' class='form-control input-sm expenseacctnum' style='width: 100%;height: 23px; ' />");
                $(objThis).children().first().focus();
                $(objThis).children().first().keypress(function (evt) {

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
                $(objThis).children().first().keydown(function (e) {

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
                $(objThis).children().first().blur(function () {
                    if (this.value != "") {
                        var num = parseFloat((this.value.length == 1 && this.value == ".") ? "0" : this.value);
                        $("#" + this.id).val(num.toFixed(0 + 0));
                    }
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
    },


    templateRowSmartlist: function () {
        return '<tr id="{0}">'
            + '<td id="td1{0}" class=" sorting_1" ><label style="font-weight: normal;">{1}</label></td>'
            + '<td id="td2{0}">{2}</td>'
            + '<td id="td3{0}"><label style= "font-weight: normal;">{3}</label></td>'
            + '<td id="td4{0}" class="text-center">'
            + '<input type="checkbox">'
            + '</td>'
            + '</tr>';
    },
    txtClickForwardTo: function () {
        if (!$("#btnForwardTo").is(":disabled")) {
            prevSelectedForwardUser = $('#txtForwardTo').val();
            $('#txtForwardTo').removeAttr("readonly");
        }
    },

    updateJqGrid: function () {
        var pONumber = '0', url = "";
        $("#jqGrid").trigger("resize");
        if ($("#ddlPONumber").val() != "") {
            pONumber = $("#ddlPONumber option:selected").val();
        }
        url = "/APInvoiceDC/GetTagDocumentDetails_ByPONumber?documentID=" + $("#docId").val() + "&pONumber=" + pONumber;
        MakeAjaxCall(REQUESTGET, url, null, apinvoice.onSuccessJqGrid, apinvoice.OnFailure, apinvoice.OnError, false);
    },

    vendorAddressSave: function (obj) {
        var isValideAddressJson = false;
        $('#hdnVendorAddressObj').val() != null ? $('#hdnVendorAddressObj').val() != '' ? isValideAddressJson = true : isValideAddressJson = false : isValideAddressJson = false;
        if (isValideAddressJson) {
            var objAddress = JSON.parse($('#hdnVendorAddressObj').val());
            //obj.VendorAddressLine1 = apinvoice.returnblank(objAddress.Address1) + apinvoice.returnblank(objAddress.Address2) + apinvoice.returnblank(objAddress.Address3) + apinvoice.returnblank(objAddress.Address4);
            //obj.VendorAddressLine2 = apinvoice.returnblank(objAddress.City) + apinvoice.returnblank(objAddress.StateCode) + apinvoice.returnblank(objAddress.Post);

            obj.VendorAddressLine1 = apinvoice.returnblank(objAddress.Address1);
            obj.VendorAddressLine2 = apinvoice.returnblank(objAddress.Address2);
            obj.VendorAddressLine3 = apinvoice.returnblank(objAddress.Address3);
            obj.VendorAddressLine4 = apinvoice.returnblank(objAddress.Address4);
            obj.VendorCity = apinvoice.returnblank(objAddress.City);
            obj.VendorState = apinvoice.returnblank(objAddress.State);
            obj.VendorZip = apinvoice.returnblank(objAddress.Post);
        }
    },

}

apinvoice.Init();

