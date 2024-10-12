using System;
using System.Collections.Generic;
using System.Linq;
using ClubSwamp.Models; // Assuming a User model exists
using System.Security.Cryptography;
using System.Text;

namespace ClubSwamp.Services
{
    public class Authenticator
    {
        // In-memory user database for demonstration (use a real database in production)
        private static List<User> users = new List<User>();

        // Register a new user
        public bool Register(string username, string password)
        {
            if (users.Any(u => u.Username == username))
                return false; // Username already exists

            var hashedPassword = HashPassword(password);
            users.Add(new User { Username = username, PasswordHash = hashedPassword });
            return true;
        }

        // Authenticate user credentials
        public bool Authenticate(string username, string password)
        {
            var user = users.FirstOrDefault(u => u.Username == username);
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
            using( SHA256 sha256Hash = SHA256.Create())
            {
                byte [] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(password));
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
