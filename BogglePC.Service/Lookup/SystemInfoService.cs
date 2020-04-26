 
using BogglePC.Model;
using BogglePC.Model.ChaliseStoredProc;
using System.Collections.Generic;
using System.Linq;
using System.Data.SqlClient;

namespace BogglePC.Service
{
    public interface ISystemInfoService : IEntityService<SystemInfo>
    {
        SystemInfo GetSystemInfoById(int infoid);
        IEnumerable<SystemInfoViewModel> GetSystemInfo(string userId = "", int infoid = 0, string infoname = "", int pageNumber = 1, int pageSize = 15, int showAll = 0);
        void UpdateSystemInfo(SystemInfo systeminfo, string actionType, string userId, ref int returnInfoId, ref string msgType, ref string msgText);
    }

    public class SystemInfoService : EntityService<SystemInfo>, ISystemInfoService
    {

        new IContext _context;
        public SystemInfoService(IContext context) : base(context)
        {
            _context = context;
            _dbset = _context.Set<SystemInfo>();
        }

        //Stored Procedures definition 
        StoredProc csp_SystemInfo_GET = new StoredProc().HasName("[csp.SystemInfo.Get]").ReturnsTypes(typeof(SystemInfoViewModel));
        StoredProc csp_SystemInfo_UPDATE = new StoredProc().HasName("[csp.SystemInfo.Update]");

        /// <summary>
        /// Get SystemInfo By Id :: Don't forget to add the DBSet to RolpoContext
        /// </summary>

        public SystemInfo GetSystemInfoById(int infoid)
        {
            return _dbset.FirstOrDefault(x => x.InfoId == infoid);
        }

        /// <summary>
        /// Get SystemInfo
        /// </summary>

        public IEnumerable<SystemInfoViewModel> GetSystemInfo(string userId="", int infoid = 0, string infoname = "", int pageNumber = 1, int pageSize = 15, int showAll = 0)
        {

            SqlParameter[] p = new SqlParameter[6];

            p[0] = new SqlParameter("@InfoId", infoid);
            p[1] = new SqlParameter("@InfoName", infoname);

            p[2] = new SqlParameter("@UserId", userId);
            p[3] = new SqlParameter("@PageNumber", pageNumber);
            p[4] = new SqlParameter("@PageSize", pageSize);
            p[5] = new SqlParameter("@ShowAll", showAll);

            var results = _context.CallSP(csp_SystemInfo_GET, p);
            return results.ToList<SystemInfoViewModel>();
        }

        /// <summary>
        /// Update SystemInfo
        /// </summary>

        public void UpdateSystemInfo(SystemInfo systeminfo, string actionType, string userId, ref int returnInfoId, ref string msgType, ref string msgText)
        {

            SqlParameter[] p = new SqlParameter[9];

            p[0] = new SqlParameter("@ActionType", actionType);

            p[1] = new SqlParameter("@InfoId", systeminfo.InfoId);
            p[2] = new SqlParameter("@InfoName", systeminfo.InfoName);
            p[3] = new SqlParameter("@InfoValue", systeminfo.InfoValue);
            p[4] = new SqlParameter("@Remarks", systeminfo.Remarks); 

            p[5] = new SqlParameter("@UserId", userId);

            p[6] = new SqlParameter("@MsgType", System.Data.SqlDbType.VarChar, 10);
            p[6].Direction = System.Data.ParameterDirection.Output;

            p[7] = new SqlParameter("@MsgText", System.Data.SqlDbType.VarChar, 100);
            p[7].Direction = System.Data.ParameterDirection.Output;

            p[8] = new SqlParameter("@ReturnInfoId", System.Data.SqlDbType.Int);
            p[8].Direction = System.Data.ParameterDirection.Output;

            var result = _context.CallSP(csp_SystemInfo_UPDATE, p);

            msgType = (string)p[6].Value;
            msgText = (string)p[7].Value;
            returnInfoId = (int)p[8].Value;
        }
    }
}
