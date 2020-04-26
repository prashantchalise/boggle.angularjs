using System;
using System.IO;
using System.Web;
using System.Web.Mvc;

namespace BuyFly.UI.Controllers
{
    public class HotelSettingsController : Controller
    {


        /// <summary>
        /// </summary>
        /// <returns></returns>
        public ActionResult Hotel()
        {
            return View();
        }


        /// <summary>
        /// Purchase Agent
        /// </summary>
        /// <returns></returns>
        public ActionResult PurchaseAgent()
        {
            return View();
        }

        /// <summary>
        /// Reservation Plan
        /// </summary>
        /// <returns></returns>
        public ActionResult ReservationPlan()
        {
            return View();
        }

        /// <summary>
        /// Room Type
        /// </summary>
        /// <returns></returns>
        public ActionResult RoomType()
        {
            return View();
        }

        /// <summary>
        /// Sector
        /// </summary>
        /// <returns></returns>
        public ActionResult Sector()
        {
            return View();
        }


    }
}