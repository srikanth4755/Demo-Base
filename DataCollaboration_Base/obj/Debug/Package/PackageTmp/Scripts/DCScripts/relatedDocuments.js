var relatedDoc = {
    Init: function () {        

        $("#btnUploadFile").click(function () {
            relatedDoc.RelatedDocumentUploadFile();
        });

        $("#btnUploadCancel").click(function () {
            relatedDoc.RelatedDocumentClearFields();
        });

        if ($("#DocumentName").length > 0 && $("#DocumentName").prop('tagName').toUpperCase() == "SELECT") {

            var url = "/APInvoiceDC/GetActiveDocumentNamesJson";
            var response = MakeAjaxCall2(REQUESTGET, false, url, '');
            $.each(response, function (data, value) {
                $("#DocumentName").append($("<option></option>").val(value.DocumentName).html(value.DocumentName));
            });
        }
        $('#fileToUpload').on('change', function () {

            var fileName = $(this).val().split(".");
            var fileType = fileName[fileName.length - 1];

            if (fileType != 'pdf') {
                $(this).val('');
                $('.alert').hide();
                Notify('Only PDF files are allowed to upload', null, null, "danger");
            }
        });
    },
    RelatedDocumentUploadFile: function () {

        if (window.FormData !== undefined) {
            var formData = new window.FormData();

            formData.append("file", $('#fileToUpload')[0].files[0]);
            formData.append("UploadFolder", $("#Uploadfolder").val());
            formData.append("DocumentName", $("#DocumentName").val());
            formData.append("ParentDocumentID", $("#ParentDocumentID").val());
            formData.append("ScanDate", $("#ScanDate").val());
            var response = [];
            if ($('#DocumentName').val().trim() != '' && $('#fileToUpload').val().trim() != '') {
                relatedDoc.RelatedDocumentClearFields();
                var url = '/RelatedDocuments/UploadDocument';
                MakeAjaxCall_WithDependantSourceUpload(REQUESTPOST, url, formData, relatedDoc.onUploadSuccess, relatedDoc.OnFailure_WithDependantSource, relatedDoc.OnError_WithDependantSource, response);
            }
            else if ($('#DocumentName').val() == "" && $('#fileToUpload').val() == "") {
                $("#DocumentName").addClass("error");
                $("#fileToUpload").addClass("error");
                $('.alert').hide();
                Notify("required fields are missing", null, null, "danger");
            }
            else if ($('#DocumentName').val() == "" && $('#fileToUpload').val() != "") {
                $("#DocumentName").addClass("error");
                $("#fileToUpload").removeClass("error");
                $('.alert').hide();
                Notify("required fields are missing", null, null, "danger");
            }
            else if ($('#DocumentName').val() != "" && $('#fileToUpload').val() == "") {
                $("#DocumentName").removeClass("error");
                $("#fileToUpload").addClass("error");
                $('.alert').hide();
                Notify("required fields are missing", null, null, "danger");
            }
        }
    },
    RelatedDocumentClearFields: function myfunction() {
        $('#fileToUpload').val('');
        $("#DocumentName").val('');
        $('#DocumentName').removeClass("error");
        $('#fileToUpload').removeClass("error");
    },
    onUploadSuccess: function onUploadSuccess(response) {
        $('.alert').hide();
        Notify(response.Result, null, null, "success");
        //alert(response);
    },
    OnFailure_WithDependantSource: function OnFailure_WithDependantSource(response, dependantObj) {
        //console.log(response);
    },
    OnError_WithDependantSource: function OnError_WithDependantSource(response, dependantObj) {
        //console.log(response);
    },
}
relatedDoc.Init();

function CloseRelatedDocumentTab() {
    $("#HeaderGeneral").show();
    $("#AccountAssignment").show();
    $("#Forward").show();
    $("#Reject").show();
    $("#RelatedDocuments").hide();


    $("#hrefHeaderGeneral").addClass('active');
    if ($("#hrefAccountAssignment").hasClass('active'))
        $("#hrefAccountAssignment").removeClass('active');
    if ($("#hrefRejects").hasClass('active'))
        $("#hrefRejects").removeClass('active');
    if ($("#hrefForward").hasClass('active'))
        $("#hrefForward").removeClass('active');
}

