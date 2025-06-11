namespace UserService.Data.DTOs.Events
{
    public class UserSignupEvent
    {
        public Guid UserId { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string VerificationCode { get; set; }
        public DateTime CreatedAt { get; set; }
    }
} 