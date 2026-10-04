namespace backend.Models;

public class Diary
{
    public int Id {get; set;}
    public long CreateDate { get; set;}
    public int EmotionId {get; set;}
    public string Content {get; set;} = string.Empty;
}