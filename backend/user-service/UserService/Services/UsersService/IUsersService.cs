using UserService.Data.DTOs.Requests;
using UserService.Data.DTOs.Responses;

namespace UserService.Services.UsersService
{
    public interface IUsersService
    {
        Task<UserResponse> CreateUserAsync(CreateUserRequest request);

        Task<UserResponse> GetUserByIdAsync(Guid id);

        Task<UserProfileResponse> GetUserProfileAsync(Guid id);
        
        Task<UserResponse> GetUserByUsernameAsync(string username);
        
        Task<UserResponse> GetUserByEmailAsync(string email);
        
        Task<UserResponse> UpdateUserAsync(Guid id, UpdateUserRequest request);
        
        Task<bool> DeleteUserAsync(Guid id);
        
        Task<IEnumerable<UserResponse>> GetAllUsersAsync();

        Task<bool> UpdateUserPasswordAsync(Guid userId, string currentPassword, string newPassword);
    }
}
