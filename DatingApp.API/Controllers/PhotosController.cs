using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Mvc;
using DatingApp.API.Data;
using DatingApp.API.DTOs;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Options;

namespace DatingApp.API.Controllers
{
    [Route("api/users/{userId}/[controller]")]
    [ApiController]
    [Authorize]
    public class PhotosController : ControllerBase
    {
        private readonly IDatingRepository _datingRepository;
        private readonly IMapper _mapper;
        private readonly Cloudinary _cloudinary;

        public PhotosController(IDatingRepository datingRepository, IMapper mapper, IOptions<CloudinarySettings> cloudinaryOptions)
        {
            _mapper = mapper;
            _datingRepository = datingRepository;

            _cloudinary = new Cloudinary(new Account
            {
                Cloud = cloudinaryOptions.Value.CloudName,
                ApiKey = cloudinaryOptions.Value.ApiKey,
                ApiSecret = cloudinaryOptions.Value.ApiSecret
            });
        }

        // GET: api/Photos
        [HttpGet("{id}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto(int id)
        {
            var photoFromRepo = await _datingRepository.GetPhoto(id);

            var photoForReturnDto = _mapper.Map<Photo, PhotoForReturnDto>(photoFromRepo);

            return Ok(photoForReturnDto);
        }

        // POST: api/Photos
        [HttpPost]
        public async Task<IActionResult> AddPhotoForUser(int userId, [FromForm] PhotoForCreationDto photoForCreationDto)
        {
            if (int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value) != userId)
                return Unauthorized();

            var userFromRepo = await _datingRepository.GetUser(userId);

            var file = photoForCreationDto.File;

            var uploadResult = new ImageUploadResult();

            if (file.Length > 0)
            {
                using (var stream = file.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams
                    {
                        File = new FileDescription(file.Name, stream),
                        Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face")
                    };

                    uploadResult = _cloudinary.Upload(uploadParams);
                }
            }

            photoForCreationDto.Url = uploadResult.Uri.ToString();
            photoForCreationDto.PublicId = uploadResult.PublicId;

            var photo = _mapper.Map<PhotoForCreationDto, Photo>(photoForCreationDto);

            if (!userFromRepo.Photos.Any(u => u.IsMain))
                photo.IsMain = true;

            userFromRepo.Photos.Add(photo);

            if (!await _datingRepository.SaveAll())
                return BadRequest("Could not add the photo");

            var photoToReturn = _mapper.Map<Photo, PhotoForReturnDto>(photo);
            return CreatedAtRoute("GetPhoto", new { id = photo.Id }, photoToReturn);

        }

        [HttpPost("{id}/setMain")]
        public async Task<IActionResult> SetMainPhoto(int userId, int id)
        {
            if (int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value) != userId)
                return Unauthorized();

            var userFromRepo = await _datingRepository.GetUser(userId);

            if (userFromRepo.Photos.All(p => p.Id != id))
                return Unauthorized();

            var photoFromRepo = await _datingRepository.GetPhoto(id);

            if (photoFromRepo.IsMain)
                return BadRequest("This is already the main photo");
            
            var currentMainPhoto = await _datingRepository.GetMainPhotoForUser(userId);
            currentMainPhoto.IsMain = false;

            photoFromRepo.IsMain = true;

            if (!await _datingRepository.SaveAll())
                return BadRequest("Could not set photo to main.");
            
            return NoContent();
        }

        // DELETE: api/Photos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePhoto(int userId, int id)
        {
           if (int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value) != userId)
                return Unauthorized();

           var userFromRepo = await _datingRepository.GetUser(userId);

           if (userFromRepo.Photos.All(p => p.Id != id))
               return Unauthorized();

           var photoFromRepo = await _datingRepository.GetPhoto(id);

           if (photoFromRepo.IsMain)
               return BadRequest("You cannot delete your main photo");
            
           if (photoFromRepo.PublicId != null) {
               var result = _cloudinary.Destroy(new DeletionParams(photoFromRepo.PublicId));

               if (result.Result == "ok") {
                   _datingRepository.Delete(photoFromRepo);
               }
           }

           if (photoFromRepo.PublicId == null) {
               _datingRepository.Delete(photoFromRepo);
           }
            

           if (await _datingRepository.SaveAll()) {
               return Ok();
           }

           return BadRequest("Failed to delete the photo");
        }
    }
}
