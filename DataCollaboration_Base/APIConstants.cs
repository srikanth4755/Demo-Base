using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DataCollaboration_Base
{
    public static class APIConstants
    {


        public const string GetAPInvoiceInfo = "APInvoice/GetAPInvoiceInfo?userdetailsId={0}&documentid={1}&wf={2}&inboxlink={3}";
        public const string SaveAPInvoiceInfo = "APInvoice/SaveAPInvoiceInfo";
        public const string SaveTagDocumentDetail = "APInvoice/SaveTagDocumentDetail?userID={0}&companyNo={1}&VendorNo={2}&workFlowId={3}&nodeId={4}";
        public const string SaveTagDocumentDetail_PODetail = "APInvoice/SaveTagDocumentDetail_PODetail?documentID={0}&companyNo={1}&VendorNo={2}&invoiceDate={3}&invoiceAmount={4}&workFlowId={5}&nodeId={6}";
        public const string SaveWorkFlowNotes = "APInvoice/SaveWorkFlowNotes?userID={0}&documentID={1}&notes={2}";
        public const string ForwardTo = "APInvoice/ForwardTo?nextUserID={0}&currentUserID={1}&currentNodeID={2}&documentID={3}&workflowID={4}&notes={5}&nodeText={6}";
        public const string GetSmartList = "APInvoice/GetSmartList?userID={0}&companyNo={1}&vendorID={2}";
        public const string ReloadPODetails = "APInvoice/ReloadPODetails?documentId={0}";
        public const string GetSmartListHeader = "APInvoice/GetSmartListHeader?companyNo={0}&vendorNo={1}&documentID={2}";
        public const string GetSmartListDetail = "APInvoice/GetSmartListDetail?documentID={0}";
        public const string SendToReply = "APInvoice/SendToReply?documentID={0}&workflowID={1}&currentNodeID={2}&notes={3}";
        public const string GetPOAuthDocumentStatusByPONumber = "APInvoice/GetPOAuthDocumentStatusByPONumber?pONumber={0}";
        public const string PONumber_GridLines_Refresh = "APInvoice/PONumber_GridLines_Refresh";  //need to remove
        public const string GetValidationConditions = "APInvoice/GetValidationConditions?workFlowId={0}";
        public const string GetTagDocumentDetails_ByPONumber = "APInvoice/GetTagDocumentDetails_ByPONumber?documentID={0}&pONumber={1}";
        public const string IsPOIssues = "Header/IsPOIssues?documentID={0}&isWriteWFNotes={1}";

        public const string RejectTo = "APInvoice/RejectTo?userID={0}&documentID={1}&workflowID={2}&currentNodeID={3}&notes={4}&nodeText={5}";
        public const string SaveExcelUpl_TagDocumentDetails = "APInvoice/SaveExcelUpl_TagDocumentDetails";


        public const string IsMaskfileCheckApplicable = "Approver/GetMaskFileCheckNode?workflowId={0}&nodeId={1}"; // not use in js
        public const string GetApproversList = "Approver/GetApproversList?docId={0}&workflowId={1}&maskfileType={2}&company={3}&invoiceAmount={4}&currentNodeid={5}&SMD_currentNodeid={6}";
        public const string IsCurrentUserCanApprove = "Approver/IsCurrentUserCanApprove?documentId={0}&workflowId={1}&invoiceAmount={2}";  //calling in poauth js


        public const string SaveException = "ExceptionLogging/SaveException"; // not use in js and no sp only query

        public const string SaveRelatedDocuments = "FileUpload/UploadDocument?Uploadfolder={0}&Documentname={1}&ParentDocumentId={2}&ScanDate={3}"; //no sp 

        public const string GetWorkFlowdetails = "FieldRules/GetWorkFlowDet"; // not  use
        public const string GetPartialFields = "FieldRules/GetPartialRulesFields?WorkFlowId={0}"; //not use in js
        public const string GetRulesFields = "FieldRules/GetRulesFields?WorkFlowId={0}"; // calling from FieldRules view
        public const string GetFieldsNodes = "FieldRules/GetRulesNodes?WorkFlowId={0}"; //calling from FieldRules view
        public const string DeletePartialFields = "FieldRules/DeletePartialFields"; //calling from FieldRules view
        public const string DeleteRulesFields = "FieldRules/DeleteRulesFields"; //not use in js
        public const string DeleteFieldsNodes = "FieldRules/DeleteFieldsNodes"; //not use in js
        public const string SavePartialFields = "FieldRules/SavePartialFields";
        public const string SaveFieldRules = "FieldRules/SaveFieldRules";
        public const string SaveFieldsNodes = "FieldRules/SaveFieldsNodes";
        public const string CopyNodeRules = "FieldRules/CopyNodeRules?FromNode={0}&ToNode={1}";
        public const string CopyFieldRules = "FieldRules/CopyFieldRules?FromFieldId={0}&ToFieldId={1}"; //not use in js



        //string userdetailsId, string documentid, string wf, string inboxlink
        public const string GetActiveCompanies = "Header/GetActiveCompanies";
        public const string GetActiveDepartments = "Header/GetActiveDepartments";
        public const string GetActiveDocumentNames = "Header/GetActiveDocumentNames";  //calling from relateddocument js
        public const string GetActiveDepartments_ByCompCode = "Header/GetActiveDepartments?compCode={0}";
        public const string GetTermsInfo = "Header/GetTermsInfo";
        public const string GetPaymentCodeTypes = "Header/GetPaymentCodeTypes";
        public const string GetVendor_searchByWildCard = "Header/GetVendor_searchByWildCard?searchKey={0}&searchText={1}&isWildCard={2}";
        public const string GetVendorAddress_ByVendorNo = "Header/GetVendorAddress_ByVendorNo?vendorNo={0}&documentID={1}";
        public const string GetPaymentTermsByVendorNo = "Header/GetPaymentTerms_ByVendorNo?vendorNo={0}";
        public const string GetPaymentMethodsByVendorNo = "Header/GetPaymentMethods_ByVendorNo?vendorNo={0}";
        public const string GetPopulateAddressText = "Header/GetPopulateAddressText?remitAddrTxt={0}&remitAddrCod={1}&vendorNo={2}&documentID={3}";
        public const string GetGLAccounts = "Header/GetGLAccounts?prefixText={0}&gLCodePrefix={1}";
        public const string GetPOAuthGLAccounts = "Header/GetPOAuthGLAccounts?prefixText={0}&paNumber={1}&siteId={2}&poType={3}";
        public const string GetPOAuthGLCount = "Header/GetPOAuthGLCount?documentId={0}&projecNumber={1}&siteId={2}&poType={3}"; // not use in js
        public const string GetForwardUsers = "Header/GetForwardUsers?searchText={0}&userDetailsID={1}&workflowID={2}&documentID={3}";
        public const string GetPONumber_searchByWildCard = "Header/GetPONumber_searchByWildCard?searchText={0}&isWildCard={1}&isHeaderPObasedSearch={2}";
        public const string GetPONumbers_forGrid = "Header/GetPONumbers_forGrid?searchText={0}&isWildCard={1}";
        public const string GetActiveSites = "Header/GetActiveSites";
        public const string GetActiveSites_ByCompany = "Header/GetActiveSites_ByCompany?companyId={0}";
        public const string GetShipAddressBySiteID = "Header/GetShipAddress_BySiteID?siteID={0}";  // call from poauth
        public const string GetActivePANumbers = "Header/GetActiveProjectNumbers?pANumber={0}&isSelected={1}";
        public const string GetProjectBudgetDetails = "Header/GetProjectBudgetDetails?pANumber={0}&isSelected={1}"; // call from poauth
        public const string GetVendor_ByPONumber = "Header/GetVendor_ByPONumber?pONumber={0}";
        public const string GetActiveSpendCategories = "Header/GetActiveSpendCategories";  // call from poauth
        public const string CheckIsVendorActive = "Header/CheckIsVendorActive?vendorNo={0} ";
        public const string GetVendor_ByVendorNo = "Header/GetVendor_ByVendorNo?vendorNo={0}";
        public const string GetCustomColumnValue = "Header/GetCustomColumnValue?customColumn={0}&documentID={1}";
        public const string GetSpendCategoryBudget = "Header/GetSpendCategoryBudget?siteID={0}&spendCatagoryName={1}&currentPOAmount={2}"; // call from poauth
        public const string GetInValidPONumbers = "Header/GetInValidPONumbers?pONumbers={0}";
        public const string GetDCConfiguration = "Header/GetDCConfiguration";
        public const string GetSiteIdUsers_ByUserDetailsID = "Header/GetSiteIdUsers_ByUserDetailsID?userdetailsID={0}"; //not use in js
        public const string GetPaymentMethodByVendorNoJson = "Header/GetPaymentMethodByVendorNoJson?vendorNo={0}";

        

        public const string GetProjectNumber_ByPONumber = "POAuth/GetProjectNumber_ByPONumber?pONumber={0}";
        public const string GetPOAuthInfo = "POAuth/GetPOAuthInfo?userdetailsId={0}&documentid={1}&wf={2}&inboxlink={3}";
        public const string SavePOAuthInfo = "POAuth/SavePOAuthInfo";
        public const string SavePOTagDocumentDetail = "POAuth/SaveTagDocumentDetail?workFlowId={0}&nodeId={1}";
        public const string poauthForwardTo = "POAuth/ForwardTo?nextUserID={0}&currentUserID={1}&currentNodeID={2}&documentID={3}&workflowID={4}&notes={5}&nodeText={6}";
        public const string poauthRejectTo = "POAuth/RejectTo?userID={0}&documentID={1}&workflowID={2}&currentNodeID={3}&notes={4}&nodeText={5}";


        public const string GetPartialViewRules = "Rules/GetPartialViewRules?workflowId={0}";
        public const string GetFieldRules = "Rules/GetFieldRules?workFlowId={0}&nodeId={1}&wf={2}&isForward={3}&customColumnValue={4}";

        public const string GetPOCharges_ByPONumber = "APInvoice/GetPOCharges_ByPONumber?pONumber={0}";
        //string userID, int documentID, string notes
        //string nextUserID, string currentUserID, int currentNodeID, int documentID, int workflowID, string notes
        //string userID, int documentID, int workflowID, string notes

    }
}