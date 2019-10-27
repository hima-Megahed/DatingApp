using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.ActionsFilters;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DatingApp.API.Data;
using DatingApp.API.DTOs;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace DatingApp.API.Controllers
{
    [ServiceFilter(typeof(LogUserActivityServiceFilter))]
    [ServiceFilter(typeof(ValidateUserIdentityServiceFilter))]
    [Route("api/users/{userId}/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly IDatingRepository _datingAppDbContext;
        private readonly IMapper _mapper;

        public MessagesController(IDatingRepository datingAppDbContext, IMapper mapper)
        {
            _mapper = mapper;
            _datingAppDbContext = datingAppDbContext;
        }

        // GET: api/users/18/Messages/5
        [HttpGet("{messageId}", Name = "GetMessage")]
        public async Task<IActionResult> GetMessage(int userId, int messageId)
        {
            var messageFromRepo = await _datingAppDbContext.GetMessage(messageId);

            if (messageFromRepo == null)
                return NotFound();

            return Ok(messageFromRepo);
        }

        // GET: api/users/18/Messages
        [HttpGet]
        public async Task<IActionResult> GetMessages(int userId, [FromQuery] MessageParams messageParams)
        {
            messageParams.UserId = userId;

            var messageFromRepo = await _datingAppDbContext.GetMessagesForUser(messageParams);

            var messagesToReturn = _mapper.Map<IEnumerable<Message>, IEnumerable<MessagesToReturnDto>>(messageFromRepo);

            Response.AddPaginationHeader(messageFromRepo.CurrentPage, messageFromRepo.PageSize, messageFromRepo.TotalCount, messageFromRepo.TotalPages);

            return Ok(messagesToReturn);
        }


        [HttpGet("thread/{recipientId}")]
        public async Task<IActionResult> GetMessageThread(int userId, int recipientId)
        {
            var messagesFromRepo = await _datingAppDbContext.GetMessageThread(userId, recipientId);

            var messageThread = _mapper.Map<IEnumerable<Message>, IEnumerable<MessagesToReturnDto>>(messagesFromRepo);

            return Ok(messageThread);
        }

        // POST: api/users/18/Messages
        [HttpPost]
        public async Task<IActionResult> CreateMessage(int userId, MessageFroCreationDto messageFroCreationDto)
        {
            var sender = await _datingAppDbContext.GetUser(userId);

            messageFroCreationDto.SenderId = sender.Id;

            var recipient = await _datingAppDbContext.GetUser(messageFroCreationDto.RecipientId);

            if (recipient == null)
                return BadRequest("Could not find the user");

            var message = _mapper.Map<MessageFroCreationDto, Message>(messageFroCreationDto);

            _datingAppDbContext.Add(message);

            if (await _datingAppDbContext.SaveAll())
                return CreatedAtRoute("GetMessage", 
                    new {messageId = message.Id}, 
                    _mapper.Map<Message, MessagesToReturnDto>(message));

            throw new Exception("Creating the message failed on save");
        }

        // DELETE: api/Messages/5
        [HttpPost("{messageId}")]
        public async Task<IActionResult> DeleteMessage(int userId, int messageId)
        {
            var messageFromRepo = await _datingAppDbContext.GetMessage(messageId);

            if (messageFromRepo.SenderId == userId)
            {
                messageFromRepo.SenderDeleted = true;
            }

            if (messageFromRepo.RecipientId == userId)
            {
                messageFromRepo.RecipientDeleted = true;
            }

            if (messageFromRepo.RecipientDeleted && messageFromRepo.SenderDeleted)
            {
                _datingAppDbContext.Delete(messageFromRepo);
            }

            if (await _datingAppDbContext.SaveAll())
            {
                return NoContent();
            }

            throw new Exception("Falied to delete the message");
        }

        [HttpPost("{messageId}/read")]
        public async Task<IActionResult> MarkMessageAsRead(int userId, int messageId)
        {
            var messageFromRepo = await _datingAppDbContext.GetMessage(messageId);

            if (messageFromRepo.RecipientId != userId)
            {
                return Unauthorized();
            }

            messageFromRepo.IsRead = true;
            messageFromRepo.DateRead = DateTime.Now;

            await _datingAppDbContext.SaveAll();

            return NoContent();
        }

        [HttpGet("unread")]
        public async Task<IActionResult> GetUnreadMessagesCount(int userId)
        {
            int count = await _datingAppDbContext.GetUnreadMessagesCount(userId);

            return Ok(count);
        }
    }
}
