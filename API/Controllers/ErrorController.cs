
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class ErrorController : BaseApiController
    {
        private readonly DataContext _context;
        public ErrorController(DataContext context)
        {
            _context = context;

        }

        [Authorize]
        [HttpGet("auth")]

        public ActionResult<string> GetSecret()
        {
            return "this is secret message";
        }

        [HttpGet("not-found")]

        public ActionResult<AppUser> GetNotFound()
        {
            var thing = _context.Users.Find(-1);
            if (thing == null) return NotFound();

            return thing;
        }
        
        [HttpGet("server-error")]

        public ActionResult<string> GetServerError()
        {
            var thing = _context.Users.Find(-1);
            return thing.ToString();
        }
        
        
        [HttpGet("bad-request")]

        public ActionResult<string> GetBadRequest()
        {
            return BadRequest("This is a bad request");
        }





    }
}