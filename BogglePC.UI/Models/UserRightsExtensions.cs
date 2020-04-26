using System.Linq;
using System;
using BogglePC.Model;
using System.Collections.Generic;
using System.Web.Mvc;
using BogglePC.Service;

namespace BogglePC.UI
{

    public class UserRights
    {

         
        public static IEnumerable<SystemInfoViewModel> GetSystemInfo()
        {
            IEnumerable<SystemInfoViewModel> systemInfo = null;
            ISystemInfoService _sysInfoService = DependencyResolver.Current.GetService<ISystemInfoService>();
            //var user = GetCurrentUserAsync();
            systemInfo = _sysInfoService.GetSystemInfo(userId: "", showAll: 1);
            return systemInfo;
        }


        public static SystemInfoViewModel GetByName(string name)
        {
            try
            {
                var sysInfo = from info in SessionExtensions.Current.sysInfo
                              where info.InfoName.Contains(name)
                              select info;
                if (sysInfo.Count() > 0)
                {
                    return sysInfo.FirstOrDefault<SystemInfoViewModel>();
                }
                else
                {
                    return new SystemInfoViewModel();
                }

            }
            catch (Exception)
            {
                return new SystemInfoViewModel();
            }
        }

       
    }
}
