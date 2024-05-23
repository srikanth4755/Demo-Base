using System;
using System.Configuration;
using System.IO;
using System.Web.Mvc;
using DCCommon;

namespace DataCollaboration_Base
{
    public class ExceptionFilter : FilterAttribute, IExceptionFilter
    {
        public static void WritetoFile(string info)
        {
            try
            {
              
                string dtnow = DateTime.Now.Date.ToString("MM/dd/yyyy").Replace("/", "");
              
                string path = Convert.ToString(ConfigurationManager.AppSettings["ErrorLog"]) + dtnow + ".log";

                if (!File.Exists(path))
                {
                    File.Create(path).Dispose();
                    using (StreamWriter swfile = new StreamWriter(path, true))
                    {

                        swfile.WriteLine("<" + DateTime.Now + "> " + info);
                        swfile.WriteLine(" ");
                       
                    }
                }
                else if (File.Exists(path))
                {
                    using (StreamWriter swfile = new StreamWriter(path, true))
                    {
                        swfile.WriteLine("<" + DateTime.Now + "> " + info);
                        swfile.WriteLine(" ");
                    
                    }
                }
            }
            catch (Exception)
            {
                // ignored
            }
        }
        public void OnException(ExceptionContext filterContext)
        {
            HeaderParams headerParams = new HeaderParams();
            ExceptionLogger exceptionLogger = new ExceptionLogger()
            {

                TenantCode = Convert.ToString(headerParams.TenantCode),
                UserID = Convert.ToString(headerParams.UserID),
                DocumentID = Convert.ToString(headerParams.DocumentID),
                Severity = "Error",
                ErrorMessage = Convert.ToString(filterContext.Exception),
                Message = Convert.ToString(filterContext.Exception.Message + " Stack trace: " + filterContext.Exception.StackTrace),
                Action = Convert.ToString(filterContext.RouteData.Values["action"]),
                Controller = Convert.ToString(filterContext.RouteData.Values["controller"]),

                Browser = filterContext.RequestContext.HttpContext.Request.Browser.Browser + " "
                + filterContext.RequestContext.HttpContext.Request.Browser.Version,

                Ip = string.IsNullOrEmpty(filterContext.HttpContext.Request.ServerVariables["HTTP_X_FORWARDED_FOR"])
                    ? filterContext.HttpContext.Request.ServerVariables["REMOTE_ADDR"]
                    : filterContext.HttpContext.Request.ServerVariables["HTTP_X_FORWARDED_FOR"].Split(',')[0]

            };

           
            try
            {
                APIClient.CallObjectType<ExceptionLogger>(APIConstants.SaveException, "POST", exceptionLogger, headerParams);
            }
            catch
            {
                WritetoFile(Convert.ToString(filterContext.Exception.Message + " Stack trace: " + filterContext.Exception.StackTrace));
            }
        }
    }
}