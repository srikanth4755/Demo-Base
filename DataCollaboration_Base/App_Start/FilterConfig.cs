using System.Web;
using System.Web.Mvc;

namespace DataCollaboration_Base
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }
    }
}
