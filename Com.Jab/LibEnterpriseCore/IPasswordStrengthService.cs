using System.Threading;
using System.Threading.Tasks;

namespace Com.Jab.LibEnterprise
{
    public interface IPasswordStrengthService
    {
        Task<PasswordStrength> GetPasswordStrengthAsync(string password, CancellationToken cancellationToken);
    }
}
