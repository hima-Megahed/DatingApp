using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class DatingRepository : IDatingRepository
    {
        private readonly DatingAppDbContext _datingAppDbContext;
        public DatingRepository(DatingAppDbContext datingAppDbContext)
        {
            _datingAppDbContext = datingAppDbContext;

        }
        public void Add<T>(T entity) where T : class
        {
            _datingAppDbContext.Add(entity);
        }

        public void Delete<T>(T entity) where T : class
        {
            _datingAppDbContext.Remove(entity);
        }

        public async Task<PagedList<User>> GetUsers(UserParams userParams)
        {
            var users =  _datingAppDbContext.Users.Include(u => u.Photos).OrderByDescending(u => u.LastActive).AsQueryable();

            // Excluding the logged-in user from the search result 
            users = users.Where(user => user.Id != userParams.UserId);

            // Getting users by preferred gender
            if (!string.IsNullOrEmpty(userParams.Gender))
                users = users.Where(user => user.Gender == userParams.Gender);

            if (userParams.Likers)
            {
                var userLikers = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(user => userLikers.Contains(user.Id));
            }

            if (userParams.Likees)
            {
                var userLikees = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(user => userLikees.Contains(user.Id));
            }

            // Getting users by preferred age
            var minDateOfBirth = DateTime.Now.AddYears(-userParams.MaxAge - 1);
            var maxDateOfBirth = DateTime.Now.AddYears(-userParams.MinAge);
            users = users.Where(user => user.DateOfBirth <= maxDateOfBirth && user.DateOfBirth >= minDateOfBirth);

            // Ordering users
            if (!string.IsNullOrEmpty(userParams.OrderBy))
            {
                switch (userParams.OrderBy)
                {
                    case "created":
                        users = users.OrderByDescending(user => user.Created);
                        break;
                    default:
                        users = users.OrderByDescending(user => user.LastActive);
                        break;
                }
            }

            return await PagedList<User>.CreateAsync(users, userParams.PageNumber, userParams.PageSize);
        }

        public async Task<User> GetUser(int id)
        {
            return await _datingAppDbContext.Users.Include(u => u.Photos).FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<Photo> GetPhoto(int id)
        {
            return await _datingAppDbContext.Photos.FirstOrDefaultAsync(photo => photo.Id == id);
        }

        public async Task<bool> SaveAll()
        {
            return await _datingAppDbContext.SaveChangesAsync() > 0;
        }

        public async Task<Photo> GetMainPhotoForUser(int userId)
        {
            return await _datingAppDbContext.Photos.Where(photo => photo.UserId == userId)
                .FirstOrDefaultAsync(photo => photo.IsMain);
        }

        public async Task<Like> GetLike(int userId, int recipientId)
        {
            return await _datingAppDbContext.Likes.FirstOrDefaultAsync(like =>
                like.LikerId == userId && like.LikeeId == recipientId);
        }

        private async Task<IEnumerable<int>> GetUserLikes(int userId, bool likers)
        {
            var users = await _datingAppDbContext.Users
                .Include(user => user.Likees)
                .Include(user => user.Likers)
                .FirstOrDefaultAsync(user => user.Id == userId);

            return likers ? 
                users.Likers.Where(user => user.LikeeId == userId).Select(user => user.LikerId) : // Likers 
                users.Likees.Where(user => user.LikerId == userId).Select(user => user.LikeeId); // Likees
        }
    }
}
