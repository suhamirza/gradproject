namespace UserService.Data.DTOs.Responses
{
    public class AuthResponse
    {
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public string VerificationCode { get; set; }
        public DateTime Expiration { get; set; }
        public UserResponse User { get; set; }
    }
} 