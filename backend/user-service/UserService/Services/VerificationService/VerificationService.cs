using UserService.Data;
using UserService.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace UserService.Services.VerificationService
{
    public interface IVerificationService
    {
        Task<string> GenerateVerificationCodeAsync(Guid userId);
        Task<bool> ValidateVerificationCodeAsync(Guid userId, string code);
    }

    public class VerificationService : IVerificationService
    {
        private readonly UserServiceDbContext _context;
        private readonly Random _random;

        public VerificationService(UserServiceDbContext context)
        {
            _context = context;
            _random = new Random();
        }

        public async Task<string> GenerateVerificationCodeAsync(Guid userId)
        {
            // Generate a 6-digit code
            var code = _random.Next(100000, 999999).ToString();

            // Create verification code entity
            var verificationCode = new VerificationCode
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Code = code,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15), // Code expires in 15 minutes
                IsUsed = false
            };

            // Save to database
            await _context.VerificationCodes.AddAsync(verificationCode);
            await _context.SaveChangesAsync();

            return code;
        }

        public async Task<bool> ValidateVerificationCodeAsync(Guid userId, string code)
        {
            var verificationCode = await _context.VerificationCodes
                .Where(vc => vc.UserId == userId 
                    && vc.Code == code 
                    && !vc.IsUsed 
                    && vc.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(vc => vc.CreatedAt)
                .FirstOrDefaultAsync();

            if (verificationCode == null)
            {
                return false;
            }

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return false;
            }

            // Mark the code as used
            verificationCode.IsUsed = true;
            verificationCode.UsedAt = DateTime.UtcNow;
            user.IsEmailVerified = true;
            await _context.SaveChangesAsync();

            return true;
        }
    }
} 