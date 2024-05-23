using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using DataCollaboration_Base.ViewModels;
using DCCommon;
using Newtonsoft.Json;

namespace DataCollaboration_Base.Controllers
{
    public class POAuthDCController : Controller
    {
        #region private variable

        private string password = " !#$a54?3";
        private string tenantCode = string.Empty;// System.Configuration.ConfigurationManager.AppSettings.Get("TenantCode");//string.Empty;//"PBPDC";

        #endregion private variable

        // GET: POAuthDC
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

            POAuthInfo poauthInfo = await GetDocumentData(userdetailsID, documentID, wF, inboxlink, headerParams);
            POAuthInfoVM poauthInfoVM = new POAuthInfoVM();
            // HeaderMenuData headerMenu = new HeaderMenuData();
            poauthInfoVM.InboxLink = inboxlink;
            //poauthInfoVM.SubmitAction=
            poauthInfoVM.WorkFlowID = poauthInfo.WorkFlowID;
            poauthInfoVM.NodeID = poauthInfo.NodeID;
            poauthInfoVM.NodeText = poauthInfo.NodeText;
            poauthInfoVM.CurrentUserDetailsID = userdetailsID;
            poauthInfoVM.IsForward = poauthInfo.IsForward;
            poauthInfoVM.TagdocumentPOAuthDetail = poauthInfo.TagDocumentPOAuthDetail;
            poauthInfoVM.IndexPivot = poauthInfo.IndexPivotPOAuth;

            poauthInfoVM.ActiveCompanies = await GetActiveCompanies(headerParams);
            poauthInfoVM.ActiveDepartments = await GetActiveDepartments(headerParams);
            poauthInfoVM.Sites = await GetSites(headerParams);
            // poauthInfoVM.PANumbers = await GetActivePANumbers("");
            poauthInfoVM.Vendors = poauthInfo.IndexPivotPOAuth != null ? GetVendors(poauthInfo.IndexPivotPOAuth.Vendor_Number, poauthInfo.IndexPivotPOAuth.Vendor_Name) : GetVendors(string.Empty, string.Empty);
            //if (poauthInfoVM != null && poauthInfoVM.IndexPivot != null && poauthInfoVM.IndexPivot.Vendor_Number != null)
            //{
            //    poauthInfoVM.RemitToLocations = await GetVendorAddress_ByVendorNo(poauthInfoVM.IndexPivot.Vendor_Number, (poauthInfoVM.IndexPivot.DocumentID).ToString(), headerParams);
            //}

            poauthInfoVM.ActiveSpendCategories = await GetActiveSpendCategories();

            if (poauthInfoVM !=null && poauthInfoVM.IndexPivot !=null && poauthInfoVM.IndexPivot.Vendor_Number !=null && poauthInfoVM.Vendors.Count == 1)
            {
                poauthInfoVM.IndexPivot.Vendor_Number = poauthInfoVM.Vendors[0].Number;
            }


            if (poauthInfoVM.IndexPivot != null)
            {
                poauthInfoVM.PoNumberList = GetPONumbers(poauthInfoVM.IndexPivot.PO_Number);
            }

            List<DCConfiguration> lstDCConfig = (List<DCConfiguration>)ViewData["DCConfigurations"];
            DCConfiguration dcConfig = lstDCConfig.Where(m => m.ConfigName == "FieldRulesCustomColumn").SingleOrDefault();//FieldRulesCustomColumn
            string custColumn = dcConfig != null ? (string.IsNullOrEmpty(dcConfig.ConfigValue) ? "" : dcConfig.ConfigValue) : "";
            string custColumnVal = string.IsNullOrEmpty(custColumn) ? "" : await GetCustomColumnValue(custColumn, poauthInfo.IndexPivotPOAuth.DocumentID, headerParams); //GetCustomColumnValueFromEntity(custColumn, poauthInfo);


