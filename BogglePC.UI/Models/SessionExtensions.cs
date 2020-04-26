using System.Web;

namespace BogglePC.UI
{
	 
	public static class SessionExtensions
	{
        public static SiteSession Current
        {
            get
            {
                SiteSession session =
                  (SiteSession)HttpContext.Current.Session["__SITE_SESSIONS__"];
                if (session == null)
                {
                    session = new SiteSession();
                    HttpContext.Current.Session["__SITE_SESSIONS__"] = session;
                }
                return session;
            }
            set
            {
                SiteSession session =
                  (SiteSession)HttpContext.Current.Session["__SITE_SESSIONS__"];
                session = value;
            }
        }


        public static T GetDataFromSession<T>(this HttpSessionStateBase session, string key)
		{
			return (T)session[key];
		}

		public static void SetDataInSession<T>(this HttpSessionStateBase session, string key, object value)
		{
			session[key] = value;
		}
	}

}
