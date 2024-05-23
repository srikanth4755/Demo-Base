using DCCommon;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DataCollaboration_Base.ViewModels
{
    public class POAuthInfoVM
    {
        public TagDocumentHeader TagDocumentHeader { get; set; }
        public List<TagdocumentPOAuthDetail> TagdocumentPOAuthDetail { get; set; }
        public IndexPivotPOAuth IndexPivot { get; set; }
        public string SubmitAction { get; set; }
        public int WorkFlowID { get; set; }
        public int NodeID { get; set; }
        public string NodeText { get; set; }
        public int DocumentID { get; set; }
        //public int Wf { get; set; }
        public string InboxLink { get; set; }
        public string CurrentUserDetailsID { get; set; }
        public List<ActiveCompany> ActiveCompanies { get; set; }
        public List<ActiveDepartment> ActiveDepartments { get; set; }

        public HeaderMenuData HeaderMenuData { get; set; }

        public List<Vendor> Vendors { get; set; }
        public List<ActiveSite> Sites { get; set; }
        public List<ActivePANumber> PANumbers { get; set; }
        public List<PaymentTerms> TermsInfo { get; set; }
        public decimal? UnAllocatedBalance { get; set; }
     
        public string Message { get; set; }

        public string Vendor_Number { get; set; }
        public List<SelectListItem> PoNumberList { get; set; }
        public List<VendorAddress> RemitToLocations { get; set; }

        public List<ActiveSpendCategory> ActiveSpendCategories { get; set; }

        public bool IsForward { get; set; }
    }
}