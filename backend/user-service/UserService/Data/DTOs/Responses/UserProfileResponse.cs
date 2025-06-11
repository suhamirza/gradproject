using System;

namespace UserService.Data.DTOs.Responses
{
    public class UserProfileResponse
    {
        public Guid Id { get; set; }
        public required string Username { get; set; }
        public required string Email { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
    }
} 