using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DataCollaboration_Base.ViewModels
{
    public class RelatedDoumentModel
    {
        public string Uploadfolder { get; set; }
        public string DocumentName { get; set; }
        public string DocumentId { get; set; }
        public string ScanDate { get; set; }    
        public string ParentDocumentID { get; set; }
       
    }
}