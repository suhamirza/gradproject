using UserService.Data.DTOs.Requests;
using UserService.Data.DTOs.Responses;

namespace UserService.Services.AuthService
{
    public interface IAuthService
    {
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> RegisterAsync(CreateUserRequest request);
        Task<bool> ValidateTokenAsync(string token);
        Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
        Task<bool> ResetPasswordAsync(string email);
        Task<bool> VerifyResetPasswordTokenAsync(string token, string newPassword);
        Task<bool> LogoutAsync(string token);
        Task<AuthResponse> RefreshTokenAsync(string refreshToken);
        Task<bool> RevokeTokenAsync(string token);
        Task<bool> IsTokenRevokedAsync(string token);
        Task<bool> VerifyEmailAsync(Guid userId, string verificationCode);
        Task<bool> ResendVerificationCodeAsync(string email);
    }
} 