using System;
using System.Linq;
using AutoMapper;
using DatingApp.API.DTOs;
using DatingApp.API.Models;

namespace DatingApp.API.Mappings
{
    internal class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Model to Dtos
            CreateMap<User, UserForListDto>()
            .ForMember(userForListDto => userForListDto.PhotoUrl, option => {
                option.MapFrom(user => user.Photos.FirstOrDefault(photo => photo.IsMain).Url);
            })
            .ForMember(userForListDto => userForListDto.Age, option => {
                option.MapFrom((user, userForListDto) => DateTime.Today.Year - user.DateOfBirth.Year);
            });

            CreateMap<User, UserForDetailDto>()
            .ForMember(userForDetailDto => userForDetailDto.PhotoUrl, option => {
                option.MapFrom(user => user.Photos.FirstOrDefault(photo => photo.IsMain).Url);
            })
            .ForMember(userForDetailDto => userForDetailDto.Age, option => {
                option.MapFrom((user, userForDetailDto) => DateTime.Today.Year - user.DateOfBirth.Year);
            });

            CreateMap<Message, MessagesToReturnDto>()
                .ForMember(messageForReturnDto => messageForReturnDto.SenderPhotoUrl, option =>
                {
                    option.MapFrom(u => u.Sender.Photos.FirstOrDefault(photo => photo.IsMain).Url);
                })
                .ForMember(messageForReturnDto => messageForReturnDto.RecipientPhotoUrl, option =>
                {
                    option.MapFrom(u => u.Recipient.Photos.FirstOrDefault(photo => photo.IsMain).Url);
                });

            CreateMap<Photo, PhotosForDetailDto>();
            CreateMap<Photo, PhotoForReturnDto>();
            

            // Dtos to Model
            CreateMap<UserForUpdateDto, User>();
            CreateMap<UserForRegisterDto, User>();
            CreateMap<PhotoForCreationDto, Photo>();
            CreateMap<MessageFroCreationDto, Message>().ReverseMap();
        }
    }
}