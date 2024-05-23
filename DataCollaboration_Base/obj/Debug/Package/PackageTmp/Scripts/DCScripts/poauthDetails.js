var isErrorGridLine = false;
$(function () {
    var row = {
        TagdocumentPOAuthDetailsID: "",
        Actionstatus: 1,
        Quantity: "",
        ExpenseAccountNumber: "",
        ItemNumber: "",
        ItemDescription: "",
        Budget: "",
        Unbudgeted: "",
        UnitPrice: "",
        LineTotal: "",
        rowid: JsonDetailsData.length + 1
    };

    var data = JsonDetailsData;
    for (var i = 0; i < data.length; i++) {
        data[i].rowid = i + 1;
    }
    var lastSelection, timer;


    $('.dataTables_wrapper').css('overflow', '');
    //$('.ui-jqgrid-bdiv').css('overflow', '');

    var itemNumberEdit = false;
    var itemDescriptionEdit = false;
    var quantityEdit = false;
    var unitPriceEdit = false;
    var gLEdit = false;

    var itemNumberHidden = false;
    var itemDescriptionHidden = false;
    var quantityHidden = false;
    var unitPriceHidden = false;
    var gLHidden = false;
    var IsDeleteDetailsHidden = false;
    //---------------------------

    for (var i in fieldRules) {

        if (fieldRules[i].FieldName == "ItemNumber") {
            itemNumberEdit = (fieldRules[i].FieldName == "ItemNumber") ? !fieldRules[i].IsReadOnly : false;
            itemNumberHidden = (fieldRules[i].FieldName == "ItemNumber") ? !fieldRules[i].IsVisible : false;
        }
        if (fieldRules[i].FieldName == "ItemDescription") {
            itemDescriptionEdit = (fieldRules[i].FieldName == "ItemDescription") ? !fieldRules[i].IsReadOnly : false;
            itemDescriptionHidden = (fieldRules[i].FieldName == "ItemDescription") ? !fieldRules[i].IsVisible : false;
        }
        if (fieldRules[i].FieldName == "Quantity") {
            quantityEdit = (fieldRules[i].FieldName == "Quantity") ? !fieldRules[i].IsReadOnly : false;
            quantityHidden = (fieldRules[i].FieldName == "Quantity") ? !fieldRules[i].IsVisible : false;
        } if (fieldRules[i].FieldName == "UnitPrice") {
            unitPriceEdit = (fieldRules[i].FieldName == "UnitPrice") ? !fieldRules[i].IsReadOnly : false;
            unitPriceHidden = (fieldRules[i].FieldName == "UnitPrice") ? !fieldRules[i].IsVisible : false;
        } if (fieldRules[i].FieldName == "GLCode") {
            GLCodeEdit = (fieldRules[i].FieldName == "GLCode") ? !fieldRules[i].IsReadOnly : false;
            GLCodeHidden = (fieldRules[i].FieldName == "GLCode") ? !fieldRules[i].IsVisible : false;
        }
        if (fieldRules[i].FieldName == "LineTotal") {
            LineTotalEdit = (fieldRules[i].FieldName == "LineTotal") ? !fieldRules[i].IsReadOnly : false;
            LineTotalHidden = (fieldRules[i].FieldName == "LineTotal") ? !fieldRules[i].IsVisible : false;
        }

        if (fieldRules[i].FieldName == "IsDeleteDetails") {
            IsDeleteDetailsHidden = (fieldRules[i].FieldName == "IsDeleteDetails") ? fieldRules[i].IsReadOnly : true;
        }

    }

    //---------------------------

    var grid = jQuery("#jqGrid");

    var dataObj = {

        Init: function () {

            $.jgrid.defaults.width = 1057;
            $.jgrid.defaults.responsive = true;
            $.jgrid.defaults.styleUI = 'Bootstrap';
            $("#txtSearch").on("keyup", function () {
                var self = this;
                if (timer) { clearTimeout(timer); }
                timer = setTimeout(function () {
                    $("#jqGrid").jqGrid('filterInput', self.value);
                }, 0);
            });

            $("#txtDiscount").val(JsonHeaderData.Discount);
            $("#txtSubtotal").val(JsonHeaderData.SubTotal);
            $("#txtSalesTax").val(JsonHeaderData.SalesTax);
            $("#txtFreight").val(JsonHeaderData.Freight);
            $("#txtOther").val(JsonHeaderData.Others);
            $("#txtTotal").val(JsonHeaderData.Total);

            $('.cal_total').keypress(function (e) {
                return ValidDecimal(e, this, 1);
            }).blur(function () {
                GrandTotal();
            });

            $('.cal_total_grid').keypress(function (e) {
                if (this.id == 'footerQuantity') {
                    return ValidNumber(e, this);
                } else {
                    return ValidDecimal(e, this, 2);
                }
            }).blur(function () {
                if (this.value != "") {
                    this.value = parseFloat((this.value.length == 1 && this.value == ".") ? "0.00" : this.value);
                }
                var qty = $('#footerQuantity').val();
                var price = $('#footerUnitPrice').val();

                if (qty == '' || price == '') {
                    $('#footerTotal').val('');
                } else {
                    var total = qty * price;
                    $('#footerTotal').val(total.toFixed(2));
                    //if (total % 1 != 0) {
                    //    $('#footerTotal').val(total.toFixed(2));
                    //}else
                    //$('#footerTotal').val(total);
                }
            });

            dataObj.loadGrid();

            GrandTotal();

            if (IsDeleteDetailsHidden) {
                $('#footerNewRow').hide();
            }
            //$(window).on('load', function () {
            //     window.scrollTo(0, 0);
            //  });
            $('#footerGlCode').autocomplete({
                source: dataObj.loadGLData,
                autoFocus: true,
                select: function (event, ui) {
                    var item = ui.item.label;
                    if (item.split('---').length > 0) {
                        this.value = item.split('---')[0].trim();
                        //  $(this).parent().next('td').next('td').text(item.split('---')[1].trim());
                    }

                }
            });

            $('#footerGlCode').blur(function () {
                if ($('#footerGlCode').val().trim() != '') {
                    isValidGLCode($('#footerGlCode').val(), 'footerGlCode');
                }
            });

            $('.ui-pg-input').keypress(function (e) {
                var res = true;
                var lastpage = $('#jqGrid').getGridParam('lastpage');
                var charCode = (e.which) ? e.which : e.keyCode
                if (charCode == 13) {
                    if (parseInt(this.value) > lastpage) {
                        res = false;
                    }
                } else {
                    res = ValidDecimal(e, this);
                }
                return res;
            });

            $('.footer-valid').click(function () {
                var editrowid = $('.inline-edit-cell').parent().parent().prop('id');
                if (!isErrorGridLine) {
                    $("#jqGrid").jqGrid('saveRow', editrowid);
                    $("#jqGrid").jqGrid('restoreRow', editrowid);
                    lastSelection = "";
                }
            });

            $(document).click(function (e) {
                if (($(e.target).closest(".dataTables_wrapper").attr("class") != "dataTables_wrapper")) {
                    if (($(e.target).closest(".ui-menu-itemr").attr("class") != "ui-menu-item")) {
                        var editrowid = $('.inline-edit-cell').parent().parent().prop('id');
                        var row = jQuery("#jqGrid").jqGrid('getRowData', lastSelection);
                        if (!isErrorGridLine) {
                            $("#jqGrid").jqGrid('saveRow', editrowid);
                            $("#jqGrid").jqGrid('restoreRow', editrowid);
                            lastSelection = "";
                        }
                    }
                }

            });
            var flagAdd = 0;
            $('#lnkAddRow').click(function () {
                flagAdd++;
                $('#lnkAddRow').attr('disabled', 'disabled');
                if (flagAdd == 1) {
                    setTimeout(function () {
                        addRowNew();
                        $('#lnkAddRow').removeAttr('disabled', 'disabled');
                        flagAdd = 0;
                    }, 2000);
                }
            });

        },
        loadGrid: function () {
            $("#jqGrid").jqGrid({
                datatype: "local",
                data: data,
                colModel: [
                    { label: 'rowid', name: 'rowid', width: 75, editable: false, key: true, hidden: true },
                    { label: 'Actionstatus', name: 'TagdocumentPOAuthDetailsID', hidden: true },
                    {
                        label: 'GL Code', name: 'ExpenseAccountNumber', editable: GLCodeEdit, width: 300, classes: 'PL5,classglCode',
                        editoptions: {
                            dataInit: function (elem) {
                                elem.style.padding = '5px';
                                $(elem).autocomplete({
                                    source: dataObj.loadGLData,
                                    autoFocus: true,
                                    select: function (event, ui) {
                                        var item = ui.item.label;
                                        if (item.split('---').length > 0) {
                                            this.value = item.split('---')[0].trim();
                                            //  $(this).parent().next('td').next('td').text(item.split('---')[1].trim());
                                            isErrorGridLine = true;
                                        }
                                    }
                                })
                                $(elem).blur(function () {

                                    //if (this.value.trim() != '') {

                                    if (isValidGLCode(this.value, this.id, this)) {
                                        isCellValidate(this, 'ExpenseAccountNumber');
                                    }

                                    //} else {
                                    //    $('#' + this.id).addClass("error");
                                    //}
                                })

                                $(elem).focus(function () {
                                    $(this).select();
                                });

                            },
                            //dataEvents: [{ type: 'blur', fn: function (e) { isCellValidate(this, 'ExpenseAccountNumber'); } }]
                        }
                    },
                    {
                        label: 'Item Number', name: 'ItemNumber', width: 200, editable: itemNumberEdit, classes: 'PL5', editoptions: {
                            dataInit: function (e) {
                                e.style.padding = '5px';
                            },
                            dataEvents: [{ type: 'blur', fn: function (e) { isCellValidate(this, 'ItemDescription'); } }]
                        }
                    },
                    {
                        label: 'Item Description', name: 'ItemDescription', width: 300, editable: itemDescriptionEdit, classes: 'PL5', editoptions: {
                            dataInit: function (e) {
                                e.style.padding = '5px';
                            },
                            dataEvents: [{ type: 'blur', fn: function (e) { isCellValidate(this, 'ItemDescription'); } }]
                        }
                    },
                    {
                        label: 'Quantity', name: 'Quantity', editable: quantityEdit, align: 'right', sorttype: "number", classes: 'PR5', editoptions: {
                            dataInit: function (e) {
                                e.style.textAlign = 'right'; e.style.padding = '5px';
                            },
                            dataEvents: [{ type: 'keypress', fn: function (e) { return ValidDecimal(e, this, 0); } },
                            { type: 'blur', fn: function (e) { isCellValidate(this, 'Quantity'); } }]
                        }
                    },
                    {
                        label: 'Unit Price', name: 'UnitPrice', editable: unitPriceEdit, align: 'right', sorttype: "number", formatter: 'number', formatoptions: { decimalPlaces: 3 }, classes: 'PR5', editoptions: {
                            dataInit: function (e) {
                                e.style.textAlign = 'right'; e.style.padding = '5px';
                            },
                            dataEvents: [{ type: 'keypress', fn: function (e) { return ValidDecimal(e, this, 2); } },
                            { type: 'blur', fn: function (e) { isCellValidate(this, 'UnitPrice'); } }]
                        }
                    },
                    {
                        label: 'Total', name: 'LineTotal', editable: LineTotalEdit, align: 'right', sorttype: "number", formatter: 'number', formatoptions: { decimalPlaces: 2 }, classes: 'PR5', editoptions: {
                            dataInit: function (e) {
                                e.style.textAlign = 'right'; e.style.padding = '5px';
                            }, disabled: true
                        }
                    },
                    { label: 'Actionstatus', name: 'Actionstatus', editable: false, hidden: true },
                    { label: '', name: '', width: 75, formatter: dataObj.actionLink, align: 'center', hidden: IsDeleteDetailsHidden },
                ],
                viewrecords: true,
                loadonce: true,
                // sortable: true,
                loadComplete: function () {

                },
                onPaging: function () {

                    var lastpage = $('#jqGrid').getGridParam('lastpage');
                    var curpage = parseInt($(".ui-pg-input").val());

                    if (curpage > lastpage) {
                        return false;
                    }

                    var editrowid = $('.inline-edit-cell').parent().parent().prop('id');
                    grid.jqGrid('saveRow', editrowid);

                    // grid.jqGrid('saveRow', lastSelection);
                    //grid.jqGrid('restoreRow', lastSelection);
                },
                onSelectRow: dataObj.editRow,
                height: 'auto',
                // height: 200,
                rowList: [10, 25, 50, 100],
                rowNum: 10,
                width: 1232,                
                onSortCol: function (index, columnIndex, sortOrder) {
                    //alert(index);
                    // return 'stop';
                },
                gridComplete: function () {
                    // alert("I'm about to HIDE the loading message");

                },
                //autowidth: true,
                pager: "#jqGridPager"                
            });

            $("#jqGrid").trigger("resize");
        },

        editRow: function (id, iRow, iCol, e) {
            if (!isErrorGridLine) {
                $('#' + id).removeClass('success');
                if (id && id !== lastSelection) {

                    //if (!isValidEditRow(lastSelection)) {
                    if (!isValidfootertRow()) {
                        return false;
                    };
                    var editrowid = $('.inline-edit-cell').parent().parent().prop('id');
                    grid.jqGrid('saveRow', editrowid);

                    grid.jqGrid('saveRow', lastSelection);
                    grid.jqGrid('restoreRow', lastSelection);
                }

                $("#jqGrid").jqGrid('editRow', id);
                //  $("input, select", iCol.target).focus();

                lastSelection = id;
            }
        },

        addEmptyRow: function () {
            var grid = $("#jqGrid");
            var rowsperPage = parseInt(grid.getGridParam('rowNum'));
            var gridlength = grid.jqGrid('getGridParam', 'data').length;
            var curpage = parseInt($(".ui-pg-input").val());
            var totPages = Math.ceil(gridlength / rowsperPage);

            if (rowsperPage * totPages == gridlength) {
                var id = $('.inline-edit-cell').parent().parent().prop('id');
                grid.jqGrid('saveRow', id);
                var row = dataObj.newrow();

                var newRowId = row.rowid;
                grid.jqGrid('addRowData', newRowId, row);
                grid.trigger('reloadGrid');
                lastSelection = newRowId;
                grid.jqGrid('saveRow', lastSelection);
                grid.jqGrid('restoreRow', lastSelection);
                $('.glyphicon-step-forward').trigger('click');
            } else {
                $('.glyphicon-step-forward').trigger('click');
                var row = dataObj.newrow();
                var newRowId = row.rowid;
                grid.jqGrid('addRowData', newRowId, row);
            }

            lastSelection = newRowId;
            grid.jqGrid('saveRow', lastSelection);
            grid.jqGrid('restoreRow', lastSelection);

            var eid = $('.inline-edit-cell').parent().parent().prop('id')
            grid.jqGrid('saveRow', eid);
            grid.jqGrid('restoreRow', eid);
            grid.jqGrid('editRow', newRowId);
        },

        actionLink: function (cellValue, options, rowdata, action) {

            if (rowdata.TagdocumentPOAuthDetailsID == "") {
                return "<a href='javascript:addRow(" + options.rowId + ")' title='add record' class='glyphicon glyphicon-plus-sign'>";
            }
            else {
                return "<a href='javascript:deleteRecord(" + options.rowId + ")' title='delete record' class='glyphicon glyphicon-trash' style='color: red;'></a>";
            }
        },

        loadGLData: function (request, response) {

            var paNumber = $("#IndexPivot_PANumber").val().trim();
            var siteId = $("#IndexPivot_SiteID").val().trim();
            var poType = $("#IndexPivot_POType").val().trim();

            if (siteId == "<select>") {
                siteId = "";
            }

            if (paNumber == "" && $('#lblPONumber').text().substring(0, 2) == "DA") {
                var errMsg = "";
                if (siteId == "" || siteId == '<select>' || siteId == '0') {
                    errMsg = "SiteID is mandatory " + "<br>"
                }
                if (poType == "") {
                    errMsg += "Po Type is mandatory"
                }
                if (errMsg != '') {
                    $('.alert').hide();
                    Notify(errMsg, null, null, 'danger');
                    return false
                }
            }
            //} else {
            var url = "/POAuthDC/GetPOAuthGLAccountsJson?PreText=" + this.term + "&PaNumber=" + paNumber + "&SiteId=" + siteId + "&PoType=" + poType;
            MakeAjaxCall_WithDependantSource(requestGET, url, null, poauth.BindAutocompleteTextbox, poauth.OnFailure_WithDependantSource, poauth.OnError_WithDependantSource, response);
            //}
        },

        newrow: function () {

            var newid = 0;
            var grid = $("#jqGrid");
            var length = jQuery("#jqGrid").jqGrid('getGridParam', 'records');

            var dataobj = grid.jqGrid('getGridParam', 'data');
            var arrIds = [];
            arrIds = dataobj.map(function (e) { return e.rowid });
            if (arrIds.length > 0) {
                newid = arrIds.reduce(function (a, b) { return Math.max(a, b); });
            }
            var row = {
                TagdocumentPOAuthDetailsID: "",
                Actionstatus: 1,
                Quantity: "",
                ExpenseAccountNumber: "",
                ItemNumber: "",
                ItemDescription: "",
                Budget: "",
                Unbudgeted: "",
                UnitPrice: "",
                LineTotal: "",
                rowid: newid + 1
            };
            return row;
        }

    }

    dataObj.Init();

    //$("#jqGrid").jqGrid("columnChooser", {
    //    done: function () {
    //        $("#jqGrid").trigger("resize");
    //    }
    //});

});

