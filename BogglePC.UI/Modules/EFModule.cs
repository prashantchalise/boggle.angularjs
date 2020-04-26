using Autofac;
using BogglePC.Model;
using System;
using System.Web;

namespace BogglePC.UI.Modules
{

    public class EFModule : Autofac.Module
    {

        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterType(typeof(RolpoContext)).As(typeof(IContext)).InstancePerLifetimeScope();
        }

    }
  
}

