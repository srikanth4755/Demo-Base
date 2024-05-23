using DCCommon;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using System.Web.Script.Serialization;

namespace DataCollaboration_Base
{
    public static class APIClient
    {
        //The URL of the WEB API Service
        static string baseURL = ConfigurationManager.AppSettings.Get("APIBaseURL");
        public static HeaderParams GetHeaderObject(HttpRequestBase request)
        {
            string Params = "";
            if (request.Headers.GetValues("HeaderParams") != null)
            {
                Params = request.Headers.GetValues("HeaderParams").FirstOrDefault();

            }
            return JsonConvert.DeserializeObject<HeaderParams>(Params);
        }
        
        public static async Task<object> CallObjectTypeAsync<Type>(string apiName, HeaderParams headerParam)
        {
            string webAddr = baseURL + apiName;

            JsonReader reader = null;
            JsonSerializer serializer = new JsonSerializer();

            HttpClient httpClient = new HttpClient() { MaxResponseContentBufferSize = int.MaxValue };
            httpClient.BaseAddress = new Uri(webAddr);
            httpClient.DefaultRequestHeaders.Accept.Clear();
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            httpClient.DefaultRequestHeaders.Add(DcConstants.tenantCode, headerParam.TenantCode);
            httpClient.DefaultRequestHeaders.Add(DcConstants.userID, headerParam.UserID);
            httpClient.DefaultRequestHeaders.Add(DcConstants.documentID, headerParam.DocumentID);
            httpClient.DefaultRequestHeaders.Add(DcConstants.loggedinUserID, headerParam.LoggedinUserID);

            var response = await httpClient.GetStreamAsync(webAddr);
            StreamReader streamReader = new StreamReader(response);

            reader = new JsonTextReader(streamReader);
            return serializer.Deserialize<Type>(reader);

        }
        private static JsonReader CallJsonReader(string apiName, string methodType, HeaderParams headerParam)
        {
            HttpClient httpClient = new HttpClient();
            string webAddr = baseURL + apiName;

            httpClient.BaseAddress = new Uri(webAddr);
            httpClient.DefaultRequestHeaders.Accept.Clear();
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            httpClient.DefaultRequestHeaders.Add(DcConstants.tenantCode, headerParam.TenantCode);
            httpClient.DefaultRequestHeaders.Add(DcConstants.userID, headerParam.UserID);
            httpClient.DefaultRequestHeaders.Add(DcConstants.documentID, headerParam.DocumentID);
            httpClient.DefaultRequestHeaders.Add(DcConstants.loggedinUserID, headerParam.LoggedinUserID);

            var response = httpClient.GetAsync(webAddr).Result;

            StreamReader streamReader = new StreamReader(response.Content.ReadAsStreamAsync().Result);
            JsonReader reader = new JsonTextReader(streamReader);
            return reader;

        }

        public static object CallObjectType<Type>(string apiName, HeaderParams headerParams)
        {
            var reader = CallJsonReader(apiName, "GET", headerParams);

            JsonSerializer serializer = new JsonSerializer();
            return serializer.Deserialize<Type>(reader);

        }

        /// <summary>
        /// Method to Get Data from Web API in Sync way and return de-serialized result in the given format
        /// </summary>
        /// <typeparam name="Type"></typeparam>
        /// <param name="apiName"></param>
        /// <param name="methodType"></param>
        /// <param name="isHeaderRequired"></param>
        /// <returns></returns>
        public static object CallObjectType<Type>(string apiName, string methodType, object requestParamType, HeaderParams headerParams)
        {
            HttpClient client = new HttpClient();
            client.BaseAddress = new Uri(baseURL);
            client.DefaultRequestHeaders.Accept.Clear();

            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.Add(DcConstants.tenantCode, headerParams.TenantCode);
            client.DefaultRequestHeaders.Add(DcConstants.userID, headerParams.TenantCode);
            client.DefaultRequestHeaders.Add(DcConstants.documentID, headerParams.DocumentID);
            client.DefaultRequestHeaders.Add(DcConstants.loggedinUserID, headerParams.LoggedinUserID);

            HttpResponseMessage response = client.PostAsJsonAsync(apiName, requestParamType).Result;
            return response.Content.ReadAsAsync<Type>().Result;
        }

        /// <summary>
        /// Used to post data and get data(Model or any object) from API
        /// </summary>
        /// <param name="apiName"></param>
        /// <param name="isHeaderRequired"></param>
        /// <param name="requestParamType"></param>
        /// <returns></returns>
        public static async Task<object> CallPostAsJsonAsync<Type>(string apiName, bool isHeaderRequired, object requestParamType, HeaderParams headerParam)
        {
            HttpClient httpClient = new HttpClient
            {
                BaseAddress = new Uri(baseURL)
            };
            httpClient.DefaultRequestHeaders.Accept.Clear();

            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            
            httpClient.DefaultRequestHeaders.Add(DcConstants.tenantCode, headerParam.TenantCode);
            httpClient.DefaultRequestHeaders.Add(DcConstants.userID, headerParam.UserID);
            httpClient.DefaultRequestHeaders.Add(DcConstants.documentID, headerParam.DocumentID);
            httpClient.DefaultRequestHeaders.Add(DcConstants.loggedinUserID, headerParam.LoggedinUserID);

            HttpResponseMessage response = await httpClient.PostAsJsonAsync(apiName, requestParamType);
            return response.Content.ReadAsAsync<Type>().Result;
        }
        public static async Task<object> CallPostAsync<Type>(string apiName, HttpContent content, HeaderParams headerParam)
        {
            HttpClient client = new HttpClient
            {
                BaseAddress = new Uri(baseURL)
            };
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.Add(DcConstants.userID, headerParam.UserID);

            HttpResponseMessage response = client.PostAsync(apiName, content).Result;
            return response.Content.ReadAsAsync<Type>().Result;
        }


    }
}