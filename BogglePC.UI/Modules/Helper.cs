using Newtonsoft.Json;

namespace BogglePC.UI.Modules
{
    public static class Helper
    {
        public static string toXML(string inputStr)
        {
            System.Xml.Linq.XDocument xml = null; //JsonConvert.DeserializeXNode("{\"Data\":" + inputStr + "}", "root");
            if (!string.IsNullOrEmpty(inputStr))
            {

                xml = JsonConvert.DeserializeXNode("{\"Data\":" + inputStr + "}", "root");
                return xml.ToString();
            }
            return string.Empty;
        }

      
    }
}