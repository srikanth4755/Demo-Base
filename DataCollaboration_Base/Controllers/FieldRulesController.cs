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
    public class FieldRulesController : Controller
    {

        private string tenantCode = string.Empty;
        // GET: FieldRules

        public ActionResult FiledRulesView()
        {
            ViewData["TenantCode"] = tenantCode;
            return View();
        }
        public JsonResult GetWorkFlowId()
        {
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            var data = (List<string>)APIClient.CallObjectType<List<string>>(APIConstants.GetWorkFlowdetails, headerParams);
            return Json(data, JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetPartialRulesJson(string WorkflowId)
        {
            List<PartialViewRules> lst = (List<PartialViewRules>)await APIClient.CallObjectTypeAsync<List<PartialViewRules>>(string.Format(APIConstants.GetPartialFields, WorkflowId), APIClient.GetHeaderObject(Request));
            return Json(lst, JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetFieldRulesJson(string WorkflowId)
        {
            List<FieldRules> lst = (List<FieldRules>)await APIClient.CallObjectTypeAsync<List<FieldRules>>(string.Format(APIConstants.GetRulesFields, WorkflowId), APIClient.GetHeaderObject(Request));
            return Json(lst, JsonRequestBehavior.AllowGet);
        }

        public async Task<JsonResult> GetRulesNodesJson(string WorkflowId)
        {
            List<NodeRules> lst = (List<NodeRules>)await APIClient.CallObjectTypeAsync<List<NodeRules>>(string.Format(APIConstants.GetFieldsNodes, WorkflowId), APIClient.GetHeaderObject(Request));
            return Json(lst, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public async Task<JsonResult> DelPartialRules(int viewId)
        {
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            var response = await APIClient.CallPostAsJsonAsync<int>(APIConstants.DeletePartialFields, false, viewId, headerParams);
            return Json(response, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public async Task<JsonResult> DelFieldRules(int FieldId)
        {
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            var response = await APIClient.CallPostAsJsonAsync<int>(APIConstants.DeleteRulesFields, false, FieldId, headerParams);
            return Json(response, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public async Task<JsonResult> DelRulesNodes(int RuleNodeId)
        {
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            var response = await APIClient.CallPostAsJsonAsync<int>(APIConstants.DeleteFieldsNodes, false, RuleNodeId, headerParams);
            return Json(response, JsonRequestBehavior.AllowGet);
        }




        [HttpPost]
        public async Task<JsonResult> SavePartialRules(string jsonString)
        {
            dynamic obj = JsonConvert.DeserializeObject(jsonString);
            PartialViewRules Partialrules = new PartialViewRules()
            {
                ViewId = Convert.ToInt32(obj.ViewId),
                WorkFlowId = Convert.ToInt32(obj.workflowId),
                ViewName = obj.ViewName,
                IsApplicable = Convert.ToBoolean(obj.IsApplicable),
                HeaderLabel = obj.HeaderLabel,
            };
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            var response = await APIClient.CallPostAsJsonAsync<int>(APIConstants.SavePartialFields, false, Partialrules, headerParams);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public async Task<JsonResult> SaveFieldsNodes(string jsonString)
        {
            dynamic obj = JsonConvert.DeserializeObject(jsonString);
            NodeRules nodeRules = new NodeRules()
            {
                RuleNodeId = Convert.ToInt32(obj.RuleNodeId),
                FieldId = Convert.ToInt32(obj.FieldId),
                NodeId = Convert.ToInt32(obj.NodeId),
                NodeLike = obj.NodeLike,
                ViewName = obj.ViewName,
                FieldName = obj.FieldName,
                IsVisible = Convert.ToBoolean(obj.IsVisible),
                IsReadOnly = Convert.ToBoolean(obj.IsReadOnly),
                IsMandatory = Convert.ToBoolean(obj.IsMandatory),
                ClassName = obj.ClassName,
                WorkFlowId = Convert.ToInt32(obj.workflowId),
            };
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            var response = await APIClient.CallPostAsJsonAsync<int>(APIConstants.SaveFieldsNodes, false, nodeRules, headerParams);
            return Json(response, JsonRequestBehavior.AllowGet);
        }


        [HttpPost]
        public async Task<JsonResult> SaveFieldRules(string jsonString)
        {
            dynamic obj = JsonConvert.DeserializeObject(jsonString);
            FieldRules fieldRules = new FieldRules()
            {
                FieldId = Convert.ToInt32(obj.FieldId),
                ViewName_Refonly = obj.ViewName_Refonly,
                FieldName = obj.FieldName,
                FieldLabelValue = obj.FieldLabelValue,
                IsMandatory = Convert.ToBoolean(obj.IsMandatory),
                IsReadOnly = Convert.ToBoolean(obj.IsReadOnly),
                IsVisible = Convert.ToBoolean(obj.IsVisible),
                WorkFlowId = Convert.ToInt32(obj.workflowId),
                ClassName= obj.ClassName
            };
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            var response = await APIClient.CallPostAsJsonAsync<int>(APIConstants.SaveFieldRules, false, fieldRules, headerParams);
            return Json(response, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public async Task<Int32> CopyNodeRules(string FromNode, string ToNode)
        {
            HeaderParams headerParams = new HeaderParams();
            headerParams = APIClient.GetHeaderObject(Request);
            return (Int32)await APIClient.CallPostAsJsonAsync<Int32>(string.Format(APIConstants.CopyNodeRules, FromNode, ToNode), false, "", headerParams);
        }

    }
}