            //TODO - Hardcoded workflow ID - Change it            
            //ViewData["FieldRules"] = (List<FieldRules>)await APIClient.CallObjectTypeAsync<List<FieldRules>>(string.Format(APIConstants.GetFieldRules, poauthInfo.WorkFlowID, poauthInfo.NodeID, wF, false));
            List<FieldRules> lstFieldRules = (List<FieldRules>)await APIClient.CallObjectTypeAsync<List<FieldRules>>(string.Format(APIConstants.GetFieldRules, poauthInfo.WorkFlowID, poauthInfo.NodeID, wF, poauthInfo.IsForward, custColumnVal), headerParams);
            if (wF.ToUpper() != DcConstants.Yes.ToUpper())
            {
                if (poauthInfoVM.IsForward)
                {
                    poauthInfoVM.IsForward = false;
                    poauthInfo.IsForward = false;
                }
            }
            ViewData["FieldRules"] = lstFieldRules;
            ViewData["PartialViewRules"] = (List<PartialViewRules>)await APIClient.CallObjectTypeAsync<List<PartialViewRules>>(string.Format(APIConstants.GetPartialViewRules, poauthInfo.WorkFlowID), headerParams);

            ViewData["ValidationConditions"] = (List<ValidationConditions>)await APIClient.CallObjectTypeAsync<List<ValidationConditions>>(string.Format(APIConstants.GetValidationConditions, poauthInfo.WorkFlowID), headerParams);


            return View("POAuthView", poauthInfoVM);

        }

