using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using DCCommon;
using DataCollaboration_Base.ViewModels;
using System.Collections;
using System.Globalization;
using System.Data;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;
using System.Web.Script.Serialization;
using System.Text.RegularExpressions;


namespace DataCollaboration_Base.Controllers
{
    [ExceptionFilter]
    public class APInvoiceDCController : Controller
    {
        #region private variable

        private string password = " !#$a54?3";
        private string tenantCode = string.Empty;// System.Configuration.ConfigurationManager.AppSettings.Get("TenantCode");//string.Empty;//"PBPDC";

        #endregion private variable

        #region Action Methods
        public ActionResult Index()
        {
            ViewData["TenantCode"] = tenantCode;
            return View("Index");
        }

        public async Task<ActionResult> DocumentData(string userdetailsID, string documentID, string wF, string inboxlink, string loggedinUserID = "")
        {
            DDISecurityModule.SymmetricEncryption se = new DDISecurityModule.SymmetricEncryption();
            se.Password = password;
            userdetailsID = se.Decrypt(userdetailsID.Replace(" ", "+"));
            documentID = se.Decrypt(documentID.Replace(" ", "+"));
            wF = se.Decrypt(wF.Replace(" ", "+"));
            inboxlink = se.Decrypt(inboxlink.Replace(" ", "+"));
            if (!string.IsNullOrEmpty(loggedinUserID))
            {
                loggedinUserID = se.Decrypt(loggedinUserID.Replace(" ", "+"));
            }

            Uri uri = new Uri(inboxlink);
            tenantCode = GetSubDomain(uri);
            ViewData["TenantCode"] = tenantCode;

            //System.Web.HttpContext.Current.Session.Add(DcConstants.tenantCode, tenantCode);
            //System.Web.HttpContext.Current.Session.Add(DcConstants.userID, userdetailsID);
            //System.Web.HttpContext.Current.Session.Add(DcConstants.documentID, documentID);
            //System.Web.HttpContext.Current.Session.Add(DcConstants.wF, wF);
            //System.Web.HttpContext.Current.Session.Add(DcConstants.loggedinUserID, loggedinUserID);
            System.Web.HttpContext.Current.Session.Add(DcConstants.inboxlink, inboxlink);


            HeaderParams headerParams = new HeaderParams();
            headerParams.TenantCode = tenantCode;
            headerParams.UserID = userdetailsID;
            headerParams.DocumentID = documentID;
            headerParams.WF = wF;
            headerParams.LoggedinUserID = loggedinUserID;



            ViewData["DCConfigurations"] = (List<DCConfiguration>)await APIClient.CallObjectTypeAsync<List<DCConfiguration>>(string.Format(APIConstants.GetDCConfiguration), headerParams);


            APInvoiceInfo aPInvoiceInfo = await GetDocumentData(userdetailsID, documentID, wF, inboxlink, headerParams);
            APInvoiceInfoVM aPInvoiceInfoVM = new APInvoiceInfoVM();
            aPInvoiceInfoVM.DocumentID = aPInvoiceInfo.IndexPivotAPInvoice.DocumentID;
            aPInvoiceInfoVM.InboxLink = inboxlink;

            aPInvoiceInfoVM.WorkFlowID = aPInvoiceInfo.WorkFlowID;
            aPInvoiceInfoVM.NodeID = aPInvoiceInfo.NodeID;
            aPInvoiceInfoVM.NodeText = aPInvoiceInfo.NodeText;
            aPInvoiceInfoVM.CurrentUserDetailsID = userdetailsID;
            aPInvoiceInfoVM.IsForward = aPInvoiceInfo.IsForward;
            aPInvoiceInfoVM.TagDocumentHeader = aPInvoiceInfo.TagDocumentHeader;
            aPInvoiceInfoVM.TagDocumentDetail = aPInvoiceInfo.TagDocumentDetail;
            aPInvoiceInfoVM.IndexPivot = aPInvoiceInfo.IndexPivotAPInvoice;
            aPInvoiceInfoVM.IndexPivot.Invoice_Date = string.IsNullOrEmpty(aPInvoiceInfoVM.IndexPivot.Invoice_Date) ? "" : DateTime.ParseExact(Convert.ToDateTime(aPInvoiceInfoVM.IndexPivot.Invoice_Date).ToString(DcConstants.Date_Formatte), DcConstants.Date_Formatte, System.Globalization.CultureInfo.InvariantCulture).ToString(DcConstants.Date_Formatte);
            //aPInvoiceInfoVM.IndexPivot.Invoice_Date = DateTime.ParseExact(Convert.ToDateTime(aPInvoiceInfoVM.IndexPivot.Invoice_Date).ToString(DcConstants.Date_Formatte), DcConstants.Date_Formatte, System.Globalization.CultureInfo.InvariantCulture).ToString(DcConstants.Date_Formatte);
            aPInvoiceInfoVM.IndexPivot.PANumber = string.IsNullOrEmpty(aPInvoiceInfo.IndexPivotAPInvoice.PANumber) ? (string.IsNullOrEmpty(aPInvoiceInfo.IndexPivotAPInvoice.PO_Number) ? "" : await GetProjectNumber_ByPONumber(aPInvoiceInfo.IndexPivotAPInvoice.PO_Number, headerParams)) : aPInvoiceInfo.IndexPivotAPInvoice.PANumber;
            aPInvoiceInfoVM.ActiveCompanies = await GetActiveCompanies(headerParams);
            aPInvoiceInfoVM.ActiveDepartments = await GetActiveDepartments(headerParams);
            aPInvoiceInfoVM.Sites = await GetSites(headerParams);
            aPInvoiceInfoVM.PrepaidMonths = GetPrepaidMonths();
            aPInvoiceInfoVM.ShopPOReviewNotes = "";

            // TSS Durga (07/24/2019) Modifications for End Documents vendorno binding issues fix at Ecabinate.

            int vendorCount = 0;
            if (aPInvoiceInfo.IndexPivotAPInvoice != null && !string.IsNullOrEmpty(aPInvoiceInfo.IndexPivotAPInvoice.Vendor_Number))
            {
                if (aPInvoiceInfo.IndexPivotAPInvoice.Doc_Loc != "End")
                {
                    vendorCount = await CheckIsVendorActive(aPInvoiceInfo.IndexPivotAPInvoice.Vendor_Number, headerParams);
                    if (vendorCount > 0)
                        aPInvoiceInfoVM.Vendors = GetVendor_ByVendorNo(aPInvoiceInfo.IndexPivotAPInvoice.Vendor_Number, headerParams); //GetVendors(aPInvoiceInfo.IndexPivotAPInvoice.Vendor_Number, aPInvoiceInfo.IndexPivotAPInvoice.Vendor_Name);
                }
            }

            if (vendorCount == 0)
                aPInvoiceInfoVM.Vendors = GetVendors(aPInvoiceInfo.IndexPivotAPInvoice.Vendor_Number, aPInvoiceInfo.IndexPivotAPInvoice.Vendor_Name, aPInvoiceInfo.IndexPivotAPInvoice.Doc_Loc);

            aPInvoiceInfoVM.RemitToLocations = await GetVendorAddress_ByVendorNo(aPInvoiceInfo.IndexPivotAPInvoice.Vendor_Number, aPInvoiceInfo.IndexPivotAPInvoice.DocumentID, headerParams);
            aPInvoiceInfoVM.AccountingPeriodMonths = GetAccountingPeriod();
            aPInvoiceInfoVM.TermsInfo = await GetTermsInfo(headerParams);
            List<DCConfiguration> lstDCConfig = (List<DCConfiguration>)ViewData["DCConfigurations"];
            DCConfiguration dcConfigs = lstDCConfig.Where(m => m.ConfigName == "PaymentmethodList").SingleOrDefault();

            if (dcConfigs.ConfigValue.ToLower() == "true" && aPInvoiceInfo.IndexPivotAPInvoice.Vendor_Number != "")
            {
                aPInvoiceInfoVM.PaymentCodeTypes = await GetPaymentMethodListByVendorNo(aPInvoiceInfo.IndexPivotAPInvoice.Vendor_Number, headerParams);
            }
            else
            {
                aPInvoiceInfoVM.PaymentCodeTypes = await GetPaymentCodeTypes(headerParams);
            }
            aPInvoiceInfoVM.vendorAddress = await GetPopulateAddressText("", aPInvoiceInfoVM.TagDocumentHeader.RemitToAddress, aPInvoiceInfo.IndexPivotAPInvoice.Vendor_Number, aPInvoiceInfo.IndexPivotAPInvoice.DocumentID, headerParams);
            aPInvoiceInfoVM.RemitAddrText = aPInvoiceInfoVM.vendorAddress.AddressText;
            aPInvoiceInfoVM.TagDocumentHeader.RemitToAddress = aPInvoiceInfoVM.TagDocumentHeader.RemitToAddress;
            aPInvoiceInfoVM.TagDocumentHeader.PaymentMessage = aPInvoiceInfo.TagDocumentHeader.PaymentMessage;
            aPInvoiceInfoVM.TagDocumentHeader.HeadUsr3 = aPInvoiceInfo.TagDocumentHeader.HeadUsr3;
            aPInvoiceInfoVM.IndexPivot.Originator = aPInvoiceInfo.IndexPivotAPInvoice.Originator;

            aPInvoiceInfoVM.TagDocumentHeader.InvoiceDiscountAmount = aPInvoiceInfo.TagDocumentHeader.InvoiceDiscountAmount;
            aPInvoiceInfoVM.TagDocumentHeader.DiscountDate = aPInvoiceInfo.TagDocumentHeader.DiscountDate;
            aPInvoiceInfoVM.TagDocumentHeader.UserXDB6 = aPInvoiceInfo.TagDocumentHeader.UserXDB6;
            aPInvoiceInfoVM.TagDocumentHeader.HeadUsr2 = aPInvoiceInfo.TagDocumentHeader.HeadUsr2;
            aPInvoiceInfoVM.TagDocumentHeader.HeadUsr4 = aPInvoiceInfo.TagDocumentHeader.HeadUsr4 == null ? "" : aPInvoiceInfo.TagDocumentHeader.HeadUsr4; ;
            aPInvoiceInfoVM.TagDocumentHeader.HeadUsr5 = aPInvoiceInfo.TagDocumentHeader.HeadUsr5 == null ? "" : aPInvoiceInfo.TagDocumentHeader.HeadUsr5;
            aPInvoiceInfoVM.TagDocumentHeader.HeadUsr6 = aPInvoiceInfo.TagDocumentHeader.HeadUsr6;

            //aPInvoiceInfoVM.ParentDocumentID = aPInvoiceInfo.IndexPivotAPInvoice.DocumentID.ToString();
            //aPInvoiceInfoVM.ScanDate = DateTime.Now.ToString("dd-MMM-yyyy");     

            //if (string.IsNullOrEmpty(aPInvoiceInfoVM.IndexPivot.Vendor_Number)) //&& aPInvoiceInfoVM.Vendors.Count == 1)
            //{
            //    aPInvoiceInfoVM.IndexPivot.Vendor_Number = "<select>";//aPInvoiceInfoVM.Vendors[0].Number;
            //}

            aPInvoiceInfoVM.IndexPivot.SpecialHandling = string.IsNullOrEmpty(aPInvoiceInfo.IndexPivotAPInvoice.SpecialHandling) ? "No" : aPInvoiceInfo.IndexPivotAPInvoice.SpecialHandling;
            aPInvoiceInfoVM.IndexPivot.Payment_Type = string.IsNullOrEmpty(aPInvoiceInfo.IndexPivotAPInvoice.Payment_Type) ? "No" : aPInvoiceInfo.IndexPivotAPInvoice.Payment_Type;
            aPInvoiceInfoVM.IndexPivot.Appr = string.IsNullOrEmpty(aPInvoiceInfo.IndexPivotAPInvoice.Appr) ? "No" : aPInvoiceInfo.IndexPivotAPInvoice.Appr;
            aPInvoiceInfoVM.IndexPivot.PTY = string.IsNullOrEmpty(aPInvoiceInfo.IndexPivotAPInvoice.PTY) ? "No" : aPInvoiceInfo.IndexPivotAPInvoice.PTY;
            aPInvoiceInfoVM.IndexPivot.New_Vendor_Name = aPInvoiceInfo.IndexPivotAPInvoice.New_Vendor_Name;
            string lblMessage;
            aPInvoiceInfoVM.UnAllocatedBalance = GetUnAllocated(
                aPInvoiceInfoVM.IndexPivot.Invoice_Amount != null ? aPInvoiceInfoVM.IndexPivot.Invoice_Amount : 0,
                aPInvoiceInfoVM.TagDocumentHeader.TaxAmount != null ? aPInvoiceInfoVM.TagDocumentHeader.TaxAmount != null ? aPInvoiceInfoVM.TagDocumentHeader.TaxAmount : 0 : 0,
                aPInvoiceInfoVM.TagDocumentHeader.FreightAmount != null ? aPInvoiceInfoVM.TagDocumentHeader.FreightAmount != null ? aPInvoiceInfoVM.TagDocumentHeader.FreightAmount : 0 : 0,
                aPInvoiceInfoVM.TagDocumentHeader.MiscAmount != null ? aPInvoiceInfoVM.TagDocumentHeader.MiscAmount != null ? aPInvoiceInfoVM.TagDocumentHeader.MiscAmount : 0 : 0,
                aPInvoiceInfoVM.TagDocumentDetail, out lblMessage);
            aPInvoiceInfoVM.Message = lblMessage;

            aPInvoiceInfoVM.PoNumberList = GetPONumbers(aPInvoiceInfoVM.IndexPivot.PO_Number);
            DCConfiguration dcConfig = lstDCConfig.Where(m => m.ConfigName == "FieldRulesCustomColumn").SingleOrDefault();
            string custColumn = dcConfig != null ? (string.IsNullOrEmpty(dcConfig.ConfigValue) ? "" : dcConfig.ConfigValue) : "";
            string custColumnVal = string.IsNullOrEmpty(custColumn) ? string.Empty : await GetCustomColumnValue(custColumn, aPInvoiceInfo.IndexPivotAPInvoice.DocumentID, headerParams);//GetCustomColumnValueFromEntity(custColumn, aPInvoiceInfo);

            aPInvoiceInfoVM.IsForwardActual = aPInvoiceInfo.IsForward;
            //TODO - Hardcoded workflow ID - Change it            
            //ViewData["FieldRules"] = (List<FieldRules>)await APIClient.CallObjectTypeAsync<List<FieldRules>>(string.Format(APIConstants.GetFieldRules, aPInvoiceInfo.WorkFlowID, aPInvoiceInfo.NodeID,wF));
            List<FieldRules> lstFieldRules = (List<FieldRules>)await APIClient.CallObjectTypeAsync<List<FieldRules>>(string.Format(APIConstants.GetFieldRules, aPInvoiceInfo.WorkFlowID, aPInvoiceInfo.NodeID, wF, aPInvoiceInfo.IsForward, custColumnVal), headerParams);
            if (wF.ToUpper() != DcConstants.Yes.ToUpper())
            {
                if (aPInvoiceInfo.IsForward)
                {
                    aPInvoiceInfoVM.IsForward = false;
                    aPInvoiceInfo.IsForward = false;
                }
            }
            ViewData["FieldRules"] = lstFieldRules;
            ViewData["PartialViewRules"] = (List<PartialViewRules>)await APIClient.CallObjectTypeAsync<List<PartialViewRules>>(string.Format(APIConstants.GetPartialViewRules, aPInvoiceInfo.WorkFlowID), headerParams);
            ViewData["ValidationConditions"] = (List<ValidationConditions>)await APIClient.CallObjectTypeAsync<List<ValidationConditions>>(string.Format(APIConstants.GetValidationConditions, aPInvoiceInfo.WorkFlowID), headerParams);
            ViewData["HeaderParams"] = headerParams;
            return View("APInvoiceView", aPInvoiceInfoVM);
        }



