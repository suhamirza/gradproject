using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using UserService.Data;
using UserService.Data.DTOs.Requests;
using UserService.Data.DTOs.Responses;
using UserService.Services.UsersService;
using UserService.Services.EventService;
using UserService.Data.DTOs.Events;
using UserService.Services.VerificationService;
using Microsoft.EntityFrameworkCore;

namespace UserService.Services.AuthService
{
    public class AuthService : IAuthService
    {
        private readonly UserServiceDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IUsersService _usersService;
        private readonly IEventService _eventService;
        private readonly IVerificationService _verificationService;
        private readonly HashSet<string> _revokedTokens = new();
        private readonly Dictionary<string, string> _refreshTokens = new();

        public AuthService(
            UserServiceDbContext context,
            IUsersService usersService, 
            IConfiguration configuration, 
            IEventService eventService,
            IVerificationService verificationService)
        {
            _context = context;
            _usersService = usersService;
            _configuration = configuration;
            _eventService = eventService;
            _verificationService = verificationService;
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _usersService.GetUserByUsernameAsync(request.Username);
            
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid username or password");
            }

            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();
            _refreshTokens[refreshToken] = user.Id.ToString();

            return new AuthResponse
            {
                Token = token,
                RefreshToken = refreshToken,
                Expiration = DateTime.UtcNow.AddHours(1),
                User = user
            };
        }

        public async Task<AuthResponse> RegisterAsync(CreateUserRequest request)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
            if (existingUser != null)
            {
                throw new InvalidOperationException("Username already exists");
            }

            var existingEmail = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (existingEmail != null)
            {
                throw new InvalidOperationException("Email already exists");
            }

            var user = await _usersService.CreateUserAsync(request);
            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();
            _refreshTokens[refreshToken] = user.Id.ToString();

            var verificationCode = await _verificationService.GenerateVerificationCodeAsync(user.Id);

            var signupEvent = new UserSignupEvent
            {
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email,
                VerificationCode = verificationCode,
                CreatedAt = DateTime.UtcNow
            };
            _eventService.PublishEvent("user-signuped", signupEvent);

            return new AuthResponse
            {
                Token = token,
                RefreshToken = refreshToken,
                VerificationCode = verificationCode,
                Expiration = DateTime.UtcNow.AddHours(1),
                User = user
            };
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            if (await IsTokenRevokedAsync(token))
            {
                return false;
            }

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"]);
                
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
        {
            var guidUserId = Guid.Parse(userId);
            return await _usersService.UpdateUserPasswordAsync(guidUserId, currentPassword, newPassword);
        }

        public async Task<bool> ResetPasswordAsync(string email)
        {
            var user = await _usersService.GetUserByEmailAsync(email);
            if (user == null)
            {
                return false;
            }

            var resetToken = GenerateResetToken();
            _refreshTokens[resetToken] = user.Id.ToString();
            return true;
        }

        public async Task<bool> VerifyResetPasswordTokenAsync(string token, string newPassword)
        {
            if (!_refreshTokens.TryGetValue(token, out var userId))
            {
                return false;
            }

            var user = await _usersService.GetUserByIdAsync(Guid.Parse(userId));
            if (user == null)
            {
                return false;
            }

            // Remove the used token
            _refreshTokens.Remove(token);

            // Update the password without requiring current password for reset
            return await _usersService.UpdateUserPasswordAsync(user.Id, token, newPassword);
        }

        public async Task<bool> LogoutAsync(string token)
        {
            return await RevokeTokenAsync(token);
        }

        public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
        {
            if (!_refreshTokens.TryGetValue(refreshToken, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid refresh token");
            }

            var user = await _usersService.GetUserByIdAsync(Guid.Parse(userId));
            if (user == null)
            {
                throw new UnauthorizedAccessException("User not found");
            }

            var newToken = GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();
            
            _refreshTokens.Remove(refreshToken);
            _refreshTokens[newRefreshToken] = userId;

            return new AuthResponse
            {
                Token = newToken,
                RefreshToken = newRefreshToken,
                Expiration = DateTime.UtcNow.AddHours(1),
                User = user
            };
        }

        public async Task<bool> ResendVerificationCodeAsync(string email)
        {
            var user = await _usersService.GetUserByEmailAsync(email);
            if (user == null)
            {
                return false;
            }

            var verificationCode = await _verificationService.GenerateVerificationCodeAsync(user.Id);
            
            var signupEvent = new UserSignupEvent
            {
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email,
                VerificationCode = verificationCode,
                CreatedAt = DateTime.UtcNow
            };

            _eventService.PublishEvent("user-signuped", signupEvent);
            
            return true;
        }

        public async Task<bool> RevokeTokenAsync(string token)
        {
            _revokedTokens.Add(token);
            return true;
        }

        public async Task<bool> IsTokenRevokedAsync(string token)
        {
            return _revokedTokens.Contains(token);
        }

        public async Task<bool> VerifyEmailAsync(Guid userId, string verificationCode)
        {
            return await _verificationService.ValidateVerificationCodeAsync(userId, verificationCode);
        }

        private string GenerateJwtToken(UserResponse user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"]);
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email)
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        }

        private string GenerateResetToken()
        {
            return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        }
    }
} 