var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();
          
//React port (5173) hook up
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReact",
        policy => 
            policy.WithOrigins("http://localhost:5173") 
                        .AllowAnyMethod()
                        .AllowAnyHeader());

});

var app = builder.Build();

app.UseCors("AllowReact"); //Like Middleware
app.MapControllers();
app.Run();