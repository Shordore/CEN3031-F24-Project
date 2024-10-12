## Backend
#### How to run

1. cd backend
2. dotnet restore
3. dotnet run

### Dependencies(the ones I found that would be important )

| Package Name            | Version | Target Framework |
|-------------------------|---------|------------------|
| Microsoft.AspNetCore.Mvc | 2.2.0   | netcoreapp3.1     |
| Newtonsoft.Json         | 12.0.3  | netcoreapp3.1     |
| Serilog                 | 2.9.0   | netcoreapp3.1     |
| EntityFrameworkCore     | 5.0.1   | netcoreapp3.1     |

> **Note**: Make sure to run `dotnet list package` to verify the actual dependencies and their versions.