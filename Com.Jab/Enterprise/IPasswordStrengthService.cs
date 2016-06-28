using System;
using System.Threading;
using System.Threading.Tasks;

namespace Com.Jab.Enterprise
{
    public interface IPasswordStrengthService
    {
        Task<PasswordStrength> GetPasswordStrengthAsync(string password, 
            CancellationToken cancellationToken = default(CancellationToken),
            int timeoutMs = -2);
    }
}