        [HttpPost]
        public async Task<JsonResult> SaveAPInvoiceInfo(string jsonValue)
        {
            dynamic obj = JsonConvert.DeserializeObject(jsonValue);

            APInvoiceInfo aPInvoiceInfo = new APInvoiceInfo();
            aPInvoiceInfo.TagDocumentHeader = new TagDocumentHeader();
            aPInvoiceInfo.TagDocumentHeader.UserID = obj.UserID;
            aPInvoiceInfo.TagDocumentHeader.Immediate = obj.Immediate;
            aPInvoiceInfo.TagDocumentHeader.CommodityCode = obj.CommodityCode;
            aPInvoiceInfo.TagDocumentHeader.MICAuthor = obj.MICAuthor;
            aPInvoiceInfo.TagDocumentHeader.RemitToAddress = obj.RemitToAddress;
            aPInvoiceInfo.TagDocumentHeader.AccountingDate = obj.AccountingDate;
            aPInvoiceInfo.TagDocumentHeader.RowStatus = obj.TagHeaderRowstatus;
            aPInvoiceInfo.TagDocumentHeader.DocumentID = Convert.ToInt32(obj.DocId);
            aPInvoiceInfo.TagDocumentHeader.InvoiceCurrency = obj.InvoiceCurrency;
            aPInvoiceInfo.TagDocumentHeader.TaxAmount = string.IsNullOrEmpty(Convert.ToString(obj.TaxAmount)) ? null : Convert.ToDecimal(obj.TaxAmount);
            aPInvoiceInfo.TagDocumentHeader.FreightAmount = string.IsNullOrEmpty(Convert.ToString(obj.FreightAmount)) ? null : Convert.ToDecimal(obj.FreightAmount);
            aPInvoiceInfo.TagDocumentHeader.MiscAmount = string.IsNullOrEmpty(Convert.ToString(obj.MiscAmount)) ? null : Convert.ToDecimal(obj.MiscAmount);
            aPInvoiceInfo.TagDocumentHeader.PaymentMessage = obj.PaymentMessage;
            aPInvoiceInfo.TagDocumentHeader.HeadUsr3 = obj.HeadUsr3;

            // TSS DURGA(07022019)
            aPInvoiceInfo.TagDocumentHeader.UserXDB7 = obj.Invoice_Type;


            aPInvoiceInfo.ShopPOReviewNotes = obj.ShopPOReviewNotes;

            aPInvoiceInfo.TagDocumentHeader.InvoiceDiscountAmount = string.IsNullOrEmpty(Convert.ToString(obj.InvoiceDiscountAmount)) ? null : Convert.ToDecimal(obj.InvoiceDiscountAmount);
            aPInvoiceInfo.TagDocumentHeader.DiscountDate = obj.DiscountDueDate == "" ? null : obj.DiscountDueDate;
            aPInvoiceInfo.TagDocumentHeader.UserXDB6 = obj.UserXDB6;
            aPInvoiceInfo.TagDocumentHeader.HeadUsr2 = obj.PaymentMethod;
            aPInvoiceInfo.TagDocumentHeader.HeadUsr4 = obj.HeadUsr4;
            aPInvoiceInfo.TagDocumentHeader.HeadUsr5 = obj.HeadUsr5;
            aPInvoiceInfo.TagDocumentHeader.HeadUsr6 = obj.HeadUsr6;


            //string v = obj.Vendor_Name;
            if (obj.Vendor_Name == DcConstants.New_Vendor || obj.RemitToAddress == DcConstants.New_Address)
            {
                aPInvoiceInfo.TagDocumentHeader.VendorMaintenance = DcConstants.Yes;
                aPInvoiceInfo.TagDocumentHeader.RemitToAddress = DcConstants.New_Address;
            }
            else
                aPInvoiceInfo.TagDocumentHeader.VendorMaintenance = DcConstants.No;

            aPInvoiceInfo.TagDocumentHeader.UserXDB1 = DcConstants.No;
            aPInvoiceInfo.TagDocumentHeader.VendorAddressLine1 = obj.VendorAddressLine1;
            aPInvoiceInfo.TagDocumentHeader.VendorAddressLine2 = obj.VendorAddressLine2;
            aPInvoiceInfo.TagDocumentHeader.VendorAddressLine3 = obj.VendorAddressLine3;
            aPInvoiceInfo.TagDocumentHeader.VendorAddressLine4 = obj.VendorAddressLine4;
            aPInvoiceInfo.TagDocumentHeader.VendorCity = obj.VendorCity;
            aPInvoiceInfo.TagDocumentHeader.VendorState = obj.VendorState;
            aPInvoiceInfo.TagDocumentHeader.VendorZip = obj.VendorZip;
            aPInvoiceInfo.TagDocumentHeader.BypassPotentialDuplicate = obj.BypassPotentialDuplicate;


            aPInvoiceInfo.IndexPivotAPInvoice = new IndexPivotAPInvoice();
            aPInvoiceInfo.IndexPivotAPInvoice.DocumentID = Convert.ToInt32(obj.DocId);
            aPInvoiceInfo.IndexPivotAPInvoice.Co_Number = obj.CO_Number;
            aPInvoiceInfo.IndexPivotAPInvoice.Div_Dept = obj.Div_Dept;
            aPInvoiceInfo.IndexPivotAPInvoice.PO_Number = obj.PO_Number;
            aPInvoiceInfo.IndexPivotAPInvoice.Doc_Type = obj.Doc_Type;
            aPInvoiceInfo.IndexPivotAPInvoice.Vendor_Name = obj.Vendor_Name;
            aPInvoiceInfo.IndexPivotAPInvoice.Vendor_Number = obj.Vendor_Number;
            aPInvoiceInfo.IndexPivotAPInvoice.Invoice_Number = obj.Invoice_Number;
            aPInvoiceInfo.IndexPivotAPInvoice.Invoice_Date = obj.Invoice_Date;
            aPInvoiceInfo.IndexPivotAPInvoice.Invoice_Amount = obj.Invoice_Amount;
            aPInvoiceInfo.IndexPivotAPInvoice.Due_Date = obj.Due_Date == "" ? null : obj.Due_Date;
            aPInvoiceInfo.IndexPivotAPInvoice.Terms = obj.Terms;
            aPInvoiceInfo.IndexPivotAPInvoice.Rtng_Code = obj.Rtng_Code;
            aPInvoiceInfo.IndexPivotAPInvoice.Description1 = obj.Description1;
            aPInvoiceInfo.IndexPivotAPInvoice.Contract_Number = obj.Contract_Number;
            aPInvoiceInfo.IndexPivotAPInvoice.SiteID = obj.SiteID;
            aPInvoiceInfo.IndexPivotAPInvoice.PANumber = obj.PANumber;
            aPInvoiceInfo.IndexPivotAPInvoice.Originator = obj.Originator;

            aPInvoiceInfo.IndexPivotAPInvoice.Invoice_Type = obj.Invoice_Type;


            // TSS DURGA(07/09/2019) save discout date and amount into IndexPivot.

            aPInvoiceInfo.IndexPivotAPInvoice.TaxAmount = string.IsNullOrEmpty(Convert.ToString(obj.TaxAmount)) ? null : Convert.ToDecimal(obj.TaxAmount);
            aPInvoiceInfo.IndexPivotAPInvoice.Freight = string.IsNullOrEmpty(Convert.ToString(obj.FreightAmount)) ? null : Convert.ToDecimal(obj.FreightAmount);
            aPInvoiceInfo.IndexPivotAPInvoice.DiscountAmount = string.IsNullOrEmpty(Convert.ToString(obj.InvoiceDiscountAmount)) ? null : Convert.ToDecimal(obj.InvoiceDiscountAmount);
            aPInvoiceInfo.IndexPivotAPInvoice.DiscountDate = obj.DiscountDueDate == "" ? null : obj.DiscountDueDate;


            aPInvoiceInfo.IndexPivotAPInvoice.SeparatePayment = obj.SeparatePayment;
            aPInvoiceInfo.IndexPivotAPInvoice.DeptCode = obj.DeptCode;
            aPInvoiceInfo.IndexPivotAPInvoice.AccountingCode = obj.AccountingCode;

            aPInvoiceInfo.IndexPivotAPInvoice.Payment_Type = obj.Payment_Type;
            aPInvoiceInfo.IndexPivotAPInvoice.SpecialHandling = obj.SpecialHandling;
            aPInvoiceInfo.IndexPivotAPInvoice.SpecialHandlingInstructions = obj.SpecialHandlingInstructions;
            aPInvoiceInfo.IndexPivotAPInvoice.ProcurementInstructions = obj.ProcurementInstructions;
            aPInvoiceInfo.IndexPivotAPInvoice.Appr = obj.UserAppr;
            aPInvoiceInfo.IndexPivotAPInvoice.PTY = obj.PTY;


            aPInvoiceInfo.TagDocumentDetail = new List<TagDocumentDetail>();
            TagDocumentDetail objTagDet = null;

            foreach (var tagDet in obj.TagDocumentDetail)
            {
                objTagDet = new TagDocumentDetail();
                objTagDet.DocumentID = Convert.ToInt32(tagDet.DocumentID);
                objTagDet.RowStatus = tagDet.RowStatus;
                if (tagDet.RowStatus != "Add")
                    objTagDet.TagDocumentDetailsID = Convert.ToInt32(tagDet.TagDocumentDetailsID);
                objTagDet.ExpenseAccountNumber = tagDet.ExpenseAccountNumber;
                objTagDet.ExpenseAccountDescription = tagDet.ExpenseAccountDescription;
                objTagDet.ExpensedAmount = Convert.ToDecimal(tagDet.ExpensedAmount);
                objTagDet.IsPORow = tagDet.IsPORow;
                aPInvoiceInfo.TagDocumentDetail.Add(objTagDet);
            }
            aPInvoiceInfo.SubmitAction = obj.SubmitAction;
            aPInvoiceInfo.WorkFlowID = Convert.ToInt32(obj.WorkFlowID);
            aPInvoiceInfo.NodeID = Convert.ToInt32(obj.NodeID);
            aPInvoiceInfo.NodeText = obj.NodeText;
            aPInvoiceInfo.NextUserDetailsID = obj.NextUserDetailsID;
            aPInvoiceInfo.SMD_NextNodeID = Convert.ToInt32(obj.SMD_NextNodeID);
            aPInvoiceInfo.SMD_CurrentNodeID = Convert.ToInt32(obj.SMD_CurrentNodeID);
            aPInvoiceInfo.SMD_Dynamic = obj.SMD_Dynamic;
            aPInvoiceInfo.IsApproverSelected = Convert.ToBoolean(obj.IsApproverSelected);
            aPInvoiceInfo.IsLoggedInUserExcludedFromApprovalList = Convert.ToBoolean(obj.IsLoggedInUserExcludedFromApprovalList);
            aPInvoiceInfo.IndexPivotAPInvoice.New_Vendor_Name = obj.NewVendorName;
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            await APIClient.CallPostAsJsonAsync<APInvoiceInfo>(APIConstants.SaveAPInvoiceInfo, false, aPInvoiceInfo, headerParams);

            return Json("Data Saved", JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public async Task<Int32> SaveTagDocumentDetail(string jsonValue)
        {
            dynamic obj = JsonConvert.DeserializeObject(jsonValue);
            TagDocumentDetail tagDocumentDetail = new TagDocumentDetail();
            tagDocumentDetail.DocumentID = Convert.ToInt32(obj.DocumentID);
            if (obj.RowStatus == DcConstants.Update || obj.RowStatus == DcConstants.Delete)
                tagDocumentDetail.TagDocumentDetailsID = Convert.ToInt32(obj.TagDocumentDetailsID);
            if (obj.RowStatus != DcConstants.Delete)
            {
                tagDocumentDetail.ExpenseAccountNumber = obj.ExpenseAccountNumber;
                tagDocumentDetail.ExpenseAccountDescription = obj.ExpenseAccountDescription != null ? obj.ExpenseAccountDescription : null;
                tagDocumentDetail.ExpensedAmount = obj.ExpensedAmount != null ? Convert.ToDecimal(obj.ExpensedAmount) : null;
            }
            tagDocumentDetail.RowStatus = obj.RowStatus;
            tagDocumentDetail.IsPORow = obj.IsPORow;
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            return (Int32)await APIClient.CallPostAsJsonAsync<Int32>(string.Format(APIConstants.SaveTagDocumentDetail, obj.UserID, obj.CompanyNo, obj.VendorNo, obj.workFlowId, obj.nodeId), false, tagDocumentDetail, headerParams);
        }

        [HttpPost]
        public async Task<Int32> SaveTagDocumentDetail_PODetail(string jsonValue)
        {
            dynamic obj = JsonConvert.DeserializeObject(jsonValue);
            TagDocumentDetail tagDocumentDetail = new TagDocumentDetail();
            tagDocumentDetail.DocumentID = Convert.ToInt32(obj.DocumentID);
            if (obj.RowStatus == DcConstants.Update || obj.RowStatus == DcConstants.Delete)
                tagDocumentDetail.TagDocumentDetailsID = Convert.ToInt32(obj.TagDocumentDetailsID);
            if (obj.RowStatus != DcConstants.Delete)
            {

                tagDocumentDetail.ExpenseAccountNumber = obj.ExpenseAccountNumber;
                tagDocumentDetail.ExpenseAccountDescription = obj.ExpenseAccountDescription != null ? obj.ExpenseAccountDescription : null;
                tagDocumentDetail.ExpensedAmount = obj.ExpensedAmount != null ? Convert.ToDecimal(obj.ExpensedAmount) : null;

                tagDocumentDetail.PO = obj.PO;
                tagDocumentDetail.LINSEQ = obj.LINSEQ != null ? Convert.ToInt32(obj.LINSEQ) : null;


                tagDocumentDetail.POItemDescription = obj.POItemDescription != null ? obj.POItemDescription : null;
                tagDocumentDetail.POQty = obj.POQty != null ? Convert.ToDecimal(obj.POQty) : null;
                tagDocumentDetail.POPrice = obj.POPrice != null ? Convert.ToDecimal(obj.POPrice) : null;
                tagDocumentDetail.ExtendedCost = obj.ExtendedCost != null ? Convert.ToDecimal(obj.ExtendedCost) : null;
                tagDocumentDetail.ReceivingQty = obj.ReceivingQty != null ? Convert.ToDecimal(obj.ReceivingQty) : null;
                tagDocumentDetail.InvoiceQty = obj.InvoiceQty != null ? Convert.ToDecimal(obj.InvoiceQty) : null;
                tagDocumentDetail.InvoicePrice = obj.InvoicePrice != null ? Convert.ToDecimal(obj.InvoicePrice) : null;
                tagDocumentDetail.POExtendedPrice = obj.POExtendedPrice != null ? Convert.ToDecimal(obj.POExtendedPrice) : null;
                tagDocumentDetail.Difference = obj.POExtendedPrice != null ? Convert.ToDecimal(obj.Difference) : null;
                tagDocumentDetail.DetTaxAmount = obj.DetTaxAmount != null ? Convert.ToBoolean(obj.DetTaxAmount) : false;
                tagDocumentDetail.DetFreightAmount = obj.DetFreightAmount != null ? Convert.ToBoolean(obj.DetFreightAmount) : false;
                tagDocumentDetail.DetMiscAmount = obj.DetMiscAmount != null ? Convert.ToBoolean(obj.DetMiscAmount) : false;

            }
            tagDocumentDetail.RowStatus = obj.RowStatus;
            tagDocumentDetail.IsPORow = obj.IsPORow;
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            return (Int32)await APIClient.CallPostAsJsonAsync<Int32>(string.Format(APIConstants.SaveTagDocumentDetail_PODetail, obj.DocumentID, obj.CompanyNo, obj.VendorNo, obj.InvoiceDate, obj.InvoiceAmount, obj.workFlowId, obj.nodeId), false, tagDocumentDetail, headerParams);
        }


        [HttpPost]
        public async Task<JsonResult> SaveExcelUpl_TagDocumentDetails(string jsonValue, string gLCodePrefix, string DocumentID)
        {
            dynamic obj2 = JsonConvert.DeserializeObject(jsonValue);
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);

            List<TagDocumentDetail> lstTagDocumentDetail = new List<TagDocumentDetail>();
            List<TagDocumentDetail> lstInvalidTagDocumentDetail = new List<TagDocumentDetail>();

            foreach (var obj in obj2)
            {

                TagDocumentDetail tagDocumentDetail = new TagDocumentDetail();
                List<GLDetails> lst = new List<GLDetails>();
                tagDocumentDetail.ExpenseAccountNumber = Convert.ToString(obj.GL).Trim();
                if (tagDocumentDetail.ExpenseAccountNumber.Trim() != "")
                {
                    lst = (List<GLDetails>)await APIClient.CallObjectTypeAsync<List<GLDetails>>(string.Format(APIConstants.GetGLAccounts, tagDocumentDetail.ExpenseAccountNumber, gLCodePrefix), headerParams);
                }
                tagDocumentDetail.ReceivingQty = IsValidDecimal(Convert.ToString(obj.ReceivedQty)) ? Convert.ToDecimal(obj.ReceivedQty) : 0;
                tagDocumentDetail.InvoiceQty = IsValidDecimal(Convert.ToString(obj.InvoiceQty)) ? Convert.ToDecimal(obj.InvoiceQty) : 0;
                tagDocumentDetail.InvoicePrice = IsValidDecimal(Convert.ToString(obj.InvoicePrice)) ? Convert.ToDecimal(obj.InvoicePrice) : 0;
                tagDocumentDetail.POExtendedPrice = Convert.ToDecimal(tagDocumentDetail.InvoiceQty * tagDocumentDetail.InvoicePrice);


                //tagDocumentDetail.ReceivingQty = obj.ReceivedQty != null ? Convert.ToDecimal(obj.ReceivedQty) : null;
                //tagDocumentDetail.InvoiceQty = obj.InvoiceQty != null ? Convert.ToDecimal(obj.InvoiceQty) : null;
                //tagDocumentDetail.InvoicePrice = obj.InvoicePrice != null ? Convert.ToDecimal(obj.InvoicePrice) : null;
                //tagDocumentDetail.POExtendedPrice = Convert.ToDecimal(tagDocumentDetail.InvoiceQty * tagDocumentDetail.InvoicePrice);
                tagDocumentDetail.POItemDescription = Convert.ToString(obj.Description);


                if (lst.Count > 0)
                {
                    // tagDocumentDetail.ExpenseAccountNumber.Trim() == lst[0].GlCode.Trim()
                    var res2 = lst.Where(x => x.GlCode.Trim() == tagDocumentDetail.ExpenseAccountNumber.Trim());
                    if (res2.Count() == 0)
                    {
                        lstInvalidTagDocumentDetail.Add(tagDocumentDetail);
                    }
                    else
                    {
                        tagDocumentDetail.DocumentID = Convert.ToInt32(DocumentID);
                        tagDocumentDetail.POItemDescription = lst[0].Description;
                        tagDocumentDetail.RowStatus = "Add";
                        //tagDocumentDetail.IsPORow = obj.IsPORow;
                        lstTagDocumentDetail.Add(tagDocumentDetail);

                        Int32 res = (Int32)await APIClient.CallPostAsJsonAsync<Int32>(string.Format(APIConstants.SaveExcelUpl_TagDocumentDetails), false, tagDocumentDetail, headerParams);
                    }
                }
                else
                {
                    lstInvalidTagDocumentDetail.Add(tagDocumentDetail);
                }
            }
            return Json(lstInvalidTagDocumentDetail, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public async Task<Int32> SaveWorkFlowNotes(string jsonValue)
        {
            dynamic obj = JsonConvert.DeserializeObject(jsonValue);
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            return (Int32)await APIClient.CallPostAsJsonAsync<Int32>(string.Format(APIConstants.SaveWorkFlowNotes, obj.UserDetailsID, obj.DocumentID, Server.UrlEncode(Convert.ToString(obj.Note))), false, null, headerParams);
        }

        [HttpPost]
        public async Task<Int32> PONumber_GridLines_Refresh()
        {
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            return (Int32)await APIClient.CallPostAsJsonAsync<Int32>(APIConstants.PONumber_GridLines_Refresh, false, null, headerParams);
        }

        [HttpPost]
        public async Task<JsonResult> ForwardToUser(string jsonValue)
        {
            dynamic obj = JsonConvert.DeserializeObject(jsonValue);
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            await APIClient.CallPostAsJsonAsync<object>(string.Format(APIConstants.ForwardTo, obj.NextUserDetailsID, obj.CurrentUserDetailsID, obj.CurrentNodeID, obj.DocumentID, obj.WorkflowID, Server.UrlEncode(Convert.ToString(obj.Note)), obj.NodeText), false, null, headerParams);

            return Json("Forwarded successfully", JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public async Task<JsonResult> RejectTo(string jsonValue)
        {
            dynamic obj = JsonConvert.DeserializeObject(jsonValue);
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            await APIClient.CallPostAsJsonAsync<object>(string.Format(APIConstants.RejectTo, obj.UserDetailsID, obj.DocumentID, obj.WorkflowID, obj.CurrentNodeID, Server.UrlEncode(Convert.ToString(obj.Note)), obj.NodeText), false, null, headerParams);

            return Json("Reject successfully", JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async Task<JsonResult> SendToReply(string jsonValue)
        {
            dynamic obj = JsonConvert.DeserializeObject(jsonValue);
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            await APIClient.CallPostAsJsonAsync<object>(string.Format(APIConstants.SendToReply, obj.DocumentID, obj.WorkflowID, obj.CurrentNodeID, Server.UrlEncode(Convert.ToString(obj.ReplyNote))), false, null, headerParams);

            return Json("Sent reply successfully", JsonRequestBehavior.AllowGet);
        }
        public async Task<JsonResult> GetRefreshFieldRules(int workFlowID, int nodeID, bool IsForwardActual)
        {
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);

            List<DCConfiguration> lstDCConfig = (List<DCConfiguration>)await APIClient.CallObjectTypeAsync<List<DCConfiguration>>(string.Format(APIConstants.GetDCConfiguration), headerParams);
            DCConfiguration dcConfig = lstDCConfig.Where(m => m.ConfigName == "FieldRulesCustomColumn").SingleOrDefault();
            string custColumn = dcConfig != null ? (string.IsNullOrEmpty(dcConfig.ConfigValue) ? "" : dcConfig.ConfigValue) : "";
            string custColumnVal = string.IsNullOrEmpty(custColumn) ? string.Empty : await GetCustomColumnValue(custColumn, Convert.ToInt32(headerParams.DocumentID), headerParams);//GetCustomColumnValueFromEntity(custColumn, aPInvoiceInfo);


            List<FieldRules> lstFieldRules = (List<FieldRules>)await APIClient.CallObjectTypeAsync<List<FieldRules>>(string.Format(APIConstants.GetFieldRules, workFlowID, nodeID, headerParams.WF, IsForwardActual, custColumnVal), headerParams);

            ViewData["FieldRules"] = lstFieldRules;
            return Json(lstFieldRules, JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetVendorAddress_ByVendorNoJson(string vendorNo, int documentID)
        {
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            return Json((List<VendorAddress>)await APIClient.CallObjectTypeAsync<List<VendorAddress>>(string.Format(APIConstants.GetVendorAddress_ByVendorNo, Server.UrlEncode(vendorNo), documentID), headerParams), JsonRequestBehavior.AllowGet);
        }
        public async Task<JsonResult> GetProjectNumber_ByPONumberJson(string pONumber, HeaderParams headerParams)
        {
            return Json((string)await GetProjectNumber_ByPONumber(pONumber, headerParams), JsonRequestBehavior.AllowGet);
        }
        public async Task<JsonResult> GetPaymentTermsByVendorNoJson(string vendorNo, HeaderParams headerParams)
        {
            return Json((VendorBasedData)await APIClient.CallObjectTypeAsync<VendorBasedData>(string.Format(APIConstants.GetPaymentTermsByVendorNo, Server.UrlEncode(vendorNo)), headerParams), JsonRequestBehavior.AllowGet);

            //return (string)await APIClient.CallPostAsJsonAsync<string>(string.Format(APIConstants.GetPaymentTermsByVendorNo, vendorNo), false, null);

        }
        public async Task<JsonResult> GetPaymentMethodsByVendorNoJson(string vendorNo, HeaderParams headerParams)
        {
            return Json((string)await APIClient.CallObjectTypeAsync<string>(string.Format(APIConstants.GetPaymentMethodsByVendorNo, vendorNo), headerParams), JsonRequestBehavior.AllowGet);
        }


        public async Task<JsonResult> GetSmartListJson(string userID, string companyNo, string vendorID, HeaderParams headerParams)
        {
            return Json((List<SmartList>)await APIClient.CallObjectTypeAsync<List<SmartList>>(string.Format(APIConstants.GetSmartList, userID, companyNo, vendorID), headerParams), JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetSmartListHeader(string companyNo, string vendorID, string documentID, HeaderParams headerParams)
        {
            return Json((List<SmartListHeader>)await APIClient.CallObjectTypeAsync<List<SmartListHeader>>(string.Format(APIConstants.GetSmartListHeader, companyNo, vendorID, documentID), headerParams), JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetSmartListDetail(string documentID, HeaderParams headerParams)
        {
            return Json((List<SmartListDetail>)await APIClient.CallObjectTypeAsync<List<SmartListDetail>>(string.Format(APIConstants.GetSmartListDetail, documentID), headerParams), JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> ReloadPODetails(int documentId)
        {
            return Json((List<TagDocumentDetail>)await APIClient.CallObjectTypeAsync<List<TagDocumentDetail>>(string.Format(APIConstants.ReloadPODetails, documentId), APIClient.GetHeaderObject(Request)), JsonRequestBehavior.AllowGet);
        }

        public async Task<VendorAddress> GetPopulateAddressText(string remitAddrTxt, string remitAddrCod, string vendorNo, int documentID, HeaderParams headerParams)
        {
            VendorAddress vendorAddress = (VendorAddress)await APIClient.CallObjectTypeAsync<VendorAddress>(string.Format(APIConstants.GetPopulateAddressText, Server.UrlEncode(remitAddrTxt), remitAddrCod, Server.UrlEncode(vendorNo), documentID), headerParams);
            return vendorAddress;
        }

        public async Task<JsonResult> GetPopulateAddressTextJson(string remitAddrTxt, string remitAddrCod, string vendorNo, int documentID)
        {
            return Json((VendorAddress)await APIClient.CallObjectTypeAsync<VendorAddress>(string.Format(APIConstants.GetPopulateAddressText, Server.UrlEncode(remitAddrTxt), remitAddrCod, Server.UrlEncode(vendorNo), documentID), APIClient.GetHeaderObject(Request)), JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetGLAccountsJson(string preText, string gLCodePrefix)
        {
            //List<string> lst = (List<string>)await APIClient.CallObjectTypeAsync<List<string>>(string.Format(APIConstants.GetGLAccounts, preText.Trim(), gLCodePrefix));
            List<GLDetails> lst = (List<GLDetails>)await APIClient.CallObjectTypeAsync<List<GLDetails>>(string.Format(APIConstants.GetGLAccounts, preText, gLCodePrefix), APIClient.GetHeaderObject(Request));
            return Json(lst, JsonRequestBehavior.AllowGet);
        }


        public async Task<JsonResult> GetSearchValue(string searchkey, string searchValue)
        {
            List<Vendor> lstVendor = new List<Vendor>();
            bool isWildCard = false;

            string search = searchValue.Trim().Replace("'", "''");
            search = search.Trim().Replace('*', '%');
            if (search.IndexOf("%") != (-1))
                isWildCard = true;
            lstVendor = await GetVendor_searchByWildCard(searchkey, search, isWildCard);

            return Json(lstVendor, JsonRequestBehavior.AllowGet);

            /*List<Vendor> lstVendor = null;
            bool isWildCard = false;

            string search = searchValue.Trim().Replace("'", "''");

            //first check to see if the user searched for new vendor
            string newvend = search.Trim().ToLower();
            newvend = newvend.Replace("*", "").Trim();

            if (!((newvend == DcConstants.NewVendor) || (newvend == DcConstants.New_Vendor)))
            {
                //Based on the type of search selected, call the appropriate handler.
                if (searchkey.ToLower().Trim() == "shortname")
                {
                    //search by VendorNameSort expression.                    
                    search = search.Trim().Replace('*', '%');
                    search = search.ToUpper();

                    if (search.Length > 10)          //c_mod sort must be only 10 len (leave slot for the % wild card)
                        search = search.Substring(0, 10);
                }
                else if (searchkey.ToLower().Trim() == "name")
                {
                    //search by VendorName.                    
                    search = search.Trim().Replace('*', '%');
                }
                //else if (searchkey.ToLower().Trim() == "number")
                //{
                //    //search by VendorNumber.
                //    ds = dataHandler.searchVendorNumber(search);
                //}
                else if (searchkey.ToLower().Trim() == "dba")
                {
                    //search by VendorNumber.
                    search = search.Trim().Replace('*', '%');
                }
                if (search.IndexOf("%") != (-1))
                    isWildCard = true;
                lstVendor = await GetVendor_searchByWildCard(searchkey, search, isWildCard);
            }

            return Json(lstVendor, JsonRequestBehavior.AllowGet);*/
        }

        public async Task<JsonResult> GetSearchValue_PONumber(string searchValue, bool isHeaderPObasedSearch)
        {
            List<SelectListItem> lstPONumber = new List<SelectListItem>();
            bool isWildCard = false;

            string search = searchValue.Trim().Replace("'", "''");
            search = search.Trim().Replace('*', '%');
            if (search.IndexOf("%") != (-1))
                isWildCard = true;
            List<PODetails> lst = await GetPONumber_searchByWildCard(search, isWildCard, isHeaderPObasedSearch);
            foreach (var val in lst)
            {
                lstPONumber.Add(new SelectListItem() { Text = val.PO_number_POPrice, Value = val.PO_Number });
            }

            return Json(lstPONumber, JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetSearchValue_PONumberForGrid(string searchValue)
        {
            List<SelectListItem> lstPONumber = new List<SelectListItem>();
            bool isWildCard = false;

            string search = searchValue.Trim().Replace("'", "''");
            search = search.Trim().Replace('*', '%');
            if (search.IndexOf("%") != (-1))
                isWildCard = true;
            List<string> lst = await GetPONumbers_forGrid(search, isWildCard);
            foreach (string val in lst)
            {
                lstPONumber.Add(new SelectListItem() { Text = val, Value = val });
            }

            return Json(lstPONumber, JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetActiveDepartmentsJson()
        {
            return Json((List<ActiveDepartment>)await APIClient.CallObjectTypeAsync<List<ActiveDepartment>>(APIConstants.GetActiveDepartments, APIClient.GetHeaderObject(Request)), JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetActiveDocumentNamesJson()
        {
            return Json((List<ActiveDocumentName>)await APIClient.CallObjectTypeAsync<List<ActiveDocumentName>>(APIConstants.GetActiveDocumentNames, APIClient.GetHeaderObject(Request)), JsonRequestBehavior.AllowGet);
        }
        public async Task<JsonResult> GetActiveDepartments_BycompCodeJson(string compCode)
        {
            return Json((List<ActiveDepartment>)await APIClient.CallObjectTypeAsync<List<ActiveDepartment>>(string.Format(APIConstants.GetActiveDepartments_ByCompCode, compCode), APIClient.GetHeaderObject(Request)), JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetForwardUsers(string searchText, string userDetailsID, int workflowID, int documentID)
        {
            List<string> lst = (List<string>)await APIClient.CallObjectTypeAsync<List<string>>(string.Format(APIConstants.GetForwardUsers, searchText, userDetailsID, workflowID, documentID), APIClient.GetHeaderObject(Request));
            return Json(lst, JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetVendorDetails(string pONumber)
        {
            return Json((List<Vendor>)await APIClient.CallObjectTypeAsync<List<Vendor>>(string.Format(APIConstants.GetVendor_ByPONumber, pONumber), APIClient.GetHeaderObject(Request)), JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetTagDocumentDetails_ByPONumber(int documentID, string pONumber)
        {
            return Json((List<TagDocumentDetail>)await APIClient.CallObjectTypeAsync<List<TagDocumentDetail>>(string.Format(APIConstants.GetTagDocumentDetails_ByPONumber, documentID, pONumber), APIClient.GetHeaderObject(Request)), JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetSiteByCompany(string companyId)
        {
            List<ActiveSite> lst = (List<ActiveSite>)await APIClient.CallObjectTypeAsync<List<ActiveSite>>(string.Format(APIConstants.GetActiveSites_ByCompany, companyId), APIClient.GetHeaderObject(Request));
            return Json(lst, JsonRequestBehavior.AllowGet);
        }

        public JsonResult ValidateInvoiceDate(string invoiceDate, bool invoicebackdateValidationCheck)
        {
            string vadideMsg = IsInvoiceDateValide(invoiceDate, invoicebackdateValidationCheck);
            return Json(vadideMsg, JsonRequestBehavior.AllowGet);
        }

        public JsonResult ValidateDueDate(string dueDate, string invoiceDate, bool isDuedatevalidation, bool validateDueDateWithCurrentDate)
        {
            string vadideMsg = IsDueDateValide(dueDate, invoiceDate, isDuedatevalidation, validateDueDateWithCurrentDate);
            return Json(vadideMsg, JsonRequestBehavior.AllowGet);
        }

        public JsonResult CalculateUnallocateBalance(decimal invoiceAmount, decimal taxAmount, decimal freight, decimal misc, decimal allocatedAmount)
        {
            decimal unallocatedBalance = invoiceAmount - taxAmount - freight - misc - allocatedAmount;
            return Json(unallocatedBalance, JsonRequestBehavior.AllowGet);
        }


        public async Task<JsonResult> GetSiteIdUsers_ByUserDetailsID(string userdetailsID)
        {
            List<SiteIdUser> lst = (List<SiteIdUser>)await APIClient.CallObjectTypeAsync<List<SiteIdUser>>(string.Format(APIConstants.GetSiteIdUsers_ByUserDetailsID, userdetailsID), APIClient.GetHeaderObject(Request));
            return Json(lst, JsonRequestBehavior.AllowGet);
        }

        public JsonResult GetPOAuthDocumentStatusByPONumber(string pONumber, HeaderParams headerParams)
        {
            return Json((string)APIClient.CallObjectType<string>(string.Format(APIConstants.GetPOAuthDocumentStatusByPONumber, pONumber), headerParams));
        }

        public async Task<string> GetCustomColumnValue(string customColumn, int documentID, HeaderParams headerParams)
        {
            return (string)await APIClient.CallObjectTypeAsync<string>(string.Format(APIConstants.GetCustomColumnValue, Server.UrlEncode(Convert.ToString(customColumn)), documentID), headerParams);
        }

        #endregion

        #region Methods to populate dropdowns /API calls        

        private async Task<APInvoiceInfo> GetDocumentData(string userdetailsId, string documentid, string wf, string inboxlink, HeaderParams headerParams)
        {
            return (APInvoiceInfo)await APIClient.CallObjectTypeAsync<APInvoiceInfo>(string.Format(APIConstants.GetAPInvoiceInfo, userdetailsId, documentid, wf, inboxlink), headerParams);
        }

        private async Task<List<ActiveCompany>> GetActiveCompanies(HeaderParams headerParams)
        {
            return (List<ActiveCompany>)await APIClient.CallObjectTypeAsync<List<ActiveCompany>>(APIConstants.GetActiveCompanies, headerParams);
        }


        //public JsonResult GetShopPoReviewUsers(string documentid, int workflowid)
        //{
        //    List<ShopPOReview> shopReview = new List<ShopPOReview>();
        //    shopReview = (List<ShopPOReview>)APIClient.CallObjectType<List<ShopPOReview>>(string.Format(APIConstants.GetShopPoReviewUsers, documentid, workflowid));
        //    return Json(shopReview,JsonRequestBehavior.AllowGet);

        //}
        //private List<ShopPOReview> GetShopPoReviewUsers(string documentid, int workflowid)
        //{
        //    List<ShopPOReview> shopReview = new List<ShopPOReview>();
        //    shopReview = GetShopPoReviewUsersBySite(documentid, workflowid);
        //    return shopReview;//((APIConstants.GetShopPoReviewUsers, documentid,workflowid));
        //}

        //private List<ShopPOReview> GetShopPoReviewUsersBySite(string documentid, int workflowid)
        //{
        //    return (List<ShopPOReview>)APIClient.CallObjectType<List<ShopPOReview>>(string.Format(APIConstants.GetShopPoReviewUsers, documentid, workflowid));
        //}

        private async Task<List<ActiveDepartment>> GetActiveDepartments(HeaderParams headerParams)
        {
            return (List<ActiveDepartment>)await APIClient.CallObjectTypeAsync<List<ActiveDepartment>>(APIConstants.GetActiveDepartments, headerParams);
        }

        private async Task<List<ActiveSite>> GetSites(HeaderParams headerParams)
        {
            return (List<ActiveSite>)await APIClient.CallObjectTypeAsync<List<ActiveSite>>(APIConstants.GetActiveSites, headerParams);
        }

        private async Task<List<Vendor>> GetVendor_searchByWildCard(string searchKey, string searchText, bool isWildCard)
        {
            return (List<Vendor>)await APIClient.CallObjectTypeAsync<List<Vendor>>(string.Format(APIConstants.GetVendor_searchByWildCard, searchKey, Server.UrlEncode(searchText), isWildCard), APIClient.GetHeaderObject(Request));
        }

        private List<Vendor> GetVendor_searchByWildCardWithoutAsyn(string searchKey, string searchText, bool isWildCard, HeaderParams headerParams)
        {
            return (List<Vendor>)APIClient.CallObjectType<List<Vendor>>(string.Format(APIConstants.GetVendor_searchByWildCard, searchKey, Server.UrlEncode(searchText), isWildCard), headerParams);
        }

        private async Task<List<PODetails>> GetPONumber_searchByWildCard(string searchText, bool isWildCard, bool isHeaderPObasedSearch)
        {
            return (List<PODetails>)await APIClient.CallObjectTypeAsync<List<PODetails>>(string.Format(APIConstants.GetPONumber_searchByWildCard, Server.UrlEncode(searchText), isWildCard, isHeaderPObasedSearch), APIClient.GetHeaderObject(Request));
        }
        private async Task<List<string>> GetPONumbers_forGrid(string searchText, bool isWildCard)
        {
            return (List<string>)await APIClient.CallObjectTypeAsync<List<string>>(string.Format(APIConstants.GetPONumbers_forGrid, Server.UrlEncode(searchText), isWildCard), APIClient.GetHeaderObject(Request));
        }

        private async Task<List<VendorAddress>> GetVendorAddress_ByVendorNo(string vendorNo, int documentID, HeaderParams headerParams)
        {
            return (List<VendorAddress>)await APIClient.CallObjectTypeAsync<List<VendorAddress>>(string.Format(APIConstants.GetVendorAddress_ByVendorNo, Server.UrlEncode(vendorNo), documentID), headerParams);
        }

        private async Task<List<PaymentTerms>> GetTermsInfo(HeaderParams headerParams)
        {
            return (List<PaymentTerms>)await APIClient.CallObjectTypeAsync<List<PaymentTerms>>(APIConstants.GetTermsInfo, headerParams);
        }

        private async Task<List<PaymentCodeType>> GetPaymentCodeTypes(HeaderParams headerParams)
        {

            return (List<PaymentCodeType>)await APIClient.CallObjectTypeAsync<List<PaymentCodeType>>(APIConstants.GetPaymentCodeTypes, headerParams);
        }

        //private List<Vendor> GetVendors(string vendorNo, string vendorName)
        //{
        //    if (!string.IsNullOrEmpty(vendorNo) && !string.IsNullOrEmpty(vendorName))
        //    {
        //        if (vendorName == DcConstants.NewVendor || vendorName == DcConstants.New_Vendor)
        //            return new List<Vendor>() { new Vendor() { Number = vendorNo, Name = vendorName, DBAs = vendorName } };
        //        else
        //            return new List<Vendor>() { new Vendor() { Number = vendorNo, Name = vendorName, DBAs = vendorName }, new Vendor() { Number = DcConstants.New_Vendor, Name = DcConstants.New_Vendor, DBAs = DcConstants.New_Vendor } };

        //    }
        //    else if (!string.IsNullOrEmpty(vendorName) && string.IsNullOrEmpty(vendorNo))
        //    {
        //        return GetVendor_searchByWildCardWithoutAsyn("name", vendorName, false);
        //    }
        //    else if (string.IsNullOrEmpty(vendorName) && !string.IsNullOrEmpty(vendorNo))
        //    {
        //        return GetVendor_searchByWildCardWithoutAsyn("number", vendorNo, false);
        //    }
        //    else
        //        return new List<Vendor>() { new Vendor() { Number = DcConstants.New_Vendor, Name = DcConstants.New_Vendor, DBAs = DcConstants.New_Vendor } };
        //}

        private List<Vendor> GetVendors(string vendorNo, string vendorName, string docLoc)
        {
            List<Vendor> lstVendor = new List<Vendor>();
            List<DCConfiguration> lstDCConfiguration = (List<DCConfiguration>)ViewData["DCConfigurations"];
            string isVendorMaintenanceRequired = Convert.ToString(lstDCConfiguration.Where(r => r.ConfigName == "IsVendorMaintenanceRequired").Select(r => r.ConfigValue).FirstOrDefault());

            if (docLoc.ToLower() == "end")
                lstVendor.Add(new Vendor() { Number = vendorNo, Name = vendorName, DBAs = vendorName });

            if (!string.IsNullOrEmpty(isVendorMaintenanceRequired) && isVendorMaintenanceRequired.ToUpper() == "TRUE")
            {
                lstVendor.Add(new Vendor() { Number = DcConstants.New_Vendor, Name = DcConstants.New_Vendor, DBAs = DcConstants.New_Vendor });
            }

            return lstVendor;
        }

        private List<Vendor> GetVendor_ByVendorNo(string vendorNo, HeaderParams headerParams)
        {
            List<Vendor> lstVendor = new List<Vendor>();
            List<DCConfiguration> lstDCConfiguration = (List<DCConfiguration>)ViewData["DCConfigurations"];
            string isVendorMaintenanceRequired = Convert.ToString(lstDCConfiguration.Where(r => r.ConfigName == "IsVendorMaintenanceRequired").Select(r => r.ConfigValue).FirstOrDefault());

            if (!string.IsNullOrEmpty(vendorNo))
            {
                lstVendor = (List<Vendor>)APIClient.CallObjectType<List<Vendor>>(string.Format(APIConstants.GetVendor_ByVendorNo, Server.UrlEncode(vendorNo.Trim())), headerParams);//GetVendor_searchByVendorNo("number", vendorNo.Trim());
            }
            else
            {
                if (!string.IsNullOrEmpty(isVendorMaintenanceRequired) && isVendorMaintenanceRequired.ToUpper() == "TRUE")
                {
                    lstVendor.Add(new Vendor() { Number = DcConstants.New_Vendor, Name = DcConstants.New_Vendor, DBAs = DcConstants.New_Vendor });
                }
            }
            return lstVendor;
        }

        private List<SelectListItem> GetPONumbers(string pONumber)
        {
            if (!string.IsNullOrEmpty(pONumber))
                return new List<SelectListItem>() { new SelectListItem() { Text = "", Value = "<select>" }, new SelectListItem() { Text = pONumber, Value = pONumber } };
            else
                return new List<SelectListItem>() { new SelectListItem() { Text = "", Value = "<select>" } };
        }

        private List<SelectListItem> GetPrepaidMonths()
        {
            List<SelectListItem> lstPrepaidMonth = new List<SelectListItem>();
            lstPrepaidMonth.Add(new SelectListItem() { Text = "Month Paid", Value = "0" });

            DateTime dtnow1 = DateTime.Now;
            int month1 = dtnow1.Month;
            int year1 = dtnow1.Year;
            string n1 = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(month1) + "-" + year1;
            lstPrepaidMonth.Add(new SelectListItem() { Text = n1, Value = n1 });

            for (int i = 1; i < 13; i++)
            {
                int k = dtnow1.AddMonths(+i).Month;
                int j = dtnow1.Month;
                int l = 0;
                if (k > j)
                {
                    l = dtnow1.Year;
                }
                else
                {
                    l = dtnow1.AddYears(+1).Year;

                }
                string m1 = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(k) + "-" + l;
                lstPrepaidMonth.Add(new SelectListItem() { Text = m1, Value = m1 });
            }
            //List<SelectListItem> lstValue = new List<SelectListItem>();
            //lstValue.AddRange(lstPrepaidMonth);
            return lstPrepaidMonth;
        }

        private List<SelectListItem> GetAccountingPeriod()
        {
            List<SelectListItem> lstAccountingPeriod = new List<SelectListItem>();
            lstAccountingPeriod.Add(new SelectListItem() { Text = "<select>", Value = "" });

            DateTime dtnow = DateTime.Now;
            ArrayList al = new ArrayList();

            for (int i = 2; i >= 1; i--)
            {
                int k = dtnow.AddMonths(-i).Month;
                int j = dtnow.Month;
                int l = 0;
                if (k > j)
                {
                    l = dtnow.AddYears(-1).Year;
                }
                else
                {
                    l = dtnow.Year;
                }
                string m = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(k) + "-" + l;
                lstAccountingPeriod.Add(new SelectListItem() { Text = m, Value = m });
            }

            int month = dtnow.Month;
            int year = dtnow.Year;
            string n = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(month) + "-" + year;
            lstAccountingPeriod.Add(new SelectListItem() { Text = n, Value = n });

            for (int i = 1; i <= 2; i++)
            {
                int k = dtnow.AddMonths(+i).Month;
                int j = dtnow.Month;
                int l = 0;
                if (k > j)
                {
                    l = dtnow.Year;
                }
                else
                {
                    l = dtnow.AddYears(+1).Year;

                }
                string m = CultureInfo.CurrentCulture.DateTimeFormat.GetAbbreviatedMonthName(k) + "-" + l;
                lstAccountingPeriod.Add(new SelectListItem() { Text = m, Value = m });
            }

            return lstAccountingPeriod;
        }

        private async Task<string> GetProjectNumber_ByPONumber(string pONumber, HeaderParams headerParams)
        {
            return (string)await APIClient.CallObjectTypeAsync<string>(string.Format(APIConstants.GetProjectNumber_ByPONumber, pONumber), headerParams);
        }

        private decimal? GetUnAllocated(decimal? invoiceAmount, decimal? hSTTaxAmount, decimal? freightAmount, decimal? miscAmount, List<TagDocumentDetail> lstTagDocDetails, out string lblMessage)
        {
            decimal? SumExpencedAmount = 0;
            lblMessage = "";
            if (lstTagDocDetails != null && lstTagDocDetails.Count > 0)
                SumExpencedAmount = lstTagDocDetails.Sum(m => m.POExtendedPrice);//lstTagDocDetails.Sum(m => m.ExpensedAmount);

            decimal? diff = invoiceAmount - hSTTaxAmount - freightAmount - miscAmount - SumExpencedAmount;
            //decimal? diff = invoiceAmount - SumExpencedAmount;
            if (diff < 0 || diff > 0)
                lblMessage = "Invoice out of Balance";

            return diff;
        }

        private async void GetViewDataFieldRules(int WorkFlowID, int NodeID, string wF, bool isForward)
        {
            List<FieldRules> lstFieldRules = (List<FieldRules>)await APIClient.CallObjectTypeAsync<List<FieldRules>>(string.Format(APIConstants.GetFieldRules, WorkFlowID, NodeID, wF), APIClient.GetHeaderObject(Request));
            if (isForward)
            {
                (lstFieldRules.ToList<FieldRules>()).ForEach(p => p.IsReadOnly = true);
                (lstFieldRules.Where(m => m.FieldName == "HeaderTab"
                || m.FieldName == "AccountAssignmentTab"
                || m.FieldName == "AccountAssignmentTab"
                || m.FieldName == "ReplyToSenderButton").ToList<FieldRules>()).ForEach(p => p.IsReadOnly = false);
            }

            ViewData["FieldRules"] = lstFieldRules;
        }

        private string IsInvoiceDateValide(string invoiceDate, bool invoicebackdateValidationCheck)
        {
            //InvoceDate <= (currentDate + 30days) && InvoiceDate<= (currentDate - 16Months)
            if (!string.IsNullOrEmpty(invoiceDate))
            {
                DateTime invDate = DateTime.ParseExact(Convert.ToDateTime(invoiceDate).ToString(DcConstants.Date_Formatte), DcConstants.Date_Formatte, System.Globalization.CultureInfo.InvariantCulture);
                DateTime cDate30days = DateTime.ParseExact(Convert.ToDateTime(DateTime.Now.AddDays(30)).ToString(DcConstants.Date_Formatte), DcConstants.Date_Formatte, System.Globalization.CultureInfo.InvariantCulture);
                DateTime cDateMinus16Months = DateTime.ParseExact(Convert.ToDateTime(DateTime.Today.AddMonths(-16)).ToString(DcConstants.Date_Formatte), DcConstants.Date_Formatte, System.Globalization.CultureInfo.InvariantCulture);
                //if(invDate <= cDate30days && invDate >= cDateMinus16Months)
                // {
                //     return true;
                // }
                if (!(invDate <= cDate30days))
                {
                    return "Invoice Date can not be greater than 30 days from now";
                }
                else if (invoicebackdateValidationCheck == true && !(invDate >= cDateMinus16Months))
                {
                    return "Invoice date can not be less than 16 Months from now";
                }

            }

            return "";
        }


        private string IsDueDateValide(string dueDate, string invoiceDate, bool isDuedatevalidation, bool validateDueDateWithCurrentDate)
        {
            //InvoceDate <= (currentDate + 30days) && InvoiceDate<= (currentDate - 16Months)
            if (!string.IsNullOrEmpty(dueDate) && !string.IsNullOrEmpty(invoiceDate))
            {
                DateTime duDate = DateTime.ParseExact(Convert.ToDateTime(dueDate).ToString(DcConstants.Date_Formatte), DcConstants.Date_Formatte, System.Globalization.CultureInfo.InvariantCulture);
                DateTime crntDate = DateTime.ParseExact(Convert.ToDateTime(DateTime.Now).ToString(DcConstants.Date_Formatte), DcConstants.Date_Formatte, System.Globalization.CultureInfo.InvariantCulture);
                DateTime invDate = DateTime.ParseExact(Convert.ToDateTime(invoiceDate).ToString(DcConstants.Date_Formatte), DcConstants.Date_Formatte, System.Globalization.CultureInfo.InvariantCulture);

                //DateTime cDateMinus16Months = DateTime.ParseExact(Convert.ToDateTime(DateTime.Today.AddMonths(-16)).ToString(DcConstants.Date_Formatte), DcConstants.Date_Formatte, System.Globalization.CultureInfo.InvariantCulture);
                //if(invDate <= cDate30days && invDate >= cDateMinus16Months)
                // {
                //     return true;
                // }       
                if (validateDueDateWithCurrentDate == true)
                {
                    if ((duDate < crntDate) && isDuedatevalidation == true)
                    {
                        return "Due date can not be less than to current date";
                    }
                }
                if ((duDate < invDate) && isDuedatevalidation == true) //if ((duDate < crntDate) && isDuedatevalidation == true)
                {
                    return "Due date can not be less than invoice date";//"Due date can not be less than to current date";
                }
                if (duDate > crntDate.AddDays(90))
                {
                    return "Due date can not be greater than 90 days from current date";
                }

            }

            return "";
        }


        #endregion

        private string GetCustomColumnValueFromEntity(string customColumn, APInvoiceInfo dCInfo)
        {
            object propertyVal = null;
            string[] entityVariables = customColumn.Split('.');

            if (entityVariables.Length == 2)
            {
                object entity = (object)dCInfo.GetType().GetProperty(entityVariables[0]).GetValue(dCInfo);
                propertyVal = entity.GetType().GetProperty(entityVariables[1]).GetValue(entity);
                //foreach (object o in (IEnumerable<object>)entity)
                //    propertyVal = (object)o.GetType().GetProperty(entityVariables[1]).GetValue(o);
            }

            return Convert.ToString(propertyVal);
        }

        private static string GetSubDomain(Uri url)
        {

            if (url.HostNameType != UriHostNameType.Dns) return "";

            string host = url.Host;

            if (host.Split('.').Length <= 2) return "";

            int lastIndex = host.LastIndexOf(".", StringComparison.Ordinal);
            int index = host.LastIndexOf(".", lastIndex - 1, StringComparison.Ordinal);

            return host.Substring(0, index);
        }
        public async Task<Int32> CheckIsVendorActive(string vendorNo, HeaderParams headerParams)
        {
            return (Int32)await APIClient.CallObjectTypeAsync<Int32>(string.Format(APIConstants.CheckIsVendorActive, Server.UrlEncode(vendorNo)), headerParams);
        }

        public async Task<JsonResult> GetInValidPONumbers(string pONumbers)
        {
            List<ValidPONumber> lst = (List<ValidPONumber>)await APIClient.CallObjectTypeAsync<List<ValidPONumber>>(string.Format(APIConstants.GetInValidPONumbers, pONumbers), APIClient.GetHeaderObject(Request));
            return Json(lst, JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetPaymentMethodByVendorNoJson(string vendorNo)
        {
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            return Json((List<PaymentCodeType>)await APIClient.CallObjectTypeAsync<List<PaymentCodeType>>(string.Format(APIConstants.GetPaymentMethodByVendorNoJson, Server.UrlEncode(vendorNo)), headerParams), JsonRequestBehavior.AllowGet);
        }
        public async Task<List<PaymentCodeType>> GetPaymentMethodListByVendorNo(string vendorNo, HeaderParams headerParams)
        {
            return (List<PaymentCodeType>)await APIClient.CallObjectTypeAsync<List<PaymentCodeType>>(string.Format(APIConstants.GetPaymentMethodByVendorNoJson, Server.UrlEncode(vendorNo)), headerParams);
        }

        public static bool IsValidDecimal(string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                input = "";
            }
            Match m = Regex.Match(input, @"^-?\d*\.?\d+");
            return m.Success && m.Value != "";
        }

        public async Task<JsonResult> IsPOIssues(int documentID,bool isWriteWFNotes)
        {
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);

            string res = (string)await APIClient.CallObjectTypeAsync<string>(string.Format(APIConstants.IsPOIssues, documentID, isWriteWFNotes), headerParams);
            return Json(res, JsonRequestBehavior.AllowGet);


        }
        public async Task<JsonResult> GetPOCharges_ByPONumber(string pONumber, HeaderParams headerParams)
        {
            return Json((List<POCharges>)await APIClient.CallObjectTypeAsync<List<POCharges>>(string.Format(APIConstants.GetPOCharges_ByPONumber, pONumber), headerParams), JsonRequestBehavior.AllowGet);
        }

        //// TSS DURGA(07022019)
        //public async Task<string> GetPOHeaderDetailPOType(int documentID)
        //{
        //    return (string)await APIClient.CallObjectTypeAsync<string>(string.Format(APIConstants.GetPOHeaderDetailPOType, documentID));
        //}
    }
}