function deleteRecord(id) {
    var result = confirm("Are you sure you Want to delete?");
    if (result == true) {

        //var ediId = $('.inline-edit-cell').parent().parent().prop('id');
        //grid.jqGrid('saveRow', ediId);
        //var rowData = grid.jqGrid('getRowData', ediId);
        //if (rowData.rowid > 0 && rowData.Actionstatus != 1) {
        //    rowData.Actionstatus = 2;
        //    grid.jqGrid('getGridParam', 'data')[ediId - 1] = rowData;
        //}

        DeleteRow(id);
    }
}

function isValidEditRow(lastSelection) {

    var row = $('#jqGrid').jqGrid('getRowData', lastSelection);

    var quantity = ($("#" + lastSelection + "_Quantity").val());
    var budget = ($("#" + lastSelection + "_Budget").val());
    var unbudgeted = ($("#" + lastSelection + "_Unbudgeted").val());
    var unitPrice = ($("#" + lastSelection + "_UnitPrice").val());
    var itemNumber = $("#" + lastSelection + "_ItemNumber").val();
    var expenseAccountNumber = $("#" + lastSelection + "_ExpenseAccountNumber").val();
    var itemDescription = $("#" + lastSelection + "_ItemDescription").val();

    // if ($("tr#" + lastSelection).attr("editable") === "1" && parseInt(row.TagdocumentPOAuthDetailsID || 0) == 0) {
    if ($("tr#" + lastSelection).attr("editable") === "1") {

        if (parseInt(row.TagdocumentPOAuthDetailsID || 0) == 0) {
            if (quantity.length > 0 || unitPrice.length || 0 && itemNumber.length > 0 || expenseAccountNumber.length > 0 || itemDescription.length > 0) {
                $('.editable.inline-edit-cell').each(function () {
                    if ($(this).val().length == 0 && this.disabled == false) {
                        $(this).addClass("error");
                    }
                });
                return false;
            }
        } else {
            if (quantity.length == 0 || unitPrice.length == 0 || itemNumber.length == 0 || expenseAccountNumber.length == 0 || itemDescription.length == 0) {
                $('.editable.inline-edit-cell').each(function () {
                    if ($(this).val().length == 0 && this.disabled == false) {
                        $(this).addClass("error");
                    }
                });
                return false;
            }

        }
    }
    return true;
}

