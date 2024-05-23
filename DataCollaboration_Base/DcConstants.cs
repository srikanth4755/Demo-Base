using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DataCollaboration_Base
{
    public static class DcConstants
    {
        public const string NewVendor = "NewVendor";
        public const string NewAddress = "NewAddress";
        public const string New_Vendor = "New Vendor";
        public const string New_Address = "New Address";
        public const string Date_Formatte = "M/d/yyyy";

        public const string Yes = "yes";
        public const string No = "no";
        public const string Select = "<Select>";

        public const string Add = "Add";
        public const string Update = "Update";
        public const string Delete = "Delete";

        #region session variable names 

        public const string tenantCode = "TenantCode";
        public const string userID = "UserID";
        public const string documentID = "DocumentID";
        public const string wF = "WF";
        public const string inboxlink = "Inboxlink";

        public const string loggedinUserID = "LoggedinUserID";
        #endregion session variable names
    }
}