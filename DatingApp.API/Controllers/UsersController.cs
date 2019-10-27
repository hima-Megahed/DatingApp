using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.ActionsFilters;
using DatingApp.API.Data;
using DatingApp.API.DTOs;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [ServiceFilter(typeof(LogUserActivityServiceFilter))]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IDatingRepository _datingRepository;
        private readonly IMapper _mapper;
        public UsersController(IDatingRepository datingRepository, IMapper mapper)
        {
            this._mapper = mapper;
            this._datingRepository = datingRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] UserParams userParams)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            userParams.UserId = userId;

            var users = await _datingRepository.GetUsers(userParams);

            Response.AddPaginationHeader(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages);
            
            return Ok(_mapper.Map<IEnumerable<User>, IEnumerable<UserForListDto>>(users));
        }

        [HttpGet("{userId}", Name = "GetUser")]
        public async Task<IActionResult> GetUser(int userId)
        {
            var user = await _datingRepository.GetUser(userId);

            return Ok(_mapper.Map<User, UserForDetailDto>(user));
        }

        [ValidateUserIdentity]
        [HttpPut("{userId}")]
        public async Task<IActionResult> UpdateUser(int userId, UserForUpdateDto userForUpdateDto)
        {
            var userFromRepo = await _datingRepository.GetUser(userId);

            _mapper.Map(userForUpdateDto, userFromRepo);

            if(await _datingRepository.SaveAll())
                return NoContent();
            
            throw new Exception($"Updating user {userId} failed on save");
        }

        [ValidateUserIdentity]
        [HttpPost("{userId}/like/{recipientId}")]
        public async Task<IActionResult> LikeUser(int userId, int recipientId)
        {
            var like = await _datingRepository.GetLike(userId, recipientId);

            if (like != null)
                return BadRequest("You already liked this user");

            if (await _datingRepository.GetUser(recipientId) == null)
                return NotFound();

            like = new Like
            {
                LikerId = userId,
                LikeeId = recipientId
            };

            _datingRepository.Add(like);

            if (await _datingRepository.SaveAll())
                return Ok();

            return BadRequest("Failed to like this user");
        }
    }
}