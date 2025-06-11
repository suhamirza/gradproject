# Stage 1: Build the application using .NET 8 SDK
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the solution file and project files
COPY UserService/*.sln ./
COPY UserService/*.csproj ./
RUN dotnet restore

# Copy the remaining source code and publish a release build
COPY UserService/ ./
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Create the runtime image using .NET 8 ASP.NET Core runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish ./

# Expose port 80 for the container
EXPOSE 80

# Start the application
ENTRYPOINT ["dotnet", "UserService.dll"]
