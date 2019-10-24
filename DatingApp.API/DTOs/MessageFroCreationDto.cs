using System;

namespace DatingApp.API.DTOs
{
    public class MessageFroCreationDto
    {
        public int SenderId { get; set; }
        public int RecipientId { get; set; }
        public DateTime MessageSent { get; set; }
        public string Content { get; set; }

        public MessageFroCreationDto()
        {
            MessageSent = DateTime.Now;
        }
    }
}