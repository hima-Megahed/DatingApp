using System.Collections.Generic;
using System.Threading.Tasks;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class DatingRepository : IDatingRepository
    {
        private readonly DatingAppDbContext _datingAppDbContext;
        public DatingRepository(DatingAppDbContext datingAppDbContext)
        {
            this._datingAppDbContext = datingAppDbContext;

        }
        public void Add<T>(T entity) where T : class
        {
            _datingAppDbContext.Add(entity);
        }

        public void Delete<T>(T entity) where T : class
        {
            _datingAppDbContext.Remove(entity);
        }

        public async Task<User> GetUser(int id)
        {
            return await _datingAppDbContext.Users.Include(u => u.Photos).FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<IEnumerable<User>> GetUsers()
        {
            return await _datingAppDbContext.Users.Include(u => u.Photos).ToListAsync();
        }

        public async Task<bool> SaveAll()
        {
            return await _datingAppDbContext.SaveChangesAsync() > 0;
        }
    }
}