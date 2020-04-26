using Autofac;
using System.Linq;
using System.Reflection;

namespace BogglePC.UI.Modules
{
	public class ServiceModule : Autofac.Module
	{

		protected override void Load(ContainerBuilder builder)
		{

			builder.RegisterAssemblyTypes(Assembly.Load("BogglePC.Service"))

					  .Where(t => t.Name.EndsWith("Service"))

					  .AsImplementedInterfaces()

					  .InstancePerLifetimeScope();

		}

	}
}