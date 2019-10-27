using System;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class AuthRepository : IAuthRepository
    {
        private readonly DatingAppDbContext _datingAppDbContext;
        public AuthRepository(DatingAppDbContext datingAppDbContext)
        {
            this._datingAppDbContext = datingAppDbContext;
        }
        
        public async Task<User> Login(string userName, string password)
        {
            var user = await _datingAppDbContext.Users.Include(p => p.Photos).FirstOrDefaultAsync(u => u.UserName == userName);

            //if(!VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt))
            //    return null;
            
            return user;
        }

        //private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        //{
        //    using (var hmac = new System.Security.Cryptography.HMACSHA512(passwordSalt))
        //    {
        //        var computedHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
        //        return computedHash.SequenceEqual(passwordHash);
        //    }
        //}

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new System.Security.Cryptography.HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
            }
        }

        public async Task<User> Register(User user, string password)
        {
            CreatePasswordHash(password, out var passwordHash, out var passwordSalt);
            
            //user.PasswordHash = passwordHash;
            //user.PasswordSalt = passwordSalt;

            await _datingAppDbContext.Users.AddAsync(user);
            await _datingAppDbContext.SaveChangesAsync();

            return user;
        }

        public async Task<bool> UserExists(string userName)
        {
            if(await _datingAppDbContext.Users.AnyAsync(u => u.UserName == userName))
                return true;

            return false;
        }
    }
}