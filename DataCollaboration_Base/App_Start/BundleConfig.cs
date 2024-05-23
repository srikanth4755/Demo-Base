using System.Web;
using System.Web.Optimization;

namespace DataCollaboration_Base
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js",
                        "~/Scripts/jquery-ui-{version}.js",
                        "~/Scripts/jquery.dataTables.min.js",
                      //"~/Scripts/dataTables.buttons.min.1.5.2.js",
                      //"~/Scripts/dataTables.select.min.1.2.6.js",
                      //"~/Scripts/dataTables.editor.min.js",
                      "~/Scripts/jquery.inputmask.bundle.3.2.1.js",
                      "~/Scripts/bootstrap.js",
                      "~/Scripts/JQGrid/grid.locale-en.js",
                      "~/Scripts/JQGrid/jquery.jqGrid.js",
                       "~/Scripts/respond.js",
                       "~/Scripts/Notify.js"
                      ));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at https://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.js",
                      "~/Scripts/respond.js",
                      "~/Scripts/Notify.js"));

            bundles.Add(new ScriptBundle("~/bundles/commonScript").Include(
                      "~/Scripts/DCScripts/DateFormat.js",
                      "~/Scripts/DCScripts/Utility.js",
                      "~/Scripts/DCScripts/ApInvoiceValidation.js",
                      "~/Scripts/DCScripts/ApInvoice.js",
                      "~/Scripts/DCScripts/ApInvoiceDetails.js",
                      "~/Scripts/DCScripts/relatedDocuments.js",
                      "~/Scripts/ExcelUpload/jszip.js",
                      "~/Scripts/ExcelUpload/xlsx.full.min.js"
                      ));


            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/bootstrap.css",
                      "~/Content/site.css",
                      "~/Content/CustomStyle.css",
                      "~/Content/jquery-ui.min.css",
                      "~/Content/jquery.dataTables.min.css",
                      "~/Scripts/JQGrid/ui.jqgrid-bootstrap.css"
                      ));
        }
    }
}
