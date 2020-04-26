using BogglePC.Model;
using System.Collections.Generic;

namespace BogglePC.UI
{
    public class SiteSession
    {
        public SiteSession() {
             this.sysInfo = UserRights.GetSystemInfo();
        }
		 
        public IEnumerable<SystemInfoViewModel> sysInfo { get; set; } 
    }

}
