using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using DataCollaboration_Base.ViewModels;
using System.Threading.Tasks;
using DCCommon;
using System.Net.Http;
using Newtonsoft.Json;
using System.Configuration;

namespace DataCollaboration_Base.Controllers
{
    public class RelatedDocumentsController : Controller
    {

        [HttpPost]
        public ActionResult UploadDocument(string UploadFolder, string DocumentName, string ParentDocumentID, string ScanDate)
        {
            HttpFileCollectionBase file = Request.Files;

            HttpPostedFileBase fileCollection = file[0];

            using (var content = new MultipartFormDataContent())
            {
                byte[] Bytes = new byte[fileCollection.InputStream.Length + 1];
                fileCollection.InputStream.Read(Bytes, 0, Bytes.Length);
                var fileContent = new ByteArrayContent(Bytes);
                fileContent.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment") { FileName = fileCollection.FileName };
                content.Add(fileContent, JsonConvert.SerializeObject(fileContent));
                HeaderParams headerParams = new HeaderParams();
                headerParams = APIClient.GetHeaderObject(Request);
                var response = APIClient.CallPostAsync<object>(string.Format(APIConstants.SaveRelatedDocuments, UploadFolder, DocumentName, ParentDocumentID, ScanDate), content, headerParams);
                return Json(response, JsonRequestBehavior.AllowGet);
            }
        }
    }
}
