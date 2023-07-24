using System.Text.Json;
using API.Helpers;

namespace API.Extensions
{
    public static class HttpExtensions
    {
        public static void AddPaginationHeader(this HttpResponse httpResponse,PaginationHeader header){
            var jsonOptions = new JsonSerializerOptions{
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            httpResponse.Headers.Add("Pagination",JsonSerializer.Serialize(header,jsonOptions));
            httpResponse.Headers.Add("Access-Control-Expose-Headers","Pagination");
        }
    }
}