        [HttpPost]
        public async Task<JsonResult> SavePOAuthInfo(string jsonValue)
        {
            dynamic obj = JsonConvert.DeserializeObject(jsonValue);
            POAuthInfo poauthInfo = new POAuthInfo();
            poauthInfo.IndexPivotPOAuth = new IndexPivotPOAuth();

            poauthInfo.IndexPivotPOAuth.DocumentID = Convert.ToInt32(obj.DocId);
            poauthInfo.IndexPivotPOAuth.PODate = obj.PODate;
            poauthInfo.IndexPivotPOAuth.PONumber = obj.DAPONumber;
            poauthInfo.IndexPivotPOAuth.SiteID = obj.SiteID;
            poauthInfo.IndexPivotPOAuth.POType = obj.POType;
            poauthInfo.IndexPivotPOAuth.PO_Number = obj.PO_Number;
            poauthInfo.IndexPivotPOAuth.Capex = obj.Capex;
            poauthInfo.IndexPivotPOAuth.PANumber = obj.PANumber;
            poauthInfo.IndexPivotPOAuth.CompCode = obj.CompCode;
            poauthInfo.IndexPivotPOAuth.DeptCode = obj.Div_Dept;
            poauthInfo.IndexPivotPOAuth.Vendor_Name = obj.Vendor_Name;
            poauthInfo.IndexPivotPOAuth.PaymentTerms = obj.PaymentTerms;
            poauthInfo.IndexPivotPOAuth.ShiptoAddress1 = obj.ShiptoAddress1;
            poauthInfo.IndexPivotPOAuth.ShiptoAddress2 = obj.ShiptoAddress2;
            poauthInfo.IndexPivotPOAuth.VendorAddress1 = obj.VendorAddress1;
            poauthInfo.IndexPivotPOAuth.VendorAddress2 = obj.VendorAddress2;
            poauthInfo.IndexPivotPOAuth.Vendor_Number = obj.Vendor_Number;
            poauthInfo.IndexPivotPOAuth.VendorContactName = obj.VendorContactName;
            poauthInfo.IndexPivotPOAuth.VendorContactNumber = obj.VendorContactNumber;
            poauthInfo.IndexPivotPOAuth.SpendCategory = obj.SpendCategory;
            poauthInfo.IndexPivotPOAuth.POOrigin = obj.POOrigin;
            poauthInfo.IndexPivotPOAuth.DeliveryDate = obj.DeliveryDate;

            poauthInfo.IndexPivotPOAuth.BilltoAddress1 = obj.BilltoAddress1;
            // poauthInfo.IndexPivotPOAuth.BilltoAddress2 = obj.BilltoAddress2;
            poauthInfo.IndexPivotPOAuth.RequestedBy = obj.RequestedBy;
            poauthInfo.IndexPivotPOAuth.Unit_Number = obj.Unit_Number;
            poauthInfo.IndexPivotPOAuth.RemitToAddress = obj.RemitToAddress;
            poauthInfo.IndexPivotPOAuth.Notes = obj.Notes;
            poauthInfo.IndexPivotPOAuth.Discount = obj.Discount != null ? Convert.ToDecimal(obj.Discount) : null;
            poauthInfo.IndexPivotPOAuth.SubTotal = obj.SubTotal != null ? Convert.ToDecimal(obj.SubTotal) : null;
            poauthInfo.IndexPivotPOAuth.SalesTax = obj.SalesTax != null ? Convert.ToDecimal(obj.SalesTax) : null;
            poauthInfo.IndexPivotPOAuth.Freight = obj.Freight != null ? Convert.ToDecimal(obj.Freight) : null;
            poauthInfo.IndexPivotPOAuth.Others = obj.Others != null ? Convert.ToDecimal(obj.Others) : null;
            poauthInfo.IndexPivotPOAuth.Total = obj.Total != null ? Convert.ToDecimal(obj.Total) : null;

            if (obj.Vendor_Name == DcConstants.New_Vendor || obj.RemitToAddress == DcConstants.New_Address)
            {
                poauthInfo.IndexPivotPOAuth.VendorMaintenance = DcConstants.Yes;
                poauthInfo.IndexPivotPOAuth.RemitToAddress = DcConstants.New_Address;
            }
            else
                poauthInfo.IndexPivotPOAuth.VendorMaintenance = DcConstants.No;

            poauthInfo.TagDocumentPOAuthDetail = new List<TagdocumentPOAuthDetail>();
            TagdocumentPOAuthDetail objTagDet = null;

            foreach (var tagDet in obj.TagDocumentPOAuthDetail)
            {
                objTagDet = new TagdocumentPOAuthDetail();
                objTagDet.DocumentID = Convert.ToInt32(tagDet.DocumentID);
                objTagDet.RowStatus = tagDet.RowStatus;
                if (tagDet.RowStatus != "Add")
                    objTagDet.TagdocumentPOAuthDetailsID = Convert.ToInt32(tagDet.TagdocumentPOAuthDetailsID);

                objTagDet.Quantity = tagDet.Quantity;
                objTagDet.ExpenseAccountNumber = tagDet.ExpenseAccountNumber;
                objTagDet.ItemNumber = tagDet.ItemNumber;
                objTagDet.ItemDescription = tagDet.ItemDescription;
                objTagDet.UnitPrice = tagDet.UnitPrice;
                // objTagDet.Budget = tagDet.Budget;
                // objTagDet.Unbudgeted = tagDet.Unbudgeted;
                // objTagDet.

                poauthInfo.TagDocumentPOAuthDetail.Add(objTagDet);
            }
            poauthInfo.SubmitAction = obj.SubmitAction;
            poauthInfo.WorkFlowID = Convert.ToInt32(obj.WorkFlowID);
            poauthInfo.NodeID = Convert.ToInt32(obj.NodeID);
            poauthInfo.NodeText = Convert.ToString(obj.NodeText);
            poauthInfo.IndexPivotPOAuth.UserID = obj.UserID;

            poauthInfo.NextUserDetailsID = obj.NextUserDetailsID;
            poauthInfo.SMD_NextNodeID = Convert.ToInt32(obj.SMD_NextNodeID);
            poauthInfo.SMD_CurrentNodeID = Convert.ToInt32(obj.SMD_CurrentNodeID);
            poauthInfo.SMD_Dynamic = obj.SMD_Dynamic;
            poauthInfo.IsApproverSelected = Convert.ToBoolean(obj.IsApproverSelected);
            poauthInfo.IsLoggedInUserExcludedFromApprovalList = Convert.ToBoolean(obj.IsLoggedInUserExcludedFromApprovalList);
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            await APIClient.CallPostAsJsonAsync<POAuthInfo>(APIConstants.SavePOAuthInfo, false, poauthInfo, headerParams);
            return Json("Data Saved", JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public async Task<Int32> SaveTagDocumentDetail(string jsonValue)
        {
            dynamic obj = JsonConvert.DeserializeObject(jsonValue);
            TagdocumentPOAuthDetail tagdocumentPOAuthDetail = new TagdocumentPOAuthDetail();
            tagdocumentPOAuthDetail.DocumentID = Convert.ToInt32(obj.DocumentID);
            if (obj.RowStatus == DcConstants.Update || obj.RowStatus == DcConstants.Delete)
                tagdocumentPOAuthDetail.TagdocumentPOAuthDetailsID = Convert.ToInt32(obj.TagdocumentPOAuthDetailsID);
            if (obj.RowStatus != DcConstants.Delete)
            {
                tagdocumentPOAuthDetail.Quantity = obj.Quantity;
                tagdocumentPOAuthDetail.ExpenseAccountNumber = obj.ExpenseAccountNumber;
                tagdocumentPOAuthDetail.ItemNumber = obj.ItemNumber;
                tagdocumentPOAuthDetail.ItemDescription = obj.ItemDescription;
                tagdocumentPOAuthDetail.UnitPrice = obj.UnitPrice;

                //tagdocumentPOAuthDetail.Budget = obj.Budget;
                //tagdocumentPOAuthDetail.Unbudgeted = obj.Unbudgeted;


            }
            tagdocumentPOAuthDetail.RowStatus = obj.RowStatus;
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            return (Int32)await APIClient.CallPostAsJsonAsync<Int32>(string.Format(APIConstants.SavePOTagDocumentDetail, obj.workFlowId, obj.nodeId), false, tagdocumentPOAuthDetail, headerParams);
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
        public async Task<JsonResult> ForwardToUser(string jsonValue)
        {
            dynamic obj = JsonConvert.DeserializeObject(jsonValue);

            //await APIClient.CallPostAsJsonAsync<object>(string.Format(APIConstants.ForwardTo, obj.NextUserDetailsID, obj.CurrentUserDetailsID, obj.CurrentNodeID, obj.DocumentID, obj.WorkflowID, obj.Note), false, null);
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            await APIClient.CallPostAsJsonAsync<object>(string.Format(APIConstants.poauthForwardTo, obj.NextUserDetailsID, obj.CurrentUserDetailsID, obj.CurrentNodeID, obj.DocumentID, obj.WorkflowID, Server.UrlEncode(Convert.ToString(obj.Note)), obj.NodeText), false, null, headerParams);


            return Json("Forwarded successfully", JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async Task<JsonResult> RejectTo(string jsonValue)
        {
            dynamic obj = JsonConvert.DeserializeObject(jsonValue);

            //await APIClient.CallPostAsJsonAsync<object>(string.Format(APIConstants.RejectTo, obj.UserDetailsID, obj.DocumentID, obj.WorkflowID, obj.Note), false, null);
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            await APIClient.CallPostAsJsonAsync<object>(string.Format(APIConstants.poauthRejectTo, obj.UserDetailsID, obj.DocumentID, obj.WorkflowID, obj.CurrentNodeID, Server.UrlEncode(Convert.ToString(obj.Note)), obj.NodeText), false, null, headerParams);


            return Json("Reject successfully", JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetVendorAddress_ByVendorNoJson(string vendorNo)
        {
            return Json((List<VendorAddress>)await APIClient.CallObjectTypeAsync<List<VendorAddress>>(string.Format(APIConstants.GetVendorAddress_ByVendorNo, vendorNo), APIClient.GetHeaderObject(Request)), JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetSmartListJson(string userID, string companyNo, string vendorID)
        {
            return Json((List<SmartList>)await APIClient.CallObjectTypeAsync<List<SmartList>>(string.Format(APIConstants.GetSmartList, userID, companyNo, vendorID), APIClient.GetHeaderObject(Request)), JsonRequestBehavior.AllowGet);
        }

        public async Task<string> GetPopulateAddressText(string remitAddrTxt, string remitAddrCod, string vendorNo)
        {
            return (string)await APIClient.CallObjectTypeAsync<string>(string.Format(APIConstants.GetPopulateAddressText, remitAddrTxt, remitAddrCod, vendorNo), APIClient.GetHeaderObject(Request));
        }

        public async Task<JsonResult> GetPopulateAddressTextJson(string remitAddrTxt, string remitAddrCod, string vendorNo)
        {
            return Json((VendorAddress)await APIClient.CallObjectTypeAsync<VendorAddress>(string.Format(APIConstants.GetPopulateAddressText, Server.UrlEncode(remitAddrTxt), remitAddrCod, vendorNo), APIClient.GetHeaderObject(Request)), JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetPOAuthGLAccountsJson(string PreText, string PaNumber, string SiteId, string PoType)
        {
            List<string> lst = (List<string>)await APIClient.CallObjectTypeAsync<List<string>>(string.Format(APIConstants.GetPOAuthGLAccounts, PreText, PaNumber, SiteId, PoType), APIClient.GetHeaderObject(Request));
            return Json(lst, JsonRequestBehavior.AllowGet);
        }

        public async Task<Int32> GetPOAuthGLCount(string documentId, string projecNumber, string siteId, string poType)
        {
            return (Int32)await APIClient.CallObjectTypeAsync<Int32>(string.Format(APIConstants.GetPOAuthGLCount, documentId, projecNumber, siteId, poType), APIClient.GetHeaderObject(Request));
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
            // lstVendor.RemoveAll(r => r.Number == "New Vendor");

            return Json(lstVendor, JsonRequestBehavior.AllowGet);

            /*List<Vendor> lstVendor = null;
            bool isWildCard = false;

            //DataSet ds = new DataSet();
            //ListItem li;

            string search = searchValue.Trim().Replace("'", "''");
            //string searchkey = this.lstSearchKey.SelectedValue;

            //first check to see if the user searched for new vendor
            string newvend = search.Trim().ToLower();
            newvend = newvend.Replace("*", "").Trim();

            if (!((newvend == DcConstants.NewVendor) || (newvend == DcConstants.New_Vendor)))
            {
                search = search.Trim().Replace('*', '%');
                //Based on the type of search selected, call the appropriate handler.
                if (searchkey.ToLower().Trim() == "shortname")
                {
                    //search by VendorNameSort expression.                    
                    // search = search.Trim().Replace('*', '%');
                    search = search.ToUpper();

                    if (search.Length > 10)          //c_mod sort must be only 10 len (leave slot for the % wild card)
                        search = search.Substring(0, 10);
                }
                //else if (searchkey.ToLower().Trim() == "name")
                //{
                //    //search by VendorName.                    
                //    search = search.Trim().Replace('*', '%');
                //}
                //else if (searchkey.ToLower().Trim() == "number")
                //{
                //    //search by VendorNumber.
                //    //ds = dataHandler.searchVendorNumber(search);
                //    search = search.Trim().Replace('*', '%');
                //}
                //else if (searchkey.ToLower().Trim() == "dba")
                //{
                //    //search by VendorNumber.
                //    search = search.Trim().Replace('*', '%');
                //}
                if (search.IndexOf("%") != (-1))
                    isWildCard = true;
                lstVendor = await GetVendor_searchByWildCard(searchkey, search, isWildCard);
            }

            return Json(lstVendor, JsonRequestBehavior.AllowGet);*/
        }

        public async Task<JsonResult> GetSearchValue_PONumber(string searchValue)
        {
            List<SelectListItem> lstPONumber = new List<SelectListItem>();
            bool isWildCard = false;

            string search = searchValue.Trim().Replace("'", "''");
            search = search.Trim().Replace('*', '%');
            if (search.IndexOf("%") != (-1))
                isWildCard = true;
            List<string> lst = await GetPONumber_searchByWildCard(search, isWildCard);
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

        public async Task<JsonResult> GetActiveDepartments_BycompCodeJson(string compCode)
        {
            return Json((List<ActiveDepartment>)await APIClient.CallObjectTypeAsync<List<ActiveDepartment>>(string.Format(APIConstants.GetActiveDepartments_ByCompCode, compCode), APIClient.GetHeaderObject(Request)), JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetForwardUsers(string searchText, string userDetailsID, int workflowID, int documentID)
        {
            List<string> lst = (List<string>)await APIClient.CallObjectTypeAsync<List<string>>(string.Format(APIConstants.GetForwardUsers, searchText, userDetailsID, workflowID, documentID), APIClient.GetHeaderObject(Request));
            return Json(lst, JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetSiteByCompany(string companyId)
        {
            List<ActiveSite> lst = (List<ActiveSite>)await APIClient.CallObjectTypeAsync<List<ActiveSite>>(string.Format(APIConstants.GetActiveSites_ByCompany, companyId), APIClient.GetHeaderObject(Request));
            return Json(lst, JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetShipAddressBySiteID(string siteID)
        {
            string shipAddress = (string)await APIClient.CallObjectTypeAsync<string>(string.Format(APIConstants.GetShipAddressBySiteID, siteID), APIClient.GetHeaderObject(Request));
            return Json(shipAddress, JsonRequestBehavior.AllowGet);
        }

        public async Task<string> GetCustomColumnValue(string customColumn, int documentID, HeaderParams headerParams)
        {
            return (string)await APIClient.CallObjectTypeAsync<string>(string.Format(APIConstants.GetCustomColumnValue, Server.UrlEncode(Convert.ToString(customColumn)), documentID), headerParams);
        }


        //  #region Methods to populate dropdowns /API calls

        private async Task<POAuthInfo> GetDocumentData(string userdetailsId, string documentid, string wf, string inboxlink, HeaderParams headerParams)
        {
            return (POAuthInfo)await APIClient.CallObjectTypeAsync<POAuthInfo>(string.Format(APIConstants.GetPOAuthInfo, userdetailsId, documentid, wf, inboxlink), headerParams);
        }

        private async Task<List<ActiveCompany>> GetActiveCompanies(HeaderParams headerParams)
        {
            return (List<ActiveCompany>)await APIClient.CallObjectTypeAsync<List<ActiveCompany>>(APIConstants.GetActiveCompanies, headerParams);
        }
        private async Task<List<ActiveDepartment>> GetActiveDepartments(HeaderParams headerParams)
        {
            return (List<ActiveDepartment>)await APIClient.CallObjectTypeAsync<List<ActiveDepartment>>(APIConstants.GetActiveDepartments, headerParams);
        }
        private async Task<List<ActiveSite>> GetSites(HeaderParams headerParams)
        {
            return (List<ActiveSite>)await APIClient.CallObjectTypeAsync<List<ActiveSite>>(APIConstants.GetActiveSites, headerParams);
        }

        public async Task<JsonResult> GetActivePANumbers(string pANumber, bool isSelected)
        {
            List<ActivePANumber> lst = (List<ActivePANumber>)await APIClient.CallObjectTypeAsync<List<ActivePANumber>>(string.Format(APIConstants.GetActivePANumbers, pANumber, isSelected), APIClient.GetHeaderObject(Request));
            return Json(lst, JsonRequestBehavior.AllowGet);
        }
        public async Task<JsonResult> GetProjectBudgetDetails(string pANumber, bool isSelected)
        {
            List<ActivePANumber> lst = (List<ActivePANumber>)await APIClient.CallObjectTypeAsync<List<ActivePANumber>>(string.Format(APIConstants.GetProjectBudgetDetails, pANumber, isSelected), APIClient.GetHeaderObject(Request));
            return Json(lst, JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetSpendCategoryBudget(string siteID, string spendCatagoryName, decimal currentPOAmount)
        {
            List<SpendCategoryBudget> lst = (List<SpendCategoryBudget>)await APIClient.CallObjectTypeAsync<List<SpendCategoryBudget>>(string.Format(APIConstants.GetSpendCategoryBudget, siteID, Server.UrlEncode(spendCatagoryName), currentPOAmount), APIClient.GetHeaderObject(Request));
            return Json(lst, JsonRequestBehavior.AllowGet);
        }


        private async Task<List<Vendor>> GetVendor_searchByWildCard(string searchKey, string searchText, bool isWildCard)
        {
            return (List<Vendor>)await APIClient.CallObjectTypeAsync<List<Vendor>>(string.Format(APIConstants.GetVendor_searchByWildCard, searchKey, Server.UrlEncode(searchText), isWildCard), APIClient.GetHeaderObject(Request));
        }

        private async Task<List<string>> GetPONumber_searchByWildCard(string searchText, bool isWildCard)
        {
            return (List<string>)await APIClient.CallObjectTypeAsync<List<string>>(string.Format(APIConstants.GetPONumber_searchByWildCard, Server.UrlEncode(searchText), isWildCard), APIClient.GetHeaderObject(Request));
        }

        private async Task<List<VendorAddress>> GetVendorAddress_ByVendorNo(string vendorNo,string DocumentID)
        {
            return (List<VendorAddress>)await APIClient.CallObjectTypeAsync<List<VendorAddress>>(string.Format(APIConstants.GetVendorAddress_ByVendorNo, vendorNo, DocumentID), APIClient.GetHeaderObject(Request));
        }

        private async Task<List<PaymentTerms>> GetTermsInfo()
        {
            return (List<PaymentTerms>)await APIClient.CallObjectTypeAsync<List<PaymentTerms>>(APIConstants.GetTermsInfo, APIClient.GetHeaderObject(Request));
        }

        //private List<Vendor> GetVendors(string vendorNo, string vendorName)
        //{
        //    if (!string.IsNullOrEmpty(vendorNo) && !string.IsNullOrEmpty(vendorName))
        //    {
        //        if (vendorName == DcConstants.NewVendor || vendorName == DcConstants.New_Vendor)
        //            return new List<Vendor>() { new Vendor() { Number = vendorNo, Name = vendorName } };
        //        else
        //            return new List<Vendor>() { new Vendor() { Number = vendorNo, Name = vendorName }, new Vendor() { Number = DcConstants.New_Vendor, Name = DcConstants.New_Vendor } };

        //    }
        //    else
        //        return new List<Vendor>() { new Vendor() { Number = DcConstants.New_Vendor, Name = DcConstants.New_Vendor } };
        //}

        private List<Vendor> GetVendors(string vendorNo, string vendorName)
        {
            List<Vendor> lstVendor = new List<Vendor>();
            List<DCConfiguration> lstDCConfiguration = (List<DCConfiguration>)ViewData["DCConfigurations"];
            string isVendorMaintenanceRequired = Convert.ToString(lstDCConfiguration.Where(r => r.ConfigName == "IsVendorMaintenanceRequired").Select(r => r.ConfigValue).FirstOrDefault());
            if (!string.IsNullOrEmpty(vendorNo) && !string.IsNullOrEmpty(vendorName))
            {
                lstVendor.Add(new Vendor() { Number = vendorNo, Name = vendorName, DBAs = vendorName });
                if (!string.IsNullOrEmpty(isVendorMaintenanceRequired) && isVendorMaintenanceRequired.ToUpper() == "TRUE" && (vendorName != DcConstants.NewVendor || vendorName != DcConstants.New_Vendor))
                {
                    lstVendor.Add(new Vendor() { Number = DcConstants.New_Vendor, Name = DcConstants.New_Vendor, DBAs = DcConstants.New_Vendor });
                }
            }
            else if (!string.IsNullOrEmpty(vendorName) && string.IsNullOrEmpty(vendorNo))
            {
                lstVendor = GetVendor_searchByWildCardWithoutAsyn("name", vendorName, false);
            }
            else if (string.IsNullOrEmpty(vendorName) && !string.IsNullOrEmpty(vendorNo))
            {
                lstVendor = GetVendor_searchByWildCardWithoutAsyn("number", vendorNo.Trim(), false);
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
        private List<Vendor> GetVendor_searchByWildCardWithoutAsyn(string searchKey, string searchText, bool isWildCard)
        {
            return (List<Vendor>)APIClient.CallObjectType<List<Vendor>>(string.Format(APIConstants.GetVendor_searchByWildCard, searchKey, Server.UrlEncode(searchText), isWildCard), APIClient.GetHeaderObject(Request));
        }

        private async Task<List<ActiveSpendCategory>> GetActiveSpendCategories()
        {
            return (List<ActiveSpendCategory>)await APIClient.CallObjectTypeAsync<List<ActiveSpendCategory>>(APIConstants.GetActiveSpendCategories, APIClient.GetHeaderObject(Request));
        }



        private List<SelectListItem> GetPONumbers(string pONumber)
        {
            if (!string.IsNullOrEmpty(pONumber))
                return new List<SelectListItem>() { new SelectListItem() { Text = "<select>", Value = "<select>" }, new SelectListItem() { Text = pONumber, Value = pONumber } };
            else
                return new List<SelectListItem>() { new SelectListItem() { Text = "<select>", Value = "<select>" } };
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
            lstAccountingPeriod.Add(new SelectListItem() { Text = "<select>", Value = "0" });

            DateTime dtnow = DateTime.Now;
            ArrayList al = new ArrayList();

            for (int i = 3; i >= 1; i--)
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

            for (int i = 1; i <= 3; i++)
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

        private decimal? GetUnAllocated(decimal? invoiceAmount, List<TagDocumentDetail> lstTagDocDetails, out string lblMessage)
        {
            decimal? SumExpencedAmount = 0;
            lblMessage = "";
            if (lstTagDocDetails != null && lstTagDocDetails.Count > 0)
                SumExpencedAmount = lstTagDocDetails.Sum(m => m.ExpensedAmount);
                 decimal ? diff = invoiceAmount - SumExpencedAmount;
            if (diff < 0 || diff > 0)
                lblMessage = "Invoice out of Balance";

            return diff;
        }

        public async Task<JsonResult> GetPaymentTermsByVendorNoJson(string vendorNo)
        {
            return Json((string)await APIClient.CallObjectTypeAsync<string>(string.Format(APIConstants.GetPaymentTermsByVendorNo, vendorNo),APIClient.GetHeaderObject(Request)), JsonRequestBehavior.AllowGet);
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

        private string GetCustomColumnValueFromEntity(string customColumn, POAuthInfo dCInfo)
        {
            object propertyVal = null;
            string[] entityVariables = customColumn.Split('.');

            if (entityVariables.Length == 2)
            {
                object entity = (object)dCInfo.GetType().GetProperty(entityVariables[0]).GetValue(dCInfo);
                foreach (object o in (IEnumerable<object>)entity)
                    propertyVal = (object)o.GetType().GetProperty(entityVariables[1]).GetValue(o);
            }

            return Convert.ToString(propertyVal);
        }

        public JsonResult ValidateDeliveryDate(string invoiceDate)
        {
            string vadideMsg = IsDeliveryDateValide(invoiceDate);
            return Json(vadideMsg, JsonRequestBehavior.AllowGet);
        }
        private string IsDeliveryDateValide(string deliveryDate)
        {
            if (!string.IsNullOrEmpty(deliveryDate))
            {
                DateTime invDate = DateTime.ParseExact(Convert.ToDateTime(deliveryDate).ToString(DcConstants.Date_Formatte), DcConstants.Date_Formatte, System.Globalization.CultureInfo.InvariantCulture);
                DateTime todayDate = DateTime.ParseExact(Convert.ToDateTime(DateTime.Now).ToString(DcConstants.Date_Formatte), DcConstants.Date_Formatte, System.Globalization.CultureInfo.InvariantCulture);

                if ((invDate < todayDate))
                {
                    return "Need by date can not be less than today's date";
                }
            }
            return "";
        }


    }
}