function ValidNumber(e) {
    var charCode = (e.which) ? e.which : e.keyCode;
    var ignoredKeys = [8, 9, 37, 38, 39, 40]; //46
    if (ignoredKeys.indexOf(charCode) >= 0) {
        return true;
    }

    if (charCode == 13 || (charCode > 31 && (charCode < 48 || charCode > 57)))
        return false;
}

function ValidDecimal(evt, element, decimallength) {

    var charCode = (evt.which) ? evt.which : evt.keyCode;
    var ignoredKeys = [8, 9, 37, 38, 40, 46];

    var pos = element.value.indexOf(".");
    var dd = element.value.substring(element.selectionStart, element.selectionEnd);

    //added on 6-7-2019 by venkat --- on issue alowing -ve values
    if (!$(element).closest('td').hasClass('allowNegativeValues') && charCode == 45) {
        return false;
    }

    if (dd.indexOf('.') > -1) {
        return true;
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
        //var pos = element.value.indexOf(".");

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

function isCellValidate(val, fieldName) {
    isErrorGridLine = false;
    var id = $(val).closest('tr').prop('id');
    var oldValue = $("#jqGrid").jqGrid('getGridParam', 'data')[parseInt(id) - 1][fieldName];
    var tagdocumentPOAuthDetailsID = $("#jqGrid").jqGrid('getGridParam', 'data')[parseInt(id) - 1].TagdocumentPOAuthDetailsID || 0;

    if (tagdocumentPOAuthDetailsID > 0) {
        var newValue = (val.value);
        if (newValue != "") {
            $(val).removeClass("error");
            if (oldValue != newValue) {

                if (fieldName == "UnitPrice") {
                    if ($("#" + id + "_UnitPrice").val() == ".") {
                        $("#" + id + "_UnitPrice").val(0);
                    }
                }
                UpdateRow(id);
            }
        } else {
            if (tagdocumentPOAuthDetailsID != "") {
                if (fieldName == "Quantity" || fieldName == "UnitPrice") {
                    $("#" + id + "_LineTotal").val('');
                }
                $(val).addClass("error");
                this.focus();
                isErrorGridLine = true;
            }
        }
    } else {
        if (fieldName == "Quantity" || fieldName == "UnitPrice") {
            CalulateTotal(id);
        }
    }
}

function UpdateRow(id) {

    var row = jQuery("#jqGrid").jqGrid('getRowData', id)
    if (row.TagdocumentPOAuthDetailsID != "") {

        CalulateTotal(id);

        var quantity = parseFloat($("#" + id + "_Quantity").val()) || 0;
        var unitPrice = parseFloat($("#" + id + "_UnitPrice").val()) || 0;
        var itemNumber = $("#" + id + "_ItemNumber").val();
        var expenseAccountNumber = $("#" + id + "_ExpenseAccountNumber").val();
        var itemDescription = $("#" + id + "_ItemDescription").val();

        var discount = parseFloat($("#txtDiscount").val()) || 0;
        var subTotal = parseFloat($("#txtSubtotal").val()) || 0;
        var salesTax = parseFloat($("#txtSalesTax").val()) || 0;
        var freight = parseFloat($("#txtFreight").val()) || 0;
        var other = parseFloat($("#txtOther").val()) || 0;

        var obj = {};
        obj.workFlowId = workFlowId;
        obj.nodeId = nodeId;
        obj.RowStatus = 'Update';
        obj.DocumentID = $("#docId").val();
        obj.TagdocumentPOAuthDetailsID = row.TagdocumentPOAuthDetailsID;

        obj.Quantity = quantity;
        obj.ExpenseAccountNumber = expenseAccountNumber;
        obj.ItemNumber = itemNumber;
        obj.ItemDescription = itemDescription;
        obj.UnitPrice = unitPrice;
        //  obj.LineTotal = quantity * unitPrice;

        obj.Discount = discount;
        obj.SubTotal = subTotal;
        obj.SalesTax = salesTax;
        obj.Freight = freight;
        obj.Other = other;

        var jsonString = JSON.stringify(obj);
        var url = '/POAuthDC/SaveTagDocumentDetail';
        var dependantObj = {};
        dependantObj.obj = obj;
        dependantObj.currentRowIndex = id;
        MakeAjaxCall_WithDependantSource(requestPOST, url, jsonString, OnSuccessUpdateDetail, poauth.OnFailure_WithDependantSource, poauth.OnError_WithDependantSource, dependantObj);

    } else {
        CalulateTotal(id);
    }
}

function CalulateTotal(id) {
    var quantity = parseFloat($("#" + id + "_Quantity").val()) || 0;
    var unitPrice = parseFloat($("#" + id + "_UnitPrice").val()) || 0;
    var discount = parseFloat($("#txtDiscount").val()) || 0;
    var subTotal = parseFloat($("#txtSubtotal").val()) || 0;
    var salesTax = parseFloat($("#txtSalesTax").val()) || 0;
    var freight = parseFloat($("#txtFreight").val()) || 0;
    var other = parseFloat($("#txtOther").val()) || 0;
    var lineTotal, total;

    //if (quantity == 0 || unitPrice == 0) {

    //} else {
    lineTotal = (quantity) * (unitPrice);
    $("#" + id + "_LineTotal").val(lineTotal.toFixed(2));
    GrandTotal();
    // }
}

function GrandTotal() {

    var discount = parseFloat($("#txtDiscount").val()) || 0;
    var subTotal = parseFloat($("#txtSubtotal").val()) || 0;
    var salesTax = parseFloat($("#txtSalesTax").val()) || 0;
    var freight = parseFloat($("#txtFreight").val()) || 0;
    var other = parseFloat($("#txtOther").val()) || 0;
    var lineTotal = 0, total = 0;

    var gridCount = jQuery("#jqGrid").jqGrid('getGridParam', 'data').length
    var grdiData = jQuery("#jqGrid").jqGrid('getGridParam', 'data');
    for (var i = 0; i < gridCount; i++) {
        // var row = $('#jqGrid').jqGrid('getRowData', i);
        var row = grdiData[i];
        if ($("tr#" + row.rowid).attr("editable") === "1" && parseInt(row.TagdocumentPOAuthDetailsID) > 0) {
            total += parseFloat($("#" + row.rowid + "_LineTotal").val());
        } else
            total += parseFloat(row.LineTotal || 0);
    }

    $("#txtDiscount").val(discount.toFixed(2));
    $("#txtSalesTax").val(salesTax.toFixed(2));
    $("#txtFreight").val(freight.toFixed(2));
    $("#txtOther").val(other.toFixed(2));

    $("#txtLineTotal").val(total.toFixed(2));
    subTotal = total - discount;
    $("#txtSubtotal").val(subTotal.toFixed(2));
    finalTotal = subTotal + (salesTax + freight + other);
    $("#txtTotal").val(finalTotal.toFixed(2));

}

function addRowNew(id) {
    $('#lnkAddRow').prop('disabled', true);
    var grid = $("#jqGrid");
    var gridCount = jQuery("#jqGrid").jqGrid('getGridParam', 'data').length;
    var lastrow;

    var editrowid = $('.inline-edit-cell').parent().parent().prop('id');
    $("#jqGrid").jqGrid('saveRow', editrowid);
    $("#jqGrid").jqGrid('restoreRow', editrowid);
    lastSelection = "";

    var quantity = $("#footerQuantity").val();
    var unitPrice = $("#footerUnitPrice").val();
    var itemNumber = $("#footerItemNumber").val();
    var expenseAccountNumber = $("#footerGlCode").val();
    var itemDescription = $("#footerItemDescription").val();
    var lineTotal = $("#footerTotal").val();

    if (quantity.length > 0 && unitPrice.length > 0 && itemNumber.length > 0 && expenseAccountNumber.length > 0 && itemDescription.length > 0) {

        if (isValidGLCode(expenseAccountNumber, 'footerGlCode')) {
            var row = [];

            row.ExpenseAccountNumber = expenseAccountNumber;
            row.ItemNumber = itemNumber;
            row.ItemDescription = itemDescription;

            row.Quantity = quantity || 0;
            row.UnitPrice = unitPrice || 0;
            row.LineTotal = lineTotal || 0;

            var obj = {};
            obj.workFlowId = workFlowId;
            obj.nodeId = nodeId;
            obj.RowStatus = 'Add';
            obj.DocumentID = $("#docId").val();
            obj.Quantity = row.Quantity || 0;
            obj.ExpenseAccountNumber = row.ExpenseAccountNumber;
            obj.ItemNumber = row.ItemNumber;
            obj.ItemDescription = row.ItemDescription;
            obj.UnitPrice = row.UnitPrice || 0;

            var jsonString = JSON.stringify(obj);
            var url = '/POAuthDC/SaveTagDocumentDetail';
            var dependantObj = {};
            dependantObj.obj = obj;
            dependantObj.currentRowIndex = id;
            dependantObj.source = row;
            MakeAjaxCall_WithDependantSource(requestPOST, url, jsonString, OnSuccessAddDetail, poauth.OnFailure_WithDependantSource, poauth.OnError_WithDependantSource, dependantObj);
        } else {
            $('#footerGlCode').addClass("error");
        }
    }
    else {
        $('.footer-valid').each(function () {
            if ($(this).val().length == 0 && this.disabled == false) {
                $(this).addClass("error");
            } else {
                $(this).removeClass("error");
            }
        });
        // return false;
    }

}

function addRow(id) {
    var grid = $("#jqGrid");
    var gridCount = jQuery("#jqGrid").jqGrid('getGridParam', 'data').length;
    var lastrow;

    var quantity = ($("#" + id + "_Quantity").val());
    var unitPrice = ($("#" + id + "_UnitPrice").val());
    var itemNumber = $("#" + id + "_ItemNumber").val();
    var expenseAccountNumber = $("#" + id + "_ExpenseAccountNumber").val();
    var itemDescription = $("#" + id + "_ItemDescription").val();

    var paNumber = $("#IndexPivot_PANumber").val();
    //if ($("#IndexPivot_PANumber").val().length == 0) {count++; }

    //if (quantity.length > 0 && unitPrice.length > 0 && itemNumber.length > 0 && expenseAccountNumber.length > 0 && itemDescription.length > 0 && count<=1) {
    if (quantity.length > 0 && unitPrice.length > 0 && itemNumber.length > 0 && expenseAccountNumber.length > 0 && itemDescription.length > 0) {
        grid.jqGrid('saveRow', id);
        grid.jqGrid('restoreRow');
        var row = grid.jqGrid('getRowData', id);

        var discount = parseFloat($("#txtDiscount").val()) || 0;
        var subTotal = parseFloat($("#txtSubtotal").val()) || 0;
        var salesTax = parseFloat($("#txtSalesTax").val()) || 0;
        var freight = parseFloat($("#txtFreight").val()) || 0;
        var other = parseFloat($("#txtOther").val()) || 0;

        var obj = {};
        obj.workFlowId = workFlowId;
        obj.nodeId = nodeId;
        obj.RowStatus = 'Add';
        obj.DocumentID = $("#docId").val();

        obj.Quantity = row.Quantity || 0;
        obj.ExpenseAccountNumber = row.ExpenseAccountNumber;
        obj.ItemNumber = row.ItemNumber;
        obj.ItemDescription = row.ItemDescription;
        obj.UnitPrice = row.UnitPrice || 0;


        obj.Discount = discount;
        obj.SubTotal = subTotal;
        obj.SalesTax = salesTax;
        obj.Freight = freight;
        obj.Others = other;

        var jsonString = JSON.stringify(obj);
        var url = '/POAuthDC/SaveTagDocumentDetail';
        var dependantObj = {};
        dependantObj.obj = obj;
        dependantObj.currentRowIndex = id;
        dependantObj.source = row;
        MakeAjaxCall_WithDependantSource(requestPOST, url, jsonString, OnSuccessAddDetail, poauth.OnFailure_WithDependantSource, poauth.OnError_WithDependantSource, dependantObj);

    }
    else {
        $('.editable.inline-edit-cell').each(function () {
            if ($(this).val().length == 0 && this.disabled == false) {
                $(this).addClass("error");
            }
        });
        return false;
    }

}

function OnSuccessAddDetail(response, dependantSource) {

    var grid = $("#jqGrid");
    dependantSource.obj.TagdocumentPOAuthDetailsID = response;
    var id = dependantSource.currentRowIndex;
    var row = generateNewRow();
    var newRowId = row.rowid;

    //row.Actionstatus: 1,
    row.Quantity = dependantSource.source.Quantity;
    row.ExpenseAccountNumber = dependantSource.source.ExpenseAccountNumber;
    row.ItemNumber = dependantSource.source.ItemNumber;
    row.ItemDescription = dependantSource.source.ItemDescription;
    row.UnitPrice = dependantSource.source.UnitPrice;
    row.LineTotal = dependantSource.source.LineTotal;

    row.TagdocumentPOAuthDetailsID = response;

    grid.jqGrid('addRowData', newRowId, row);
    grid.trigger('reloadGrid');

    $('.footer-valid').each(function () {
        $(this).val('');
        if ($(this).val().length == 0 && this.disabled == false) {
            $(this).removeClass("error");
        }
    });
    GrandTotal();
    $('#lnkAddRow').prop('disabled', false);
}

function OnSuccessAddDetail1(response, dependantSource) {

    dependantSource.obj.TagdocumentPOAuthDetailsID = response;
    var id = dependantSource.currentRowIndex;
    $('#jqGrid').jqGrid('setCell', id, 'TagdocumentPOAuthDetailsID', response);
    GrandTotal();

    var grid = $("#jqGrid");
    var rowsperPage = parseInt(grid.getGridParam('rowNum'));
    var gridlength = grid.jqGrid('getGridParam', 'data').length;
    var curpage = parseInt($(".ui-pg-input").val());
    var totPages = Math.ceil(gridlength / rowsperPage);

    if (rowsperPage * totPages == gridlength) {
        var id = $('.inline-edit-cell').parent().parent().prop('id');
        grid.jqGrid('saveRow', id);
        var row = generateNewRow();

        var newRowId = row.rowid;
        grid.jqGrid('addRowData', newRowId, row);
        grid.trigger('reloadGrid');
        lastSelection = newRowId;
        grid.jqGrid('saveRow', lastSelection);
        grid.jqGrid('restoreRow', lastSelection);
        $('.glyphicon-step-forward').trigger('click');
    } else {
        $('.glyphicon-step-forward').trigger('click');
        var row = generateNewRow();
        var newRowId = row.rowid;
        grid.trigger('reloadGrid');
        grid.jqGrid('addRowData', newRowId, row);
    }

    lastSelection = newRowId;
    grid.jqGrid('saveRow', lastSelection);
    grid.jqGrid('restoreRow', lastSelection);

    var eid = $('.inline-edit-cell').parent().parent().prop('id')
    grid.jqGrid('saveRow', eid);
    grid.jqGrid('restoreRow', eid);
    grid.jqGrid('editRow', newRowId);

}

function generateNewRow() {
    var newid = 0;
    var grid = $("#jqGrid");
    var length = jQuery("#jqGrid").jqGrid('getGridParam', 'records');

    var dataobj = grid.jqGrid('getGridParam', 'data');
    var arrIds = [];
    arrIds = dataobj.map(function (e) { return e.rowid });
    if (arrIds.length > 0) {
        newid = arrIds.reduce(function (a, b) { return Math.max(a, b); });
    }
    var row = {
        TagdocumentPOAuthDetailsID: "",
        Actionstatus: 1,
        Quantity: "",
        ExpenseAccountNumber: "",
        ItemNumber: "",
        ItemDescription: "",
        Budget: "",     
        Unbudgeted: "",
        UnitPrice: "",
        LineTotal: "",
        rowid: newid + 1

    };
    return row;

}

function OnSuccessUpdateDetail(response, dependantSource) {
    rowindex = dependantSource.currentRowIndex;
    CalulateTotal(rowindex);
}

function DeleteRow(id) {
    var row = jQuery("#jqGrid").jqGrid('getRowData', id);
    var obj = {};
    obj.workFlowId = workFlowId;
    obj.nodeId = nodeId;
    obj.RowStatus = 'Delete';
    obj.DocumentID = $("#docId").val();
    obj.TagdocumentPOAuthDetailsID = row.TagdocumentPOAuthDetailsID;
    var jsonString = JSON.stringify(obj);
    var url = '/POAuthDC/SaveTagDocumentDetail';
    var dependantObj = {};
    dependantObj.obj = obj;
    dependantObj.currentRowIndex = id;
    MakeAjaxCall_WithDependantSource(requestPOST, url, jsonString, OnSuccessDeleteDetail, poauth.OnFailure_WithDependantSource, poauth.OnError_WithDependantSource, dependantObj);

}

function OnSuccessDeleteDetail(response, dependantSource) {
    var id = dependantSource.currentRowIndex;
    var row = $('#jqGrid').jqGrid('getRowData', id);
    $('#jqGrid').jqGrid('delRowData', id);

    var data = jQuery("#jqGrid").jqGrid('getGridParam', 'data');
    for (var i = 0; i < data.length; i++) {
        //if (data[i].TagdocumentPOAuthDetailsID == 0) {
        data[i].rowid = i + 1;
        data[i].id = i + 1;
        //} else
        //   data[i].rowid = i + 1;
    }
    var curpage = parseInt($(".ui-pg-input").val());
    jQuery('#jqGrid').jqGrid('clearGridData');
    jQuery('#jqGrid').jqGrid('setGridParam', { data: data });
    $("#jqGrid").trigger("reloadGrid", [{ page: curpage }]);
    $("#jqGrid").trigger("reloadGrid", [{ page: curpage }]);
    lastSelection = id;

    GrandTotal();

}

function isValidfootertRow() {

    var quantity = $("#footerQuantity").val();
    var unitPrice = $("#footerUnitPrice").val();
    var itemNumber = $("#footerItemNumber").val();
    var expenseAccountNumber = $("#footerGlCode").val();
    var itemDescription = $("#footerItemDescription").val();
    var lineTotal = $("#footerTotal").val();

    if (quantity.length > 0 || unitPrice.length > 0 || itemNumber.length > 0 || expenseAccountNumber.length > 0 || itemDescription.length > 0) {
        //return false;
        return true;
    } else {

        $('.footer-valid').each(function () {
            if ($(this).val().length == 0 && this.disabled == false) {
                $(this).removeClass("error");
            }
        });
        return true;
    }
}

function isValidGLCode(glCode, Id, val) {
    var oldGlCodeValue = "";
    if (Id != "footerGlCode") {
        var id = $(val).closest('tr').prop('id');
        oldGlCodeValue = $("#jqGrid").jqGrid('getGridParam', 'data')[parseInt(id) - 1]['ExpenseAccountNumber'];
    }
    else {
        oldGlCodeValue = glCode;
    }

    var isValid = false;
    var paNumber = $("#IndexPivot_PANumber").val().trim();
    var siteId = $("#IndexPivot_SiteID").val().trim();
    var poType = $("#IndexPivot_POType").val().trim();

    if (siteId == "<select>") {
        siteId = "";
    }

    var value = $('#' + Id).val();
    var url = "/POAuthDC/GetPOAuthGLAccountsJson?PreText=" + value + "&PaNumber=" + paNumber + "&SiteId=" + siteId + "&PoType=" + poType;
    var data = MakeAjaxCall2(requestGET, false, url, '');

    if (data.length > 0) {
        var res = data.filter(function (item, index) {
            var val = '';
            if (item.indexOf('---') !== -1) {
                val = item.split('---')[0].trim();
            } else {
                val = item;
            }
            if (val == glCode) {
                return item
            };
        });
        if (res.length == 0) {
            // $('#' + Id).val(oldGlCodeValue);
            // if (Id == "footerGlCode") {
            $('#' + Id).addClass("error");
            // }
            isErrorGridLine = true;
            //
            // var editrowid = $('.inline-edit-cell').parent().parent().prop('id');
        } else {
            isValid = true;
            $('#' + Id).removeClass("error");
            isErrorGridLine = false;
        }
    } else {
        $('#' + Id).val(oldGlCodeValue);
        // if (Id == "footerGlCode") {
        $('#' + Id).addClass("error");
        //}
        //$('#' + Id).addClass("error");
        isErrorGridLine = true;
        // $('.alert').hide();
        // Notify(GetFieldLabelName(fieldRules, 'GridRowPODetailExpenseAccountNumber') + ' is not valid', null, null, 'danger');
    }

    return isValid

}

