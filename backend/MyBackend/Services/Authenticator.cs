using System;
using System.Collections.Generic;
using System.Linq;
using ClubSwamp.Models; // Assuming a User model exists
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace ClubSwamp.Services
{
    public class Authenticator
    {
        // In-memory user database for demonstration (use a real database in production)
        private static List<User> users = new List<User>();

        // Register a new user
        public async Task<bool> RegisterAsync(string ufid, string password)
        {
            // Simulate asynchronous database call
            await Task.Delay(10);

            if (users.Any(u => u.UFID == ufid))
                return false; // UFID already exists

            var hashedPassword = HashPassword(password);
            users.Add(new User { UFID = ufid, PasswordHash = hashedPassword });

            return true;
        }
        public async Task<bool> AuthenticateAsync(string ufid, string password)
        {
            // Simulate asynchronous operation
            await Task.Delay(10);  // You'd replace this with a real async database call

            var user = users.FirstOrDefault(u => u.UFID == ufid);
            if (user == null)
                return false;

            return VerifyPassword(password, user.PasswordHash);
        }

        // Generate a basic token (placeholder - replace with secure JWT implementation)
        public string GenerateToken(string username)
        {
            return $"token-{username}-{Guid.NewGuid()}";
        }

        // Hash password using SHA256
        private string HashPassword(string password)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(password));
                return BitConverter.ToString(bytes).Replace("-", "").ToLower();
            }
        }

        // Verify password
        private bool VerifyPassword(string password, string storedHash)
        {
            var hashOfInput = HashPassword(password);
            return hashOfInput == storedHash;
        }
    }
}
