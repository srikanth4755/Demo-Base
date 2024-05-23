
var lastSelection
    , isErrorGridLine = false
    , isErrorGLCode = false
    , isErrorPONumber = false
    , flagAdd = 0
    , grid = jQuery("#jqGrid"), timer, data = {};

var apinvoiceDetails = {

    init: function () {
        $.jgrid.defaults.width = 1057;
        $.jgrid.defaults.responsive = true;
        $.jgrid.defaults.styleUI = 'Bootstrap';
        $('.dataTables_wrapper').css('overflow', '');

        data = JsonDetailsData;
        for (var i = 0; i < data.length; i++) {
            data[i].rowid = i + 1;
        };



        // gridColumns = apinvoiceDetails.getGridColumns();

        apinvoiceDetails.loadGrid();
        $(document).click(function (e) {
            apinvoiceDetails.documentClick(e);
        });

        var wf = (jsonHeaderParams.WF || "").toLowerCase();
        if (wf == "yes" && utility.getIsVisibleField(fieldRules, 'GridRowPODetailAddButton') == false)
            apinvoiceDetails.addEmptyRow();

        $("#txtSearch").on("keyup", function () {
            apinvoiceDetails.gridSearch(this);
        });
        $('.ui-pg-input').keypress(function (e) {
            apinvoiceDetails.gridPageChange(e, this);
        });
    },

    addEmptyRow: function () {
        var grid = $("#jqGrid");
        var rowsperPage = parseInt(grid.getGridParam('rowNum'));
        var gridlength = grid.jqGrid('getGridParam', 'data').length;
        var curpage = parseInt($(".ui-pg-input").val());
        var totPages = Math.ceil(gridlength / rowsperPage);

        if (rowsperPage * totPages == gridlength) {
            var id = $('.inline-edit-cell').parent().parent().prop('id');
            grid.jqGrid('saveRow', id, false, 'clientArray');
            var row = apinvoiceDetails.newrow();

            var newRowId = row.rowid;
            grid.jqGrid('addRowData', newRowId, row);
            grid.trigger('reloadGrid');
            lastSelection = newRowId;
            grid.jqGrid('saveRow', lastSelection, false, 'clientArray');
            grid.jqGrid('restoreRow', lastSelection);
            $('.glyphicon-step-forward').trigger('click');
        } else {
            $('.glyphicon-step-forward').trigger('click');
            var row = apinvoiceDetails.newrow();
            var newRowId = row.rowid;
            grid.trigger('reloadGrid');
            grid.jqGrid('addRowData', newRowId, row);
        }

        lastSelection = newRowId;
        grid.jqGrid('saveRow', lastSelection, false, 'clientArray');
        grid.jqGrid('restoreRow', lastSelection);

        var eid = $('.inline-edit-cell').parent().parent().prop('id')
        grid.jqGrid('saveRow', eid, false, 'clientArray');
        grid.jqGrid('restoreRow', eid);
        grid.jqGrid('editRow', newRowId);
    },
    addRow: function (id) {
        var editrowid = $('.inline-edit-cell').parent().parent().prop('id');
        if (id != editrowid) {
            $("#jqGrid").jqGrid('editRow', id);
        }
        apinvoiceDetails.resetPreviousRow(id);
        if (apinvoiceDetails.validateGridRow()) {
            flagAdd++;
            $('.disabledPlussign').bind('click', false);
            if (flagAdd == 1) {
                setTimeout(function () {
                    apinvoiceDetails.addGridRow(id, 'Add');
                    $(this).unbind('click', false);
                    $('.disabledPlussign').unbind('click', false);
                    flagAdd = 0;
                }, 2000);
            }
        }
    },
    addGridRow: function (id, type) {

        var grid = $("#jqGrid"), obj = {}, row = grid.jqGrid('getRowData', id)
            , jsonString = ""
            , url = '/APInvoiceDC/SaveTagDocumentDetail_PODetail'
            , dependantObj = {};

        //var lastrow;


        obj.DocumentID = $('#HdnDocumentID').val();
        obj.RowStatus = type;

        if (type == 'Add') {
            obj.IsPORow = false;
        } else {
            obj.TagDocumentDetailsID = row.TagDocumentDetailsID;
            obj.IsPORow = row.IsPORow;
        }

        obj.ExpenseAccountNumber = $("#" + id + "_ExpenseAccountNumber").length > 0 ? $("#" + id + "_ExpenseAccountNumber").val() : row.ExpenseAccountNumber;

        // if (isNaN(parseFloat($("#" + id + "_ReceivingQty").val())))
        //    $("#" + id + "_ReceivingQty").val(0);

        // obj.ReceivingQty = parseFloat($("#" + id + "_ReceivingQty").val() || 0);

        //  if (isNaN(parseFloat($("#" + id + "_InvoiceQty").val())))
        //   $("#" + id + "_InvoiceQty").val(0);

        //  obj.InvoiceQty = parseFloat($("#" + id + "_InvoiceQty").val() || 0);

        obj.ReceivingQty = $("#" + id + "_ReceivingQty").length > 0 ? parseFloat($("#" + id + "_ReceivingQty").val() || 0) : row.ReceivingQty;
        if (isNaN(parseFloat($("#" + id + "_InvoiceQty").val())))
            $("#" + id + "_InvoiceQty").val(0);
        obj.InvoiceQty = $("#" + id + "_InvoiceQty").length > 0 ? parseFloat($("#" + id + "_InvoiceQty").val() || 0) : row.InvoiceQty;


        if (isNaN(parseFloat($("#" + id + "_InvoicePrice").val())))
            $("#" + id + "_InvoicePrice").val(0);

        obj.InvoicePrice = parseFloat(($("#" + id + "_InvoicePrice").val() || "0").replace(/,/g, "") || 0);
        // obj.PO = $("#" + id + "_PO").val();
        obj.PO = row.PO;

        obj.POItemDescription = row.POItemDescription.replace(/"/g, '');
        obj.POQty = parseFloat(row.POQty || 0);
        obj.POPrice = parseFloat(row.POPrice || 0);
        obj.ExtendedCost = parseFloat(row.ExtendedCost || 0);
        obj.POExtendedPrice = parseFloat(row.POExtendedPrice || 0);
        obj.Difference = parseFloat(row.Difference || 0);
        obj.LINSEQ = parseFloat(row.LINSEQ || 0);

        if (validationDetail(obj, id)) {

            obj.InvoiceDate = $('#IndexPivot_Invoice_Date').val();
            obj.InvoiceAmount = ($('#IndexPivot_Invoice_Amount').val() || "0").replace(/,/g, "");
            obj.UserID = userDetailsID;
            obj.CompanyNo = '';
            obj.VendorNo = '0';

            if ($('#IndexPivot_Co_Number').val() != 0 && $('#IndexPivot_Co_Number').val() != '') {
                obj.CompanyNo = $('#IndexPivot_Co_Number').val();
            }
            if ($('#IndexPivot_Vendor_Number').val() != 0 && $('#IndexPivot_Vendor_Number').val() != '' && $('#IndexPivot_Vendor_Number').val() != 'New Vendor') {
                obj.VendorNo = $('#IndexPivot_Vendor_Number').val();
            }

            obj.workFlowId = workFlowId;
            obj.nodeId = nodeId;
            jsonString = JSON.stringify(obj);

            dependantObj.obj = obj;
            dependantObj.currentRowIndex = id;

            if (type == 'Add')
                MakeAjaxCall_WithDependantSource(REQUESTPOST, url, jsonString, apinvoiceDetails.onSuccessAddDetail, apinvoice.onFailure_WithDependantSource, apinvoice.onError_WithDependantSource, dependantObj);
            else
                MakeAjaxCall_WithDependantSource(REQUESTPOST, url, jsonString, apinvoiceDetails.onSuccessUpdateDetail, apinvoice.onFailure_WithDependantSource, apinvoice.onError_WithDependantSource, dependantObj);

        }
    },

    addGridRowDetails: function (data) {

        var DocumentID = $('#HdnDocumentID').val()
            , dataObj = {}, gls = [];
        dataObj.jsonValue = JSON.stringify(data);
        dataObj.gLCodePrefix = apinvoice.getGLPrefix();
        dataObj.DocumentID = DocumentID;


        //for (var j = 0; j < data.length; j++) {
        //    if (Object.keys(data[j]).length == 5) {
        //        for (var key in data[j]) {
        //            if (data[j].hasOwnProperty(key)) {
        //                dataHeader.push(key.trim());
        //            }
        //        }
        //        if (JSON.stringify(dataHeader) == JSON.stringify(dataValue)) {
        //            isValid = true;
        //        }
        //        break;
        //    }
        //}
        //  if (JSON.stringify(dataHeader) == JSON.stringify(dataValue)) {

        var jsonString = JSON.stringify(dataObj);
        var url = "/APInvoiceDC/SaveExcelUpl_TagDocumentDetails";
        var data2 = MakeAjaxCall2(REQUESTPOST, false, url, jsonString);
        for (var i = 0; i < data2.length; i++) {
            var obj = {};
            obj.GL = (data2[i].ExpenseAccountNumber);
            obj.Description = (data2[i].POItemDescription || "");
            obj.ReceivedQty = parseFloat(data2[i].ReceivingQty || 0);
            obj.InvoiceQty = parseFloat(data2[i].InvoiceQty || 0);
            obj.InvoicePrice = parseFloat(data2[i].InvoicePrice || 0);
            gls.push(obj);
        }
        $("#btnGLFileUpload")[0].value = "";
        $('.alert').hide();
        return gls;
        //}
    },




    addGridRowDetails_Old: function (data, dataHeader) {

        var DocumentID = $('#HdnDocumentID').val()
            , dataObj = {}, gls = []
            , dataValue = ["GL", "Description", "ReceivedQty", "InvoiceQty", "InvoicePrice"];
        dataObj.jsonValue = JSON.stringify(data);
        dataObj.gLCodePrefix = apinvoice.getGLPrefix();
        dataObj.DocumentID = DocumentID;


        //for (var j = 0; j < data.length; j++) {
        //    if (Object.keys(data[j]).length == 5) {
        //        for (var key in data[j]) {
        //            if (data[j].hasOwnProperty(key)) {
        //                dataHeader.push(key.trim());
        //            }
        //        }
        //        if (JSON.stringify(dataHeader) == JSON.stringify(dataValue)) {
        //            isValid = true;
        //        }
        //        break;
        //    }
        //}
        if (JSON.stringify(dataHeader) == JSON.stringify(dataValue)) {

            var jsonString = JSON.stringify(dataObj);
            var url = "/APInvoiceDC/SaveExcelUpl_TagDocumentDetails";
            var data2 = MakeAjaxCall2(REQUESTPOST, false, url, jsonString);
            for (var i = 0; i < data2.length; i++) {
                var obj = {};
                obj.GL = (data2[i].ExpenseAccountNumber);
                obj.Description = (data2[i].POItemDescription || "");
                obj.ReceivedQty = parseFloat(data2[i].ReceivingQty || 0);
                obj.InvoiceQty = parseFloat(data2[i].InvoiceQty || 0);
                obj.InvoicePrice = parseFloat(data2[i].InvoicePrice || 0);
                gls.push(obj);
            }
            $("#btnGLFileUpload")[0].value = "";
            $('.alert').hide();
            return gls;
        }
    },

    actionLink: function (cellValue, options, rowdata, action) {

        if (rowdata.TagDocumentDetailsID == "") {
            //if (utility.getIsReadOnlyField(fieldRules, 'GridRowPODetailAddButton'))
            // if (!utility.getIsVisibleField(fieldRules, 'GridRowPODetailAddButton'))
            return "<a href='javascript:apinvoiceDetails.addRow(" + options.rowId + ")' title='add record' class='glyphicon glyphicon-plus-sign disabledPlussign'>";
            // else
            // return "<a href='javascript:apinvoiceDetails.addRow(" + options.rowId + ")' title='add record' class='glyphicon glyphicon-plus-sign disabledPlussign' style='pointer-events:none;'>";

            //<a href='javascript:ClearRow(" + options.rowId + ")' title='clear record' class='glyphicon glyphicon-remove-circle'>
        }
        else {
            if (utility.getIsReadOnlyField(fieldRules, 'GridRowPODetailDeleteCheckbox'))
                return "<a href='javascript:apinvoiceDetails.deleteRecord(" + options.rowId + ")'  title='delete record' class='glyphicon glyphicon-trash' style='color: red; '></a>";
            else
                return "<a href='javascript:apinvoiceDetails.deleteRecord(" + options.rowId + ")'  title='delete record' class='glyphicon glyphicon-trash' style='color: red; pointer-events:none;'></a>";
        }
    },
    actionLinkForDeleteAllRecords() {
        if (utility.getIsReadOnlyField(fieldRules, 'GridRowPODetailDeleteCheckbox'))
            return "<a onclick='apinvoiceDetails.deleteAllRecords()'  title='delete all records' class='glyphicon glyphicon-trash' style='color: red; margin-left: 36px;'></a><br/><p>Delete All GLs</p>";
        else
            return "<a onclick='apinvoiceDetails.deleteAllRecords()'  title='delete all records' class='glyphicon glyphicon-trash' style='color: red; margin-left: 36px; pointer-events:none;'></a><br/><p>Delete All GLs</p>";



    },

    bindAutoCompletePONumbers: function (data, dependantSource) {
        dependantSource($.map(data, function (item) {
            return { value: item.Value.trim() }
        }));
    },

    calDifference: function (id) {
        var row = jQuery("#jqGrid").jqGrid('getRowData', id);
        var poQty = parseFloat(row.POQty) || 0;
        var poPrice = parseFloat(row.POPrice) || 0;
        //var invQty = parseFloat($("#" + id + "_InvoiceQty").val()) || 0;
        var invQty = $("#" + id + "_InvoiceQty").length > 0 ? (parseFloat($("#" + id + "_InvoiceQty").val()) || 0) : row.InvoiceQty;
        var invAmt = parseFloat($("#" + id + "_InvoicePrice").val()) || 0;
        var extCost = parseFloat(row.ExtendedCost) || 0;// parseFloat($("#" + id + "_POExtendedPrice").val()) || 0;
        var extndprice = (invQty * invAmt).toFixed(5);
        var diff = 0;

        if (!isNaN(parseFloat(extndprice)) && !isNaN(parseFloat(extCost))) {

            if (poQty == 0 && poPrice == 0) { //if (poQty == 0 && poPrice == 0) 
                diff = 0;
            }
            else {
                diff = parseFloat(extCost - extndprice).toFixed(2);
            }
            row.POExtendedPrice = extndprice;//activeElement8.next().text(extndprice);
            row.Difference = diff;//activeElement8.next().next().text(diff);

            $('#jqGrid').jqGrid('setCell', id, 'POExtendedPrice', extndprice);
            $('#jqGrid').jqGrid('setCell', id, 'Difference', diff);

        }
        else {
            isErrorGridLine = true;
        }
    },
    calculateUnAllocatedBalanceJqGrid: function () {
        var totalPOExtPrice = 0
            , gridData = []
            , invAmt = 0
            , taxAmt = 0
            , freightAmt = 0
            , miscAmt = 0
            , unallocBal = 0
            , unallocDecimalPointLength = 0;

        if (!isErrorGridLine) {

            gridData = jQuery("#jqGrid").jqGrid('getGridParam', 'data');
            invAmt = utility.getAmountWithOutCommas('IndexPivot_Invoice_Amount');
            taxAmt = utility.getAmountWithOutCommas('TagDocumentHeader_TaxAmount');
            freightAmt = utility.getAmountWithOutCommas('TagDocumentHeader_FreightAmount');
            miscAmt = utility.getAmountWithOutCommas('TagDocumentHeader_MiscAmount');
            unallocDecimalPointLength = utility.getDecimalPointLength(fieldRules, 'PODetailUnAllocatedBalance');

            gridData.forEach(function (row, i) {
                if (parseInt(row.TagDocumentDetailsID) > 0) {
                    totalPOExtPrice += (parseFloat(row.POExtendedPrice) || 0);
                }
            });

            paramData = {
                "invoiceAmount": invAmt,
                "taxAmount": taxAmt,
                "freight": freightAmt,
                "misc": miscAmt,
                "allocatedAmount": totalPOExtPrice
            }

            unallocBal = MakeAjaxCall2('GET', false, '/APInvoiceDC/CalculateUnallocateBalance', paramData);
            unallocBal = unallocBal.toFixed(unallocDecimalPointLength);



            if (parseFloat(unallocBal) == 0) {
                unallocBal = 0;
                unallocBal = unallocBal.toFixed(unallocDecimalPointLength);
                $('#UnAllocatedBalance').css('background-color', 'green');
                $('#lblMessage').text('');
            }
            else {
                $('#UnAllocatedBalance').css('background-color', 'orange');
                $('#lblMessage').text('Invoice out of Balance');
            }

            $('#UnAllocatedBalance').text(unallocBal);
            apinvoiceDetails.setGridPageCount();
        }
    },

    deleteRecord: function (id) {
        var result = confirm("Are you sure you Want to delete?");
        if (result == true) {

            var row = jQuery("#jqGrid").jqGrid('getRowData', id);
            var obj = {};
            obj.workFlowId = workFlowId;
            obj.nodeId = nodeId;
            obj.RowStatus = 'Delete';
            obj.IsPORow = row.IsPORow;
            obj.DocumentID = $("#docId").val();
            obj.TagDocumentDetailsID = row.TagDocumentDetailsID;
            var jsonString = JSON.stringify(obj);
            var url = '/APInvoiceDC/SaveTagDocumentDetail';
            var dependantObj = {};
            dependantObj.obj = obj;
            dependantObj.currentRowIndex = id;
            MakeAjaxCall_WithDependantSource(REQUESTPOST, url, jsonString, apinvoiceDetails.onSuccessDeleteDetail, apinvoice.onFailure_WithDependantSource, apinvoice.onError_WithDependantSource, dependantObj);

        }
    },
    deleteAllRecords: function () {

        var grid = $("#jqGrid");
        var gridlength = grid.jqGrid('getGridParam', 'data').length;
        if (gridlength => 1)
            var result = confirm("Are you sure you want to delete all GL entries?");

        if (result == true) {
            var obj = {};
            obj.workFlowId = workFlowId;
            obj.nodeId = nodeId;
            obj.RowStatus = 'Delete';
            obj.IsPORow = 0;// row.IsPORow;
            obj.DocumentID = $("#docId").val();
            obj.TagDocumentDetailsID = 0;
            var jsonString = JSON.stringify(obj);
            var url = '/APInvoiceDC/SaveTagDocumentDetail';
            var dependantObj = {};
            dependantObj.obj = obj;
            dependantObj.currentRowIndex = 0;
            MakeAjaxCall_WithDependantSource(REQUESTPOST, url, jsonString, apinvoiceDetails.OnSuccessDeteleAllDetails, apinvoice.OnFailure_WithDependantSource, apinvoice.OnError_WithDependantSource, dependantObj);
        }
    },
    documentClick: function (e) {
        if (($(e.target).closest(".dataTables_wrapper").attr("class") != "dataTables_wrapper")) {
            if (($(e.target).closest(".ui-menu-itemr").attr("class") != "ui-menu-item")) {

                var editrowid = $('.inline-edit-cell').parent().parent().prop('id')
                    , row = jQuery("#jqGrid").jqGrid('getRowData', lastSelection)
                    , grid = $("#jqGrid");

                grid.jqGrid('setCell', lastSelection, 'POItemDescription', row.POItemDescription);

                if ((row.TagDocumentDetailsID || "") != "") {
                    if (apinvoiceDetails.validateGridRow()) {
                        grid.jqGrid('saveRow', editrowid, false, 'clientArray');
                        grid.jqGrid('restoreRow', editrowid);
                        lastSelection = "";
                    }
                    if (isErrorGLCode) {
                        isErrorGLCode = false
                    }
                }
                apinvoiceDetails.editLastRow();
            }
        }
    },

    editRow: function (id, iRow, iCol, e) {
        id = parseInt(id);
        var gridCount = jQuery("#jqGrid").jqGrid('getGridParam', 'data')
            , grid = $("#jqGrid"),
            editrowid = $('.inline-edit-cell').parent().parent().prop('id');

        if (apinvoiceDetails.validateGridRow()) {
            $('#' + id).removeClass('success');
            if (id && id !== lastSelection) {
                // var editrowid = $('.inline-edit-cell').parent().parent().prop('id');
                grid.jqGrid('saveRow', editrowid, false, 'clientArray');
                grid.jqGrid('saveRow', lastSelection, false, 'clientArray');
                grid.jqGrid('restoreRow', lastSelection);
            }
            grid.jqGrid('editRow', id);
            lastSelection = id;
        }
        if ($("tr#" + gridCount.length).attr("editable") != "1") {
            apinvoiceDetails.editLastRow();
        }
        if ($(iCol.target).children().length > 0) {
            let focusColumn = $(iCol.target).children()[0].id;
            $('#' + focusColumn).focus(1);
        }

    },
    editLastRow: function () {
        var grid = jQuery("#jqGrid");
        var data = grid.jqGrid('getGridParam', 'data');
        var row = grid.jqGrid('getRowData', data.length);

        if (row.TagDocumentDetailsID == "") {
            $("#jqGrid").jqGrid('editRow', data.length);
        }
    },

    getGridColumns: function () {

        var col = [
            { label: 'rowid', name: 'rowid', width: 75, editable: false, key: true, hidden: true },
            { label: 'IsPORow', name: 'IsPORow', width: 75, editable: false, hidden: true, sorttype: "boolean" },
            { label: 'TagDocumentDetailsID', name: 'TagDocumentDetailsID', hidden: true },
            {
                label: utility.getFieldLabelName(fieldRules, 'GridRowPODetailExpenseAccountNumber'), name: 'ExpenseAccountNumber', editable: utility.getIsReadOnlyField(fieldRules, 'GridRowPODetailExpenseAccountNumber'), width: 200, classes: 'PL5 classglCode' + utility.getCssClass(fieldRules, 'GridRowPODetailExpenseAccountNumber'), hidden: utility.getIsVisibleField(fieldRules, 'GridRowPODetailExpenseAccountNumber'), resizable: false, fixed: true,
                editoptions: {
                    dataInit: function (elem) {
                        elem.style.padding = '5px';
                        $(elem).autocomplete({
                            source: apinvoiceDetails.loadGLData,
                            autoFocus: true,
                            select: function (event, ui) {

                                $('.ui-menu').scrollTop(0);
                                $(this).parent().next('td').text(ui.item.desc);
                                $(".ui-menu-item").removeAttr("class");
                                isErrorGLCode = true;
                            }
                        })
                        $(elem).blur(function () {
                            if (apinvoiceDetails.isValidGLCode(this.value.trim(), this.id, this)) {
                                apinvoiceDetails.isCellValidate(this, 'ExpenseAccountNumber');
                            }
                        })
                        $(elem).focus(function () {
                            isErrorGLCode = true;
                            $(this).select();
                        });
                        $(elem).mousedown(function () {
                            apinvoiceDetails.resetPreviousRow(this.id.split('_')[0]);
                        });
                    },
                }
            },
            {
                label: utility.getFieldLabelName(fieldRules, 'GridRowPODetailPOItemDescription'), name: 'POItemDescription', width: 300, editable: utility.getIsReadOnlyField(fieldRules, 'GridRowPODetailPOItemDescription'), hidden: utility.getIsVisibleField(fieldRules, 'GridRowPODetailPOItemDescription'), classes: 'PL5' + utility.getCssClass(fieldRules, 'GridRowPODetailPOItemDescription'), editoptions: {
                    dataInit: function (e) {
                        e.style.padding = '5px';
                    },
                }
            },
            {
                label: utility.getFieldLabelName(fieldRules, 'GridRowPODetailPONumber'), name: 'PO', editable: utility.getIsReadOnlyField(fieldRules, 'GridRowPODetailPONumber'), width: 100, classes: 'PL5 classPOno' + utility.getCssClass(fieldRules, 'GridRowPODetailPONumber'), hidden: utility.getIsVisibleField(fieldRules, 'GridRowPODetailPONumber'), resizable: false, fixed: true,
                editoptions: {
                    dataInit: function (elem) {
                        elem.style.padding = '5px';
                        if ($('#IndexPivot_Invoice_Type').length > 0 && $('#IndexPivot_Invoice_Type').val() == "po") {
                            $(elem).autocomplete({
                                source: apinvoiceDetails.loadPONumbers,
                                autoFocus: true,
                                minLength: 3,
                                select: function (event, ui) {
                                    isErrorPONumber = true;
                                }
                            })
                            $(elem).blur(function () {
                                if (!apinvoiceDetails.isValidPONumber(this.value, this.id, this)) {
                                    this.value = "";
                                }
                                apinvoiceDetails.isCellValidate(this, 'PO');
                            });
                            $(elem).mousedown(function () {
                                apinvoiceDetails.resetPreviousRow(this.id.split('_')[0]);
                            });
                        }
                    },
                }
            },
            {
                label: utility.getFieldLabelName(fieldRules, 'GridRowPOLineseq'), name: 'LINSEQ', width: 100, editable: utility.getIsReadOnlyField(fieldRules, 'GridRowPOLineseq'), hidden: utility.getIsVisibleField(fieldRules, 'GridRowPOLineseq'), classes: 'PL5' + utility.getCssClass(fieldRules, 'GridRowPOLineseq'), editoptions: {
                    dataInit: function (e) {
                        e.style.padding = '5px';
                    },
                }
            },
            {
                label: utility.getFieldLabelName(fieldRules, 'GridRowPODetailPOQuantity'), name: 'POQty', width: 120, editable: utility.getIsReadOnlyField(fieldRules, 'GridRowPODetailPOQuantity'), hidden: utility.getIsVisibleField(fieldRules, 'GridRowPODetailPOQuantity'), align: 'right', sorttype: "number", formatoptions: { decimalPlaces: utility.getDecimalPointLength(fieldRules, 'GridRowPODetailPOQuantity') }, classes: 'PL5' + utility.getCssClass(fieldRules, 'GridRowPODetailPOQuantity'), editoptions: {
                    dataInit: function (e) {
                        e.style.textAlign = 'right'; e.style.padding = '5px';
                    },
                }
            },
            {
                label: utility.getFieldLabelName(fieldRules, 'GridRowPODetailPOUnitPrice'), name: 'POPrice', editable: utility.getIsReadOnlyField(fieldRules, 'GridRowPODetailPOUnitPrice'), hidden: utility.getIsVisibleField(fieldRules, 'GridRowPODetailPOUnitPrice'), align: 'right', sorttype: "number", formatter: 'number', formatoptions: { decimalPlaces: utility.getDecimalPointLength(fieldRules, 'GridRowPODetailPOUnitPrice') }, classes: 'PR5' + utility.getCssClass(fieldRules, 'GridRowPODetailPOUnitPrice'), editoptions: {
                    dataInit: function (e) {
                        e.style.textAlign = 'right'; e.style.padding = '5px';
                    },
                }
            },
            {
                label: utility.getFieldLabelName(fieldRules, 'GridRowPODetailExtendedCost'), name: 'ExtendedCost', editable: utility.getIsReadOnlyField(fieldRules, 'GridRowPODetailExtendedCost'), hidden: utility.getIsVisibleField(fieldRules, 'GridRowPODetailExtendedCost'), align: 'right', sorttype: "number", formatter: 'number', formatoptions: { decimalPlaces: utility.getDecimalPointLength(fieldRules, 'GridRowPODetailExtendedCost') }, classes: 'PR5' + utility.getCssClass(fieldRules, 'GridRowPODetailExtendedCost'), editoptions: {
                    dataInit: function (e) {
                        e.style.textAlign = 'right'; e.style.padding = '5px';
                    },
                }
            },
            {
                label: utility.getFieldLabelName(fieldRules, 'GridRowPODetailReceivedQuantity'), name: 'ReceivingQty', editable: utility.getIsReadOnlyField(fieldRules, 'GridRowPODetailReceivedQuantity'), hidden: utility.getIsVisibleField(fieldRules, 'GridRowPODetailReceivedQuantity'), align: 'right', sorttype: "number", formatter: 'number', formatoptions: { decimalPlaces: utility.getDecimalPointLength(fieldRules, 'GridRowPODetailReceivedQuantity') }, classes: 'PR5' + utility.getCssClass(fieldRules, 'GridRowPODetailReceivedQuantity'), editoptions: {
                    dataInit: function (e) {
                        e.style.textAlign = 'right'; e.style.padding = '5px';
                        $(e).mousedown(function () {
                            apinvoiceDetails.resetPreviousRow(this.id.split('_')[0]);
                        });
                    },
                    dataEvents: [{ type: 'blur', fn: function (e) { apinvoiceDetails.isCellValidate(this, 'ReceivingQty'); } },
                    { type: 'keypress', fn: function (e) { return ValidDecimalNew(e, this, utility.getDecimalEntryLength(fieldRules, 'GridRowPODetailReceivedQuantity')); } }]
                }
            },
            {
                label: utility.getFieldLabelName(fieldRules, 'GridRowPODetailInvoiceQuantity'), name: 'InvoiceQty', editable: utility.getIsReadOnlyField(fieldRules, 'GridRowPODetailInvoiceQuantity'), hidden: utility.getIsVisibleField(fieldRules, 'GridRowPODetailInvoiceQuantity'), align: 'right', sorttype: "number", formatter: 'number', formatoptions: { decimalPlaces: utility.getDecimalPointLength(fieldRules, 'GridRowPODetailInvoiceQuantity') }, classes: 'PR5' + utility.getCssClass(fieldRules, 'GridRowPODetailInvoiceQuantity'), editoptions: {
                    dataInit: function (e) {
                        e.style.textAlign = 'right'; e.style.padding = '5px';
                        $(e).mousedown(function () {
                            //  apinvoiceDetails.resetPreviousRow(this.id.split('_')[0]);
                        });
                    },
                    dataEvents: [{ type: 'blur', fn: function (e) { apinvoiceDetails.isCellValidate(this, 'InvoiceQty'); } }
                        , { type: 'keypress', fn: function (e) { return ValidDecimalNew(e, this, utility.getDecimalEntryLength(fieldRules, 'GridRowPODetailInvoiceQuantity')); } }]
                }
            },
            {
                label: utility.getFieldLabelName(fieldRules, 'GridRowPODetailInvoiceAmount'), name: 'InvoicePrice', editable: utility.getIsReadOnlyField(fieldRules, 'GridRowPODetailInvoiceAmount'), hidden: utility.getIsVisibleField(fieldRules, 'GridRowPODetailInvoiceAmount'), align: 'right', sorttype: "number", formatter: 'number', formatoptions: { decimalPlaces: utility.getDecimalPointLength(fieldRules, 'GridRowPODetailInvoiceAmount') }, classes: 'PR5' + utility.getCssClass(fieldRules, 'GridRowPODetailInvoiceAmount'), editoptions: {
                    dataInit: function (e) {
                        e.style.textAlign = 'right'; e.style.padding = '5px';
                        $(e).mousedown(function () {
                            //apinvoiceDetails.resetPreviousRow(this.id.split('_')[0]);
                        });
                    },
                    dataEvents: [{ type: 'blur', fn: function (e) { apinvoiceDetails.isCellValidate(this, 'InvoicePrice'); } },
                    { type: 'keypress', fn: function (e) { return ValidDecimalNew(e, this, utility.getDecimalEntryLength(fieldRules, 'GridRowPODetailInvoiceAmount')); } }],
                }
            },
            {
                label: utility.getFieldLabelName(fieldRules, 'GridRowPODetailExtendedPrice'), name: 'POExtendedPrice', editable: utility.getIsReadOnlyField(fieldRules, 'GridRowPODetailExtendedPrice'), hidden: utility.getIsVisibleField(fieldRules, 'GridRowPODetailExtendedPrice'), align: 'right', sorttype: "number", formatter: 'number', formatoptions: { decimalPlaces: utility.getDecimalPointLength(fieldRules, 'GridRowPODetailExtendedPrice') }, classes: 'PR5' + utility.getCssClass(fieldRules, 'GridRowPODetailExtendedPrice'), editoptions: {
                    dataInit: function (e) {
                        e.style.textAlign = 'right'; e.style.padding = '5px';
                    },
                    disabled: true
                }
            },
            {
                label: utility.getFieldLabelName(fieldRules, 'GridRowPODetailDifference'), name: 'Difference', editable: utility.getIsReadOnlyField(fieldRules, 'GridRowPODetailDifference'), hidden: utility.getIsVisibleField(fieldRules, 'GridRowPODetailDifference'), align: 'right', sorttype: "number", formatter: 'number', formatoptions: { decimalPlaces: utility.getDecimalPointLength(fieldRules, 'GridRowPODetailDifference') }, classes: 'PR5' + utility.getCssClass(fieldRules, 'GridRowPODetailDifference'), editoptions: {
                    dataInit: function (e) {
                        e.style.textAlign = 'right'; e.style.padding = '5px';
                    },
                }
            },
            {
                label: utility.getFieldLabelName(fieldRules, 'GridRowPODetailTaxAmountCheckbox'), name: 'DetTaxAmount', editable: utility.getIsReadOnlyField(fieldRules, 'GridRowPODetailTaxAmountCheckbox'), hidden: utility.getIsVisibleField(fieldRules, 'GridRowPODetailTaxAmountCheckbox'), align: 'center', classes: 'PR5' + utility.getCssClass(fieldRules, 'GridRowPODetailTaxAmountCheckbox'), editoptions: {
                    dataInit: function (e) {
                        e.style.textAlign = 'center'; e.style.padding = '5px';
                    },
                }
            },
            {
                label: utility.getFieldLabelName(fieldRules, 'GridRowPODetailFreightAmountCheckbox'), name: 'DetFreightAmount', editable: utility.getIsReadOnlyField(fieldRules, 'GridRowPODetailFreightAmountCheckbox'), hidden: utility.getIsVisibleField(fieldRules, 'GridRowPODetailFreightAmountCheckbox'), align: 'center', classes: 'PR5' + utility.getCssClass(fieldRules, 'GridRowPODetailFreightAmountCheckbox'), editoptions: {
                    dataInit: function (e) {
                        e.style.textAlign = 'center'; e.style.padding = '5px';
                    },
                }
            },
            {
                label: utility.getFieldLabelName(fieldRules, 'GridRowPODetailMiscAmountCheckbox'), name: 'DetMiscAmount', editable: utility.getIsReadOnlyField(fieldRules, 'GridRowPODetailMiscAmountCheckbox'), hidden: utility.getIsVisibleField(fieldRules, 'GridRowPODetailMiscAmountCheckbox'), align: 'center', classes: 'PR5' + utility.getCssClass(fieldRules, 'GridRowPODetailMiscAmountCheckbox'), editoptions: {
                    dataInit: function (e) {
                        e.style.textAlign = 'center'; e.style.padding = '5px';
                    },
                }
            },
            { label: 'Actionstatus', name: 'Actionstatus', editable: false, hidden: true },
            { label: apinvoiceDetails.actionLinkForDeleteAllRecords(), name: '', width: 70, align: 'center', formatter: apinvoiceDetails.actionLink, hidden: utility.getIsVisibleField(fieldRules, 'GridRowPODetailDeleteCheckbox') }
        ];

        return col;
    },
    getInValidPONumbers: function (strPonos) {
        var data = {};
        data.pONumbers = strPonos;
        var resultData = MakeAjaxCall2(REQUESTGET, false, '/APInvoiceDC/GetInValidPONumbers', data);
        if (resultData != undefined) {
            if (resultData.length > 0) {
                var pos = '';
                for (var j = 0; j < resultData.length; j++)
                    pos += '' + resultData[j].PO_Number + ',';

                return pos = pos != '' ? pos.substring(0, pos.length - 1) : '';
            }
        }

        return '';
    },
    gridSearch: function (self) {
        if (timer) { clearTimeout(timer); }
        timer = setTimeout(function () {
            $("#jqGrid").jqGrid('filterInput', self.value);
        }, 0);
    },
    gridPageChange: function (e, obj) {
        var res = true;
        var lastpage = $('#jqGrid').getGridParam('lastpage');
        var charCode = (e.which) ? e.which : e.keyCode
        if (charCode == 13) {
            if (parseInt(obj.value) > lastpage) {
                res = false;
            }
        } else {
            res = ValidDecimal(e, obj);
        }
        return res;
    },

    isCellValidate: function (val, fieldName) {
        isErrorGridLine = false;
        var id = $(val).closest('tr').prop('id')
            , oldValue = $("#jqGrid").jqGrid('getGridParam', 'data')[parseInt(id) - 1][fieldName]
            , tagdocumentDetailsID = $("#jqGrid").jqGrid('getGridParam', 'data')[parseInt(id) - 1].TagDocumentDetailsID || 0;

        if (tagdocumentDetailsID > 0) {
            var newValue = (val.value);

            $(val).removeClass("error");
            //if (oldValue != newValue) {
            apinvoiceDetails.calDifference(id);
            apinvoiceDetails.addGridRow(id, 'Update');
            //}
        } else {
            apinvoiceDetails.calDifference(id);
        }
    },
    isValidGLCode: function (glCode, Id, val) {
        var id, oldGlCodeValue = "", oldGlDescription = "", isValid = false, poType = " ", url = "", glcodevalue = "", data = [];
        //var oldGlCodeValue = "";
        //var oldGlDescription = "";
        //var isValid = false;

        //glCode = glCode.trim();

        id = $(val).closest('tr').prop('id');
        oldGlCodeValue = $("#jqGrid").jqGrid('getGridParam', 'data')[parseInt(id) - 1]['ExpenseAccountNumber'];
        oldGlDescription = $("#jqGrid").jqGrid('getGridParam', 'data')[parseInt(id) - 1]['POItemDescription'];

        if (glCode == "") {
            $('#' + Id).val(oldGlCodeValue);
            $("#jqGrid").jqGrid('setCell', id, 'POItemDescription', oldGlDescription);
            isErrorGLCode = false;
        } else {

            var paNumber = $("#IndexPivot_PANumber").length > 0 ? $("#IndexPivot_PANumber").val().trim() : '';
            var siteId = $("#IndexPivot_SiteID").length > 0 ? $("#IndexPivot_SiteID").val().trim() : '';
            //var poType;

            if ($("#IndexPivot_POType").length > 0) {
                if ($("#IndexPivot_POType").val() || "" != "") {
                    poType = $("#IndexPivot_POType").val().trim();
                }
            }
            //if (siteId == "<select>") {
            //    siteId = "";
            //}
            glcodevalue = ($('#' + Id).val() || '').trim();
            if (glcodevalue.indexOf('---') !== -1) {
                glcodevalue = glcodevalue.split('---')[0].trim();
            }

            url = "/APInvoiceDC/GetGLAccountsJson?PreText=" + glcodevalue + '&gLCodePrefix=' + apinvoice.getGLPrefix();
            if ($('#IndexPivot_PANumber').length > 0 && $('#IndexPivot_PANumber').val() != null && $('#IndexPivot_PANumber').val() != '') {
                poType = " ";
                url = "/POAuthDC/GetPOAuthGLAccountsJson?PreText=" + glcodevalue + "&PaNumber=" + $('#IndexPivot_PANumber').val().trim() + "&SiteId=" + $('#IndexPivot_SiteID').val().trim() + "&PoType=" + poType;
            }
            data = MakeAjaxCall2('GET', false, url, '');

            if (data.length > 0) {
                var res = data.filter(function (item, index) {
                    if (item.GlCode == glCode) {
                        return item;
                    };
                });
                if (res.length == 0) {
                    $('#' + Id).val(oldGlCodeValue);
                    if ((oldGlCodeValue || '') != '')
                        $("#jqGrid").jqGrid('setCell', id, 'POItemDescription', oldGlDescription);
                    else
                        $("#jqGrid").jqGrid('setCell', id, 'POItemDescription', " ");
                } else {
                    isValid = true;
                    $('#' + Id).removeClass("error");
                    $("#jqGrid").jqGrid('setCell', id, 'POItemDescription', res[0].Description);
                    isErrorGLCode = false;
                }
            } else {
                $('#' + Id).val(oldGlCodeValue);
                if ((oldGlCodeValue || '') != '') {
                    $("#jqGrid").jqGrid('setCell', id, 'POItemDescription', oldGlDescription);
                }
                $('.alert').hide();
                Notify(utility.getFieldLabelName(fieldRules, 'GridRowPODetailExpenseAccountNumber') + ' is not valid', null, null, 'danger');
            }

            return isValid
        }
    },
    isValidPONumber: function (poNumeber, Id, val) {
        var isValid = false;
        var oldPONumberValue = poNumeber;

        id = $(val).closest('tr').prop('id');
        oldPONumberValue = $("#jqGrid").jqGrid('getGridParam', 'data')[parseInt(id) - 1]['PO'];

        if (poNumeber == "") {
            $('#' + Id).val("");
            isErrorPONumber = false;
            return true;
        } else {

            var value = $('#' + Id).val();
            var url = '/APInvoiceDC/GetSearchValue_PONumber?searchValue=' + value.toLowerCase();
            var data = MakeAjaxCall2(REQUESTGET, false, url, '');

            data = (data || '');

            if (data.length > 0) {
                var res = data.filter(function (item, index) {
                    if (item.Value.trim() == poNumeber) {
                        return item
                    };
                });
                if (res.length == 0) {
                    $('#' + Id).val(oldPONumberValue);
                } else {
                    isValid = true;
                    $('#' + Id).removeClass("error");
                    isErrorPONumber = false;
                }
            } else {
                $('#' + Id).val("");
            }
            return isValid;
        }
    },
    isAnyPOEmpty: function () {
        var gridCount = jQuery("#jqGrid").jqGrid('getGridParam', 'data').length
        var grdiData = jQuery("#jqGrid").jqGrid('getGridParam', 'data');
        var rowCount = 0;
        var poCount = 0;
        var poNos = [];
        var errMsg = "";

        for (var i = 0; i < gridCount; i++) {
            var row = grdiData[i];
            if (row.TagDocumentDetailsID != "") {
                if (row.PO == "") {
                    rowCount++;
                }
                else {
                    rowCount++;
                    poCount++;
                    poNos.push(row.PO);
                }
            }
        }

        //var POType = $("#IndexPivot_Invoice_Type").val() == '<select>' ? '' : $("#IndexPivot_Invoice_Type").val();
        var POType = $("#IndexPivot_Invoice_Type").val();
        var invalidPos = POType == 'po' ? apinvoiceDetails.inValidPONumbers(poNos) : '';
        if (invalidPos != '') {
            errMsg = 'Invalid PO Numbers ' + invalidPos;
        }
        else {

            if (poNos.length > 0 && rowCount != poCount) {
                errMsg = "PO Number can not be empty in GL Account details";
            }
        }

        return errMsg;
    },
    inValidPONumbers: function () {
        var inValidPos = '';
        if (poNos.length > 0) {
            var strPonos = ''
            for (var i = 0; i < poNos.length; i++) {
                strPonos += '' + poNos[i] + ',';
            }
            inValidPos = apinvoiceDetails.getInValidPONumbers(strPonos.substring(0, strPonos.length - 1));
        }
        return inValidPos;
    },

    loadGrid: function () {
        $("#jqGrid").jqGrid({
            datatype: "local",
            data: data,
            colModel: apinvoiceDetails.getGridColumns(),
            viewrecords: true,
            loadonce: true,
            //sortable: true,
            loadComplete: function () { apinvoiceDetails.setGridPageCount(); },
            onPaging: function () {
                var grid = jQuery("#jqGrid");
                var lastpage = $('#jqGrid').getGridParam('lastpage');
                var curpage = parseInt($(".ui-pg-input").val());

                //if (curpage > lastpage) {
                //    return false;
                //}
                var editrowid = $('.inline-edit-cell').parent().parent().prop('id');
                grid.jqGrid('saveRow', editrowid, false, 'clientArray');


            },
            onSelectRow: apinvoiceDetails.editRow,
            height: 'auto',
            rowList: [10, 25, 50, 100],
            rowNum: 10,
            width: '1240',
            onSortCol: function (index, columnIndex, sortOrder) {
                //alert(index);
                // return 'stop';
            },
            gridcomplete: function () {
                //apinvoicedetails.editlastrow();
            },
            pager: "#jqGridPager"
        });

        $("#jqGrid").trigger("resize");
    },
    loadGLData: function (request, response) {
        request.term = request.term.trim();
        if (request.term != '') {

            var url = "/APInvoiceDC/GetGLAccountsJson?PreText=" + request.term + '&gLCodePrefix=' + apinvoice.getGLPrefix();
            if ($('#IndexPivot_PANumber').length > 0 && $('#IndexPivot_PANumber').val() != null && $('#IndexPivot_PANumber').val() != '') {
                var poType = " ";
                url = "/POAuthDC/GetPOAuthGLAccountsJson?PreText=" + request.term + "&PaNumber=" + $('#IndexPivot_PANumber').val().trim() + "&SiteId=" + $('#IndexPivot_SiteID').val().trim() + "&PoType=" + poType;
            }
            MakeAjaxCall_WithDependantSource(REQUESTGET, url, null, apinvoice.bindAutocompleteTextboxAdd, apinvoice.onFailure_WithDependantSource, apinvoice.onError_WithDependantSource, response);
        }
    },
    loadPONumbers: function (request, response) {
        request.term = request.term.trim();
        if (request.term != '') {
            var url = '/APInvoiceDC/GetSearchValue_PONumberForGrid?searchValue=' + request.term.toLowerCase();
            MakeAjaxCall_WithDependantSource(REQUESTGET, url, null, apinvoiceDetails.bindAutoCompletePONumbers, apinvoice.onFailure_WithDependantSource, apinvoice.onError_WithDependantSource, response);
        }
    },

    newrow: function (obj, isExcel) {
        var newid = 0;
        var grid = $("#jqGrid");
        var length = jQuery("#jqGrid").jqGrid('getGridParam', 'records');

        var dataobj = grid.jqGrid('getGridParam', 'data');
        var arrIds = [];
        arrIds = dataobj.map(function (e) { return e.rowid });
        if (arrIds.length > 0) {
            newid = arrIds.reduce(function (a, b) { return Math.max(a, b); });
        }
        var unAllocBal = $('#UnAllocatedBalance').text() || 0;
        var invPrice = 0, extendPrice = 0;
        // if (unAllocBal > 0) {
        invPrice = unAllocBal;
        extendPrice = AccountAssignmentDefault * invPrice;
        // }

        var row = {
            IsPORow: "",
            TagDocumentDetailsID: "",
            Actionstatus: 1,
            ExpenseAccountNumber: "",
            ExpenseAccountDescription: "",
            POQty: "",
            POPrice: "",
            ExtendedCost: "",
            ReceivingQty: AccountAssignmentDefault, //AccountAssignmentDefault,
            InvoiceQty: AccountAssignmentDefault,   //AccountAssignmentDefault,
            InvoicePrice: invPrice,
            POExtendedPrice: extendPrice,
            Difference: "",
            DetTaxAmount: "",
            DetFreightAmount: "",
            DetMiscAmount: "",
            rowid: parseInt(newid) + 1
        };
        if (isExcel) {
            row["ExpenseAccountNumber"] = obj.ExpenseAccountNumber;
            row["ExpenseAccountDescription"] = obj.ExpenseAccountDescription;
            row["ReceivingQty"] = obj.ReceivingQty;
            row["InvoiceQty"] = obj.InvoiceQty;
            row["InvoicePrice"] = obj.InvoicePrice;
        }

        return row;
    },

    onSuccessAddDetail: function (response, dependantSource) {
        var grid = $("#jqGrid");
        if (response > 0) {

            dependantSource.obj.TagDocumentDetailsID = response;
            var id = dependantSource.currentRowIndex;

            grid.jqGrid('setCell', id, 'IsPORow', false);
            grid.jqGrid('setCell', id, 'TagDocumentDetailsID', response);
            grid.jqGrid('setCell', id, 'POItemDescription', dependantSource.obj.POItemDescription);
            grid.jqGrid('saveRow', id, false, 'clientArray');
            grid.jqGrid('restoreRow');

            apinvoiceDetails.calculateUnAllocatedBalanceJqGrid();
            apinvoiceDetails.addEmptyRow();
        }
    },
    onSuccessUpdateDetail: function (response, dependantSource) {
        var grid = $("#jqGrid");
        rowindex = dependantSource.currentRowIndex;
        apinvoiceDetails.calculateUnAllocatedBalanceJqGrid();
        var wf = (jsonHeaderParams.WF || "").toLowerCase();
        if (wf == "yes" && utility.getIsVisibleField(fieldRules, 'GridRowPODetailAddButton') == false) {
            apinvoiceDetails.setUnallocatedBalancetoLastRow();
            var data = jQuery("#jqGrid").jqGrid('getGridParam', 'data');
            $("#jqGrid").jqGrid('editRow', data.length);
        }

    },
    onSuccessDeleteDetail: function (response, dependantSource) {
        var id = dependantSource.currentRowIndex;
        var row = $('#jqGrid').jqGrid('getRowData', id);
        $('#jqGrid').jqGrid('delRowData', id);

        var data = jQuery("#jqGrid").jqGrid('getGridParam', 'data');
        for (var i = 0; i < data.length; i++) {
            data[i].rowid = i + 1;
            data[i].id = i + 1;
        }
        var curpage = parseInt($(".ui-pg-input").val());
        jQuery('#jqGrid').jqGrid('clearGridData');
        jQuery('#jqGrid').jqGrid('setGridParam', { data: data });
        $("#jqGrid").trigger("reloadGrid", [{ page: curpage }]);
        $("#jqGrid").trigger("reloadGrid", [{ page: curpage }]);
        // lastSelection = id;

        apinvoiceDetails.calculateUnAllocatedBalanceJqGrid();
        var wf = (jsonHeaderParams.WF || "").toLowerCase();
        if (wf == "yes" && utility.getIsVisibleField(fieldRules, 'GridRowPODetailAddButton') == false) {
            apinvoiceDetails.setUnallocatedBalancetoLastRow();
            $("#jqGrid").jqGrid('editRow', data.length);
        }

        lastSelection = "";
    },
    OnSuccessDeteleAllDetails: function () {
        var curpage = parseInt($(".ui-pg-input").val());
        jQuery('#jqGrid').jqGrid('clearGridData');
        $("#jqGrid").trigger("reloadGrid", [{ page: curpage }]);
        apinvoiceDetails.calculateUnAllocatedBalanceJqGrid();
        apinvoiceDetails.setUnallocatedBalancetoLastRow();
        var wf = (jsonHeaderParams.WF || "").toLowerCase();
        if (wf == "yes" && utility.getIsVisibleField(fieldRules, 'GridRowPODetailAddButton') == false)
            apinvoiceDetails.addEmptyRow();
    },

    resetPreviousRow: function (editrowid) {
        var grid = $("#jqGrid"), gridlength = grid.jqGrid('getGridParam', 'data').length;
        if (gridlength == editrowid && lastSelection != "") {

            var row = grid.jqGrid('getRowData', lastSelection);
            grid.jqGrid('setCell', lastSelection, 'POItemDescription', row.POItemDescription);

            if (row.TagDocumentDetailsID != "") {
                if (apinvoiceDetails.validateGridRow()) {

                    apinvoiceDetails.calDifference(lastSelection);
                    apinvoiceDetails.addGridRow(lastSelection, 'Update');

                    grid.jqGrid('saveRow', lastSelection, false, 'clientArray');
                    grid.jqGrid('restoreRow', lastSelection);
                    lastSelection = "";
                }
            }
            if (isErrorGLCode) {
                isErrorGLCode = false
            }
        }
    },

    setUnallocatedBalancetoLastRow: function () {
        var grdiData = jQuery("#jqGrid").jqGrid('getGridParam', 'data');
        var unAlloBAl = $('#UnAllocatedBalance').text();
        var editrowid = $('.inline-edit-cell').parent().parent().prop('id');

        if (grdiData.length != editrowid) {
            $("#jqGrid").jqGrid('editRow', grdiData.length);
        }
        editrowid = $('.inline-edit-cell').parent().parent().prop('id');
        if (editrowid > 0) {
            //if (parseFloat(unAlloBAl) >= 0) {
            var invQty = $('#' + grdiData.length + '_InvoiceQty').val() || 0;
            $('#' + grdiData.length + '_InvoicePrice').val(unAlloBAl);
            $("#jqGrid").jqGrid('setCell', grdiData.length, 'POExtendedPrice', parseFloat(invQty) * parseFloat(unAlloBAl));

            // } else {
            //   $('#' + grdiData.length + '_InvoicePrice').val(0);
            //    $("#jqGrid").jqGrid('setCell', grdiData.length, 'POExtendedPrice', 0);
            // }
        }
    },

    setGridPageCount: function () {
        var grid = $("#jqGrid"), gridData = grid.jqGrid('getGridParam', 'data'), gridCount = 0;
        gridData.forEach(function (item, index) {
            if (parseInt(item.TagDocumentDetailsID) > 0) {
                gridCount++;
            }
        });
        $('.ui-paging-info').html('Total Records: ' + gridCount);

    },

    validateGridRow: function () {
        var isValid = false;
        if (isErrorGLCode == false && isErrorPONumber == false) {
            isValid = true;
            isErrorGridLine = false;
        }
        return isValid;
    },

}

apinvoiceDetails.init();


