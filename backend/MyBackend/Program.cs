var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Add Swagger/OpenAPI for API documentation if needed
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add other services, such as the Authenticator, as a singleton
builder.Services.AddSingleton<ClubSwamp.Services.Authenticator>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthorization();

app.MapControllers();

app.Run();
