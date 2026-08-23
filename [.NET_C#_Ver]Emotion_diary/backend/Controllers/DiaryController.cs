using Microsoft.AspNetCore.Mvc;
using backend.Models;
using System.Runtime.Versioning;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]

//controllerBase is a parent class which means that it can provide a bunch of feature to make api.
public class DiaryController : ControllerBase
{
    private static List<Diary> _diaries = new List<Diary>();
    private static int _idCounter = 1;

    //Search all diary
    [HttpGet]
    public IActionResult Get() => Ok(_diaries);

    //Save new diary
    [HttpPost]
    public IActionResult Post([FromBody] Diary newDiary)
    {
        newDiary.Id = _idCounter++;
        _diaries.Add(newDiary);
        return Ok(newDiary);
    }

    //Delete diary
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var diary = _diaries.Find(d=> d.Id == id);
        if(diary == null) return NotFound();
        _diaries.Remove(diary);
        return NoContent();
    }

}