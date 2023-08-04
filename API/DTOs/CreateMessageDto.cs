namespace API.DTOs;

public class CreateMessageDto
{
    public int RecipientId { get; set; }
    public string Content { get; set; }
}