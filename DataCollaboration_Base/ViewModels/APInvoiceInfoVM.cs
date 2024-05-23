using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using DCCommon;

namespace DataCollaboration_Base.ViewModels
{
    public class APInvoiceInfoVM
    {
        public TagDocumentHeader TagDocumentHeader { get; set; }
        public List<TagDocumentDetail> TagDocumentDetail { get; set; }
        public IndexPivotAPInvoice IndexPivot { get; set; }
        public string SubmitAction { get; set; }
        public int WorkFlowID { get; set; }
        public int NodeID { get; set; }
        public string NodeText { get; set; }
        public int DocumentID { get; set; }
        //public int Wf { get; set; }
        public string InboxLink { get; set; }
        public string CurrentUserDetailsID { get; set; }
        public HeaderMenuData HeaderMenuData { get; set; }
        public List<ActiveCompany> ActiveCompanies { get; set; }    
        public List<ActiveDepartment> ActiveDepartments { get; set; }
        public List<ActiveSite> Sites { get; set; }
        public List<SelectListItem> PrepaidMonths { get; set; }
        public List<Vendor> Vendors { get; set; }        
        public List<VendorAddress> RemitToLocations { get; set; }
        public List<SelectListItem> AccountingPeriodMonths { get; set; }
        public List<PaymentTerms> TermsInfo { get; set; }        
        public decimal? UnAllocatedBalance { get; set; }
        public string RemitAddrText { get; set; }
        public string Message { get; set; }
        public List<SelectListItem> PoNumberList { get; set; }
        public VendorAddress vendorAddress { get; set; }
        public bool IsForward { get; set; }
        public bool IsForwardActual { get; set; }

        public string ShopPOReviewUser { get; set; }
        public List<ShopPOReview> ShopPoReviewUsers { get; set; }

        public string ShopPOReviewNotes { get; set; }

        public List<SelectListItem> SeparatePayments
        {
            get
            {
                return new List<SelectListItem>(){
                    new SelectListItem() { Text = DcConstants.Select, Value = "" },
                    new SelectListItem() { Text = DcConstants.Yes, Value = DcConstants.Yes },
                    new SelectListItem() { Text = DcConstants.No, Value = DcConstants.No }
            };
            }
        }

        public List<PaymentCodeType> PaymentCodeTypes { get; set; }

    }
}