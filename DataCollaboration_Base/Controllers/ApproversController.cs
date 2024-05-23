using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using DCCommon;
namespace DataCollaboration_Base.Controllers
{
    public class ApproversController : Controller
    {
        public JsonResult GetApproversList(int docId, int workflowId, string maskfileType, string company, decimal invoiceAmount, int currentNodeid, int smdCurrentNodeId)
        {
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            var data = APIClient.CallObjectType<List<Approver>>(string.Format(APIConstants.GetApproversList, docId, workflowId, maskfileType, company, invoiceAmount, currentNodeid, smdCurrentNodeId), headerParams);
            return Json(data, JsonRequestBehavior.AllowGet);
        }

        public JsonResult IsMaskfileCheckApplicable(int workflowId, int nodeId)
        {
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            MaskfileNode data = (MaskfileNode)(APIClient.CallObjectType<MaskfileNode>(string.Format(APIConstants.IsMaskfileCheckApplicable, workflowId, nodeId), headerParams));
            return Json(data, JsonRequestBehavior.AllowGet);
        }

        public JsonResult IsCurrentUserCanApprove(int documentId, int workflowId, decimal invoiceAmount)
        {
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            return Json(((bool)APIClient.CallObjectType<bool>(string.Format(APIConstants.IsCurrentUserCanApprove, documentId, workflowId, invoiceAmount), headerParams)), JsonRequestBehavior.AllowGet);
        }
    }
}